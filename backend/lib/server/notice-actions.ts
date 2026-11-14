"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import path from "node:path";
import { prisma } from "@/lib/server/prisma";
import { recordAuditEvent } from "@/lib/server/audit";
import { AuthorizationError, requireRole } from "@/lib/server/auth";
import {
  createNoticeSchema,
  updateNoticeSchema,
  deleteNoticeSchema,
  toggleNoticeStatusSchema,
  type CreateNoticeInput,
  type UpdateNoticeInput,
} from "@/lib/validation/notices";
import { sanitizeRichText } from "@/lib/server/sanitizer";
import { generateDeterministicSlug } from "@/lib/server/slug";
import { validatePdfBuffer } from "@/lib/validation/pdf-validator";
import {
  stageDocument,
  cleanupStagedDocument,
  promoteStagedDocument,
  deleteManagedDocument,
} from "@/lib/server/document-storage";
import { getMalwareScanner } from "@/lib/server/malware-scanner";

export interface NoticeActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  noOp?: boolean;
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

/**
 * Extracts client IP for audit logging.
 */
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

/**
 * Generates safe display filename from user-supplied name.
 */
function sanitizeDisplayFilename(rawName: string | null | undefined): string {
  if (!rawName) return "document.pdf";
  const base = path.basename(rawName).trim();
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_");
  if (!cleaned.toLowerCase().endsWith(".pdf")) {
    return `${cleaned}.pdf`;
  }
  return cleaned.slice(0, 255);
}

/**
 * Uploads, validates, scans, and atomically promotes a managed PDF attachment.
 * Restricted strictly to SUPER_ADMIN.
 */
