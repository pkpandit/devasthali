"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/server/prisma";
import { requireRole } from "@/lib/server/auth";
import { recordAuditEvent } from "@/lib/server/audit";
import {
  extractUploadedFile,
  isRemovalRequested,
  processAndSaveUploadedImage,
  cleanupOrphanFile,
  ImageProcessingError,
  deleteManagedPhotoIfUnreferenced,
} from "@/lib/server/admin-media";
import {
  aboutPageSettingSchema,
  aboutCredentialCreateSchema,
  aboutCredentialUpdateSchema,
  aboutCredentialDeleteSchema,
  aboutCredentialToggleSchema,
  aboutCredentialReorderSchema,
  aboutNarrativeSectionCreateSchema,
  aboutNarrativeSectionUpdateSchema,
  aboutNarrativeSectionDeleteSchema,
  aboutNarrativeSectionToggleSchema,
  aboutNarrativeSectionReorderSchema,
  visionMissionSettingSchema,
  institutionalCoreValueCreateSchema,
  institutionalCoreValueUpdateSchema,
  institutionalCoreValueDeleteSchema,
  institutionalCoreValueToggleSchema,
  institutionalCoreValueReorderSchema,
  leadershipMemberUpdateSchema,
  leadershipMemberToggleSchema,
  leadershipMemberReorderSchema,
  leadershipSlugs,
  normalizeAboutPayload,
  computeAboutLeadershipDiff,
  formatZodErrors,
} from "@/lib/validation/about-leadership";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function parsePayload(payload: FormData | Record<string, unknown>): Record<string, unknown> {
  if (typeof FormData !== "undefined" && payload instanceof FormData) {
    const obj: Record<string, unknown> = {};
    payload.forEach((value, key) => {
      if (typeof value === "string") {
        if (value === "true") obj[key] = true;
        else if (value === "false") obj[key] = false;
        else if (value === "") obj[key] = null;
        else obj[key] = value;
      } else {
        obj[key] = value;
      }
    });
    return obj;
  }
  return payload as Record<string, unknown>;
}

// ==========================================
// DATA FETCHING FOR ADMIN
// ==========================================

export async function getAdminAboutLeadershipData() {
  await requireRole(["SUPER_ADMIN"]);

  const [
    aboutSetting,
    credentials,
    narrativeSections,
    vmSetting,
    coreValues,
    leadershipMembers,
  ] = await Promise.all([
    prisma.aboutPageSetting.findUnique({ where: { id: "default" } }),
    prisma.aboutCredential.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.aboutNarrativeSection.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.visionMissionSetting.findUnique({ where: { id: "default" } }),
    prisma.institutionalCoreValue.findMany({ orderBy: { displayOrder: "asc" } }),
    prisma.leadershipMember.findMany({ orderBy: { displayOrder: "asc" } }),
  ]);

  return {
    aboutSetting,
    credentials,
    narrativeSections,
    vmSetting,
    coreValues,
    leadershipMembers,
  };
}

// ==========================================
// 1. ABOUT SETTING ACTIONS
// ==========================================

