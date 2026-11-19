"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import path from "node:path";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import { recordAuditEvent } from "@/lib/server/audit";
import { AuthorizationError, requireRole } from "@/lib/server/auth";
import {
  createDownloadCategorySchema,
  updateDownloadCategorySchema,
  deleteDownloadCategorySchema,
  toggleDownloadCategoryStatusSchema,
  reorderDownloadCategoriesSchema,
  createDownloadDocumentSchema,
  updateDownloadDocumentSchema,
  deleteDownloadDocumentSchema,
  toggleDownloadDocumentStatusSchema,
  reorderDownloadDocumentsSchema,
  computeCategoryDiff,
  computeDocumentDiff,
  type CreateDownloadCategoryInput,
  type UpdateDownloadCategoryInput,
  type CreateDownloadDocumentInput,
  type UpdateDownloadDocumentInput,
} from "@/lib/validation/downloads";
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

export interface DownloadActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  noOp?: boolean;
}

function revalidateDownloadRoutes() {
  revalidatePath("/admin/students-parents/downloads");
  revalidatePath("/downloads");
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

async function generateCategoryDeterministicSlug(
  db: Prisma.TransactionClient,
  title: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = slugify(title);
  const existing = await db.downloadCategory.findMany({
    where: {
      slug: { startsWith: baseSlug },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { slug: true },
  });

  const existingSlugs = new Set(existing.map((c) => c.slug));
  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  while (existingSlugs.has(`${baseSlug}-${counter}`)) {
    counter++;
  }
  return `${baseSlug}-${counter}`;
}

async function isStorageKeyReferenced(
  db: Prisma.TransactionClient,
  storageKey: string
): Promise<boolean> {
  const [inNotice, inNoticeAtt, inDownloadDoc] = await Promise.all([
    db.notice.count({ where: { fileStorageKey: storageKey } }),
    db.noticeAttachment.count({ where: { fileStorageKey: storageKey } }),
    db.downloadDocument.count({ where: { fileStorageKey: storageKey } }),
  ]);
  return inNotice > 0 || inNoticeAtt > 0 || inDownloadDoc > 0;
}

/* -------------------------------------------------------------------------- */
/* UPLOAD ACTION                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Uploads, validates, scans, and atomically promotes a managed PDF download document.
 * Stored strictly under documents/downloads/.
 * Restricted strictly to SUPER_ADMIN.
 */
export async function uploadDownloadDocumentAction(
  formData: FormData
): Promise<DownloadActionResponse<{
  fileStorageKey: string;
  fileSizeBytes: number;
  fileSha256: string;
  fileOriginalName: string;
  fileUploadedAt: Date;
}>> {
  let user;
  try {
    user = await requireRole(["SUPER_ADMIN"]);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unauthorized access" };
  }

  const ipAddress = await getClientIp();
  const rateLimitKey = `upload_download_doc_${user.id}_${ipAddress}`;
  if (!checkUploadRateLimit(rateLimitKey, 15, 60 * 1000)) {
    return {
      success: false,
      error: "Upload rate limit exceeded. Please wait a minute before uploading again.",
    };
  }

  const rawFile = formData.get("file");
  if (!rawFile || !(rawFile instanceof Blob)) {
    return { success: false, error: "No file provided for upload." };
  }

  const rawFilename = (rawFile as File).name || "document.pdf";
  const fileOriginalName = sanitizeDisplayFilename(rawFilename);

  const MAX_SIZE = 10 * 1024 * 1024;
  if (rawFile.size > MAX_SIZE) {
    return {
      success: false,
      error: `File size (${(rawFile.size / (1024 * 1024)).toFixed(2)} MB) exceeds 10 MiB limit.`,
    };
  }

  if (rawFile.size < 32) {
    return { success: false, error: "File is too small to be a valid PDF document." };
  }

  const arrayBuffer = await rawFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let stagingKey: string;
  try {
    const staged = await stageDocument(buffer);
    stagingKey = staged.stagingKey;
  } catch (err) {
    console.error("[download-actions] Document staging failed:", err);
    return { success: false, error: "Failed to stage document upload." };
  }

  try {
    const valResult = validatePdfBuffer(buffer, {
      mimeType: rawFile.type || "application/pdf",
      originalFilename: fileOriginalName,
      maxSizeBytes: MAX_SIZE,
    });

    if (!valResult.isValid) {
      await cleanupStagedDocument(stagingKey);
      return { success: false, error: valResult.error || "PDF validation failed." };
    }

    let scanResult;
    try {
      const scanner = getMalwareScanner();
      scanResult = await scanner.scanBuffer(buffer);
    } catch (scannerErr) {
      await cleanupStagedDocument(stagingKey);
      console.error("[download-actions] Malware scanner execution failed:", scannerErr);
      return {
        success: false,
        error: "Document scanning is unavailable in this environment. Contact the administrator.",
      };
    }

    if (!scanResult.isClean) {
      await cleanupStagedDocument(stagingKey);
      return {
        success: false,
        error: `Upload rejected: Malware threat detected (${scanResult.threatName || "Suspicious content"}).`,
      };
    }

    // Promote specifically to downloads target folder
    const promoted = await promoteStagedDocument(stagingKey, "downloads");
    const permanentKey = promoted.permanentKey;

    const fileSizeBytes = valResult.details!.byteSize;
    const fileSha256 = valResult.details!.sha256;
    const fileUploadedAt = new Date();

    return {
      success: true,
      data: {
        fileStorageKey: permanentKey,
        fileSizeBytes,
        fileSha256,
        fileOriginalName,
        fileUploadedAt,
      },
    };
  } catch (err) {
    await cleanupStagedDocument(stagingKey).catch(() => {});
    const msg = err instanceof Error ? err.message : "Unknown upload failure";
    console.error("[download-actions] uploadDownloadDocumentAction failed:", err);
    return { success: false, error: msg };
  }
}

/* -------------------------------------------------------------------------- */
/* CATEGORY ACTIONS                                                           */
/* -------------------------------------------------------------------------- */

export async function createDownloadCategoryAction(
  _prevState: unknown,
  payload: unknown
): Promise<DownloadActionResponse> {
  let user;
  try {
    user = await requireRole(["SUPER_ADMIN"]);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unauthorized access" };
  }

  const parseResult = createDownloadCategorySchema.safeParse(payload);
  if (!parseResult.success) {
    return {
      success: false,
      error: "Validation failed. Please correct the highlighted errors.",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const data: CreateDownloadCategoryInput = parseResult.data;
  const ipAddress = await getClientIp();
  const cleanDescription = data.description ? sanitizeRichText(data.description).trim() : null;

  try {
    const created = await prisma.$transaction(async (tx) => {
      const slug = await generateCategoryDeterministicSlug(tx, data.title);

      const category = await tx.downloadCategory.create({
        data: {
          slug,
          title: data.title.trim(),
          description: cleanDescription,
          displayOrder: data.displayOrder,
          isPublished: data.isPublished,
        },
      });

      await recordAuditEvent(
        {
          action: "DOWNLOAD_CATEGORY_CREATED",
          entityType: "DownloadCategory",
          entityId: category.id,
          userId: user.id,
          ipAddress,
          metadata: {
            title: category.title,
            slug: category.slug,
            displayOrder: category.displayOrder,
            isPublished: category.isPublished,
          },
        },
        tx
      );

      return category;
    });

    revalidateDownloadRoutes();
    return { success: true, data: created };
  } catch (err) {
    console.error("[download-actions] Failed to create category:", err);
    return { success: false, error: "Failed to create download category." };
  }
}

export async function updateDownloadCategoryAction(
  _prevState: unknown,
  payload: unknown
): Promise<DownloadActionResponse> {
  let user;
  try {
    user = await requireRole(["SUPER_ADMIN"]);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unauthorized access" };
  }

  const parseResult = updateDownloadCategorySchema.safeParse(payload);
  if (!parseResult.success) {
    return {
      success: false,
      error: "Validation failed. Please correct the highlighted errors.",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const data: UpdateDownloadCategoryInput = parseResult.data;
  const ipAddress = await getClientIp();
  const cleanDescription = data.description ? sanitizeRichText(data.description).trim() : null;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.downloadCategory.findUnique({
        where: { id: data.id },
      });

      if (!existing) {
        throw new Error("Download category not found.");
      }

      let slug = existing.slug;
      if (data.title.trim() !== existing.title) {
        slug = await generateCategoryDeterministicSlug(tx, data.title, existing.id);
      }

      const diff = computeCategoryDiff(existing, {
        title: data.title.trim(),
        description: cleanDescription,
        displayOrder: data.displayOrder,
        isPublished: data.isPublished,
      });

      const category = await tx.downloadCategory.update({
        where: { id: data.id },
        data: {
          slug,
          title: data.title.trim(),
          description: cleanDescription,
          displayOrder: data.displayOrder,
          isPublished: data.isPublished,
        },
      });

      await recordAuditEvent(
        {
          action: "DOWNLOAD_CATEGORY_UPDATED",
          entityType: "DownloadCategory",
          entityId: category.id,
          userId: user.id,
          ipAddress,
          metadata: {
            diff,
            title: category.title,
            slug: category.slug,
          },
        },
        tx
      );

      return category;
    });

    revalidateDownloadRoutes();
    return { success: true, data: updated };
  } catch (err) {
    console.error("[download-actions] Failed to update category:", err);
    return { success: false, error: "Failed to update download category." };
  }
}

export async function deleteDownloadCategoryAction(
  _prevState: unknown,
  payload: unknown
): Promise<DownloadActionResponse> {
  let user;
  try {
    user = await requireRole(["SUPER_ADMIN"]);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unauthorized access" };
  }

  const parseResult = deleteDownloadCategorySchema.safeParse(payload);
  if (!parseResult.success) {
    return { success: false, error: "Invalid category ID." };
  }

  const { id } = parseResult.data;
  const ipAddress = await getClientIp();
  const potentialKeysToClean: string[] = [];

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.downloadCategory.findUnique({
        where: { id },
        include: { documents: { select: { id: true, fileStorageKey: true } } },
      });

      if (!existing) {
        throw new Error("Category not found.");
      }

      for (const doc of existing.documents) {
        if (doc.fileStorageKey && isValidAnyManagedDocumentKey(doc.fileStorageKey)) {
          potentialKeysToClean.push(doc.fileStorageKey);
        }
      }

      await tx.downloadCategory.delete({
        where: { id },
      });

      await recordAuditEvent(
        {
          action: "DOWNLOAD_CATEGORY_DELETED",
          entityType: "DownloadCategory",
          entityId: id,
          userId: user.id,
          ipAddress,
          metadata: {
            title: existing.title,
            slug: existing.slug,
            deletedDocumentCount: existing.documents.length,
          },
        },
        tx
      );
    });

    // Post-transaction filesystem cleanup for unreferenced keys
    for (const key of potentialKeysToClean) {
      try {
        const stillReferenced = await prisma.$transaction(async (tx) => {
          return isStorageKeyReferenced(tx, key);
        });
        if (!stillReferenced) {
          await deleteManagedDocument(key);
        }
      } catch (cleanErr) {
        console.warn(`[download-actions] Failed to clean orphaned key "${key}":`, cleanErr);
      }
    }

    revalidateDownloadRoutes();
    return { success: true };
  } catch (err) {
    console.error("[download-actions] Failed to delete category:", err);
    return { success: false, error: "Failed to delete download category." };
  }
}

