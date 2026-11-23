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
  alumniOverviewUpdateSchema,
  alumniReunionCreateSchema,
  alumniReunionUpdateSchema,
  alumniReunionDeleteSchema,
  toggleAlumniReunionStatusSchema,
  reorderAlumniReunionsSchema,
  careerOpportunityCreateSchema,
  careerOpportunityUpdateSchema,
  careerOpportunityDeleteSchema,
  toggleCareerOpportunityStatusSchema,
  reorderCareerOpportunitiesSchema,
  computeAlumniDiff,
} from "@/lib/validation/alumni";

export interface AlumniActionState<T = unknown> {
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

function triggerAlumniRevalidation() {
  revalidateTag("alumni", "max");
  revalidatePath("/admin/students-parents/alumni");
}

async function generateUniqueReunionSlug(title: string, excludeId?: string): Promise<string> {
  const baseSlug = slugify(title);
  const existing = await prisma.alumniReunion.findMany({
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

async function generateUniqueCareerSlug(title: string, excludeId?: string): Promise<string> {
  const baseSlug = slugify(title);
  const existing = await prisma.careerOpportunity.findMany({
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
// 1. ALUMNI OVERVIEW ACTIONS
// ==========================================

export async function updateAlumniOverviewAction(
  rawInput: unknown
): Promise<AlumniActionState<{ id: string }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = alumniOverviewUpdateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const current = await prisma.alumniOverview.findUnique({
      where: { id: "default" },
    });

    const diff = computeAlumniDiff(
      (current as unknown as Record<string, unknown>) || {},
      parsed.data as Record<string, unknown>
    );

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.alumniOverview.upsert({
        where: { id: "default" },
        update: {
          badgeText: parsed.data.badgeText ?? null,
          title: parsed.data.title ?? null,
          subtitle: parsed.data.subtitle ?? null,
        },
        create: {
          id: "default",
          badgeText: parsed.data.badgeText ?? null,
          title: parsed.data.title ?? null,
          subtitle: parsed.data.subtitle ?? null,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ALUMNI_OVERVIEW_UPDATED",
          entityType: "AlumniOverview",
          entityId: "default",
          metadata: { diff },
          ipAddress: clientIp,
        },
        tx
      );

      return result;
    });

    triggerAlumniRevalidation();
    return { success: true, data: { id: updated.id } };
  } catch (err: unknown) {
    console.error("[alumni-actions] updateAlumniOverviewAction failed:", err);
    return { success: false, error: "Failed to update alumni overview settings." };
  }
}

// ==========================================
// 2. ALUMNI REUNIONS ACTIONS
// ==========================================

export async function createAlumniReunionAction(
  rawInput: unknown
): Promise<AlumniActionState<{ id: string; slug: string }>> {
  let newlyUploadedStorageKey: string | null = null;

  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const isFormData = typeof FormData !== "undefined" && rawInput instanceof FormData;
    const extractedFile = extractUploadedFile(rawInput as FormData, "heroImageFile");

    let formFields: Record<string, unknown>;
    if (isFormData) {
      const fd = rawInput as FormData;
      formFields = {
        title: fd.get("title")?.toString() || "",
        description: fd.get("description")?.toString() || "",
        heroImage: fd.get("heroImage")?.toString() || null,
        heroImageAlt: fd.get("heroImageAlt")?.toString() || null,
        heroImageStorageKey: fd.get("heroImageStorageKey")?.toString() || null,
        eventDate: fd.get("eventDate")?.toString() || null,
        displayOrder: Number(fd.get("displayOrder")) || 0,
        isPublished: fd.get("isPublished") === "true" || fd.get("isPublished") === "on",
      };
    } else {
      formFields = (rawInput as Record<string, unknown>) || {};
    }

    if (extractedFile) {
      const saved = await processAndSaveUploadedImage(extractedFile, "alumni");
      newlyUploadedStorageKey = saved.storageKey;
      formFields.heroImage = saved.publicUrl;
      formFields.heroImageStorageKey = saved.storageKey;
    }

    const parsed = alumniReunionCreateSchema.safeParse(formFields);
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

    const slug = await generateUniqueReunionSlug(parsed.data.title);

    let displayOrder = parsed.data.displayOrder;
    if (displayOrder === 0) {
      const maxOrder = await prisma.alumniReunion.aggregate({
        _max: { displayOrder: true },
      });
      displayOrder = (maxOrder._max.displayOrder ?? -1) + 1;
    }

    const created = await prisma.$transaction(async (tx) => {
      const record = await tx.alumniReunion.create({
        data: {
          slug,
          title: parsed.data.title,
          description: parsed.data.description,
          heroImage: parsed.data.heroImage ?? null,
          heroImageAlt: parsed.data.heroImageAlt ?? null,
          heroImageStorageKey: parsed.data.heroImageStorageKey ?? null,
          eventDate: parsed.data.eventDate ?? null,
          displayOrder,
          isPublished: parsed.data.isPublished,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ALUMNI_REUNION_CREATED",
          entityType: "AlumniReunion",
          entityId: record.id,
          metadata: {
            title: record.title,
            slug: record.slug,
            isPublished: record.isPublished,
          },
          ipAddress: clientIp,
        },
        tx
      );

      return record;
    });

    triggerAlumniRevalidation();
    return { success: true, data: { id: created.id, slug: created.slug } };
  } catch (err: unknown) {
    if (newlyUploadedStorageKey) {
      await cleanupOrphanFile(newlyUploadedStorageKey);
    }
    console.error("[alumni-actions] createAlumniReunionAction failed:", err);
    return { success: false, error: "Failed to create alumni reunion record." };
  }
}

export async function updateAlumniReunionAction(
  rawInput: unknown
): Promise<AlumniActionState<{ id: string; slug: string }>> {
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
        id: fd.get("id")?.toString() || "",
        title: fd.get("title")?.toString(),
        description: fd.get("description")?.toString(),
        heroImage: fd.get("heroImage")?.toString() || null,
        heroImageAlt: fd.get("heroImageAlt")?.toString() || null,
        heroImageStorageKey: fd.get("heroImageStorageKey")?.toString() || null,
        eventDate: fd.get("eventDate")?.toString() || null,
        displayOrder: fd.has("displayOrder") ? Number(fd.get("displayOrder")) : undefined,
        isPublished: fd.has("isPublished")
          ? fd.get("isPublished") === "true" || fd.get("isPublished") === "on"
          : undefined,
      };
    } else {
      formFields = (rawInput as Record<string, unknown>) || {};
    }

    const reunionId = String(formFields.id || "");
    const existing = await prisma.alumniReunion.findUnique({
      where: { id: reunionId },
    });

    if (!existing) {
      return { success: false, error: "Alumni reunion not found." };
    }

    // Handle Image upload or removal
    if (removalRequested) {
      formFields.heroImage = null;
      formFields.heroImageStorageKey = null;
      formFields.heroImageAlt = null;
      if (existing.heroImageStorageKey) {
        previousStorageKeyToCleanup = existing.heroImageStorageKey;
      }
    } else if (extractedFile) {
      const saved = await processAndSaveUploadedImage(extractedFile, "alumni");
      newlyUploadedStorageKey = saved.storageKey;
      formFields.heroImage = saved.publicUrl;
      formFields.heroImageStorageKey = saved.storageKey;
      if (existing.heroImageStorageKey && existing.heroImageStorageKey !== saved.storageKey) {
        previousStorageKeyToCleanup = existing.heroImageStorageKey;
      }
    } else if (formFields.heroImage === undefined) {
      // Preserve existing image values if untouched
      formFields.heroImage = existing.heroImage;
      formFields.heroImageAlt = existing.heroImageAlt;
      formFields.heroImageStorageKey = existing.heroImageStorageKey;
    }

    const parsed = alumniReunionUpdateSchema.safeParse(formFields);
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

    let slug = existing.slug;
    if (parsed.data.title && parsed.data.title !== existing.title) {
      slug = await generateUniqueReunionSlug(parsed.data.title, existing.id);
    }

    const diff = computeAlumniDiff(
      existing as unknown as Record<string, unknown>,
      parsed.data as Record<string, unknown>
    );

    const updated = await prisma.$transaction(async (tx) => {
      const record = await tx.alumniReunion.update({
        where: { id: existing.id },
        data: {
          slug,
          ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
          ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
          ...(parsed.data.heroImage !== undefined ? { heroImage: parsed.data.heroImage } : {}),
          ...(parsed.data.heroImageAlt !== undefined ? { heroImageAlt: parsed.data.heroImageAlt } : {}),
          ...(parsed.data.heroImageStorageKey !== undefined
            ? { heroImageStorageKey: parsed.data.heroImageStorageKey }
            : {}),
          ...(parsed.data.eventDate !== undefined ? { eventDate: parsed.data.eventDate } : {}),
          ...(parsed.data.displayOrder !== undefined ? { displayOrder: parsed.data.displayOrder } : {}),
          ...(parsed.data.isPublished !== undefined ? { isPublished: parsed.data.isPublished } : {}),
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ALUMNI_REUNION_UPDATED",
          entityType: "AlumniReunion",
          entityId: record.id,
          metadata: { diff },
          ipAddress: clientIp,
        },
        tx
      );

      return record;
    });

    if (previousStorageKeyToCleanup) {
      await deleteManagedPhotoIfUnreferenced(previousStorageKeyToCleanup);
    }

    triggerAlumniRevalidation();
    return { success: true, data: { id: updated.id, slug: updated.slug } };
  } catch (err: unknown) {
    if (newlyUploadedStorageKey) {
      await cleanupOrphanFile(newlyUploadedStorageKey);
    }
    console.error("[alumni-actions] updateAlumniReunionAction failed:", err);
    return { success: false, error: "Failed to update alumni reunion." };
  }
}

export async function deleteAlumniReunionAction(
  rawInput: unknown
): Promise<AlumniActionState<{ id: string }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = alumniReunionDeleteSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid deletion payload." };
    }

