"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import path from "node:path";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import { recordAuditEvent } from "@/lib/server/audit";
import { AuthorizationError, requireRole } from "@/lib/server/auth";
import {
  createDisclosureSectionSchema,
  updateDisclosureSectionSchema,
  deleteDisclosureSectionSchema,
  toggleDisclosureSectionStatusSchema,
  reorderDisclosureSectionsSchema,
  createDisclosureDocumentSchema,
  updateDisclosureDocumentSchema,
  deleteDisclosureDocumentSchema,
  toggleDisclosureDocumentStatusSchema,
  reorderDisclosureDocumentsSchema,
  computeSectionDiff,
  computeDocumentDiff,
} from "@/lib/validation/disclosure";
import { sanitizeRichText } from "@/lib/server/sanitizer";
import { slugify } from "@/lib/server/slug";
import { validatePdfBuffer } from "@/lib/validation/pdf-validator";
import {
  stageDocument,
  cleanupStagedDocument,
  promoteStagedDocument,
  deleteManagedDocument,
  isValidAnyManagedDocumentKey,
} from "@/lib/server/document-storage";
import { getMalwareScanner } from "@/lib/server/malware-scanner";

export interface DisclosureActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  noOp?: boolean;
}

function revalidateDisclosureRoutes() {
  revalidatePath("/admin/about/mandatory-disclosure");
  revalidatePath("/mandatory-public-disclosure");
  revalidatePath("/");
}

// In-memory sliding rate limiter for upload actions (15 uploads / minute / admin)
const uploadRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkUploadRateLimit(key: string, maxAttempts = 15, windowMs = 60 * 1000): boolean {
  const now = Date.now();
  const record = uploadRateLimitMap.get(key);

  if (!record || now >= record.resetAt) {
    uploadRateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count += 1;
  return true;
}

async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    const realIp = headerList.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }
  } catch {
    // Header access may fail in non-request contexts
  }
  return "127.0.0.1";
}

function sanitizeDisplayFilename(rawName: string | null | undefined): string {
  if (!rawName) return "document.pdf";
  const base = path.basename(rawName).trim();
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_");
  if (!cleaned.toLowerCase().endsWith(".pdf")) {
    return `${cleaned}.pdf`;
  }
  return cleaned.slice(0, 255);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function isStorageKeyReferenced(
  db: Prisma.TransactionClient,
  storageKey: string
): Promise<boolean> {
  const [inNotice, inNoticeAtt, inDownloadDoc, inDisclosureDoc] = await Promise.all([
    db.notice.count({ where: { fileStorageKey: storageKey } }),
    db.noticeAttachment.count({ where: { fileStorageKey: storageKey } }),
    db.downloadDocument.count({ where: { fileStorageKey: storageKey } }),
    db.disclosureDocument.count({ where: { fileStorageKey: storageKey } }),
  ]);
  return inNotice > 0 || inNoticeAtt > 0 || inDownloadDoc > 0 || inDisclosureDoc > 0;
}

/* ========================================================================== */
/* DOCUMENT UPLOAD (SECURE PIPELINE)                                          */
/* ========================================================================== */

export async function uploadDisclosureDocumentAction(
  formData: FormData
): Promise<DisclosureActionResponse<{
  fileStorageKey: string;
  fileSizeBytes: number;
  fileSize: string;
  filename: string;
  fileType: string;
}>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    if (!checkUploadRateLimit(`disclosure_upload_${user.id}_${clientIp}`)) {
      return {
        success: false,
        error: "Too many upload requests. Please wait a moment before trying again.",
      };
    }

    const file = formData.get("file");
    if (!file || typeof file === "string" || !(file instanceof Blob)) {
      return { success: false, error: "No file provided in upload request." };
    }

    const rawFilename = (file as File).name || "upload.pdf";
    const sanitizedFilename = sanitizeDisplayFilename(rawFilename);

    // 1. Strict size verification (max 10 MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return {
        success: false,
        error: `File exceeds maximum allowed size of 10 MB (received ${formatBytes(file.size)}).`,
      };
    }

    if (file.size < 32) {
      return { success: false, error: "File is too small to be a valid PDF document." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Stage file in temporary storage
    let stagingKey: string;
    try {
      const staged = await stageDocument(buffer, sanitizedFilename);
      stagingKey = staged.stagingKey;
    } catch (stageErr) {
      console.error("[disclosure-upload] Staging failed:", stageErr);
      return { success: false, error: "Failed to stage document upload." };
    }

    // 3. Strict PDF validation & header verification
    const pdfCheck = validatePdfBuffer(buffer, {
      mimeType: file.type || "application/pdf",
      originalFilename: sanitizedFilename,
      maxSizeBytes: MAX_SIZE,
    });
    if (!pdfCheck.isValid) {
      await cleanupStagedDocument(stagingKey);
      return {
        success: false,
        error: pdfCheck.error || "File is not a valid PDF document.",
      };
    }

    // 4. Scan file with malware scanner
    try {
      const scanner = getMalwareScanner();
      const scanResult = await scanner.scanBuffer(buffer);
      if (!scanResult.isClean) {
        await cleanupStagedDocument(stagingKey);
        return {
          success: false,
          error: `Document failed security verification: ${scanResult.threatName || "Malicious content detected"}`,
        };
      }
    } catch (scanErr) {
      await cleanupStagedDocument(stagingKey);
      console.error("[disclosure-upload] Malware scan failure:", scanErr);
      return {
        success: false,
        error: "Document security verification could not be completed. Upload rejected.",
      };
    }

    // 5. Promote staged file to permanent managed disclosures directory
    const { permanentKey } = await promoteStagedDocument(stagingKey, "disclosures");

    return {
      success: true,
      data: {
        fileStorageKey: permanentKey,
        fileSizeBytes: buffer.length,
        fileSize: formatBytes(buffer.length),
        filename: sanitizedFilename,
        fileType: "application/pdf",
      },
    };
  } catch (err: unknown) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: "Access denied. SUPER_ADMIN permission required." };
    }
    console.error("[disclosure-upload] Unexpected error:", err);
    return { success: false, error: "Failed to upload document. Please try again." };
  }
}

