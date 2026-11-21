"use server";

import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/server/prisma";
import { requireRole } from "@/lib/server/auth";
import { recordAuditEvent } from "@/lib/server/audit";
import { slugify } from "@/lib/server/slug";
import {
  processAndSaveUploadedImage,
  deleteManagedPhotoIfUnreferenced,
  cleanupOrphanFile,
  extractUploadedFile,
  isRemovalRequested,
} from "@/lib/server/admin-media";
import {
  academicWingCreateSchema,
  academicWingUpdateSchema,
  reorderAcademicWingsSchema,
  toggleAcademicWingStatusSchema,
  deleteAcademicWingSchema,
  academicStreamCreateSchema,
  academicStreamUpdateSchema,
  reorderAcademicStreamsSchema,
  toggleAcademicStreamStatusSchema,
  deleteAcademicStreamSchema,
  academicAssessmentRuleCreateSchema,
  academicAssessmentRuleUpdateSchema,
  reorderAcademicAssessmentRulesSchema,
  toggleAcademicAssessmentRuleStatusSchema,
  deleteAcademicAssessmentRuleSchema,
  academicOverviewUpdateSchema,
  computeAcademicDiff,
} from "@/lib/validation/academics";

export interface AcademicActionState<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    return headerList.get("x-real-ip") || "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

function triggerAcademicRevalidation() {
  revalidateTag("academics", "max");
  revalidatePath("/admin/academics/academic-system");
  revalidatePath("/admin/academics");
}

async function generateUniqueWingSlug(title: string, excludeId?: string): Promise<string> {
  const baseSlug = slugify(title);
  const existing = await prisma.academicWing.findMany({
    where: {
      slug: { startsWith: baseSlug },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { slug: true },
  });

  const existingSlugs = new Set(existing.map((s) => s.slug));
  if (!existingSlugs.has(baseSlug)) return baseSlug;

  let counter = 2;
  while (existingSlugs.has(`${baseSlug}-${counter}`)) {
    counter++;
  }
  return `${baseSlug}-${counter}`;
}

async function generateUniqueStreamSlug(title: string, excludeId?: string): Promise<string> {
  const baseSlug = slugify(title);
  const existing = await prisma.academicStream.findMany({
    where: {
      slug: { startsWith: baseSlug },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { slug: true },
  });

  const existingSlugs = new Set(existing.map((s) => s.slug));
  if (!existingSlugs.has(baseSlug)) return baseSlug;

  let counter = 2;
  while (existingSlugs.has(`${baseSlug}-${counter}`)) {
    counter++;
  }
  return `${baseSlug}-${counter}`;
}

// ==========================================
// 1. ACADEMIC WINGS ACTIONS
// ==========================================

export async function createAcademicWingAction(
  rawInput: unknown
): Promise<AcademicActionState<{ id: string; slug: string }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = academicWingCreateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { stageBadge, title, description, highlights, displayOrder, isPublished } = parsed.data;
    const slug = await generateUniqueWingSlug(title);

    const wing = await prisma.$transaction(async (tx) => {
      const created = await tx.academicWing.create({
        data: {
          slug,
          stageBadge,
          title,
          description,
          highlights,
          displayOrder,
          isPublished,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ACADEMIC_WING_CREATED",
          entityType: "AcademicWing",
          entityId: created.id,
          metadata: { title, slug, stageBadge, isPublished },
          ipAddress: clientIp,
        },
        tx
      );

      return created;
    });

    triggerAcademicRevalidation();

    return {
      success: true,
      data: { id: wing.id, slug: wing.slug },
    };
  } catch (err: unknown) {
    console.error("[createAcademicWingAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create academic wing.",
    };
  }
}

export async function updateAcademicWingAction(
  rawInput: unknown
): Promise<AcademicActionState<{ id: string }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = academicWingUpdateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { id, ...updates } = parsed.data;

    const existing = await prisma.academicWing.findUnique({
      where: { id },
    });
    if (!existing) {
      return { success: false, error: "Academic wing not found." };
    }

    const slug = updates.title && updates.title !== existing.title
      ? await generateUniqueWingSlug(updates.title, id)
      : existing.slug;

    const diff = computeAcademicDiff(
      existing as unknown as Record<string, unknown>,
      { ...updates, slug }
    );

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.academicWing.update({
        where: { id },
        data: {
          ...updates,
          slug,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ACADEMIC_WING_UPDATED",
          entityType: "AcademicWing",
          entityId: id,
          metadata: { diff },
          ipAddress: clientIp,
        },
        tx
      );

      return result;
    });

    triggerAcademicRevalidation();

    return {
      success: true,
      data: { id: updated.id },
    };
  } catch (err: unknown) {
    console.error("[updateAcademicWingAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update academic wing.",
    };
  }
}