    const existing = await prisma.alumniReunion.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "Alumni reunion not found." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.alumniReunion.delete({
        where: { id: existing.id },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ALUMNI_REUNION_DELETED",
          entityType: "AlumniReunion",
          entityId: existing.id,
          metadata: { title: existing.title, slug: existing.slug },
          ipAddress: clientIp,
        },
        tx
      );
    });

    if (existing.heroImageStorageKey) {
      await deleteManagedPhotoIfUnreferenced(existing.heroImageStorageKey);
    }

    triggerAlumniRevalidation();
    return { success: true, data: { id: existing.id } };
  } catch (err: unknown) {
    console.error("[alumni-actions] deleteAlumniReunionAction failed:", err);
    return { success: false, error: "Failed to delete alumni reunion." };
  }
}

export async function toggleAlumniReunionStatusAction(
  rawInput: unknown
): Promise<AlumniActionState<{ id: string; isPublished: boolean }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = toggleAlumniReunionStatusSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid status toggle payload." };
    }

    const existing = await prisma.alumniReunion.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "Alumni reunion not found." };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const record = await tx.alumniReunion.update({
        where: { id: existing.id },
        data: { isPublished: parsed.data.isPublished },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ALUMNI_REUNION_TOGGLED",
          entityType: "AlumniReunion",
          entityId: record.id,
          metadata: {
            title: record.title,
            before: existing.isPublished,
            after: record.isPublished,
          },
          ipAddress: clientIp,
        },
        tx
      );

      return record;
    });

    triggerAlumniRevalidation();
    return { success: true, data: { id: updated.id, isPublished: updated.isPublished } };
  } catch (err: unknown) {
    console.error("[alumni-actions] toggleAlumniReunionStatusAction failed:", err);
    return { success: false, error: "Failed to toggle reunion status." };
  }
}