export async function updateAboutPageSettingAction(
  _prevState: unknown,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionResult> {
  let newlyManagedKey: string | null = null;
  let newlyPublicUrl: string | null = null;

  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);

    const imageFile =
      extractUploadedFile(rawPayload, "showcaseImageFile") ||
      extractUploadedFile(rawPayload, "imageFile") ||
      extractUploadedFile(rawPayload, "photoFile");
    const isRemoval =
      isRemovalRequested(rawPayload, "removeShowcaseImage") ||
      isRemovalRequested(rawPayload, "removeImage") ||
      isRemovalRequested(rawPayload, "removePhoto");

    if (imageFile) {
      try {
        const saved = await processAndSaveUploadedImage(imageFile);
        newlyManagedKey = saved.storageKey;
        newlyPublicUrl = saved.publicUrl;
      } catch (procErr) {
        if (procErr instanceof ImageProcessingError) {
          return {
            success: false,
            error: procErr.message,
            fieldErrors: { showcaseImageFile: procErr.message },
          };
        }
        return {
          success: false,
          error:
            "Failed to process uploaded showcase image. Please ensure it is a valid JPEG, PNG, or WebP image under 2 MiB.",
        };
      }
    }

    const normalized = normalizeAboutPayload(parsePayload(rawPayload));
    if (newlyPublicUrl) {
      normalized.showcaseImageUrl = newlyPublicUrl;
      normalized.showcaseImageStorageKey = newlyManagedKey;
    } else if (isRemoval) {
      normalized.showcaseImageUrl = null;
      normalized.showcaseImageStorageKey = null;
    }

    const parsed = aboutPageSettingSchema.safeParse(normalized);
    if (!parsed.success) {
      if (newlyManagedKey) await cleanupOrphanFile(newlyManagedKey);
      return {
        success: false,
        error: "Validation failed. Please review the errors below.",
        fieldErrors: formatZodErrors(parsed.error),
      };
    }

    const currentSetting = await prisma.aboutPageSetting.findUnique({
      where: { id: "default" },
    });

    const oldStorageKeyToDelete =
      (newlyManagedKey || isRemoval) && currentSetting?.showcaseImageStorageKey
        ? currentSetting.showcaseImageStorageKey
        : null;

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.aboutPageSetting.findUnique({
        where: { id: "default" },
      });

      const updated = await tx.aboutPageSetting.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          ...parsed.data,
        },
        update: {
          ...parsed.data,
        },
      });

      const diff = computeAboutLeadershipDiff(
        (existing as unknown as Record<string, unknown>) || {},
        updated as unknown as Record<string, unknown>
      );

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ABOUT_SETTING_UPDATED",
          entityType: "AboutPageSetting",
          entityId: "default",
          metadata: { diff, heading: updated.heading },
        },
        tx
      );

      return updated;
    });

    if (oldStorageKeyToDelete) {
      await deleteManagedPhotoIfUnreferenced(oldStorageKeyToDelete);
    }

    revalidatePath("/admin/about-leadership");
    revalidatePath("/about");
    return { success: true, data: result };
  } catch (err: unknown) {
    if (newlyManagedKey) await cleanupOrphanFile(newlyManagedKey);
    console.error("updateAboutPageSettingAction error:", err);
    return { success: false, error: "Failed to update About School settings." };
  }
}

// ==========================================
// 2. ABOUT CREDENTIAL ACTIONS
// ==========================================

export async function createAboutCredentialAction(
  _prevState: unknown,
  rawData: unknown
): Promise<ActionResult> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);
  const normalized = normalizeAboutPayload((rawData as Record<string, unknown>) || {});

  const parsed = aboutCredentialCreateSchema.safeParse(normalized);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed. Please check the form fields.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const count = await tx.aboutCredential.count();
      const created = await tx.aboutCredential.create({
        data: {
          ...parsed.data,
          displayOrder: parsed.data.displayOrder ?? count,
        },
      });

            await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ABOUT_CREDENTIAL_CREATED",
          entityType: "AboutCredential",
          entityId: created.id,
          metadata: { title: created.title, category: created.category },
        },
        tx
      );

      return created;
    });

    revalidatePath("/admin/about-leadership");
    revalidatePath("/about");
    return { success: true, data: result };
  } catch (err: unknown) {
    console.error("createAboutCredentialAction error:", err);
    return { success: false, error: "Failed to create credential." };
  }
}

export async function updateAboutCredentialAction(
  _prevState: unknown,
  rawData: unknown
): Promise<ActionResult> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);
  const normalized = normalizeAboutPayload((rawData as Record<string, unknown>) || {});

  const parsed = aboutCredentialUpdateSchema.safeParse(normalized);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed. Please check the form fields.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.aboutCredential.findUnique({
        where: { id: parsed.data.id },
      });
      if (!existing) {
        throw new Error("Credential not found.");
      }

      const updated = await tx.aboutCredential.update({
        where: { id: parsed.data.id },
        data: {
          category: parsed.data.category,
          title: parsed.data.title,
          subtext: parsed.data.subtext,
          iconName: parsed.data.iconName ?? null,
          displayOrder: parsed.data.displayOrder,
          isPublished: parsed.data.isPublished,
        },
      });

      const diff = computeAboutLeadershipDiff(
        existing as unknown as Record<string, unknown>,
        updated as unknown as Record<string, unknown>
      );

            await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ABOUT_CREDENTIAL_UPDATED",
          entityType: "AboutCredential",
          entityId: parsed.data.id,
          metadata: { diff, title: updated.title },
        },
        tx
      );

      return updated;
    });

    revalidatePath("/admin/about-leadership");
    revalidatePath("/about");
    return { success: true, data: result };
  } catch (err: unknown) {
    console.error("updateAboutCredentialAction error:", err);
    return { success: false, error: "Failed to update credential." };
  }
}