export async function uploadNoticeDocumentAction(
  formData: FormData
): Promise<NoticeActionResponse<{
  fileStorageKey: string;
  fileSizeBytes: number;
  fileSha256: string;
  fileOriginalName: string;
  fileUploadedAt: Date;
}>> {
  // 1. Authorization check
  let user;
  try {
    user = await requireRole(["SUPER_ADMIN"]);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unauthorized access" };
  }

  // 2. Rate limiting
  const ipAddress = await getClientIp();
  const rateLimitKey = `upload_doc_${user.id}_${ipAddress}`;
  if (!checkUploadRateLimit(rateLimitKey, 15, 60 * 1000)) {
    return {
      success: false,
      error: "Upload rate limit exceeded. Please wait a minute before uploading again.",
    };
  }

  // 3. Extract and pre-validate file from FormData
  const rawFile = formData.get("file");
  if (!rawFile || !(rawFile instanceof Blob)) {
    return { success: false, error: "No file provided for upload." };
  }

  const noticeId = formData.get("noticeId");
  const targetNoticeId = typeof noticeId === "string" && noticeId.trim() ? noticeId.trim() : null;

  const rawFilename = (rawFile as File).name || "document.pdf";
  const fileOriginalName = sanitizeDisplayFilename(rawFilename);

  // Size limit pre-check (10 MiB)
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

  // 4. Stage to temporary directory
  let stagingKey: string;
  try {
    const staged = await stageDocument(buffer);
    stagingKey = staged.stagingKey;
  } catch (err) {
    console.error("[notice-actions] Document staging failed:", err);
    return { success: false, error: "Failed to stage document upload." };
  }

  let permanentKey: string | null = null;

  try {
    // 5. PDF Core & Structural Validation
    const valResult = validatePdfBuffer(buffer, {
      mimeType: rawFile.type || "application/pdf",
      originalFilename: fileOriginalName,
      maxSizeBytes: MAX_SIZE,
    });

    if (!valResult.isValid) {
      await cleanupStagedDocument(stagingKey);
      return { success: false, error: valResult.error || "PDF validation failed." };
    }

    // 6. Malware Scanning (Fail-closed in production, gated synthetic in test)
    let scanResult;
    try {
      const scanner = getMalwareScanner();
      scanResult = await scanner.scanBuffer(buffer);
    } catch (scannerErr) {
      await cleanupStagedDocument(stagingKey);
      console.error("[notice-actions] Malware scanner execution failed:", scannerErr);
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

    // 7. Atomic Promotion
    const promoted = await promoteStagedDocument(stagingKey);
    permanentKey = promoted.permanentKey;

    const fileSizeBytes = valResult.details!.byteSize;
    const fileSha256 = valResult.details!.sha256;
    const fileUploadedAt = new Date();

    // 8. Transactional Notice Association (if noticeId provided)
    let oldStorageKeyToDelete: string | null = null;

    if (targetNoticeId) {
      await prisma.$transaction(async (tx) => {
        const existing = await tx.notice.findUnique({
          where: { id: targetNoticeId },
        });

        if (!existing) {
          throw new Error("Target notice not found.");
        }

        oldStorageKeyToDelete = existing.fileStorageKey;

        await tx.notice.update({
          where: { id: targetNoticeId },
          data: {
            fileStorageKey: permanentKey,
            fileSizeBytes,
            fileSha256,
            fileOriginalName,
            fileUploadedAt,
          },
        });

        await recordAuditEvent(
          {
            action: "DOCUMENT_UPLOADED",
            entityType: "Notice",
            entityId: existing.id,
            userId: user.id,
            ipAddress,
            metadata: {
              fileStorageKey: permanentKey,
              fileOriginalName,
              fileSizeBytes,
              fileSha256,
              noticeTitle: existing.title,
            },
          },
          tx
        );
      });

      // Post-commit cleanup: unlink old replaced file only after transaction commits successfully
      if (oldStorageKeyToDelete && oldStorageKeyToDelete !== permanentKey) {
        await deleteManagedDocument(oldStorageKeyToDelete);
      }
    } else {
      // Staged upload for new notice creation
      await recordAuditEvent({
        action: "DOCUMENT_UPLOADED",
        entityType: "Notice",
        entityId: "pending",
        userId: user.id,
        ipAddress,
        metadata: {
          fileStorageKey: permanentKey,
          fileOriginalName,
          fileSizeBytes,
          fileSha256,
        },
      });
    }

    revalidatePath("/admin/students-parents/notices");
    revalidatePath("/notices");

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
  } catch (err: unknown) {
    // Error Rollback: Clean up promoted file if database update failed
    if (permanentKey) {
      await deleteManagedDocument(permanentKey);
    } else {
      await cleanupStagedDocument(stagingKey);
    }

    const msg = err instanceof Error ? err.message : "Document upload failed.";
    console.error("[notice-actions] uploadNoticeDocumentAction failed:", err);
    return { success: false, error: msg };
  }
}

/**
 * Creates a new Notice.
 * Restricted strictly to SUPER_ADMIN.
 */
export async function createNoticeAction(
  _prevState: unknown,
  payload: unknown
): Promise<NoticeActionResponse> {
  // 1. Authorization check
  let user;
  try {
    user = await requireRole(["SUPER_ADMIN"]);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unauthorized access" };
  }

  // 2. Canonical schema validation
  const parseResult = createNoticeSchema.safeParse(payload);
  if (!parseResult.success) {
    return {
      success: false,
      error: "Validation failed. Please correct the highlighted errors.",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const data: CreateNoticeInput = parseResult.data;
  const ipAddress = await getClientIp();

  // 3. Rich-text sanitization
  const cleanSummary = data.summary ? sanitizeRichText(data.summary) : null;
  const cleanContent = data.content ? sanitizeRichText(data.content) : null;

  // 4. Transactional creation & audit log
  try {
    const createdNotice = await prisma.$transaction(async (tx) => {
      const slug = await generateDeterministicSlug(tx, data.title);
      const publishedAt = data.isPublished ? new Date() : null;

      const notice = await tx.notice.create({
        data: {
          title: data.title,
          slug,
          category: data.category,
          summary: cleanSummary,
          content: cleanContent,
          isUrgent: data.isUrgent,
          isPublished: data.isPublished,
          fileUrl: data.fileUrl || null,
          fileSize: data.fileSize || null,
          publishDate: data.publishDate,
          publishedAt,
          expiryDate: data.expiryDate || null,
          displayOrder: data.displayOrder,

          // Managed attachment fields
          fileStorageKey: data.fileStorageKey || null,
          fileSizeBytes: data.fileSizeBytes || null,
          fileSha256: data.fileSha256 || null,
          fileOriginalName: data.fileOriginalName || null,
          fileUploadedAt: data.fileUploadedAt || (data.fileStorageKey ? new Date() : null),

          authorId: user.id,
        },
      });

      await recordAuditEvent(
        {
          action: "NOTICE_CREATED",
          entityType: "Notice",
          entityId: notice.id,
          userId: user.id,
          ipAddress,
          metadata: {
            title: notice.title,
            slug: notice.slug,
            category: notice.category,
            isPublished: notice.isPublished,
            isUrgent: notice.isUrgent,
            hasManagedAttachment: Boolean(notice.fileStorageKey),
          },
        },
        tx
      );

      return notice;
    });

    revalidatePath("/admin/students-parents/notices");
    revalidatePath("/notices");
    revalidatePath("/");

    return { success: true, data: createdNotice };
  } catch (err) {
    console.error("[notice-actions] Failed to create notice:", err);
    return { success: false, error: "Database transaction failed while creating notice." };
  }
}

/**
 * Updates an existing Notice.
 * Restricted strictly to SUPER_ADMIN.
 */
export async function updateNoticeAction(
  _prevState: unknown,
  payload: unknown
): Promise<NoticeActionResponse> {
  // 1. Authorization check
  let user;
  try {
    user = await requireRole(["SUPER_ADMIN"]);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unauthorized access" };
  }

  // 2. Canonical schema validation
  const parseResult = updateNoticeSchema.safeParse(payload);
  if (!parseResult.success) {
    return {
      success: false,
      error: "Validation failed. Please correct the highlighted errors.",
      fieldErrors: parseResult.error.flatten().fieldErrors,
    };
  }

  const data: UpdateNoticeInput = parseResult.data;
  const ipAddress = await getClientIp();

  // 3. Rich-text sanitization
  const cleanSummary = data.summary ? sanitizeRichText(data.summary) : null;
  const cleanContent = data.content ? sanitizeRichText(data.content) : null;

  let oldStorageKeyToDelete: string | null = null;

  // 4. Transactional update & audit log
  try {
    const updatedNotice = await prisma.$transaction(async (tx) => {
      const existing = await tx.notice.findUnique({
        where: { id: data.id },
      });

      if (!existing) {
        throw new Error("Notice not found");
      }

      // If attachment is being replaced or removed, track old key for post-commit deletion
      if (existing.fileStorageKey && data.fileStorageKey !== existing.fileStorageKey) {
        oldStorageKeyToDelete = existing.fileStorageKey;
      }

      // If title changed, recompute deterministic slug
      let slug = existing.slug;
      if (data.title !== existing.title) {
        slug = await generateDeterministicSlug(tx, data.title, existing.id);
      }

      // Handle publishedAt timestamp
      let publishedAt = existing.publishedAt;
      if (data.isPublished && !existing.isPublished) {
        publishedAt = new Date();
      } else if (!data.isPublished && existing.isPublished) {
        publishedAt = null;
      }

      // Detect changed fields for audit diff
      const changedFields: Record<string, { from: unknown; to: unknown }> = {};
      if (existing.title !== data.title) changedFields.title = { from: existing.title, to: data.title };
      if (existing.category !== data.category) changedFields.category = { from: existing.category, to: data.category };
      if (existing.isPublished !== data.isPublished) changedFields.isPublished = { from: existing.isPublished, to: data.isPublished };
      if (existing.isUrgent !== data.isUrgent) changedFields.isUrgent = { from: existing.isUrgent, to: data.isUrgent };
      if (existing.fileUrl !== (data.fileUrl || null)) changedFields.fileUrl = { from: existing.fileUrl, to: data.fileUrl || null };
      if (existing.displayOrder !== data.displayOrder) changedFields.displayOrder = { from: existing.displayOrder, to: data.displayOrder };
      if (existing.fileStorageKey !== (data.fileStorageKey || null)) {
        changedFields.fileStorageKey = { from: existing.fileStorageKey, to: data.fileStorageKey || null };
      }

      const notice = await tx.notice.update({
        where: { id: data.id },
        data: {
          title: data.title,
          slug,
          category: data.category,
          summary: cleanSummary,
          content: cleanContent,
          isUrgent: data.isUrgent,
          isPublished: data.isPublished,
          fileUrl: data.fileUrl || null,
          fileSize: data.fileSize || null,
          publishDate: data.publishDate,
          publishedAt,
          expiryDate: data.expiryDate || null,
          displayOrder: data.displayOrder,

          // Managed attachment fields
          fileStorageKey: data.fileStorageKey || null,
          fileSizeBytes: data.fileSizeBytes || null,
          fileSha256: data.fileSha256 || null,
          fileOriginalName: data.fileOriginalName || null,
          fileUploadedAt: data.fileUploadedAt || (data.fileStorageKey && !existing.fileStorageKey ? new Date() : existing.fileUploadedAt),
        },
      });

      if (Object.keys(changedFields).length > 0) {
        await recordAuditEvent(
          {
            action: "NOTICE_UPDATED",
            entityType: "Notice",
            entityId: notice.id,
            userId: user.id,
            ipAddress,
            metadata: {
              changedFields,
            },
          },
          tx
        );
      }

      return notice;
    });

    // 5. Post-commit cleanup: unlink replaced attachment only after transaction committed
    if (oldStorageKeyToDelete) {
      await deleteManagedDocument(oldStorageKeyToDelete);
      await recordAuditEvent({
        action: "DOCUMENT_REMOVED",
        entityType: "Notice",
        entityId: data.id,
        userId: user.id,
        ipAddress,
        metadata: {
          removedStorageKey: oldStorageKeyToDelete,
        },
      });
    }

    revalidatePath("/admin/students-parents/notices");
    revalidatePath("/notices");
    revalidatePath("/");

    return { success: true, data: updatedNotice };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database update failed";
    console.error("[notice-actions] Failed to update notice:", err);
    return { success: false, error: msg };
  }
}

/**
 * Deletes a Notice.
 * Restricted strictly to SUPER_ADMIN.
 */
export async function deleteNoticeAction(
  _prevState: unknown,
  payload: unknown
): Promise<NoticeActionResponse> {
  // 1. Authorization check
  let user;
  try {
    user = await requireRole(["SUPER_ADMIN"]);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unauthorized access" };
  }

  // 2. Validation
  const parseResult = deleteNoticeSchema.safeParse(payload);
  if (!parseResult.success) {
    return { success: false, error: "Invalid notice ID." };
  }

  const { id } = parseResult.data;
  const ipAddress = await getClientIp();

  let storageKeyToDelete: string | null = null;

  // 3. Transactional deletion & audit log
  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.notice.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error("Notice not found");
      }

      storageKeyToDelete = existing.fileStorageKey;

      await tx.notice.delete({
        where: { id },
      });

      await recordAuditEvent(
        {
          action: "NOTICE_DELETED",
          entityType: "Notice",
          entityId: existing.id,
          userId: user.id,
          ipAddress,
          metadata: {
            title: existing.title,
            slug: existing.slug,
            category: existing.category,
            hadAttachment: Boolean(existing.fileStorageKey),
          },
        },
        tx
      );
    });

    // 4. Post-commit cleanup: Delete managed document only after transaction committed
    if (storageKeyToDelete) {
      await deleteManagedDocument(storageKeyToDelete);
      await recordAuditEvent({
        action: "DOCUMENT_DELETED",
        entityType: "Notice",
        entityId: id,
        userId: user.id,
        ipAddress,
        metadata: {
          deletedStorageKey: storageKeyToDelete,
        },
      });
    }

    revalidatePath("/admin/students-parents/notices");
    revalidatePath("/notices");
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database delete failed";
    console.error("[notice-actions] Failed to delete notice:", err);
    return { success: false, error: msg };
  }
}