/* ========================================================================== */
/* SECTION ACTIONS                                                            */
/* ========================================================================== */

export async function createDisclosureSectionAction(
  input: unknown
): Promise<DisclosureActionResponse<{ id: string; title: string; slug: string }>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parseResult = createDisclosureSectionSchema.safeParse(input);
    if (!parseResult.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parseResult.error.flatten().fieldErrors,
      };
    }

    const data = parseResult.data;
    const cleanTitle = sanitizeRichText(data.title);
    let cleanSlug = data.slug ? slugify(data.slug) : slugify(cleanTitle);

    // Ensure slug uniqueness
    const existingSlug = await prisma.disclosureSection.findUnique({
      where: { slug: cleanSlug },
    });
    if (existingSlug) {
      cleanSlug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;
    }

    const created = await prisma.$transaction(async (tx) => {
      const sec = await tx.disclosureSection.create({
        data: {
          title: cleanTitle,
          slug: cleanSlug,
          description: data.description ? sanitizeRichText(data.description) : null,
          displayOrder: data.displayOrder ?? 0,
          isPublished: data.isPublished ?? true,
        },
      });

      await recordAuditEvent(
        {
          userId: user.id,
          action: "DISCLOSURE_SECTION_CREATED",
          entityType: "DisclosureSection",
          entityId: sec.id,
          ipAddress: clientIp,
          metadata: {
            title: sec.title,
            slug: sec.slug,
            displayOrder: sec.displayOrder,
            isPublished: sec.isPublished,
          },
        },
        tx
      );

      return sec;
    });

    revalidateDisclosureRoutes();
    return {
      success: true,
      data: { id: created.id, title: created.title, slug: created.slug },
    };
  } catch (err: unknown) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: "Access denied. SUPER_ADMIN permission required." };
    }
    console.error("[disclosure-section-create] Error:", err);
    return { success: false, error: "Failed to create disclosure section." };
  }
}