export async function deleteAboutCredentialAction(
  _prevState: unknown,
  rawData: unknown
): Promise<ActionResult> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = aboutCredentialDeleteSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Invalid credential ID" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.aboutCredential.findUnique({
        where: { id: parsed.data.id },
      });
      if (!existing) throw new Error("Credential not found.");

      await tx.aboutCredential.delete({ where: { id: parsed.data.id } });

            await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ABOUT_CREDENTIAL_DELETED",
          entityType: "AboutCredential",
          entityId: parsed.data.id,
          metadata: { title: existing.title, category: existing.category },
        },
        tx
      );
    });

    revalidatePath("/admin/about-leadership");
    revalidatePath("/about");
    return { success: true };
  } catch (err: unknown) {
    console.error("deleteAboutCredentialAction error:", err);
    return { success: false, error: "Failed to delete credential." };
  }
}

export async function toggleAboutCredentialStatusAction(
  _prevState: unknown,
  rawData: unknown
): Promise<ActionResult> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = aboutCredentialToggleSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Invalid parameters" };
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.aboutCredential.findUnique({
        where: { id: parsed.data.id },
      });
      if (!existing) throw new Error("Credential not found.");

      const res = await tx.aboutCredential.update({
        where: { id: parsed.data.id },
        data: { isPublished: parsed.data.isPublished },
      });

            await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ABOUT_CREDENTIAL_STATUS_CHANGED",
          entityType: "AboutCredential",
          entityId: parsed.data.id,
          metadata: { isPublished: res.isPublished, title: res.title },
        },
        tx
      );

      return res;
    });

    revalidatePath("/admin/about-leadership");
    revalidatePath("/about");
    return { success: true, data: updated };
  } catch (err: unknown) {
    console.error("toggleAboutCredentialStatusAction error:", err);
    return { success: false, error: "Failed to toggle status." };
  }
}

export async function reorderAboutCredentialsAction(
  _prevState: unknown,
  rawData: unknown
): Promise<ActionResult> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = aboutCredentialReorderSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Invalid reorder payload" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const item of parsed.data.credentials) {
        await tx.aboutCredential.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        });
      }

            await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ABOUT_CREDENTIALS_REORDERED",
          entityType: "AboutCredential",
          entityId: "batch",
          metadata: { count: parsed.data.credentials.length, ids: parsed.data.credentials.map((c) => c.id) },
        },
        tx
      );
    });

    revalidatePath("/admin/about-leadership");
    revalidatePath("/about");
    return { success: true };
  } catch (err: unknown) {
    console.error("reorderAboutCredentialsAction error:", err);
    return { success: false, error: "Failed to reorder credentials." };
  }
}

// ==========================================
// 3. ABOUT NARRATIVE SECTION ACTIONS
// ==========================================

export async function createAboutNarrativeSectionAction(
  _prevState: unknown,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionResult> {
  let newlyManagedKey: string | null = null;
  let newlyPublicUrl: string | null = null;

  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);

    const imageFile =
      extractUploadedFile(rawPayload, "imageFile") ||
      extractUploadedFile(rawPayload, "photoFile");

    if (imageFile) {
      try {
        const saved = await processAndSaveUploadedImage(imageFile);
        newlyManagedKey = saved.storageKey;
        newlyPublicUrl = saved.publicUrl;
      } catch (procErr) {
        if (procErr instanceof ImageProcessingError) {
          return {
            success: false,
            error: procErr.message,
            fieldErrors: { imageFile: procErr.message },
          };
        }
        return {
          success: false,
          error:
            "Failed to process uploaded image. Please ensure it is a valid JPEG, PNG, or WebP image under 2 MiB.",
        };
      }
    }

    const normalized = normalizeAboutPayload(parsePayload(rawPayload));
    if (newlyPublicUrl) {
      normalized.imageUrl = newlyPublicUrl;
      normalized.imageStorageKey = newlyManagedKey;
    }

    const parsed = aboutNarrativeSectionCreateSchema.safeParse(normalized);
    if (!parsed.success) {
      if (newlyManagedKey) await cleanupOrphanFile(newlyManagedKey);
      return {
        success: false,
        error: "Validation failed. Please check the narrative section fields.",
        fieldErrors: formatZodErrors(parsed.error),
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const count = await tx.aboutNarrativeSection.count();
      const created = await tx.aboutNarrativeSection.create({
        data: {
          heading: parsed.data.heading ?? null,
          body: parsed.data.body,
          imageUrl: parsed.data.imageUrl ?? null,
          imageStorageKey: parsed.data.imageStorageKey ?? null,
          imageAlt: parsed.data.imageAlt ?? null,
          displayOrder: parsed.data.displayOrder ?? count,
          isPublished: parsed.data.isPublished,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ABOUT_NARRATIVE_CREATED",
          entityType: "AboutNarrativeSection",
          entityId: created.id,
          metadata: { heading: created.heading },
        },
        tx
      );

      return created;
    });

    revalidatePath("/admin/about-leadership");
    revalidatePath("/about");
    return { success: true, data: result };
  } catch (err: unknown) {
    if (newlyManagedKey) await cleanupOrphanFile(newlyManagedKey);
    console.error("createAboutNarrativeSectionAction error:", err);
    return { success: false, error: "Failed to create narrative section." };
  }
}

