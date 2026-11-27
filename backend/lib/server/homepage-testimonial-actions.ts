"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/server/prisma";
import { requireRole } from "@/lib/server/auth";
import { recordAuditEvent } from "@/lib/server/audit";
import {
  homepageTestimonialCreateSchema,
  homepageTestimonialUpdateSchema,
  homepageTestimonialDeleteSchema,
  homepageTestimonialsReorderSchema,
  homepageTestimonialToggleSchema,
  type HomepageTestimonialCreateInput,
  type HomepageTestimonialUpdateInput,
  type HomepageTestimonialDeleteInput,
  type HomepageTestimonialsReorderInput,
  type HomepageTestimonialToggleInput,
} from "@/lib/validation/homepage-testimonial";

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
// HOMEPAGE TESTIMONIAL ACTIONS
// ==========================================

export async function createHomepageTestimonialAction(
  rawInput: HomepageTestimonialCreateInput
): Promise<ActionResponse> {
  try {
    const user = await requireRole(["SUPER_ADMIN"], "/admin/homepage");

    const parsed = homepageTestimonialCreateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    let displayOrder = parsed.data.displayOrder;
    if (displayOrder === 0) {
      const highest = await prisma.homepageTestimonial.findFirst({
        orderBy: { displayOrder: "desc" },
        select: { displayOrder: true },
      });
      displayOrder = (highest?.displayOrder ?? -1) + 1;
    }

    const testimonial = await prisma.homepageTestimonial.create({
      data: {
        author: parsed.data.author,
        relationship: parsed.data.relationship,
        subject: parsed.data.subject,
        quote: parsed.data.quote,
        rating: parsed.data.rating,
        avatarUrl: parsed.data.avatarUrl,
        monogram: parsed.data.monogram,
        displayOrder,
        isPublished: parsed.data.isPublished,
      },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "HOMEPAGE_TESTIMONIAL_CREATED",
      entityType: "HomepageTestimonial",
      entityId: testimonial.id,
      metadata: {
        author: testimonial.author,
        relationship: testimonial.relationship,
        displayOrder: testimonial.displayOrder,
        isPublished: testimonial.isPublished,
      },
    });

    revalidateHomepageCaches();
    return { success: true, data: testimonial };
  } catch (error) {
    console.error("[TestimonialActions] createHomepageTestimonialAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create homepage testimonial",
    };
  }
}

export async function updateHomepageTestimonialAction(
  rawInput: HomepageTestimonialUpdateInput
): Promise<ActionResponse> {
  try {
    const user = await requireRole(["SUPER_ADMIN"], "/admin/homepage");

    const parsed = homepageTestimonialUpdateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const existing = await prisma.homepageTestimonial.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "Testimonial record not found" };
    }

    const updated = await prisma.homepageTestimonial.update({
      where: { id: parsed.data.id },
      data: {
        author: parsed.data.author,
        relationship: parsed.data.relationship,
        subject: parsed.data.subject,
        quote: parsed.data.quote,
        rating: parsed.data.rating,
        avatarUrl: parsed.data.avatarUrl,
        monogram: parsed.data.monogram,
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
      action: "HOMEPAGE_TESTIMONIAL_UPDATED",
      entityType: "HomepageTestimonial",
      entityId: updated.id,
      metadata: {
        author: updated.author,
        relationship: updated.relationship,
        displayOrder: updated.displayOrder,
        isPublished: updated.isPublished,
      },
    });

    revalidateHomepageCaches();
    return { success: true, data: updated };
  } catch (error) {
    console.error("[TestimonialActions] updateHomepageTestimonialAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update homepage testimonial",
    };
  }
}

export async function deleteHomepageTestimonialAction(
  rawInput: HomepageTestimonialDeleteInput
): Promise<ActionResponse> {
  try {
    const user = await requireRole(["SUPER_ADMIN"], "/admin/homepage");

    const parsed = homepageTestimonialDeleteSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid testimonial ID" };
    }

    const existing = await prisma.homepageTestimonial.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "Testimonial record not found" };
    }

    await prisma.homepageTestimonial.delete({
      where: { id: parsed.data.id },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "HOMEPAGE_TESTIMONIAL_DELETED",
      entityType: "HomepageTestimonial",
      entityId: parsed.data.id,
      metadata: {
        author: existing.author,
      },
    });

    revalidateHomepageCaches();
    return { success: true };
  } catch (error) {
    console.error("[TestimonialActions] deleteHomepageTestimonialAction error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete homepage testimonial",
    };
  }
}

export async function toggleHomepageTestimonialStatusAction(
  rawInput: HomepageTestimonialToggleInput
): Promise<ActionResponse> {
  try {
    const user = await requireRole(["SUPER_ADMIN"], "/admin/homepage");

    const parsed = homepageTestimonialToggleSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid testimonial ID" };
    }

    const existing = await prisma.homepageTestimonial.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "Testimonial record not found" };
    }

    const newStatus = !existing.isPublished;
    const updated = await prisma.homepageTestimonial.update({
      where: { id: parsed.data.id },
      data: { isPublished: newStatus },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "HOMEPAGE_TESTIMONIAL_STATUS_CHANGED",
      entityType: "HomepageTestimonial",
      entityId: updated.id,
      metadata: {
        author: updated.author,
        previousStatus: existing.isPublished,
        newStatus: updated.isPublished,
      },
    });

    revalidateHomepageCaches();
    return { success: true, data: updated };
  } catch (error) {
    console.error(
      "[TestimonialActions] toggleHomepageTestimonialStatusAction error:",
      error
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to toggle homepage testimonial status",
    };
  }
}

export async function reorderHomepageTestimonialsAction(
  rawInput: HomepageTestimonialsReorderInput
): Promise<ActionResponse> {
  try {
    const user = await requireRole(["SUPER_ADMIN"], "/admin/homepage");

    const parsed = homepageTestimonialsReorderSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const itemIds = parsed.data.items.map((i) => i.id);

    // Verify all IDs exist in database
    const count = await prisma.homepageTestimonial.count({
      where: {
        id: { in: itemIds },
      },
    });

    if (count !== itemIds.length) {
      return {
        success: false,
        error: "One or more testimonial IDs do not exist",
      };
    }

    // Execute atomic update inside transaction
    await prisma.$transaction(
      parsed.data.items.map((item) =>
        prisma.homepageTestimonial.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    await recordAuditEvent({
      userId: user.id,
      action: "HOMEPAGE_TESTIMONIALS_REORDERED",
      entityType: "HomepageTestimonial",
      entityId: "batch",
      metadata: {
        itemCount: parsed.data.items.length,
      },
    });

    revalidateHomepageCaches();
    return { success: true };
  } catch (error) {
    console.error(
      "[TestimonialActions] reorderHomepageTestimonialsAction error:",
      error
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to reorder homepage testimonials",
    };
  }
}
