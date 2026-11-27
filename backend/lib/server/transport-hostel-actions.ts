"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/server/prisma";
import { requireRole } from "@/lib/server/auth";
import { recordAuditEvent } from "@/lib/server/audit";
import {
  hostelSectionUpdateSchema,
  hostelFeatureCreateSchema,
  hostelFeatureUpdateSchema,
  hostelFeatureDeleteSchema,
  hostelFeaturesReorderSchema,
  hostelFeatureToggleSchema,
  transportSectionUpdateSchema,
  type HostelSectionUpdateInput,
  type HostelFeatureCreateInput,
  type HostelFeatureUpdateInput,
  type HostelFeatureDeleteInput,
  type HostelFeaturesReorderInput,
  type HostelFeatureToggleInput,
  type TransportSectionUpdateInput,
} from "@/lib/validation/transport-hostel";

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

function revalidateCaches() {
  try {
    revalidatePath("/facilities");
    revalidatePath("/admin/life-at-school/hostels");
    revalidatePath("/admin/life-at-school/transport");
    revalidateTag("life_at_school", "max");
  } catch {
    // In test or CLI runtime, next/cache may be mocked or inert
  }
}

// ==========================================
// HOSTEL ACTIONS
// ==========================================

export async function updateHostelSectionAction(
  rawInput: HostelSectionUpdateInput
): Promise<ActionResponse> {
  try {
    const user = await requireRole(["SUPER_ADMIN"], "/admin/life-at-school/hostels");

    const parsed = hostelSectionUpdateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const updated = await prisma.hostelSection.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        badge: parsed.data.badge,
        title: parsed.data.title,
        description: parsed.data.description,
      },
      update: {
        badge: parsed.data.badge,
        title: parsed.data.title,
        description: parsed.data.description,
      },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "HOSTEL_SECTION_UPDATED",
      entityType: "HostelSection",
      entityId: "default",
      metadata: {
        badge: updated.badge,
        title: updated.title,
      },
    });

    revalidateCaches();
    return { success: true, data: updated };
  } catch (error) {
    console.error("[HostelActions] updateHostelSectionAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update hostel section",
    };
  }
}

export async function createHostelFeatureAction(
  rawInput: HostelFeatureCreateInput
): Promise<ActionResponse> {
  try {
    const user = await requireRole(["SUPER_ADMIN"], "/admin/life-at-school/hostels");

    const parsed = hostelFeatureCreateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    // Auto-calculate displayOrder if not explicitly specified
    let displayOrder = parsed.data.displayOrder;
    if (displayOrder === 0) {
      const highest = await prisma.hostelFeature.findFirst({
        where: { sectionId: "default" },
        orderBy: { displayOrder: "desc" },
        select: { displayOrder: true },
      });
      displayOrder = (highest?.displayOrder ?? -1) + 1;
    }

    // Ensure hostelSection exists before creating feature
    await prisma.hostelSection.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        description:
          "Our residential boarding is structured to instill life-long habits of self-reliance, physical vigor, and focused academic discipline.",
      },
      update: {},
    });

    const feature = await prisma.hostelFeature.create({
      data: {
        sectionId: "default",
        title: parsed.data.title,
        description: parsed.data.description,
        displayOrder,
        isPublished: parsed.data.isPublished,
      },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "HOSTEL_FEATURE_CREATED",
      entityType: "HostelFeature",
      entityId: feature.id,
      metadata: {
        title: feature.title,
        displayOrder: feature.displayOrder,
      },
    });

    revalidateCaches();
    return { success: true, data: feature };
  } catch (error) {
    console.error("[HostelActions] createHostelFeatureAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create hostel feature",
    };
  }
}

export async function updateHostelFeatureAction(
  rawInput: HostelFeatureUpdateInput
): Promise<ActionResponse> {
  try {
    const user = await requireRole(["SUPER_ADMIN"], "/admin/life-at-school/hostels");

    const parsed = hostelFeatureUpdateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const existing = await prisma.hostelFeature.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "Hostel feature record not found" };
    }

    const updated = await prisma.hostelFeature.update({
      where: { id: parsed.data.id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        ...(parsed.data.displayOrder !== undefined ? { displayOrder: parsed.data.displayOrder } : {}),
        ...(parsed.data.isPublished !== undefined ? { isPublished: parsed.data.isPublished } : {}),
      },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "HOSTEL_FEATURE_UPDATED",
      entityType: "HostelFeature",
      entityId: updated.id,
      metadata: {
        title: updated.title,
        displayOrder: updated.displayOrder,
        isPublished: updated.isPublished,
      },
    });

    revalidateCaches();
    return { success: true, data: updated };
  } catch (error) {
    console.error("[HostelActions] updateHostelFeatureAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update hostel feature",
    };
  }
}