export async function updateAboutNarrativeSectionAction(
  _prevState: unknown,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionResult> {
  let newlyManagedKey: string | null = null;
  let newlyPublicUrl: string | null = null;

  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);

    const imageFile =
      extractUploadedFile(rawPayload, "imageFile") ||
      extractUploadedFile(rawPayload, "photoFile");
    const isRemoval =
      isRemovalRequested(rawPayload, "removeImage") ||
      isRemovalRequested(rawPayload, "removePhoto");

    if (imageFile) {
      try {
        const saved = await processAndSaveUploadedImage(imageFile);
        newlyManagedKey = saved.storageKey;
        newlyPublicUrl = saved.publicUrl;
      } catch (procErr) {
        if (procErr instanceof ImageProcessingError) {
          return {
            success: false,
            error: procErr.message,
            fieldErrors: { imageFile: procErr.message },
          };
        }
        return {
          success: false,
          error:
            "Failed to process uploaded image. Please ensure it is a valid JPEG, PNG, or WebP image under 2 MiB.",
        };
      }
    }

    const normalized = normalizeAboutPayload(parsePayload(rawPayload));
    if (newlyPublicUrl) {
      normalized.imageUrl = newlyPublicUrl;
      normalized.imageStorageKey = newlyManagedKey;
    } else if (isRemoval) {
      normalized.imageUrl = null;
      normalized.imageStorageKey = null;
    }

    const parsed = aboutNarrativeSectionUpdateSchema.safeParse(normalized);
    if (!parsed.success) {
      if (newlyManagedKey) await cleanupOrphanFile(newlyManagedKey);
      return {
        success: false,
        error: "Validation failed. Please check the narrative section fields.",
        fieldErrors: formatZodErrors(parsed.error),
      };
    }

    const existingSection = await prisma.aboutNarrativeSection.findUnique({
      where: { id: parsed.data.id },
    });
    if (!existingSection) {
      if (newlyManagedKey) await cleanupOrphanFile(newlyManagedKey);
      return { success: false, error: "Narrative section not found." };
    }

    const oldStorageKeyToDelete =
      (newlyManagedKey || isRemoval) && existingSection.imageStorageKey
        ? existingSection.imageStorageKey
        : null;

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.aboutNarrativeSection.update({
        where: { id: parsed.data.id },
        data: {
          heading: parsed.data.heading ?? null,
          body: parsed.data.body,
          imageUrl: parsed.data.imageUrl ?? null,
          imageStorageKey: parsed.data.imageStorageKey ?? null,
          imageAlt: parsed.data.imageAlt ?? null,
          displayOrder: parsed.data.displayOrder,
          isPublished: parsed.data.isPublished,
        },
      });

      const diff = computeAboutLeadershipDiff(
        existingSection as unknown as Record<string, unknown>,
        updated as unknown as Record<string, unknown>
      );

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ABOUT_NARRATIVE_UPDATED",
          entityType: "AboutNarrativeSection",
          entityId: parsed.data.id,
          metadata: { diff, heading: updated.heading },
        },
        tx
      );

      return updated;
    });

    if (oldStorageKeyToDelete) {
      await deleteManagedPhotoIfUnreferenced(oldStorageKeyToDelete);
    }

    revalidatePath("/admin/about-leadership");
    revalidatePath("/about");
    return { success: true, data: result };
  } catch (err: unknown) {
    if (newlyManagedKey) await cleanupOrphanFile(newlyManagedKey);
    console.error("updateAboutNarrativeSectionAction error:", err);
    return { success: false, error: "Failed to update narrative section." };
  }
}