export async function updateDisclosureSectionAction(
  input: unknown
): Promise<DisclosureActionResponse<{ id: string; title: string }>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parseResult = updateDisclosureSectionSchema.safeParse(input);
    if (!parseResult.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parseResult.error.flatten().fieldErrors,
      };
    }

    const data = parseResult.data;
    const existing = await prisma.disclosureSection.findUnique({
      where: { id: data.id },
    });

    if (!existing) {
      return { success: false, error: "Section not found." };
    }

    const cleanTitle = sanitizeRichText(data.title);
    let cleanSlug = existing.slug;
    if (data.slug && data.slug !== existing.slug) {
      cleanSlug = slugify(data.slug);
      const duplicateSlug = await prisma.disclosureSection.findFirst({
        where: { slug: cleanSlug, id: { not: data.id } },
      });
      if (duplicateSlug) {
        cleanSlug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const updatePayload: Prisma.DisclosureSectionUpdateInput = {
      title: cleanTitle,
      slug: cleanSlug,
      description: data.description !== undefined ? (data.description ? sanitizeRichText(data.description) : null) : undefined,
      displayOrder: data.displayOrder !== undefined ? data.displayOrder : undefined,
      isPublished: data.isPublished !== undefined ? data.isPublished : undefined,
    };

    const diff = computeSectionDiff(existing, updatePayload as Record<string, unknown>);

    const updated = await prisma.$transaction(async (tx) => {
      const sec = await tx.disclosureSection.update({
        where: { id: data.id },
        data: updatePayload,
      });

      await recordAuditEvent(
        {
          userId: user.id,
          action: "DISCLOSURE_SECTION_UPDATED",
          entityType: "DisclosureSection",
          entityId: sec.id,
          ipAddress: clientIp,
          metadata: { diff },
        },
        tx
      );

      return sec;
    });

    revalidateDisclosureRoutes();
    return {
      success: true,
      data: { id: updated.id, title: updated.title },
    };
  } catch (err: unknown) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: "Access denied. SUPER_ADMIN permission required." };
    }
    console.error("[disclosure-section-update] Error:", err);
    return { success: false, error: "Failed to update disclosure section." };
  }
}

export async function deleteDisclosureSectionAction(
  input: unknown
): Promise<DisclosureActionResponse<{ id: string }>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parseResult = deleteDisclosureSectionSchema.safeParse(input);
    if (!parseResult.success) {
      return { success: false, error: "Invalid section ID." };
    }

    const { id } = parseResult.data;
    const existing = await prisma.disclosureSection.findUnique({
      where: { id },
      include: {
        documents: {
          select: {
            id: true,
            fileStorageKey: true,
          },
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Section not found." };
    }

    // Collect managed keys to delete post-transaction
    const managedKeysToDelete = existing.documents
      .map((d) => d.fileStorageKey)
      .filter((k): k is string => Boolean(k) && isValidAnyManagedDocumentKey(k));

    await prisma.$transaction(async (tx) => {
      await tx.disclosureSection.delete({ where: { id } });

      await recordAuditEvent(
        {
          userId: user.id,
          action: "DISCLOSURE_SECTION_DELETED",
          entityType: "DisclosureSection",
          entityId: id,
          ipAddress: clientIp,
          metadata: {
            title: existing.title,
            slug: existing.slug,
            deletedDocumentCount: existing.documents.length,
          },
        },
        tx
      );
    });

    // Clean up managed files from disk post-transaction if unreferenced
    for (const key of managedKeysToDelete) {
      try {
        const stillReferenced = await isStorageKeyReferenced(prisma, key);
        if (!stillReferenced) {
          await deleteManagedDocument(key);
        }
      } catch (fileErr) {
        console.error(`[disclosure-section-delete] Failed to clean file "${key}":`, fileErr);
      }
    }

    revalidateDisclosureRoutes();
    return { success: true, data: { id } };
  } catch (err: unknown) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: "Access denied. SUPER_ADMIN permission required." };
    }
    console.error("[disclosure-section-delete] Error:", err);
    return { success: false, error: "Failed to delete disclosure section." };
  }
}