export async function deleteAcademicWingAction(
  rawInput: unknown
): Promise<AcademicActionState<{ id: string }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = deleteAcademicWingSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid wing ID provided." };
    }

    const { id } = parsed.data;
    const existing = await prisma.academicWing.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Academic wing not found." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.academicWing.delete({ where: { id } });
      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ACADEMIC_WING_DELETED",
          entityType: "AcademicWing",
          entityId: id,
          metadata: { title: existing.title, slug: existing.slug },
          ipAddress: clientIp,
        },
        tx
      );
    });

    triggerAcademicRevalidation();

    return { success: true, data: { id } };
  } catch (err: unknown) {
    console.error("[deleteAcademicWingAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete academic wing.",
    };
  }
}

export async function reorderAcademicWingsAction(
  rawInput: unknown
): Promise<AcademicActionState<{ count: number }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = reorderAcademicWingsSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid reorder payload." };
    }

    const { orderedIds } = parsed.data;

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx.academicWing.update({
          where: { id: orderedIds[i] },
          data: { displayOrder: i },
        });
      }

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ACADEMIC_WINGS_REORDERED",
          entityType: "AcademicWing",
          entityId: "batch",
          metadata: { orderedIds },
          ipAddress: clientIp,
        },
        tx
      );
    });

    triggerAcademicRevalidation();

    return { success: true, data: { count: orderedIds.length } };
  } catch (err: unknown) {
    console.error("[reorderAcademicWingsAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to reorder wings.",
    };
  }
}

export async function toggleAcademicWingStatusAction(
  rawInput: unknown
): Promise<AcademicActionState<{ id: string; isPublished: boolean }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = toggleAcademicWingStatusSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid wing ID provided." };
    }

    const { id } = parsed.data;
    const existing = await prisma.academicWing.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Academic wing not found." };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.academicWing.update({
        where: { id },
        data: { isPublished: !existing.isPublished },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ACADEMIC_WING_TOGGLED",
          entityType: "AcademicWing",
          entityId: id,
          metadata: {
            title: existing.title,
            isPublished: res.isPublished,
          },
          ipAddress: clientIp,
        },
        tx
      );

      return res;
    });

    triggerAcademicRevalidation();

    return {
      success: true,
      data: { id: updated.id, isPublished: updated.isPublished },
    };
  } catch (err: unknown) {
    console.error("[toggleAcademicWingStatusAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle wing status.",
    };
  }
}

// ==========================================
// 2. ACADEMIC STREAMS ACTIONS
// ==========================================

export async function createAcademicStreamAction(
  rawInput: unknown
): Promise<AcademicActionState<{ id: string; slug: string }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = academicStreamCreateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { title, iconName, subjects, careerHighlight, displayOrder, isPublished } = parsed.data;
    const slug = await generateUniqueStreamSlug(title);

    const stream = await prisma.$transaction(async (tx) => {
      const created = await tx.academicStream.create({
        data: {
          slug,
          title,
          iconName,
          subjects,
          careerHighlight,
          displayOrder,
          isPublished,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ACADEMIC_STREAM_CREATED",
          entityType: "AcademicStream",
          entityId: created.id,
          metadata: { title, slug, iconName, isPublished },
          ipAddress: clientIp,
        },
        tx
      );

      return created;
    });

    triggerAcademicRevalidation();

    return {
      success: true,
      data: { id: stream.id, slug: stream.slug },
    };
  } catch (err: unknown) {
    console.error("[createAcademicStreamAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create stream.",
    };
  }
}

export async function updateAcademicStreamAction(
  rawInput: unknown
): Promise<AcademicActionState<{ id: string }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = academicStreamUpdateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { id, ...updates } = parsed.data;

    const existing = await prisma.academicStream.findUnique({
      where: { id },
    });
    if (!existing) {
      return { success: false, error: "Stream not found." };
    }

    const slug = updates.title && updates.title !== existing.title
      ? await generateUniqueStreamSlug(updates.title, id)
      : existing.slug;

    const diff = computeAcademicDiff(
      existing as unknown as Record<string, unknown>,
      { ...updates, slug }
    );

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.academicStream.update({
        where: { id },
        data: {
          ...updates,
          slug,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ACADEMIC_STREAM_UPDATED",
          entityType: "AcademicStream",
          entityId: id,
          metadata: { diff },
          ipAddress: clientIp,
        },
        tx
      );

      return result;
    });

    triggerAcademicRevalidation();

    return {
      success: true,
      data: { id: updated.id },
    };
  } catch (err: unknown) {
    console.error("[updateAcademicStreamAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update stream.",
    };
  }
}