export async function deleteAboutNarrativeSectionAction(
  _prevState: unknown,
  rawData: unknown
): Promise<ActionResult> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = aboutNarrativeSectionDeleteSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Invalid section ID" };
  }

  try {
    const existing = await prisma.aboutNarrativeSection.findUnique({
      where: { id: parsed.data.id },
    });
    if (!existing) throw new Error("Narrative section not found.");

    await prisma.$transaction(async (tx) => {
      await tx.aboutNarrativeSection.delete({ where: { id: parsed.data.id } });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ABOUT_NARRATIVE_DELETED",
          entityType: "AboutNarrativeSection",
          entityId: parsed.data.id,
          metadata: { heading: existing.heading },
        },
        tx
      );
    });

    if (existing.imageStorageKey) {
      await deleteManagedPhotoIfUnreferenced(existing.imageStorageKey);
    }

    revalidatePath("/admin/about-leadership");
    revalidatePath("/about");
    return { success: true };
  } catch (err: unknown) {
    console.error("deleteAboutNarrativeSectionAction error:", err);
    return { success: false, error: "Failed to delete narrative section." };
  }
}

export async function toggleAboutNarrativeSectionStatusAction(
  _prevState: unknown,
  rawData: unknown
): Promise<ActionResult> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = aboutNarrativeSectionToggleSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Invalid parameters" };
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.aboutNarrativeSection.findUnique({
        where: { id: parsed.data.id },
      });
      if (!existing) throw new Error("Narrative section not found.");

      const res = await tx.aboutNarrativeSection.update({
        where: { id: parsed.data.id },
        data: { isPublished: parsed.data.isPublished },
      });

            await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ABOUT_NARRATIVE_STATUS_CHANGED",
          entityType: "AboutNarrativeSection",
          entityId: parsed.data.id,
          metadata: { isPublished: res.isPublished, heading: res.heading },
        },
        tx
      );

      return res;
    });

    revalidatePath("/admin/about-leadership");
    revalidatePath("/about");
    return { success: true, data: updated };
  } catch (err: unknown) {
    console.error("toggleAboutNarrativeSectionStatusAction error:", err);
    return { success: false, error: "Failed to toggle status." };
  }
}

export async function reorderAboutNarrativeSectionsAction(
  _prevState: unknown,
  rawData: unknown
): Promise<ActionResult> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = aboutNarrativeSectionReorderSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Invalid reorder payload" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const item of parsed.data.sections) {
        await tx.aboutNarrativeSection.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        });
      }

            await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "ABOUT_NARRATIVES_REORDERED",
          entityType: "AboutNarrativeSection",
          entityId: "batch",
          metadata: { count: parsed.data.sections.length, ids: parsed.data.sections.map((s) => s.id) },
        },
        tx
      );
    });

    revalidatePath("/admin/about-leadership");
    revalidatePath("/about");
    return { success: true };
  } catch (err: unknown) {
    console.error("reorderAboutNarrativeSectionsAction error:", err);
    return { success: false, error: "Failed to reorder narrative sections." };
  }
}

// ==========================================
// 4. VISION MISSION SETTING ACTIONS
// ==========================================

export async function updateVisionMissionSettingAction(
  _prevState: unknown,
  rawData: unknown
): Promise<ActionResult> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);
  const normalized = normalizeAboutPayload((rawData as Record<string, unknown>) || {});

  const parsed = visionMissionSettingSchema.safeParse(normalized);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed. Please review the errors below.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.visionMissionSetting.findUnique({
        where: { id: "default" },
      });

      const updated = await tx.visionMissionSetting.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          ...parsed.data,
        },
        update: {
          ...parsed.data,
        },
      });

      const diff = computeAboutLeadershipDiff(
        (existing as unknown as Record<string, unknown>) || {},
        updated as unknown as Record<string, unknown>
      );

            await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "VISION_MISSION_SETTING_UPDATED",
          entityType: "VisionMissionSetting",
          entityId: "default",
          metadata: { diff, heading: updated.heading },
        },
        tx
      );

      return updated;
    });

    revalidatePath("/admin/about-leadership");
    revalidatePath("/vision-mission");
    return { success: true, data: result };
  } catch (err: unknown) {
    console.error("updateVisionMissionSettingAction error:", err);
    return { success: false, error: "Failed to update Vision and Mission settings." };
  }
}

// ==========================================
// 5. CORE VALUE ACTIONS
// ==========================================

