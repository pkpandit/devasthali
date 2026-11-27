"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/server/prisma";
import { requireRole } from "@/lib/server/auth";
import { recordAuditEvent } from "@/lib/server/audit";
import {
  homepageAnnouncementUpdateSchema,
  homepageFaqCreateSchema,
  homepageFaqUpdateSchema,
  homepageFaqDeleteSchema,
  homepageFaqsReorderSchema,
  homepageFaqToggleSchema,
  type HomepageAnnouncementUpdateInput,
  type HomepageFaqCreateInput,
  type HomepageFaqUpdateInput,
  type HomepageFaqDeleteInput,
  type HomepageFaqsReorderInput,
  type HomepageFaqToggleInput,
} from "@/lib/validation/homepage-announcement-faq";

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function revalidateHomepageCaches() {
  try {
    revalidatePath("/admin/homepage");
    revalidatePath("/api/public/homepage");
    revalidatePath("/");
    revalidateTag("homepage", "max");
  } catch {
    // In test or CLI runtime, next/cache may be inert
  }
}

// ==========================================
// 1. HOMEPAGE ANNOUNCEMENT ACTIONS
// ==========================================

export async function updateHomepageAnnouncementAction(
  rawInput: HomepageAnnouncementUpdateInput
): Promise<ActionResponse> {
  try {
    const user = await requireRole(["SUPER_ADMIN"], "/admin/homepage");

    const parsed = homepageAnnouncementUpdateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const updated = await prisma.homepageAnnouncement.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        enabled: parsed.data.enabled,
        title: parsed.data.title,
        badge: parsed.data.badge,
        subtitle: parsed.data.subtitle,
        imageUrl: parsed.data.imageUrl,
        imageAlt: parsed.data.imageAlt,
        linkHref: parsed.data.linkHref,
        linkLabel: parsed.data.linkLabel,
        delayMs: parsed.data.delayMs,
        dismissalKey: parsed.data.dismissalKey,
      },
      update: {
        enabled: parsed.data.enabled,
        title: parsed.data.title,
        badge: parsed.data.badge,
        subtitle: parsed.data.subtitle,
        imageUrl: parsed.data.imageUrl,
        imageAlt: parsed.data.imageAlt,
        linkHref: parsed.data.linkHref,
        linkLabel: parsed.data.linkLabel,
        delayMs: parsed.data.delayMs,
        dismissalKey: parsed.data.dismissalKey,
      },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "HOMEPAGE_ANNOUNCEMENT_UPDATED",
      entityType: "HomepageAnnouncement",
      entityId: "default",
      metadata: {
        enabled: updated.enabled,
        title: updated.title,
        imageUrl: updated.imageUrl,
        linkHref: updated.linkHref,
        delayMs: updated.delayMs,
        dismissalKey: updated.dismissalKey,
      },
    });

    revalidateHomepageCaches();
    return { success: true, data: updated };
  } catch (error) {
    console.error("[HomepageActions] updateHomepageAnnouncementAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update homepage announcement",
    };
  }
}

// ==========================================
// 2. HOMEPAGE FAQ ACTIONS
// ==========================================

export async function createHomepageFaqAction(
  rawInput: HomepageFaqCreateInput
): Promise<ActionResponse> {
  try {
    const user = await requireRole(["SUPER_ADMIN"], "/admin/homepage");

    const parsed = homepageFaqCreateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    let displayOrder = parsed.data.displayOrder;
    if (displayOrder === 0) {
      const highest = await prisma.homepageFaq.findFirst({
        orderBy: { displayOrder: "desc" },
        select: { displayOrder: true },
      });
      displayOrder = (highest?.displayOrder ?? -1) + 1;
    }

    const faq = await prisma.homepageFaq.create({
      data: {
        question: parsed.data.question,
        answer: parsed.data.answer,
        displayOrder,
        isPublished: parsed.data.isPublished,
      },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "HOMEPAGE_FAQ_CREATED",
      entityType: "HomepageFaq",
      entityId: faq.id,
      metadata: {
        question: faq.question,
        displayOrder: faq.displayOrder,
        isPublished: faq.isPublished,
      },
    });

    revalidateHomepageCaches();
    return { success: true, data: faq };
  } catch (error) {
    console.error("[HomepageActions] createHomepageFaqAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create homepage FAQ",
    };
  }
}