export async function deleteAcademicStreamAction(
  rawInput: unknown
): Promise<AcademicActionState<{ id: string }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = deleteAcademicStreamSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid stream ID provided." };
    }

    const { id } = parsed.data;
    const existing = await prisma.academicStream.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Stream not found." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.academicStream.delete({ where: { id } });
      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ACADEMIC_STREAM_DELETED",
          entityType: "AcademicStream",
          entityId: id,
          metadata: { title: existing.title, slug: existing.slug },
          ipAddress: clientIp,
        },
        tx
      );
    });

    triggerAcademicRevalidation();

    return { success: true, data: { id } };
  } catch (err: unknown) {
    console.error("[deleteAcademicStreamAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete stream.",
    };
  }
}

export async function reorderAcademicStreamsAction(
  rawInput: unknown
): Promise<AcademicActionState<{ count: number }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = reorderAcademicStreamsSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid reorder payload." };
    }

    const { orderedIds } = parsed.data;

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx.academicStream.update({
          where: { id: orderedIds[i] },
          data: { displayOrder: i },
        });
      }

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ACADEMIC_STREAMS_REORDERED",
          entityType: "AcademicStream",
          entityId: "batch",
          metadata: { orderedIds },
          ipAddress: clientIp,
        },
        tx
      );
    });

    triggerAcademicRevalidation();

    return { success: true, data: { count: orderedIds.length } };
  } catch (err: unknown) {
    console.error("[reorderAcademicStreamsAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to reorder streams.",
    };
  }
}

export async function toggleAcademicStreamStatusAction(
  rawInput: unknown
): Promise<AcademicActionState<{ id: string; isPublished: boolean }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = toggleAcademicStreamStatusSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid stream ID provided." };
    }

    const { id } = parsed.data;
    const existing = await prisma.academicStream.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Stream not found." };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.academicStream.update({
        where: { id },
        data: { isPublished: !existing.isPublished },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ACADEMIC_STREAM_TOGGLED",
          entityType: "AcademicStream",
          entityId: id,
          metadata: {
            title: existing.title,
            isPublished: res.isPublished,
          },
          ipAddress: clientIp,
        },
        tx
      );

      return res;
    });

    triggerAcademicRevalidation();

    return {
      success: true,
      data: { id: updated.id, isPublished: updated.isPublished },
    };
  } catch (err: unknown) {
    console.error("[toggleAcademicStreamStatusAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle stream status.",
    };
  }
}

// ==========================================
// 3. ACADEMIC ASSESSMENT RULES ACTIONS
// ==========================================

export async function createAcademicAssessmentRuleAction(
  rawInput: unknown
): Promise<AcademicActionState<{ id: string }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = academicAssessmentRuleCreateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { ruleText, displayOrder, isPublished } = parsed.data;

    const rule = await prisma.$transaction(async (tx) => {
      const created = await tx.academicAssessmentRule.create({
        data: {
          ruleText,
          displayOrder,
          isPublished,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ACADEMIC_RULE_CREATED",
          entityType: "AcademicAssessmentRule",
          entityId: created.id,
          metadata: { displayOrder, isPublished },
          ipAddress: clientIp,
        },
        tx
      );

      return created;
    });

    triggerAcademicRevalidation();

    return {
      success: true,
      data: { id: rule.id },
    };
  } catch (err: unknown) {
    console.error("[createAcademicAssessmentRuleAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create assessment rule.",
    };
  }
}

export async function updateAcademicAssessmentRuleAction(
  rawInput: unknown
): Promise<AcademicActionState<{ id: string }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = academicAssessmentRuleUpdateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { id, ...updates } = parsed.data;

    const existing = await prisma.academicAssessmentRule.findUnique({
      where: { id },
    });
    if (!existing) {
      return { success: false, error: "Rule not found." };
    }

    const diff = computeAcademicDiff(
      existing as unknown as Record<string, unknown>,
      updates as Record<string, unknown>
    );

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.academicAssessmentRule.update({
        where: { id },
        data: updates,
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ACADEMIC_RULE_UPDATED",
          entityType: "AcademicAssessmentRule",
          entityId: id,
          metadata: { diff },
          ipAddress: clientIp,
        },
        tx
      );

      return result;
    });

    triggerAcademicRevalidation();

    return {
      success: true,
      data: { id: updated.id },
    };
  } catch (err: unknown) {
    console.error("[updateAcademicAssessmentRuleAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update assessment rule.",
    };
  }
}