export async function createInstitutionalCoreValueAction(
  _prevState: unknown,
  rawData: unknown
): Promise<ActionResult> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);
  const normalized = normalizeAboutPayload((rawData as Record<string, unknown>) || {});

  const parsed = institutionalCoreValueCreateSchema.safeParse(normalized);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed. Please check the core value fields.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const count = await tx.institutionalCoreValue.count();
      const created = await tx.institutionalCoreValue.create({
        data: {
          ...parsed.data,
          displayOrder: parsed.data.displayOrder ?? count,
        },
      });

            await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "CORE_VALUE_CREATED",
          entityType: "InstitutionalCoreValue",
          entityId: created.id,
          metadata: { title: created.title },
        },
        tx
      );

      return created;
    });

    revalidatePath("/admin/about-leadership");
    revalidatePath("/vision-mission");
    return { success: true, data: result };
  } catch (err: unknown) {
    console.error("createInstitutionalCoreValueAction error:", err);
    return { success: false, error: "Failed to create core value." };
  }
}

export async function updateInstitutionalCoreValueAction(
  _prevState: unknown,
  rawData: unknown
): Promise<ActionResult> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);
  const normalized = normalizeAboutPayload((rawData as Record<string, unknown>) || {});

  const parsed = institutionalCoreValueUpdateSchema.safeParse(normalized);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed. Please check the core value fields.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.institutionalCoreValue.findUnique({
        where: { id: parsed.data.id },
      });
      if (!existing) throw new Error("Core value not found.");

      const updated = await tx.institutionalCoreValue.update({
        where: { id: parsed.data.id },
        data: {
          title: parsed.data.title,
          description: parsed.data.description,
          iconName: parsed.data.iconName ?? null,
          displayOrder: parsed.data.displayOrder,
          isPublished: parsed.data.isPublished,
        },
      });

      const diff = computeAboutLeadershipDiff(
        existing as unknown as Record<string, unknown>,
        updated as unknown as Record<string, unknown>
      );

            await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "CORE_VALUE_UPDATED",
          entityType: "InstitutionalCoreValue",
          entityId: parsed.data.id,
          metadata: { diff, title: updated.title },
        },
        tx
      );

      return updated;
    });

    revalidatePath("/admin/about-leadership");
    revalidatePath("/vision-mission");
    return { success: true, data: result };
  } catch (err: unknown) {
    console.error("updateInstitutionalCoreValueAction error:", err);
    return { success: false, error: "Failed to update core value." };
  }
}

export async function deleteInstitutionalCoreValueAction(
  _prevState: unknown,
  rawData: unknown
): Promise<ActionResult> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = institutionalCoreValueDeleteSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Invalid core value ID" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.institutionalCoreValue.findUnique({
        where: { id: parsed.data.id },
      });
      if (!existing) throw new Error("Core value not found.");

      await tx.institutionalCoreValue.delete({ where: { id: parsed.data.id } });

            await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "CORE_VALUE_DELETED",
          entityType: "InstitutionalCoreValue",
          entityId: parsed.data.id,
          metadata: { title: existing.title },
        },
        tx
      );
    });

    revalidatePath("/admin/about-leadership");
    revalidatePath("/vision-mission");
    return { success: true };
  } catch (err: unknown) {
    console.error("deleteInstitutionalCoreValueAction error:", err);
    return { success: false, error: "Failed to delete core value." };
  }
}

export async function toggleInstitutionalCoreValueStatusAction(
  _prevState: unknown,
  rawData: unknown
): Promise<ActionResult> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = institutionalCoreValueToggleSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Invalid parameters" };
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.institutionalCoreValue.findUnique({
        where: { id: parsed.data.id },
      });
      if (!existing) throw new Error("Core value not found.");

      const res = await tx.institutionalCoreValue.update({
        where: { id: parsed.data.id },
        data: { isPublished: parsed.data.isPublished },
      });

            await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "CORE_VALUE_STATUS_CHANGED",
          entityType: "InstitutionalCoreValue",
          entityId: parsed.data.id,
          metadata: { isPublished: res.isPublished, title: res.title },
        },
        tx
      );

      return res;
    });

    revalidatePath("/admin/about-leadership");
    revalidatePath("/vision-mission");
    return { success: true, data: updated };
  } catch (err: unknown) {
    console.error("toggleInstitutionalCoreValueStatusAction error:", err);
    return { success: false, error: "Failed to toggle status." };
  }
}