export async function toggleDownloadCategoryStatusAction(
  _prevState: unknown,
  payload: unknown
): Promise<DownloadActionResponse> {
  let user;
  try {
    user = await requireRole(["SUPER_ADMIN"]);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unauthorized access" };
  }

  const parseResult = toggleDownloadCategoryStatusSchema.safeParse(payload);
  if (!parseResult.success) {
    return { success: false, error: "Invalid payload for status toggle." };
  }

  const { id, isPublished } = parseResult.data;
  const ipAddress = await getClientIp();

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.downloadCategory.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error("Category not found.");
      }

      if (existing.isPublished === isPublished) {
        return existing;
      }

      const category = await tx.downloadCategory.update({
        where: { id },
        data: { isPublished },
      });

      await recordAuditEvent(
        {
          action: "DOWNLOAD_CATEGORY_STATUS_CHANGED",
          entityType: "DownloadCategory",
          entityId: category.id,
          userId: user.id,
          ipAddress,
          metadata: {
            from: existing.isPublished,
            to: isPublished,
            title: category.title,
          },
        },
        tx
      );

      return category;
    });

    revalidateDownloadRoutes();
    return { success: true, data: updated };
  } catch (err) {
    console.error("[download-actions] Failed to toggle category status:", err);
    return { success: false, error: "Failed to toggle download category status." };
  }
}