export async function reorderAlumniReunionsAction(
  rawInput: unknown
): Promise<AlumniActionState<{ count: number }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = reorderAlumniReunionsSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid reorder payload." };
    }

    await prisma.$transaction(async (tx) => {
      for (const item of parsed.data.items) {
        await tx.alumniReunion.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        });
      }

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ALUMNI_REUNIONS_REORDERED",
          entityType: "AlumniReunion",
          entityId: "batch",
          metadata: { reorderedCount: parsed.data.items.length },
          ipAddress: clientIp,
        },
        tx
      );
    });

    triggerAlumniRevalidation();
    return { success: true, data: { count: parsed.data.items.length } };
  } catch (err: unknown) {
    console.error("[alumni-actions] reorderAlumniReunionsAction failed:", err);
    return { success: false, error: "Failed to reorder alumni reunions." };
  }
}

// ==========================================
// 3. CAREER OPPORTUNITIES ACTIONS
// ==========================================

export async function createCareerOpportunityAction(
  rawInput: unknown
): Promise<AlumniActionState<{ id: string; slug: string }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = careerOpportunityCreateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const slug = await generateUniqueCareerSlug(parsed.data.title);

    let displayOrder = parsed.data.displayOrder;
    if (displayOrder === 0) {
      const maxOrder = await prisma.careerOpportunity.aggregate({
        _max: { displayOrder: true },
      });
      displayOrder = (maxOrder._max.displayOrder ?? -1) + 1;
    }

    const created = await prisma.$transaction(async (tx) => {
      const record = await tx.careerOpportunity.create({
        data: {
          slug,
          badgeText: parsed.data.badgeText,
          title: parsed.data.title,
          description: parsed.data.description,
          contactEmail: parsed.data.contactEmail,
          emailSubject: parsed.data.emailSubject ?? null,
          ctaText: parsed.data.ctaText,
          displayOrder,
          isPublished: parsed.data.isPublished,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "CAREER_OPPORTUNITY_CREATED",
          entityType: "CareerOpportunity",
          entityId: record.id,
          metadata: {
            title: record.title,
            slug: record.slug,
            isPublished: record.isPublished,
          },
          ipAddress: clientIp,
        },
        tx
      );

      return record;
    });

    triggerAlumniRevalidation();
    return { success: true, data: { id: created.id, slug: created.slug } };
  } catch (err: unknown) {
    console.error("[alumni-actions] createCareerOpportunityAction failed:", err);
    return { success: false, error: "Failed to create career opportunity." };
  }
}

