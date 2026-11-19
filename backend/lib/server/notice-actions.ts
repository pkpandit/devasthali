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
  reorderNoticesSchema,
  reorderNoticeAttachmentsSchema,
  deleteNoticeAttachmentSchema,
  toggleNoticeAttachmentStatusSchema,
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

function revalidateNoticeRoutes() {
  revalidatePath("/admin/students-parents/notices");
  revalidatePath("/notices");
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

      if (oldStorageKeyToDelete && oldStorageKeyToDelete !== permanentKey) {
        await deleteManagedDocument(oldStorageKeyToDelete);
      }
    } else {
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

    revalidateNoticeRoutes();

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
  let user;
  try {
    user = await requireRole(["SUPER_ADMIN"]);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unauthorized access" };
  }

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

  const cleanSummary = data.summary ? sanitizeRichText(data.summary) : null;
  const cleanContent = data.content ? sanitizeRichText(data.content) : null;

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

          // Managed attachment fields (root compatibility)
          fileStorageKey: data.fileStorageKey || null,
          fileSizeBytes: data.fileSizeBytes || null,
          fileSha256: data.fileSha256 || null,
          fileOriginalName: data.fileOriginalName || null,
          fileUploadedAt: data.fileUploadedAt || (data.fileStorageKey ? new Date() : null),

          authorId: user.id,
        },
      });

      // Create attachments if provided
      if (data.attachments && data.attachments.length > 0) {
        for (let i = 0; i < data.attachments.length; i++) {
          const att = data.attachments[i];
          const createdAtt = await tx.noticeAttachment.create({
            data: {
              noticeId: notice.id,
              title: att.title,
              fileUrl: att.fileUrl || null,
              fileStorageKey: att.fileStorageKey || null,
              fileSizeBytes: att.fileSizeBytes || null,
              fileSize: att.fileSize || null,
              fileType: att.fileType || "application/pdf",
              displayOrder: att.displayOrder ?? i,
              isPublished: att.isPublished ?? true,
            },
          });

          await recordAuditEvent(
            {
              action: "NOTICE_ATTACHMENT_CREATED",
              entityType: "NoticeAttachment",
              entityId: createdAtt.id,
              userId: user.id,
              ipAddress,
              metadata: {
                noticeId: notice.id,
                title: createdAtt.title,
                fileStorageKey: createdAtt.fileStorageKey,
              },
            },
            tx
          );
        }
      } else if (data.fileUrl || data.fileStorageKey) {
        // Auto-create default attachment from root document for consistency
        const defaultTitle = data.fileOriginalName || `${data.title} Document`;
        const createdAtt = await tx.noticeAttachment.create({
          data: {
            noticeId: notice.id,
            title: defaultTitle,
            fileUrl: data.fileUrl || null,
            fileStorageKey: data.fileStorageKey || null,
            fileSizeBytes: data.fileSizeBytes || null,
            fileSize: data.fileSize || null,
            fileType: "application/pdf",
            displayOrder: 0,
            isPublished: true,
          },
        });

        await recordAuditEvent(
          {
            action: "NOTICE_ATTACHMENT_CREATED",
            entityType: "NoticeAttachment",
            entityId: createdAtt.id,
            userId: user.id,
            ipAddress,
            metadata: {
              noticeId: notice.id,
              title: createdAtt.title,
              fileStorageKey: createdAtt.fileStorageKey,
            },
          },
          tx
        );
      }

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
            attachmentCount: data.attachments?.length || (data.fileUrl || data.fileStorageKey ? 1 : 0),
          },
        },
        tx
      );

      return notice;
    });

    revalidateNoticeRoutes();

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
  let user;
  try {
    user = await requireRole(["SUPER_ADMIN"]);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unauthorized access" };
  }

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

  const cleanSummary = data.summary ? sanitizeRichText(data.summary) : null;
  const cleanContent = data.content ? sanitizeRichText(data.content) : null;

  let oldStorageKeyToDelete: string | null = null;
  const attachmentStorageKeysToDelete: string[] = [];

  try {
    const updatedNotice = await prisma.$transaction(async (tx) => {
      const existing = await tx.notice.findUnique({
        where: { id: data.id },
      });

      if (!existing) {
        throw new Error("Notice not found");
      }

      if (existing.fileStorageKey && data.fileStorageKey !== existing.fileStorageKey) {
        oldStorageKeyToDelete = existing.fileStorageKey;
      }

      let slug = existing.slug;
      if (data.title !== existing.title) {
        slug = await generateDeterministicSlug(tx, data.title, existing.id);
      }

      let publishedAt = existing.publishedAt;
      if (data.isPublished && !existing.isPublished) {
        publishedAt = new Date();
      } else if (!data.isPublished && existing.isPublished) {
        publishedAt = null;
      }

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

      // Synchronize attachments if array provided
      if (Array.isArray(data.attachments)) {
        const existingAtts = await tx.noticeAttachment.findMany({
          where: { noticeId: data.id },
        });
        const incomingIds = new Set(data.attachments.map((a) => a.id).filter(Boolean));

        // Delete removed attachments
        for (const existingAtt of existingAtts) {
          if (!incomingIds.has(existingAtt.id)) {
            if (existingAtt.fileStorageKey) {
              attachmentStorageKeysToDelete.push(existingAtt.fileStorageKey);
            }
            await tx.noticeAttachment.delete({
              where: { id: existingAtt.id },
            });
            await recordAuditEvent(
              {
                action: "NOTICE_ATTACHMENT_DELETED",
                entityType: "NoticeAttachment",
                entityId: existingAtt.id,
                userId: user.id,
                ipAddress,
                metadata: {
                  noticeId: data.id,
                  title: existingAtt.title,
                  fileStorageKey: existingAtt.fileStorageKey,
                },
              },
              tx
            );
          }
        }

        // Upsert incoming attachments
        for (let i = 0; i < data.attachments.length; i++) {
          const att = data.attachments[i];
          const displayOrder = att.displayOrder ?? i;

          if (att.id && existingAtts.some((ea) => ea.id === att.id)) {
            const prev = existingAtts.find((ea) => ea.id === att.id)!;
            if (prev.fileStorageKey && att.fileStorageKey && prev.fileStorageKey !== att.fileStorageKey) {
              attachmentStorageKeysToDelete.push(prev.fileStorageKey);
            }
            await tx.noticeAttachment.update({
              where: { id: att.id },
              data: {
                title: att.title,
                fileUrl: att.fileUrl || null,
                fileStorageKey: att.fileStorageKey || null,
                fileSizeBytes: att.fileSizeBytes || null,
                fileSize: att.fileSize || null,
                fileType: att.fileType || "application/pdf",
                displayOrder,
                isPublished: att.isPublished ?? true,
              },
            });
            await recordAuditEvent(
              {
                action: "NOTICE_ATTACHMENT_UPDATED",
                entityType: "NoticeAttachment",
                entityId: att.id,
                userId: user.id,
                ipAddress,
                metadata: {
                  noticeId: data.id,
                  title: att.title,
                  fileStorageKey: att.fileStorageKey,
                },
              },
              tx
            );
          } else {
            const createdAtt = await tx.noticeAttachment.create({
              data: {
                noticeId: data.id,
                title: att.title,
                fileUrl: att.fileUrl || null,
                fileStorageKey: att.fileStorageKey || null,
                fileSizeBytes: att.fileSizeBytes || null,
                fileSize: att.fileSize || null,
                fileType: att.fileType || "application/pdf",
                displayOrder,
                isPublished: att.isPublished ?? true,
              },
            });
            await recordAuditEvent(
              {
                action: "NOTICE_ATTACHMENT_CREATED",
                entityType: "NoticeAttachment",
                entityId: createdAtt.id,
                userId: user.id,
                ipAddress,
                metadata: {
                  noticeId: data.id,
                  title: createdAtt.title,
                  fileStorageKey: createdAtt.fileStorageKey,
                },
              },
              tx
            );
          }
        }
      }

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

    for (const key of attachmentStorageKeysToDelete) {
      await deleteManagedDocument(key);
      await recordAuditEvent({
        action: "DOCUMENT_REMOVED",
        entityType: "NoticeAttachment",
        entityId: data.id,
        userId: user.id,
        ipAddress,
        metadata: {
          removedStorageKey: key,
        },
      });
    }

    revalidateNoticeRoutes();

    return { success: true, data: updatedNotice };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database update failed";
    console.error("[notice-actions] Failed to update notice:", err);
    return { success: false, error: msg };
  }
}

/**
 * Deletes a Notice and cascades to its attachments and managed files.
 * Restricted strictly to SUPER_ADMIN.
 */
export async function deleteNoticeAction(
  _prevState: unknown,
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

  const parseResult = deleteNoticeSchema.safeParse(payload);
  if (!parseResult.success) {
    return { success: false, error: "Invalid notice ID." };
  }

  const { id } = parseResult.data;
  const ipAddress = await getClientIp();

  const storageKeysToDelete: string[] = [];

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.notice.findUnique({
        where: { id },
        include: { attachments: true },
      });

      if (!existing) {
        throw new Error("Notice not found");
      }

      if (existing.fileStorageKey) {
        storageKeysToDelete.push(existing.fileStorageKey);
      }
      for (const att of existing.attachments) {
        if (att.fileStorageKey) {
          storageKeysToDelete.push(att.fileStorageKey);
        }
      }

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
            attachmentCount: existing.attachments.length,
          },
        },
        tx
      );
    });

    for (const storageKey of storageKeysToDelete) {
      await deleteManagedDocument(storageKey);
      await recordAuditEvent({
        action: "DOCUMENT_DELETED",
        entityType: "Notice",
        entityId: id,
        userId: user.id,
        ipAddress,
        metadata: {
          deletedStorageKey: storageKey,
        },
      });
    }

    revalidateNoticeRoutes();

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

    revalidateNoticeRoutes();

    return { success: true, data: updated };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Status toggle failed";
    return { success: false, error: msg };
  }
}