export async function toggleDisclosureSectionStatusAction(
  input: unknown
): Promise<DisclosureActionResponse<{ id: string; isPublished: boolean }>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parseResult = toggleDisclosureSectionStatusSchema.safeParse(input);
    if (!parseResult.success) {
      return { success: false, error: "Invalid input." };
    }

    const { id, isPublished } = parseResult.data;
    const existing = await prisma.disclosureSection.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Section not found." };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const sec = await tx.disclosureSection.update({
        where: { id },
        data: { isPublished },
      });

      await recordAuditEvent(
        {
          userId: user.id,
          action: "DISCLOSURE_SECTION_STATUS_CHANGED",
          entityType: "DisclosureSection",
          entityId: id,
          ipAddress: clientIp,
          metadata: {
            title: sec.title,
            from: existing.isPublished,
            to: isPublished,
          },
        },
        tx
      );

      return sec;
    });

    revalidateDisclosureRoutes();
    return { success: true, data: { id: updated.id, isPublished: updated.isPublished } };
  } catch (err: unknown) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: "Access denied. SUPER_ADMIN permission required." };
    }
    console.error("[disclosure-section-toggle] Error:", err);
    return { success: false, error: "Failed to update section status." };
  }
}

export async function reorderDisclosureSectionsAction(
  input: unknown
): Promise<DisclosureActionResponse> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parseResult = reorderDisclosureSectionsSchema.safeParse(input);
    if (!parseResult.success) {
      return { success: false, error: "Invalid reorder data." };
    }

    const { items } = parseResult.data;

    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.disclosureSection.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        });
      }

      await recordAuditEvent(
        {
          userId: user.id,
          action: "DISCLOSURE_SECTIONS_REORDERED",
          entityType: "DisclosureSection",
          entityId: "batch",
          ipAddress: clientIp,
          metadata: { itemCount: items.length },
        },
        tx
      );
    });

    revalidateDisclosureRoutes();
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: "Access denied. SUPER_ADMIN permission required." };
    }
    console.error("[disclosure-sections-reorder] Error:", err);
    return { success: false, error: "Failed to reorder sections." };
  }
}

/* ========================================================================== */
/* DOCUMENT ACTIONS                                                           */
/* ========================================================================== */

export async function createDisclosureDocumentAction(
  input: unknown
): Promise<DisclosureActionResponse<{ id: string; title: string }>> {
  let createdStorageKey: string | null = null;
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parseResult = createDisclosureDocumentSchema.safeParse(input);
    if (!parseResult.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parseResult.error.flatten().fieldErrors,
      };
    }

    const data = parseResult.data;
    const sectionExists = await prisma.disclosureSection.findUnique({
      where: { id: data.sectionId },
    });
    if (!sectionExists) {
      return { success: false, error: "Parent section does not exist." };
    }

    createdStorageKey = data.fileStorageKey ?? null;
    const cleanTitle = sanitizeRichText(data.title);

    const created = await prisma.$transaction(async (tx) => {
      const doc = await tx.disclosureDocument.create({
        data: {
          sectionId: data.sectionId,
          title: cleanTitle,
          description: data.description ? sanitizeRichText(data.description) : null,
          fileUrl: data.fileUrl ?? null,
          fileStorageKey: data.fileStorageKey ?? null,
          fileSizeBytes: data.fileSizeBytes ?? null,
          fileSize: data.fileSize ?? null,
          fileType: data.fileType ?? "application/pdf",
          linkLabel: data.linkLabel ? sanitizeRichText(data.linkLabel) : "VIEW/DOWNLOAD",
          displayOrder: data.displayOrder ?? 0,
          isPublished: data.isPublished ?? true,
        },
      });

      await recordAuditEvent(
        {
          userId: user.id,
          action: "DISCLOSURE_DOCUMENT_CREATED",
          entityType: "DisclosureDocument",
          entityId: doc.id,
          ipAddress: clientIp,
          metadata: {
            title: doc.title,
            sectionId: doc.sectionId,
            fileType: doc.fileType,
            fileSize: doc.fileSize,
            isManaged: Boolean(doc.fileStorageKey),
            isPublished: doc.isPublished,
          },
        },
        tx
      );

      return doc;
    });

    revalidateDisclosureRoutes();
    return {
      success: true,
      data: { id: created.id, title: created.title },
    };
  } catch (err: unknown) {
    // Roll back created managed storage file if transaction failed
    if (createdStorageKey && isValidAnyManagedDocumentKey(createdStorageKey)) {
      try {
        await deleteManagedDocument(createdStorageKey);
      } catch (cleanupErr) {
        console.error("[disclosure-document-create] Rollback cleanup failed:", cleanupErr);
      }
    }

    if (err instanceof AuthorizationError) {
      return { success: false, error: "Access denied. SUPER_ADMIN permission required." };
    }
    console.error("[disclosure-document-create] Error:", err);
    return { success: false, error: "Failed to create document." };
  }
}

