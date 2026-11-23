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
  studentClubCreateSchema,
  studentClubUpdateSchema,
  studentClubDeleteSchema,
  toggleStudentClubStatusSchema,
  reorderStudentClubsSchema,
  activityOverviewUpdateSchema,
  computeActivityDiff,
} from "@/lib/validation/activities";

export interface ActivityActionState<T = unknown> {
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

function triggerActivityRevalidation() {
  revalidateTag("activities", "max");
  revalidatePath("/admin/life-at-school/activities");
}

async function generateUniqueClubSlug(name: string, excludeId?: string): Promise<string> {
  const baseSlug = slugify(name);
  const existing = await prisma.studentClub.findMany({
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
// 1. STUDENT CLUBS ACTIONS
// ==========================================

export async function createStudentClubAction(
  rawInput: unknown
): Promise<ActivityActionState<{ id: string; slug: string }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = studentClubCreateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const slug = await generateUniqueClubSlug(parsed.data.name);

    // If displayOrder is 0, append to the end of the list
    let displayOrder = parsed.data.displayOrder;
    if (displayOrder === 0) {
      const maxOrder = await prisma.studentClub.aggregate({
        _max: { displayOrder: true },
      });
      displayOrder = (maxOrder._max.displayOrder ?? -1) + 1;
    }

    const created = await prisma.$transaction(async (tx) => {
      const club = await tx.studentClub.create({
        data: {
          name: parsed.data.name,
          slug,
          category: parsed.data.category,
          description: parsed.data.description ?? null,
          iconName: parsed.data.iconName,
          displayOrder,
          isPublished: parsed.data.isPublished,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "STUDENT_CLUB_CREATED",
          entityType: "StudentClub",
          entityId: club.id,
          metadata: { name: club.name, slug: club.slug, category: club.category },
          ipAddress: clientIp,
        },
        tx
      );

      return club;
    });

    triggerActivityRevalidation();

    return {
      success: true,
      data: { id: created.id, slug: created.slug },
    };
  } catch (err: unknown) {
    console.error("[createStudentClubAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create student club.",
    };
  }
}

export async function updateStudentClubAction(
  rawInput: unknown
): Promise<ActivityActionState<{ id: string; slug: string }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = studentClubUpdateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const current = await prisma.studentClub.findUnique({
      where: { id: parsed.data.id },
    });

    if (!current) {
      return { success: false, error: "Student club not found." };
    }

    let slug = current.slug;
    if (parsed.data.name && parsed.data.name !== current.name) {
      slug = await generateUniqueClubSlug(parsed.data.name, current.id);
    }

    const updatePayload: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updatePayload.name = parsed.data.name;
    if (slug !== current.slug) updatePayload.slug = slug;
    if (parsed.data.category !== undefined) updatePayload.category = parsed.data.category;
    if (parsed.data.description !== undefined) updatePayload.description = parsed.data.description ?? null;
    if (parsed.data.iconName !== undefined) updatePayload.iconName = parsed.data.iconName;
    if (parsed.data.displayOrder !== undefined) updatePayload.displayOrder = parsed.data.displayOrder;
    if (parsed.data.isPublished !== undefined) updatePayload.isPublished = parsed.data.isPublished;

    const diff = computeActivityDiff(
      current as unknown as Record<string, unknown>,
      updatePayload
    );

    const updated = await prisma.$transaction(async (tx) => {
      const club = await tx.studentClub.update({
        where: { id: current.id },
        data: updatePayload,
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "STUDENT_CLUB_UPDATED",
          entityType: "StudentClub",
          entityId: club.id,
          metadata: { diff },
          ipAddress: clientIp,
        },
        tx
      );

      return club;
    });

    triggerActivityRevalidation();

    return {
      success: true,
      data: { id: updated.id, slug: updated.slug },
    };
  } catch (err: unknown) {
    console.error("[updateStudentClubAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update student club.",
    };
  }
}

export async function deleteStudentClubAction(
  rawInput: unknown
): Promise<ActivityActionState<{ id: string }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = studentClubDeleteSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const current = await prisma.studentClub.findUnique({
      where: { id: parsed.data.id },
    });

    if (!current) {
      return { success: false, error: "Student club not found." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.studentClub.delete({
        where: { id: current.id },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "STUDENT_CLUB_DELETED",
          entityType: "StudentClub",
          entityId: current.id,
          metadata: { name: current.name, slug: current.slug },
          ipAddress: clientIp,
        },
        tx
      );
    });

    triggerActivityRevalidation();

    return {
      success: true,
      data: { id: current.id },
    };
  } catch (err: unknown) {
    console.error("[deleteStudentClubAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete student club.",
    };
  }
}