export async function deleteHostelFeatureAction(
  rawInput: HostelFeatureDeleteInput
): Promise<ActionResponse> {
  try {
    const user = await requireRole(["SUPER_ADMIN"], "/admin/life-at-school/hostels");

    const parsed = hostelFeatureDeleteSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid feature ID" };
    }

    const existing = await prisma.hostelFeature.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "Hostel feature record not found" };
    }

    await prisma.hostelFeature.delete({
      where: { id: parsed.data.id },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "HOSTEL_FEATURE_DELETED",
      entityType: "HostelFeature",
      entityId: parsed.data.id,
      metadata: {
        title: existing.title,
      },
    });

    revalidateCaches();
    return { success: true };
  } catch (error) {
    console.error("[HostelActions] deleteHostelFeatureAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete hostel feature",
    };
  }
}

export async function toggleHostelFeatureStatusAction(
  rawInput: HostelFeatureToggleInput
): Promise<ActionResponse> {
  try {
    const user = await requireRole(["SUPER_ADMIN"], "/admin/life-at-school/hostels");

    const parsed = hostelFeatureToggleSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid feature ID" };
    }

    const existing = await prisma.hostelFeature.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "Hostel feature record not found" };
    }

    const newStatus = !existing.isPublished;
    const updated = await prisma.hostelFeature.update({
      where: { id: parsed.data.id },
      data: { isPublished: newStatus },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "HOSTEL_FEATURE_STATUS_CHANGED",
      entityType: "HostelFeature",
      entityId: updated.id,
      metadata: {
        title: updated.title,
        isPublished: updated.isPublished,
      },
    });

    revalidateCaches();
    return { success: true, data: updated };
  } catch (error) {
    console.error("[HostelActions] toggleHostelFeatureStatusAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to toggle hostel feature status",
    };
  }
}

export async function reorderHostelFeaturesAction(
  rawInput: HostelFeaturesReorderInput
): Promise<ActionResponse> {
  try {
    const user = await requireRole(["SUPER_ADMIN"], "/admin/life-at-school/hostels");

    const parsed = hostelFeaturesReorderSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const itemIds = parsed.data.items.map((i) => i.id);

    // Verify all IDs belong to "default" section
    const count = await prisma.hostelFeature.count({
      where: {
        id: { in: itemIds },
        sectionId: "default",
      },
    });

    if (count !== itemIds.length) {
      return {
        success: false,
        error: "One or more feature IDs do not exist or belong to a different section",
      };
    }

    // Execute atomic update
    await prisma.$transaction(
      parsed.data.items.map((item) =>
        prisma.hostelFeature.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    await recordAuditEvent({
      userId: user.id,
      action: "HOSTEL_FEATURES_REORDERED",
      entityType: "HostelFeature",
      entityId: "default",
      metadata: {
        itemCount: parsed.data.items.length,
      },
    });

    revalidateCaches();
    return { success: true };
  } catch (error) {
    console.error("[HostelActions] reorderHostelFeaturesAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reorder hostel features",
    };
  }
}

// ==========================================
// TRANSPORT ACTIONS
// ==========================================

export async function updateTransportSectionAction(
  rawInput: TransportSectionUpdateInput
): Promise<ActionResponse> {
  try {
    const user = await requireRole(["SUPER_ADMIN"], "/admin/life-at-school/transport");

    const parsed = transportSectionUpdateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const updated = await prisma.transportSection.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        badge: parsed.data.badge,
        title: parsed.data.title,
        description: parsed.data.description,
        ctaText: parsed.data.ctaText,
        ctaUrl: parsed.data.ctaUrl,
      },
      update: {
        badge: parsed.data.badge,
        title: parsed.data.title,
        description: parsed.data.description,
        ctaText: parsed.data.ctaText,
        ctaUrl: parsed.data.ctaUrl,
      },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "TRANSPORT_SECTION_UPDATED",
      entityType: "TransportSection",
      entityId: "default",
      metadata: {
        badge: updated.badge,
        title: updated.title,
        ctaUrl: updated.ctaUrl,
      },
    });

    revalidateCaches();
    return { success: true, data: updated };
  } catch (error) {
    console.error("[TransportActions] updateTransportSectionAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update transport section",
    };
  }
}