export async function updateDisclosureDocumentAction(
  input: unknown
): Promise<DisclosureActionResponse<{ id: string; title: string }>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parseResult = updateDisclosureDocumentSchema.safeParse(input);
    if (!parseResult.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parseResult.error.flatten().fieldErrors,
      };
    }

    const data = parseResult.data;
    const existing = await prisma.disclosureDocument.findUnique({
      where: { id: data.id },
    });

    if (!existing) {
      return { success: false, error: "Document not found." };
    }

    // Track previous key for post-transaction cleanup if replaced
    const previousStorageKey = existing.fileStorageKey;
    const storageKeyReplaced =
      data.fileStorageKey !== undefined &&
      data.fileStorageKey !== previousStorageKey &&
      Boolean(previousStorageKey) &&
      isValidAnyManagedDocumentKey(previousStorageKey);

    const cleanTitle = sanitizeRichText(data.title);

    const updatePayload: Prisma.DisclosureDocumentUpdateInput = {
      section: data.sectionId ? { connect: { id: data.sectionId } } : undefined,
      title: cleanTitle,
      description: data.description !== undefined ? (data.description ? sanitizeRichText(data.description) : null) : undefined,
      fileUrl: data.fileUrl !== undefined ? data.fileUrl : undefined,
      fileStorageKey: data.fileStorageKey !== undefined ? data.fileStorageKey : undefined,
      fileSizeBytes: data.fileSizeBytes !== undefined ? data.fileSizeBytes : undefined,
      fileSize: data.fileSize !== undefined ? data.fileSize : undefined,
      fileType: data.fileType !== undefined ? data.fileType : undefined,
      linkLabel: data.linkLabel !== undefined ? sanitizeRichText(data.linkLabel) : undefined,
      displayOrder: data.displayOrder !== undefined ? data.displayOrder : undefined,
      isPublished: data.isPublished !== undefined ? data.isPublished : undefined,
    };

    const diff = computeDocumentDiff(existing, updatePayload as Record<string, unknown>);

    const updated = await prisma.$transaction(async (tx) => {
      const doc = await tx.disclosureDocument.update({
        where: { id: data.id },
        data: updatePayload,
      });

      await recordAuditEvent(
        {
          userId: user.id,
          action: "DISCLOSURE_DOCUMENT_UPDATED",
          entityType: "DisclosureDocument",
          entityId: doc.id,
          ipAddress: clientIp,
          metadata: { diff },
        },
        tx
      );

      return doc;
    });

    // Clean up replaced managed file from disk if unreferenced
    if (storageKeyReplaced && previousStorageKey) {
      try {
        const stillReferenced = await isStorageKeyReferenced(prisma, previousStorageKey);
        if (!stillReferenced) {
          await deleteManagedDocument(previousStorageKey);
        }
      } catch (fileErr) {
        console.error(`[disclosure-document-update] Failed to delete replaced file "${previousStorageKey}":`, fileErr);
      }
    }

    revalidateDisclosureRoutes();
    return {
      success: true,
      data: { id: updated.id, title: updated.title },
    };
  } catch (err: unknown) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: "Access denied. SUPER_ADMIN permission required." };
    }
    console.error("[disclosure-document-update] Error:", err);
    return { success: false, error: "Failed to update document." };
  }
}