export async function toggleStudentClubStatusAction(
  rawInput: unknown
): Promise<ActivityActionState<{ id: string; isPublished: boolean }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = toggleStudentClubStatusSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const current = await prisma.studentClub.findUnique({
      where: { id: parsed.data.id },
    });

    if (!current) {
      return { success: false, error: "Student club not found." };
    }

    const nextPublished = !current.isPublished;

    const updated = await prisma.$transaction(async (tx) => {
      const club = await tx.studentClub.update({
        where: { id: current.id },
        data: { isPublished: nextPublished },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "STUDENT_CLUB_TOGGLED",
          entityType: "StudentClub",
          entityId: club.id,
          metadata: { from: current.isPublished, to: nextPublished },
          ipAddress: clientIp,
        },
        tx
      );

      return club;
    });

    triggerActivityRevalidation();

    return {
      success: true,
      data: { id: updated.id, isPublished: updated.isPublished },
    };
  } catch (err: unknown) {
    console.error("[toggleStudentClubStatusAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle student club status.",
    };
  }
}

export async function reorderStudentClubsAction(
  rawInput: unknown
): Promise<ActivityActionState<null>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = reorderStudentClubsSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < parsed.data.orderedIds.length; i++) {
        const id = parsed.data.orderedIds[i];
        await tx.studentClub.update({
          where: { id },
          data: { displayOrder: i },
        });
      }

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "STUDENT_CLUBS_REORDERED",
          entityType: "StudentClub",
          entityId: "bulk-reorder",
          metadata: { orderedIds: parsed.data.orderedIds },
          ipAddress: clientIp,
        },
        tx
      );
    });

    triggerActivityRevalidation();

    return {
      success: true,
      data: null,
    };
  } catch (err: unknown) {
    console.error("[reorderStudentClubsAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to reorder student clubs.",
    };
  }
}

// ==========================================
// 2. ACTIVITY OVERVIEW ACTIONS
// ==========================================

export async function updateActivityOverviewAction(
  rawInput: unknown
): Promise<ActivityActionState<{ id: string }>> {
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
        badgeText: fd.get("badgeText")?.toString() || null,
        title: fd.get("title")?.toString() || null,
        subtitle: fd.get("subtitle")?.toString() || null,
        arenaSize: fd.get("arenaSize")?.toString() || null,
        cardTitle: fd.get("cardTitle")?.toString() || null,
        cardSubtitle: fd.get("cardSubtitle")?.toString() || null,
        narrativeParagraph1: fd.get("narrativeParagraph1")?.toString() || null,
        narrativeParagraph2: fd.get("narrativeParagraph2")?.toString() || null,
        heroImage: fd.get("heroImage")?.toString() || null,
        heroImageAlt: fd.get("heroImageAlt")?.toString() || null,
        heroImageStorageKey: fd.get("heroImageStorageKey")?.toString() || null,
      };
    } else {
      formFields = (rawInput as Record<string, unknown>) || {};
    }

    const current = await prisma.activityOverview.findUnique({
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
      const saved = await processAndSaveUploadedImage(extractedFile, "activities");
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

    const parsed = activityOverviewUpdateSchema.safeParse(formFields);
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

    const diff = computeActivityDiff(
      (current as unknown as Record<string, unknown>) || {},
      parsed.data as Record<string, unknown>
    );

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.activityOverview.upsert({
        where: { id: "default" },
        update: {
          badgeText: parsed.data.badgeText ?? null,
          title: parsed.data.title ?? null,
          subtitle: parsed.data.subtitle ?? null,
          arenaSize: parsed.data.arenaSize ?? null,
          cardTitle: parsed.data.cardTitle ?? null,
          cardSubtitle: parsed.data.cardSubtitle ?? null,
          narrativeParagraph1: parsed.data.narrativeParagraph1 ?? null,
          narrativeParagraph2: parsed.data.narrativeParagraph2 ?? null,
          heroImage: parsed.data.heroImage ?? null,
          heroImageAlt: parsed.data.heroImageAlt ?? null,
          heroImageStorageKey: parsed.data.heroImageStorageKey ?? null,
        },
        create: {
          id: "default",
          badgeText: parsed.data.badgeText ?? null,
          title: parsed.data.title ?? null,
          subtitle: parsed.data.subtitle ?? null,
          arenaSize: parsed.data.arenaSize ?? null,
          cardTitle: parsed.data.cardTitle ?? null,
          cardSubtitle: parsed.data.cardSubtitle ?? null,
          narrativeParagraph1: parsed.data.narrativeParagraph1 ?? null,
          narrativeParagraph2: parsed.data.narrativeParagraph2 ?? null,
          heroImage: parsed.data.heroImage ?? null,
          heroImageAlt: parsed.data.heroImageAlt ?? null,
          heroImageStorageKey: parsed.data.heroImageStorageKey ?? null,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ACTIVITY_OVERVIEW_UPDATED",
          entityType: "ActivityOverview",
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

    triggerActivityRevalidation();

    return {
      success: true,
      data: { id: updated.id },
    };
  } catch (err: unknown) {
    if (newlyUploadedStorageKey) {
      await cleanupOrphanFile(newlyUploadedStorageKey);
    }
    console.error("[updateActivityOverviewAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update activity overview.",
    };
  }
}