/**
 * Reorders Notices in batch.
 * Restricted strictly to SUPER_ADMIN.
 */
export async function reorderNoticesAction(
  payload: unknown
): Promise<NoticeActionResponse<{ count: number }>> {
  let user;
  try {
    user = await requireRole(["SUPER_ADMIN"]);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unauthorized access" };
  }

  const parseResult = reorderNoticesSchema.safeParse(payload);
  if (!parseResult.success) {
    return { success: false, error: "Invalid ordering payload." };
  }

  const { orderedIds } = parseResult.data;
  const ipAddress = await getClientIp();

  try {
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx.notice.update({
          where: { id: orderedIds[i] },
          data: { displayOrder: i },
        });
      }

      await recordAuditEvent(
        {
          userId: user.id,
          action: "NOTICES_REORDERED",
          entityType: "Notice",
          entityId: "batch",
          ipAddress,
          metadata: {
            orderedIds,
            count: orderedIds.length,
          },
        },
        tx
      );
    });

    revalidateNoticeRoutes();
    return { success: true, data: { count: orderedIds.length } };
  } catch (err) {
    console.error("[reorderNoticesAction] Error:", err);
    return { success: false, error: "Failed to reorder notices." };
  }
}

/**
 * Reorders Notice Attachments for a specific notice.
 * Restricted strictly to SUPER_ADMIN.
 */