export async function reorderInstitutionalCoreValuesAction(
  _prevState: unknown,
  rawData: unknown
): Promise<ActionResult> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = institutionalCoreValueReorderSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Invalid reorder payload" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const item of parsed.data.values) {
        await tx.institutionalCoreValue.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        });
      }

            await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "CORE_VALUES_REORDERED",
          entityType: "InstitutionalCoreValue",
          entityId: "batch",
          metadata: { count: parsed.data.values.length, ids: parsed.data.values.map((v) => v.id) },
        },
        tx
      );
    });

    revalidatePath("/admin/about-leadership");
    revalidatePath("/vision-mission");
    return { success: true };
  } catch (err: unknown) {
    console.error("reorderInstitutionalCoreValuesAction error:", err);
    return { success: false, error: "Failed to reorder core values." };
  }
}

// ==========================================
// 6. LEADERSHIP MEMBER ACTIONS
// ==========================================

export async function updateLeadershipMemberAction(
  _prevState: unknown,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionResult> {
  let newlyManagedImageKey: string | null = null;
  let newlyPublicImageUrl: string | null = null;
  let newlyManagedSigKey: string | null = null;
  let newlyPublicSigUrl: string | null = null;

  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);

    const imageFile =
      extractUploadedFile(rawPayload, "imageFile") ||
      extractUploadedFile(rawPayload, "photoFile");
    const isImageRemoval =
      isRemovalRequested(rawPayload, "removeImage") ||
      isRemovalRequested(rawPayload, "removePhoto");

    const signatureFile =
      extractUploadedFile(rawPayload, "signatureFile") ||
      extractUploadedFile(rawPayload, "signatureImageFile");
    const isSignatureRemoval =
      isRemovalRequested(rawPayload, "removeSignature") ||
      isRemovalRequested(rawPayload, "removeSignatureImage");

    if (imageFile) {
      try {
        const saved = await processAndSaveUploadedImage(imageFile);
        newlyManagedImageKey = saved.storageKey;
        newlyPublicImageUrl = saved.publicUrl;
      } catch (procErr) {
        if (procErr instanceof ImageProcessingError) {
          return {
            success: false,
            error: procErr.message,
            fieldErrors: { imageFile: procErr.message },
          };
        }
        return {
          success: false,
          error:
            "Failed to process uploaded portrait. Please ensure it is a valid JPEG, PNG, or WebP image under 2 MiB.",
        };
      }
    }

    if (signatureFile) {
      try {
        const saved = await processAndSaveUploadedImage(signatureFile);
        newlyManagedSigKey = saved.storageKey;
        newlyPublicSigUrl = saved.publicUrl;
      } catch (procErr) {
        if (newlyManagedImageKey) await cleanupOrphanFile(newlyManagedImageKey);
        if (procErr instanceof ImageProcessingError) {
          return {
            success: false,
            error: procErr.message,
            fieldErrors: { signatureFile: procErr.message },
          };
        }
        return {
          success: false,
          error:
            "Failed to process uploaded signature. Please ensure it is a valid JPEG, PNG, or WebP image under 2 MiB.",
        };
      }
    }

    const normalized = normalizeAboutPayload(parsePayload(rawPayload));

    if (newlyPublicImageUrl) {
      normalized.imageUrl = newlyPublicImageUrl;
      normalized.imageStorageKey = newlyManagedImageKey;
    } else if (isImageRemoval) {
      normalized.imageUrl = null;
      normalized.imageStorageKey = null;
    }

    if (newlyPublicSigUrl) {
      normalized.signatureImageUrl = newlyPublicSigUrl;
      normalized.signatureStorageKey = newlyManagedSigKey;
    } else if (isSignatureRemoval) {
      normalized.signatureImageUrl = null;
      normalized.signatureStorageKey = null;
    }

    const parsed = leadershipMemberUpdateSchema.safeParse(normalized);
    if (!parsed.success) {
      if (newlyManagedImageKey) await cleanupOrphanFile(newlyManagedImageKey);
      if (newlyManagedSigKey) await cleanupOrphanFile(newlyManagedSigKey);
      return {
        success: false,
        error: "Validation failed. Please check the leadership fields.",
        fieldErrors: formatZodErrors(parsed.error),
      };
    }

    const existingMember = await prisma.leadershipMember.findUnique({
      where: { id: parsed.data.id },
    });
    if (!existingMember) {
      if (newlyManagedImageKey) await cleanupOrphanFile(newlyManagedImageKey);
      if (newlyManagedSigKey) await cleanupOrphanFile(newlyManagedSigKey);
      return { success: false, error: "Leadership member not found." };
    }

    const canonicalSlug = leadershipSlugs[parsed.data.role];

    const oldImageKeyToDelete =
      (newlyManagedImageKey || isImageRemoval) && existingMember.imageStorageKey
        ? existingMember.imageStorageKey
        : null;

    const oldSigKeyToDelete =
      (newlyManagedSigKey || isSignatureRemoval) && existingMember.signatureStorageKey
        ? existingMember.signatureStorageKey
        : null;

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.leadershipMember.update({
        where: { id: parsed.data.id },
        data: {
          role: parsed.data.role,
          slug: canonicalSlug,
          pageTitle: parsed.data.pageTitle,
          breadcrumb: parsed.data.breadcrumb,
          badgeText: parsed.data.badgeText,
          name: parsed.data.name,
          designation: parsed.data.designation,
          termOrAffiliation: parsed.data.termOrAffiliation ?? null,
          location: parsed.data.location ?? null,
          shortIntro: parsed.data.shortIntro,
          quote: parsed.data.quote ?? null,
          messageBody: parsed.data.messageBody,
          imageUrl: parsed.data.imageUrl ?? null,
          imageStorageKey: parsed.data.imageStorageKey ?? null,
          imageAlt: parsed.data.imageAlt ?? null,
          signatureImageUrl: parsed.data.signatureImageUrl ?? null,
          signatureStorageKey: parsed.data.signatureStorageKey ?? null,
          signatureAlt: parsed.data.signatureAlt ?? null,
          bio: parsed.data.bio ?? null,
          ctaLabel: parsed.data.ctaLabel ?? null,
          ctaHref: parsed.data.ctaHref ?? null,
          isPublished: parsed.data.isPublished,
        },
      });

      const diff = computeAboutLeadershipDiff(
        existingMember as unknown as Record<string, unknown>,
        updated as unknown as Record<string, unknown>
      );

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "LEADERSHIP_MEMBER_UPDATED",
          entityType: "LeadershipMember",
          entityId: parsed.data.id,
          metadata: { diff, role: updated.role, name: updated.name },
        },
        tx
      );

      return updated;
    });

    if (oldImageKeyToDelete) {
      await deleteManagedPhotoIfUnreferenced(oldImageKeyToDelete);
    }
    if (oldSigKeyToDelete) {
      await deleteManagedPhotoIfUnreferenced(oldSigKeyToDelete);
    }

    revalidatePath("/admin/about-leadership");
    revalidatePath(`/${canonicalSlug}`);
    return { success: true, data: result };
  } catch (err: unknown) {
    if (newlyManagedImageKey) await cleanupOrphanFile(newlyManagedImageKey);
    if (newlyManagedSigKey) await cleanupOrphanFile(newlyManagedSigKey);
    console.error("updateLeadershipMemberAction error:", err);
    return { success: false, error: "Failed to update leadership member." };
  }
}