export async function reorderDownloadCategoriesAction(
  _prevState: unknown,
  payload: unknown
): Promise<DownloadActionResponse> {
  let user;
  try {
    user = await requireRole(["SUPER_ADMIN"]);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unauthorized access" };
  }

  const parseResult = reorderDownloadCategoriesSchema.safeParse(payload);
  if (!parseResult.success) {
    return { success: false, error: "Invalid payload for category reordering." };
  }

  const { orderedIds } = parseResult.data;
  const ipAddress = await getClientIp();

  try {
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx.downloadCategory.update({
          where: { id: orderedIds[i] },
          data: { displayOrder: i },
        });
      }

      await recordAuditEvent(
        {
          action: "DOWNLOAD_CATEGORIES_REORDERED",
          entityType: "DownloadCategory",
          entityId: "REORDER_EVENT",
          userId: user.id,
          ipAddress,
          metadata: {
            orderedIds,
            count: orderedIds.length,
          },
        },
        tx
      );
    });

    revalidateDownloadRoutes();
    return { success: true };
  } catch (err) {
    console.error("[download-actions] Failed to reorder categories:", err);
    return { success: false, error: "Failed to reorder download categories." };
  }
}

/* -------------------------------------------------------------------------- */
/* DOCUMENT ACTIONS                                                           */
/* -------------------------------------------------------------------------- */