export async function reorderNoticeAttachmentsAction(
  payload: unknown
): Promise<NoticeActionResponse<{ count: number }>> {
  let user;
  try {
    user = await requireRole(["SUPER_ADMIN"]);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Unauthorized access" };
  }

  const parseResult = reorderNoticeAttachmentsSchema.safeParse(payload);
  if (!parseResult.success) {
    return { success: false, error: "Invalid attachment ordering payload." };
  }

  const { noticeId, orderedIds } = parseResult.data;
  const ipAddress = await getClientIp();

  try {
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx.noticeAttachment.updateMany({
          where: { id: orderedIds[i], noticeId },
          data: { displayOrder: i },
        });
      }

      await recordAuditEvent(
        {
          userId: user.id,
          action: "NOTICE_ATTACHMENTS_REORDERED",
          entityType: "NoticeAttachment",
          entityId: noticeId,
          ipAddress,
          metadata: {
            noticeId,
            orderedIds,
            count: orderedIds.length,
          },
        },
        tx
      );
    });

    revalidateNoticeRoutes();
    return { success: true, data: { count: orderedIds.length } };
  } catch (err) {
    console.error("[reorderNoticeAttachmentsAction] Error:", err);
    return { success: false, error: "Failed to reorder notice attachments." };
  }
}