export async function deleteAcademicAssessmentRuleAction(
  rawInput: unknown
): Promise<AcademicActionState<{ id: string }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = deleteAcademicAssessmentRuleSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid rule ID provided." };
    }

    const { id } = parsed.data;
    const existing = await prisma.academicAssessmentRule.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Rule not found." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.academicAssessmentRule.delete({ where: { id } });
      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ACADEMIC_RULE_DELETED",
          entityType: "AcademicAssessmentRule",
          entityId: id,
          metadata: { ruleSnippet: existing.ruleText.slice(0, 50) },
          ipAddress: clientIp,
        },
        tx
      );
    });

    triggerAcademicRevalidation();

    return { success: true, data: { id } };
  } catch (err: unknown) {
    console.error("[deleteAcademicAssessmentRuleAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete assessment rule.",
    };
  }
}

export async function reorderAcademicAssessmentRulesAction(
  rawInput: unknown
): Promise<AcademicActionState<{ count: number }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = reorderAcademicAssessmentRulesSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid reorder payload." };
    }

    const { orderedIds } = parsed.data;

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx.academicAssessmentRule.update({
          where: { id: orderedIds[i] },
          data: { displayOrder: i },
        });
      }

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ACADEMIC_RULES_REORDERED",
          entityType: "AcademicAssessmentRule",
          entityId: "batch",
          metadata: { orderedIds },
          ipAddress: clientIp,
        },
        tx
      );
    });

    triggerAcademicRevalidation();

    return { success: true, data: { count: orderedIds.length } };
  } catch (err: unknown) {
    console.error("[reorderAcademicAssessmentRulesAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to reorder rules.",
    };
  }
}

export async function toggleAcademicAssessmentRuleStatusAction(
  rawInput: unknown
): Promise<AcademicActionState<{ id: string; isPublished: boolean }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = toggleAcademicAssessmentRuleStatusSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid rule ID provided." };
    }

    const { id } = parsed.data;
    const existing = await prisma.academicAssessmentRule.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Rule not found." };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.academicAssessmentRule.update({
        where: { id },
        data: { isPublished: !existing.isPublished },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ACADEMIC_RULE_TOGGLED",
          entityType: "AcademicAssessmentRule",
          entityId: id,
          metadata: {
            ruleSnippet: existing.ruleText.slice(0, 50),
            isPublished: res.isPublished,
          },
          ipAddress: clientIp,
        },
        tx
      );

      return res;
    });

    triggerAcademicRevalidation();

    return {
      success: true,
      data: { id: updated.id, isPublished: updated.isPublished },
    };
  } catch (err: unknown) {
    console.error("[toggleAcademicAssessmentRuleStatusAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle rule status.",
    };
  }
}

// ==========================================
// 4. ACADEMIC OVERVIEW ACTIONS
// ==========================================