export async function createDownloadDocumentAction(
  _prevState: unknown,
  payload: unknown
): Promise<DownloadActionResponse> {
  let user;
  try {
    user = await requireRole(["SUPER_ADMIN"]);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unauthorized access" };
  }

  const parseResult = createDownloadDocumentSchema.safeParse(payload);
  if (!parseResult.success) {
    return {
      success: false,
      error: "Validation failed. Please correct the highlighted errors.",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const data: CreateDownloadDocumentInput = parseResult.data;
  const ipAddress = await getClientIp();
  const cleanDescription = data.description ? sanitizeRichText(data.description).trim() : null;

  try {
    const created = await prisma.$transaction(async (tx) => {
      const category = await tx.downloadCategory.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new Error("Selected category does not exist.");
      }

      const document = await tx.downloadDocument.create({
        data: {
          title: data.title.trim(),
          description: cleanDescription,
          categoryId: data.categoryId,
          fileUrl: data.fileUrl ? data.fileUrl.trim() : null,
          fileStorageKey: data.fileStorageKey ? data.fileStorageKey.trim() : null,
          fileSizeBytes: data.fileSizeBytes ?? null,
          fileSize: data.fileSize ? data.fileSize.trim() : null,
          fileType: data.fileType || "application/pdf",
          displayOrder: data.displayOrder,
          isPublished: data.isPublished,
        },
      });

      await recordAuditEvent(
        {
          action: "DOWNLOAD_DOCUMENT_CREATED",
          entityType: "DownloadDocument",
          entityId: document.id,
          userId: user.id,
          ipAddress,
          metadata: {
            title: document.title,
            categoryId: document.categoryId,
            categoryTitle: category.title,
            fileStorageKey: document.fileStorageKey ? "[MANAGED_FILE]" : null,
            fileUrl: document.fileUrl,
            isPublished: document.isPublished,
            displayOrder: document.displayOrder,
          },
        },
        tx
      );

      return document;
    });

    revalidateDownloadRoutes();
    return { success: true, data: created };
  } catch (err) {
    console.error("[download-actions] Failed to create document:", err);
    return { success: false, error: "Failed to create download document." };
  }
}

export async function updateDownloadDocumentAction(
  _prevState: unknown,
  payload: unknown
): Promise<DownloadActionResponse> {
  let user;
  try {
    user = await requireRole(["SUPER_ADMIN"]);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unauthorized access" };
  }

  const parseResult = updateDownloadDocumentSchema.safeParse(payload);
  if (!parseResult.success) {
    return {
      success: false,
      error: "Validation failed. Please correct the highlighted errors.",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const data: UpdateDownloadDocumentInput = parseResult.data;
  const ipAddress = await getClientIp();
  const cleanDescription = data.description ? sanitizeRichText(data.description).trim() : null;

  let oldKeyToClean: string | null = null;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.downloadDocument.findUnique({
        where: { id: data.id },
      });

      if (!existing) {
        throw new Error("Document not found.");
      }

      const category = await tx.downloadCategory.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new Error("Selected category does not exist.");
      }

      if (
        existing.fileStorageKey &&
        data.fileStorageKey !== existing.fileStorageKey &&
        isValidAnyManagedDocumentKey(existing.fileStorageKey)
      ) {
        oldKeyToClean = existing.fileStorageKey;
      }

      const diff = computeDocumentDiff(existing, {
        title: data.title.trim(),
        description: cleanDescription,
        categoryId: data.categoryId,
        fileUrl: data.fileUrl ? data.fileUrl.trim() : null,
        fileStorageKey: data.fileStorageKey ? data.fileStorageKey.trim() : null,
        fileSizeBytes: data.fileSizeBytes ?? null,
        fileSize: data.fileSize ? data.fileSize.trim() : null,
        fileType: data.fileType || "application/pdf",
        displayOrder: data.displayOrder,
        isPublished: data.isPublished,
      });

      const document = await tx.downloadDocument.update({
        where: { id: data.id },
        data: {
          title: data.title.trim(),
          description: cleanDescription,
          categoryId: data.categoryId,
          fileUrl: data.fileUrl ? data.fileUrl.trim() : null,
          fileStorageKey: data.fileStorageKey ? data.fileStorageKey.trim() : null,
          fileSizeBytes: data.fileSizeBytes ?? null,
          fileSize: data.fileSize ? data.fileSize.trim() : null,
          fileType: data.fileType || "application/pdf",
          displayOrder: data.displayOrder,
          isPublished: data.isPublished,
        },
      });

      await recordAuditEvent(
        {
          action: "DOWNLOAD_DOCUMENT_UPDATED",
          entityType: "DownloadDocument",
          entityId: document.id,
          userId: user.id,
          ipAddress,
          metadata: {
            diff,
            title: document.title,
            categoryId: document.categoryId,
          },
        },
        tx
      );

      return document;
    });

    if (oldKeyToClean) {
      try {
        const stillReferenced = await prisma.$transaction(async (tx) => {
          return isStorageKeyReferenced(tx, oldKeyToClean!);
        });
        if (!stillReferenced) {
          await deleteManagedDocument(oldKeyToClean);
        }
      } catch (cleanErr) {
        console.warn(`[download-actions] Failed to delete replaced key "${oldKeyToClean}":`, cleanErr);
      }
    }

    revalidateDownloadRoutes();
    return { success: true, data: updated };
  } catch (err) {
    console.error("[download-actions] Failed to update document:", err);
    return { success: false, error: "Failed to update download document." };
  }
}