export async function toggleLeadershipMemberStatusAction(
  _prevState: unknown,
  rawData: unknown
): Promise<ActionResult> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = leadershipMemberToggleSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Invalid parameters" };
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.leadershipMember.findUnique({
        where: { id: parsed.data.id },
      });
      if (!existing) throw new Error("Leadership member not found.");

      const res = await tx.leadershipMember.update({
        where: { id: parsed.data.id },
        data: { isPublished: parsed.data.isPublished },
      });

            await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "LEADERSHIP_MEMBER_STATUS_CHANGED",
          entityType: "LeadershipMember",
          entityId: parsed.data.id,
          metadata: { isPublished: res.isPublished, role: res.role, name: res.name },
        },
        tx
      );

      return res;
    });

    revalidatePath("/admin/about-leadership");
    revalidatePath(`/${updated.slug}`);
    return { success: true, data: updated };
  } catch (err: unknown) {
    console.error("toggleLeadershipMemberStatusAction error:", err);
    return { success: false, error: "Failed to toggle status." };
  }
}

export async function reorderLeadershipMembersAction(
  _prevState: unknown,
  rawData: unknown
): Promise<ActionResult> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = leadershipMemberReorderSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Invalid reorder payload" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const item of parsed.data.members) {
        await tx.leadershipMember.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        });
      }

            await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "LEADERSHIP_MEMBERS_REORDERED",
          entityType: "LeadershipMember",
          entityId: "batch",
          metadata: { count: parsed.data.members.length, ids: parsed.data.members.map((m) => m.id) },
        },
        tx
      );
    });

    revalidatePath("/admin/about-leadership");
    return { success: true };
  } catch (err: unknown) {
    console.error("reorderLeadershipMembersAction error:", err);
    return { success: false, error: "Failed to reorder leadership members." };
  }
}