export async function updateAcademicOverviewAction(
  rawInput: unknown
): Promise<AcademicActionState<{ id: string }>> {
  let newlyUploadedStorageKey: string | null = null;
  let previousStorageKeyToCleanup: string | null = null;

  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const isFormData = typeof FormData !== "undefined" && rawInput instanceof FormData;
    const extractedFile = extractUploadedFile(rawInput as FormData, "heroImageFile");
    const removalRequested = isRemovalRequested(rawInput as FormData, "removeHeroImage");

    let formFields: Record<string, unknown>;
    if (isFormData) {
      const fd = rawInput as FormData;
      formFields = {
        heroBadge: fd.get("heroBadge")?.toString() || null,
        heroImage: fd.get("heroImage")?.toString() || null,
        heroImageAlt: fd.get("heroImageAlt")?.toString() || null,
        heroImageStorageKey: fd.get("heroImageStorageKey")?.toString() || null,
        competitiveBadge: fd.get("competitiveBadge")?.toString() || null,
        competitiveTitle: fd.get("competitiveTitle")?.toString() || null,
        competitiveDescription: fd.get("competitiveDescription")?.toString() || null,
        competitiveCtaText: fd.get("competitiveCtaText")?.toString() || null,
        competitiveCtaHref: fd.get("competitiveCtaHref")?.toString() || null,
        assessmentParentNotice: fd.get("assessmentParentNotice")?.toString() || null,
        assessmentProspectusNotice: fd.get("assessmentProspectusNotice")?.toString() || null,
        assessmentProspectusUrl: fd.get("assessmentProspectusUrl")?.toString() || null,
      };
    } else {
      formFields = (rawInput as Record<string, unknown>) || {};
    }

    const current = await prisma.academicOverview.findUnique({
      where: { id: "default" },
    });

    // Handle Image upload or removal
    if (removalRequested) {
      formFields.heroImage = null;
      formFields.heroImageStorageKey = null;
      if (current?.heroImageStorageKey) {
        previousStorageKeyToCleanup = current.heroImageStorageKey;
      }
    } else if (extractedFile) {
      const saved = await processAndSaveUploadedImage(extractedFile, "academics");
      newlyUploadedStorageKey = saved.storageKey;
      formFields.heroImage = saved.publicUrl;
      formFields.heroImageStorageKey = saved.storageKey;
      if (current?.heroImageStorageKey && current.heroImageStorageKey !== saved.storageKey) {
        previousStorageKeyToCleanup = current.heroImageStorageKey;
      }
    } else if (formFields.heroImage === undefined && current) {
      // Preserve existing image values if untouched
      formFields.heroImage = current.heroImage;
      formFields.heroImageAlt = current.heroImageAlt;
      formFields.heroImageStorageKey = current.heroImageStorageKey;
    }

    const parsed = academicOverviewUpdateSchema.safeParse(formFields);
    if (!parsed.success) {
      if (newlyUploadedStorageKey) {
        await cleanupOrphanFile(newlyUploadedStorageKey);
      }
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const diff = computeAcademicDiff(
      (current as unknown as Record<string, unknown>) || {},
      parsed.data as Record<string, unknown>
    );

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.academicOverview.upsert({
        where: { id: "default" },
        update: {
          heroBadge: parsed.data.heroBadge ?? null,
          heroImage: parsed.data.heroImage ?? null,
          heroImageAlt: parsed.data.heroImageAlt ?? null,
          heroImageStorageKey: parsed.data.heroImageStorageKey ?? null,
          competitiveBadge: parsed.data.competitiveBadge ?? null,
          competitiveTitle: parsed.data.competitiveTitle ?? null,
          competitiveDescription: parsed.data.competitiveDescription ?? null,
          competitiveCtaText: parsed.data.competitiveCtaText ?? null,
          competitiveCtaHref: parsed.data.competitiveCtaHref ?? null,
          assessmentParentNotice: parsed.data.assessmentParentNotice ?? null,
          assessmentProspectusNotice: parsed.data.assessmentProspectusNotice ?? null,
          assessmentProspectusUrl: parsed.data.assessmentProspectusUrl ?? null,
        },
        create: {
          id: "default",
          heroBadge: parsed.data.heroBadge ?? null,
          heroImage: parsed.data.heroImage ?? null,
          heroImageAlt: parsed.data.heroImageAlt ?? null,
          heroImageStorageKey: parsed.data.heroImageStorageKey ?? null,
          competitiveBadge: parsed.data.competitiveBadge ?? null,
          competitiveTitle: parsed.data.competitiveTitle ?? null,
          competitiveDescription: parsed.data.competitiveDescription ?? null,
          competitiveCtaText: parsed.data.competitiveCtaText ?? null,
          competitiveCtaHref: parsed.data.competitiveCtaHref ?? null,
          assessmentParentNotice: parsed.data.assessmentParentNotice ?? null,
          assessmentProspectusNotice: parsed.data.assessmentProspectusNotice ?? null,
          assessmentProspectusUrl: parsed.data.assessmentProspectusUrl ?? null,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ACADEMIC_OVERVIEW_UPDATED",
          entityType: "AcademicOverview",
          entityId: "default",
          metadata: { diff },
          ipAddress: clientIp,
        },
        tx
      );

      return result;
    });

    if (previousStorageKeyToCleanup) {
      await deleteManagedPhotoIfUnreferenced(previousStorageKeyToCleanup);
    }

    triggerAcademicRevalidation();

    return {
      success: true,
      data: { id: updated.id },
    };
  } catch (err: unknown) {
    if (newlyUploadedStorageKey) {
      await cleanupOrphanFile(newlyUploadedStorageKey);
    }
    console.error("[updateAcademicOverviewAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update academic overview.",
    };
  }
}