export async function deleteDownloadDocumentAction(
  _prevState: unknown,
  payload: unknown
): Promise<DownloadActionResponse> {
  let user;
  try {
    user = await requireRole(["SUPER_ADMIN"]);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unauthorized access" };
  }

  const parseResult = deleteDownloadDocumentSchema.safeParse(payload);
  if (!parseResult.success) {
    return { success: false, error: "Invalid document ID." };
  }

  const { id } = parseResult.data;
  const ipAddress = await getClientIp();
  let keyToClean: string | null = null;

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.downloadDocument.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error("Document not found.");
      }

      if (existing.fileStorageKey && isValidAnyManagedDocumentKey(existing.fileStorageKey)) {
        keyToClean = existing.fileStorageKey;
      }

      await tx.downloadDocument.delete({
        where: { id },
      });

      await recordAuditEvent(
        {
          action: "DOWNLOAD_DOCUMENT_DELETED",
          entityType: "DownloadDocument",
          entityId: id,
          userId: user.id,
          ipAddress,
          metadata: {
            title: existing.title,
            categoryId: existing.categoryId,
          },
        },
        tx
      );
    });

    if (keyToClean) {
      try {
        const stillReferenced = await prisma.$transaction(async (tx) => {
          return isStorageKeyReferenced(tx, keyToClean!);
        });
        if (!stillReferenced) {
          await deleteManagedDocument(keyToClean);
        }
      } catch (cleanErr) {
        console.warn(`[download-actions] Failed to delete key "${keyToClean}":`, cleanErr);
      }
    }

    revalidateDownloadRoutes();
    return { success: true };
  } catch (err) {
    console.error("[download-actions] Failed to delete document:", err);
    return { success: false, error: "Failed to delete download document." };
  }
}