export async function updateCareerOpportunityAction(
  rawInput: unknown
): Promise<AlumniActionState<{ id: string; slug: string }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = careerOpportunityUpdateSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const existing = await prisma.careerOpportunity.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "Career opportunity not found." };
    }

    let slug = existing.slug;
    if (parsed.data.title && parsed.data.title !== existing.title) {
      slug = await generateUniqueCareerSlug(parsed.data.title, existing.id);
    }

    const diff = computeAlumniDiff(
      existing as unknown as Record<string, unknown>,
      parsed.data as Record<string, unknown>
    );

    const updated = await prisma.$transaction(async (tx) => {
      const record = await tx.careerOpportunity.update({
        where: { id: existing.id },
        data: {
          slug,
          ...(parsed.data.badgeText !== undefined ? { badgeText: parsed.data.badgeText } : {}),
          ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
          ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
          ...(parsed.data.contactEmail !== undefined ? { contactEmail: parsed.data.contactEmail } : {}),
          ...(parsed.data.emailSubject !== undefined ? { emailSubject: parsed.data.emailSubject } : {}),
          ...(parsed.data.ctaText !== undefined ? { ctaText: parsed.data.ctaText } : {}),
          ...(parsed.data.displayOrder !== undefined ? { displayOrder: parsed.data.displayOrder } : {}),
          ...(parsed.data.isPublished !== undefined ? { isPublished: parsed.data.isPublished } : {}),
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "CAREER_OPPORTUNITY_UPDATED",
          entityType: "CareerOpportunity",
          entityId: record.id,
          metadata: { diff },
          ipAddress: clientIp,
        },
        tx
      );

      return record;
    });

    triggerAlumniRevalidation();
    return { success: true, data: { id: updated.id, slug: updated.slug } };
  } catch (err: unknown) {
    console.error("[alumni-actions] updateCareerOpportunityAction failed:", err);
    return { success: false, error: "Failed to update career opportunity." };
  }
}

export async function deleteCareerOpportunityAction(
  rawInput: unknown
): Promise<AlumniActionState<{ id: string }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = careerOpportunityDeleteSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid deletion payload." };
    }

    const existing = await prisma.careerOpportunity.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "Career opportunity not found." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.careerOpportunity.delete({
        where: { id: existing.id },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "CAREER_OPPORTUNITY_DELETED",
          entityType: "CareerOpportunity",
          entityId: existing.id,
          metadata: { title: existing.title, slug: existing.slug },
          ipAddress: clientIp,
        },
        tx
      );
    });

    triggerAlumniRevalidation();
    return { success: true, data: { id: existing.id } };
  } catch (err: unknown) {
    console.error("[alumni-actions] deleteCareerOpportunityAction failed:", err);
    return { success: false, error: "Failed to delete career opportunity." };
  }
}

export async function toggleCareerOpportunityStatusAction(
  rawInput: unknown
): Promise<AlumniActionState<{ id: string; isPublished: boolean }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = toggleCareerOpportunityStatusSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid status toggle payload." };
    }

    const existing = await prisma.careerOpportunity.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "Career opportunity not found." };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const record = await tx.careerOpportunity.update({
        where: { id: existing.id },
        data: { isPublished: parsed.data.isPublished },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "CAREER_OPPORTUNITY_TOGGLED",
          entityType: "CareerOpportunity",
          entityId: record.id,
          metadata: {
            title: record.title,
            before: existing.isPublished,
            after: record.isPublished,
          },
          ipAddress: clientIp,
        },
        tx
      );

      return record;
    });

    triggerAlumniRevalidation();
    return { success: true, data: { id: updated.id, isPublished: updated.isPublished } };
  } catch (err: unknown) {
    console.error("[alumni-actions] toggleCareerOpportunityStatusAction failed:", err);
    return { success: false, error: "Failed to toggle opportunity status." };
  }
}

export async function reorderCareerOpportunitiesAction(
  rawInput: unknown
): Promise<AlumniActionState<{ count: number }>> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = reorderCareerOpportunitiesSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, error: "Invalid reorder payload." };
    }

    await prisma.$transaction(async (tx) => {
      for (const item of parsed.data.items) {
        await tx.careerOpportunity.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        });
      }

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "CAREER_OPPORTUNITIES_REORDERED",
          entityType: "CareerOpportunity",
          entityId: "batch",
          metadata: { reorderedCount: parsed.data.items.length },
          ipAddress: clientIp,
        },
        tx
      );
    });

    triggerAlumniRevalidation();
    return { success: true, data: { count: parsed.data.items.length } };
  } catch (err: unknown) {
    console.error("[alumni-actions] reorderCareerOpportunitiesAction failed:", err);
    return { success: false, error: "Failed to reorder career opportunities." };
  }
}