export async function updateHomepageFaqAction(
  rawInput: HomepageFaqUpdateInput
): Promise<ActionResponse> {
  try {
    const user = await requireRole(["SUPER_ADMIN"], "/admin/homepage");

    const parsed = homepageFaqUpdateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const existing = await prisma.homepageFaq.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "FAQ record not found" };
    }

    const updated = await prisma.homepageFaq.update({
      where: { id: parsed.data.id },
      data: {
        question: parsed.data.question,
        answer: parsed.data.answer,
        ...(parsed.data.displayOrder !== undefined
          ? { displayOrder: parsed.data.displayOrder }
          : {}),
        ...(parsed.data.isPublished !== undefined
          ? { isPublished: parsed.data.isPublished }
          : {}),
      },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "HOMEPAGE_FAQ_UPDATED",
      entityType: "HomepageFaq",
      entityId: updated.id,
      metadata: {
        question: updated.question,
        displayOrder: updated.displayOrder,
        isPublished: updated.isPublished,
      },
    });

    revalidateHomepageCaches();
    return { success: true, data: updated };
  } catch (error) {
    console.error("[HomepageActions] updateHomepageFaqAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update homepage FAQ",
    };
  }
}

export async function deleteHomepageFaqAction(
  rawInput: HomepageFaqDeleteInput
): Promise<ActionResponse> {
  try {
    const user = await requireRole(["SUPER_ADMIN"], "/admin/homepage");

    const parsed = homepageFaqDeleteSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid FAQ ID" };
    }

    const existing = await prisma.homepageFaq.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "FAQ record not found" };
    }

    await prisma.homepageFaq.delete({
      where: { id: parsed.data.id },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "HOMEPAGE_FAQ_DELETED",
      entityType: "HomepageFaq",
      entityId: parsed.data.id,
      metadata: {
        question: existing.question,
      },
    });

    revalidateHomepageCaches();
    return { success: true };
  } catch (error) {
    console.error("[HomepageActions] deleteHomepageFaqAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete homepage FAQ",
    };
  }
}

export async function toggleHomepageFaqStatusAction(
  rawInput: HomepageFaqToggleInput
): Promise<ActionResponse> {
  try {
    const user = await requireRole(["SUPER_ADMIN"], "/admin/homepage");

    const parsed = homepageFaqToggleSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid FAQ ID" };
    }

    const existing = await prisma.homepageFaq.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "FAQ record not found" };
    }

    const newStatus = !existing.isPublished;
    const updated = await prisma.homepageFaq.update({
      where: { id: parsed.data.id },
      data: { isPublished: newStatus },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "HOMEPAGE_FAQ_STATUS_CHANGED",
      entityType: "HomepageFaq",
      entityId: updated.id,
      metadata: {
        question: updated.question,
        previousStatus: existing.isPublished,
        newStatus: updated.isPublished,
      },
    });

    revalidateHomepageCaches();
    return { success: true, data: updated };
  } catch (error) {
    console.error("[HomepageActions] toggleHomepageFaqStatusAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to toggle homepage FAQ status",
    };
  }
}

export async function reorderHomepageFaqsAction(
  rawInput: HomepageFaqsReorderInput
): Promise<ActionResponse> {
  try {
    const user = await requireRole(["SUPER_ADMIN"], "/admin/homepage");

    const parsed = homepageFaqsReorderSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const itemIds = parsed.data.items.map((i) => i.id);

    // Verify all IDs exist in database
    const count = await prisma.homepageFaq.count({
      where: {
        id: { in: itemIds },
      },
    });

    if (count !== itemIds.length) {
      return {
        success: false,
        error: "One or more FAQ IDs do not exist",
      };
    }

    // Execute atomic update
    await prisma.$transaction(
      parsed.data.items.map((item) =>
        prisma.homepageFaq.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    await recordAuditEvent({
      userId: user.id,
      action: "HOMEPAGE_FAQS_REORDERED",
      entityType: "HomepageFaq",
      entityId: "batch",
      metadata: {
        itemCount: parsed.data.items.length,
      },
    });

    revalidateHomepageCaches();
    return { success: true };
  } catch (error) {
    console.error("[HomepageActions] reorderHomepageFaqsAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to reorder homepage FAQs",
    };
  }
}