/**
 * Deletes a single Notice Attachment and cleans up its storage key.
 * Restricted strictly to SUPER_ADMIN.
 */
export async function deleteNoticeAttachmentAction(
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

  const parseResult = deleteNoticeAttachmentSchema.safeParse(payload);
  if (!parseResult.success) {
    return { success: false, error: "Invalid attachment ID." };
  }

  const { id } = parseResult.data;
  const ipAddress = await getClientIp();
  let storageKeyToDelete: string | null = null;

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.noticeAttachment.findUnique({
        where: { id },
      });
      if (!existing) {
        throw new Error("Notice attachment not found.");
      }

      storageKeyToDelete = existing.fileStorageKey;

      await tx.noticeAttachment.delete({
        where: { id },
      });

      await recordAuditEvent(
        {
          action: "NOTICE_ATTACHMENT_DELETED",
          entityType: "NoticeAttachment",
          entityId: id,
          userId: user.id,
          ipAddress,
          metadata: {
            noticeId: existing.noticeId,
            title: existing.title,
            fileStorageKey: existing.fileStorageKey,
          },
        },
        tx
      );
    });

    if (storageKeyToDelete) {
      await deleteManagedDocument(storageKeyToDelete);
      await recordAuditEvent({
        action: "DOCUMENT_DELETED",
        entityType: "NoticeAttachment",
        entityId: id,
        userId: user.id,
        ipAddress,
        metadata: {
          deletedStorageKey: storageKeyToDelete,
        },
      });
    }

    revalidateNoticeRoutes();
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete attachment.";
    console.error("[deleteNoticeAttachmentAction] Error:", err);
    return { success: false, error: msg };
  }
}

/**
 * Toggles published status of a Notice Attachment.
 * Restricted strictly to SUPER_ADMIN.
 */
export async function toggleNoticeAttachmentStatusAction(
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

  const parseResult = toggleNoticeAttachmentStatusSchema.safeParse(payload);
  if (!parseResult.success) {
    return { success: false, error: "Invalid status toggle payload." };
  }

  const { id, isPublished } = parseResult.data;
  const ipAddress = await getClientIp();

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.noticeAttachment.findUnique({ where: { id } });
      if (!existing) throw new Error("Attachment not found");

      const attachment = await tx.noticeAttachment.update({
        where: { id },
        data: { isPublished },
      });

      await recordAuditEvent(
        {
          action: "NOTICE_ATTACHMENT_STATUS_CHANGED",
          entityType: "NoticeAttachment",
          entityId: attachment.id,
          userId: user.id,
          ipAddress,
          metadata: {
            noticeId: existing.noticeId,
            from: existing.isPublished ? "PUBLISHED" : "DRAFT",
            to: isPublished ? "PUBLISHED" : "DRAFT",
          },
        },
        tx
      );

      return attachment;
    });

    revalidateNoticeRoutes();
    return { success: true, data: updated };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Status toggle failed";
    return { success: false, error: msg };
  }
}