/**
 * Toggles published status of a Notice.
 * Restricted strictly to SUPER_ADMIN.
 */
export async function toggleNoticeStatusAction(
  payload: unknown
): Promise<NoticeActionResponse> {
  let user;
  try {
    user = await requireRole(["SUPER_ADMIN"]);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unauthorized access" };
  }

  const parseResult = toggleNoticeStatusSchema.safeParse(payload);
  if (!parseResult.success) {
    return { success: false, error: "Invalid status toggle payload." };
  }

  const { id, isPublished } = parseResult.data;
  const ipAddress = await getClientIp();

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.notice.findUnique({ where: { id } });
      if (!existing) throw new Error("Notice not found");

      const publishedAt = isPublished ? (existing.publishedAt ?? new Date()) : null;

      const notice = await tx.notice.update({
        where: { id },
        data: {
          isPublished,
          publishedAt,
        },
      });

      await recordAuditEvent(
        {
          action: "NOTICE_STATUS_CHANGED",
          entityType: "Notice",
          entityId: notice.id,
          userId: user.id,
          ipAddress,
          metadata: {
            from: existing.isPublished ? "PUBLISHED" : "DRAFT",
            to: isPublished ? "PUBLISHED" : "DRAFT",
          },
        },
        tx
      );

      return notice;
    });

    revalidatePath("/admin/students-parents/notices");
    revalidatePath("/notices");
    revalidatePath("/");

    return { success: true, data: updated };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Status toggle failed";
    return { success: false, error: msg };
  }
}