export async function toggleDownloadDocumentStatusAction(
  _prevState: unknown,
  payload: unknown
): Promise<DownloadActionResponse> {
  let user;
  try {
    user = await requireRole(["SUPER_ADMIN"]);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unauthorized access" };
  }

  const parseResult = toggleDownloadDocumentStatusSchema.safeParse(payload);
  if (!parseResult.success) {
    return { success: false, error: "Invalid payload for status toggle." };
  }

  const { id, isPublished } = parseResult.data;
  const ipAddress = await getClientIp();

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.downloadDocument.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error("Document not found.");
      }

      if (existing.isPublished === isPublished) {
        return existing;
      }

      const document = await tx.downloadDocument.update({
        where: { id },
        data: { isPublished },
      });

      await recordAuditEvent(
        {
          action: "DOWNLOAD_DOCUMENT_STATUS_CHANGED",
          entityType: "DownloadDocument",
          entityId: document.id,
          userId: user.id,
          ipAddress,
          metadata: {
            from: existing.isPublished,
            to: isPublished,
            title: document.title,
            categoryId: document.categoryId,
          },
        },
        tx
      );

      return document;
    });

    revalidateDownloadRoutes();
    return { success: true, data: updated };
  } catch (err) {
    console.error("[download-actions] Failed to toggle document status:", err);
    return { success: false, error: "Failed to toggle download document status." };
  }
}

export async function reorderDownloadDocumentsAction(
  _prevState: unknown,
  payload: unknown
): Promise<DownloadActionResponse> {
  let user;
  try {
    user = await requireRole(["SUPER_ADMIN"]);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unauthorized access" };
  }

  const parseResult = reorderDownloadDocumentsSchema.safeParse(payload);
  if (!parseResult.success) {
    return { success: false, error: "Invalid payload for document reordering." };
  }

  const { categoryId, orderedIds } = parseResult.data;
  const ipAddress = await getClientIp();

  try {
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx.downloadDocument.update({
          where: { id: orderedIds[i] },
          data: {
            displayOrder: i,
            categoryId, // Ensure association consistency
          },
        });
      }

      await recordAuditEvent(
        {
          action: "DOWNLOAD_DOCUMENTS_REORDERED",
          entityType: "DownloadDocument",
          entityId: categoryId,
          userId: user.id,
          ipAddress,
          metadata: {
            categoryId,
            orderedIds,
            count: orderedIds.length,
          },
        },
        tx
      );
    });

    revalidateDownloadRoutes();
    return { success: true };
  } catch (err) {
    console.error("[download-actions] Failed to reorder documents:", err);
    return { success: false, error: "Failed to reorder download documents." };
  }
}
