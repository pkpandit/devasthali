"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
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

export interface NoticeActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  noOp?: boolean;
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

  // 4. Transactional update & audit log
  try {
    const updatedNotice = await prisma.$transaction(async (tx) => {
      const existing = await tx.notice.findUnique({
        where: { id: data.id },
      });

      if (!existing) {
        throw new Error("Notice not found");
      }

      // If title changed, recompute deterministic slug
      let slug = existing.slug;
      if (data.title !== existing.title) {
        slug = await generateDeterministicSlug(tx, data.title, existing.id);
      }

      // Handle publishedAt timestamp
      let publishedAt = existing.publishedAt;
      if (data.isPublished && !existing.isPublished) {
        // Transitioning from draft to published
        publishedAt = new Date();
      } else if (!data.isPublished && existing.isPublished) {
        // Transitioning from published to draft
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

  // 3. Transactional deletion & audit log
  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.notice.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error("Notice not found");
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
          },
        },
        tx
      );
    });

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