export async function deleteDisclosureDocumentAction(
  input: unknown
): Promise<DisclosureActionResponse<{ id: string }>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parseResult = deleteDisclosureDocumentSchema.safeParse(input);
    if (!parseResult.success) {
      return { success: false, error: "Invalid document ID." };
    }

    const { id } = parseResult.data;
    const existing = await prisma.disclosureDocument.findUnique({ where: { id } });

    if (!existing) {
      return { success: false, error: "Document not found." };
    }

    const storageKeyToDelete = existing.fileStorageKey;

    await prisma.$transaction(async (tx) => {
      await tx.disclosureDocument.delete({ where: { id } });

      await recordAuditEvent(
        {
          userId: user.id,
          action: "DISCLOSURE_DOCUMENT_DELETED",
          entityType: "DisclosureDocument",
          entityId: id,
          ipAddress: clientIp,
          metadata: {
            title: existing.title,
            sectionId: existing.sectionId,
            wasManaged: Boolean(storageKeyToDelete),
          },
        },
        tx
      );
    });

    // Clean up managed file from disk post-transaction if unreferenced
    if (storageKeyToDelete && isValidAnyManagedDocumentKey(storageKeyToDelete)) {
      try {
        const stillReferenced = await isStorageKeyReferenced(prisma, storageKeyToDelete);
        if (!stillReferenced) {
          await deleteManagedDocument(storageKeyToDelete);
        }
      } catch (fileErr) {
        console.error(`[disclosure-document-delete] Failed to delete file "${storageKeyToDelete}":`, fileErr);
      }
    }

    revalidateDisclosureRoutes();
    return { success: true, data: { id } };
  } catch (err: unknown) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: "Access denied. SUPER_ADMIN permission required." };
    }
    console.error("[disclosure-document-delete] Error:", err);
    return { success: false, error: "Failed to delete document." };
  }
}

export async function toggleDisclosureDocumentStatusAction(
  input: unknown
): Promise<DisclosureActionResponse<{ id: string; isPublished: boolean }>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parseResult = toggleDisclosureDocumentStatusSchema.safeParse(input);
    if (!parseResult.success) {
      return { success: false, error: "Invalid input." };
    }

    const { id, isPublished } = parseResult.data;
    const existing = await prisma.disclosureDocument.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Document not found." };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const doc = await tx.disclosureDocument.update({
        where: { id },
        data: { isPublished },
      });

      await recordAuditEvent(
        {
          userId: user.id,
          action: "DISCLOSURE_DOCUMENT_STATUS_CHANGED",
          entityType: "DisclosureDocument",
          entityId: id,
          ipAddress: clientIp,
          metadata: {
            title: doc.title,
            from: existing.isPublished,
            to: isPublished,
          },
        },
        tx
      );

      return doc;
    });

    revalidateDisclosureRoutes();
    return { success: true, data: { id: updated.id, isPublished: updated.isPublished } };
  } catch (err: unknown) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: "Access denied. SUPER_ADMIN permission required." };
    }
    console.error("[disclosure-document-toggle] Error:", err);
    return { success: false, error: "Failed to update document status." };
  }
}

export async function reorderDisclosureDocumentsAction(
  input: unknown
): Promise<DisclosureActionResponse> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parseResult = reorderDisclosureDocumentsSchema.safeParse(input);
    if (!parseResult.success) {
      return { success: false, error: "Invalid reorder data." };
    }

    const { sectionId, items } = parseResult.data;

    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.disclosureDocument.update({
          where: { id: item.id, sectionId },
          data: { displayOrder: item.displayOrder },
        });
      }

      await recordAuditEvent(
        {
          userId: user.id,
          action: "DISCLOSURE_DOCUMENTS_REORDERED",
          entityType: "DisclosureDocument",
          entityId: sectionId,
          ipAddress: clientIp,
          metadata: { sectionId, itemCount: items.length },
        },
        tx
      );
    });

    revalidateDisclosureRoutes();
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: "Access denied. SUPER_ADMIN permission required." };
    }
    console.error("[disclosure-documents-reorder] Error:", err);
    return { success: false, error: "Failed to reorder documents." };
  }
}
