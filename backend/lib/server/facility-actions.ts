"use server";
import { revalidatePath, revalidateTag } from "next/cache";
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
  facilityCategoryCreateSchema,
  facilityCategoryUpdateSchema,
  reorderFacilityCategoriesSchema,
  toggleFacilityCategoryStatusSchema,
  deleteFacilityCategorySchema,
  facilityItemCreateSchema,
  facilityItemUpdateSchema,
  reorderFacilityItemsSchema,
  toggleFacilityItemStatusSchema,
  deleteFacilityItemSchema,
  computeCategoryDiff,
  computeFacilityItemDiff,
} from "@/lib/validation/facilities";

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

async function generateUniqueCategorySlug(title: string, excludeId?: string): Promise<string> {
  const baseSlug = slugify(title);
  const existing = await prisma.facilityCategory.findMany({
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

async function generateUniqueItemSlug(title: string, excludeId?: string): Promise<string> {
  const baseSlug = slugify(title);
  const existing = await prisma.facilityItem.findMany({
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
// CATEGORY ACTIONS
// ==========================================

export async function createFacilityCategoryAction(
  rawInput: unknown
): Promise<ActionResponse<{ id: string }>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const parsed = facilityCategoryCreateSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { title, description, displayOrder, isPublished } = parsed.data;

  try {
    const slug = await generateUniqueCategorySlug(title);

    const category = await prisma.$transaction(async (tx) => {
      const created = await tx.facilityCategory.create({
        data: {
          title,
          slug,
          description: description ?? null,
          displayOrder,
          isPublished,
        },
      });

      await recordAuditEvent({
        userId: user.id,
        action: "FACILITY_CATEGORY_CREATED",
        entityType: "FacilityCategory",
        entityId: created.id,
        metadata: {
          title,
          slug,
          displayOrder,
          isPublished,
        },
      });

      return created;
    });

    revalidateTag("facilities", "max");
    revalidatePath("/admin/life-at-school/facilities");
    revalidatePath("/facilities");

    return { success: true, data: { id: category.id } };
  } catch (err) {
    console.error("[createFacilityCategoryAction] Error:", err);
    return { success: false, error: "Failed to create facility category." };
  }
}

export async function updateFacilityCategoryAction(
  rawInput: unknown
): Promise<ActionResponse<{ id: string }>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const parsed = facilityCategoryUpdateSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { id, title, description, displayOrder, isPublished } = parsed.data;

  try {
    const existing = await prisma.facilityCategory.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: "Facility category not found." };
    }

    const diff = computeCategoryDiff(existing, {
      title,
      description,
      displayOrder,
      isPublished,
    });

    if (Object.keys(diff).length === 0) {
      return { success: true, data: { id } };
    }

    const slug =
      existing.title !== title
        ? await generateUniqueCategorySlug(title, id)
        : existing.slug;

    await prisma.$transaction(async (tx) => {
      await tx.facilityCategory.update({
        where: { id },
        data: {
          title,
          slug,
          description: description ?? null,
          displayOrder,
          isPublished,
        },
      });

      await recordAuditEvent({
        userId: user.id,
        action: "FACILITY_CATEGORY_UPDATED",
        entityType: "FacilityCategory",
        entityId: id,
        metadata: {
          title,
          changedFields: Object.keys(diff),
          diff,
        },
      });
    });

    revalidateTag("facilities", "max");
    revalidatePath("/admin/life-at-school/facilities");
    revalidatePath("/facilities");

    return { success: true, data: { id } };
  } catch (err) {
    console.error("[updateFacilityCategoryAction] Error:", err);
    return { success: false, error: "Failed to update facility category." };
  }
}

export async function deleteFacilityCategoryAction(
  rawInput: unknown
): Promise<ActionResponse<{ id: string }>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const parsed = deleteFacilityCategorySchema.safeParse(rawInput);

  if (!parsed.success) {
    return { success: false, error: "Invalid category ID." };
  }

  const { id } = parsed.data;

  try {
    const existing = await prisma.facilityCategory.findUnique({
      where: { id },
      include: {
        items: {
          select: { id: true, imageStorageKey: true },
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Facility category not found." };
    }

    const imageKeysToClean = existing.items
      .map((item) => item.imageStorageKey)
      .filter((k): k is string => Boolean(k));

    await prisma.$transaction(async (tx) => {
      await tx.facilityCategory.delete({
        where: { id },
      });

      await recordAuditEvent({
        userId: user.id,
        action: "FACILITY_CATEGORY_DELETED",
        entityType: "FacilityCategory",
        entityId: id,
        metadata: {
          title: existing.title,
          deletedItemsCount: existing.items.length,
        },
      });
    });

    // Safely cleanup orphaned managed images
    for (const key of imageKeysToClean) {
      await deleteManagedPhotoIfUnreferenced(key);
    }

    revalidateTag("facilities", "max");
    revalidatePath("/admin/life-at-school/facilities");
    revalidatePath("/facilities");

    return { success: true, data: { id } };
  } catch (err) {
    console.error("[deleteFacilityCategoryAction] Error:", err);
    return { success: false, error: "Failed to delete facility category." };
  }
}

export async function reorderFacilityCategoriesAction(
  rawInput: unknown
): Promise<ActionResponse<void>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const parsed = reorderFacilityCategoriesSchema.safeParse(rawInput);

  if (!parsed.success) {
    return { success: false, error: "Invalid category reorder data." };
  }

  const { orders } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      for (const item of orders) {
        await tx.facilityCategory.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        });
      }

      await recordAuditEvent({
        userId: user.id,
        action: "FACILITY_CATEGORIES_REORDERED",
        entityType: "FacilityCategory",
        entityId: orders[0]?.id || "unknown",
        metadata: { count: orders.length, orders },
      });
    });

    revalidateTag("facilities", "max");
    revalidatePath("/admin/life-at-school/facilities");
    revalidatePath("/facilities");

    return { success: true };
  } catch (err) {
    console.error("[reorderFacilityCategoriesAction] Error:", err);
    return { success: false, error: "Failed to reorder facility categories." };
  }
}

export async function toggleFacilityCategoryStatusAction(
  rawInput: unknown
): Promise<ActionResponse<{ isPublished: boolean }>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const parsed = toggleFacilityCategoryStatusSchema.safeParse(rawInput);

  if (!parsed.success) {
    return { success: false, error: "Invalid status payload." };
  }

  const { id, isPublished } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.facilityCategory.update({
        where: { id },
        data: { isPublished },
      });

      await recordAuditEvent({
        userId: user.id,
        action: "FACILITY_CATEGORY_STATUS_CHANGED",
        entityType: "FacilityCategory",
        entityId: id,
        metadata: { isPublished },
      });
    });

    revalidateTag("facilities", "max");
    revalidatePath("/admin/life-at-school/facilities");
    revalidatePath("/facilities");

    return { success: true, data: { isPublished } };
  } catch (err) {
    console.error("[toggleFacilityCategoryStatusAction] Error:", err);
    return { success: false, error: "Failed to update category status." };
  }
}

// ==========================================
// IMAGE UPLOAD ACTION
// ==========================================

export async function uploadFacilityImageAction(
  formData: FormData
): Promise<ActionResponse<{ fileUrl: string; imageStorageKey: string }>> {
  await requireRole(["SUPER_ADMIN"]);

  const file = extractUploadedFile(formData, "image") || extractUploadedFile(formData, "file");
  if (!file) {
    return { success: false, error: "No image file provided." };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: "Invalid file type. Only JPEG, PNG, and WebP images are permitted.",
    };
  }

  const maxSize = 8 * 1024 * 1024; // 8 MB
  if (file.size > maxSize) {
    return { success: false, error: "Image size exceeds 8 MB limit." };
  }

  try {
    const { storageKey, publicUrl } = await processAndSaveUploadedImage(file, "facilities");
    return {
      success: true,
      data: {
        fileUrl: publicUrl,
        imageStorageKey: storageKey,
      },
    };
  } catch (err) {
    console.error("[uploadFacilityImageAction] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to process image.",
    };
  }
}

// ==========================================
// FACILITY ITEM ACTIONS
// ==========================================

export async function createFacilityItemAction(
  rawInput: unknown
): Promise<ActionResponse<{ id: string }>> {
  const user = await requireRole(["SUPER_ADMIN"]);

  let payload: Record<string, unknown>;
  let uploadedFile: File | null = null;

  if (typeof FormData !== "undefined" && rawInput instanceof FormData) {
    uploadedFile = extractUploadedFile(rawInput, "image") || extractUploadedFile(rawInput, "file");
    const rawHighlights = rawInput.get("highlights");
    let parsedHighlights: string[] = [];
    if (typeof rawHighlights === "string") {
      try {
        parsedHighlights = JSON.parse(rawHighlights);
      } catch {
        parsedHighlights = rawHighlights
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    payload = {
      categoryId: rawInput.get("categoryId"),
      title: rawInput.get("title"),
      description: rawInput.get("description"),
      imageUrl: rawInput.get("imageUrl") || null,
      imageStorageKey: rawInput.get("imageStorageKey") || null,
      imageAlt: rawInput.get("imageAlt"),
      iconName: rawInput.get("iconName") || "BookOpen",
      highlights: parsedHighlights,
      displayOrder: rawInput.get("displayOrder") ?? 0,
      isPublished: rawInput.get("isPublished") !== "false",
    };
  } else if (typeof rawInput === "object" && rawInput !== null) {
    payload = { ...(rawInput as Record<string, unknown>) };
  } else {
    return { success: false, error: "Invalid payload." };
  }

  // Handle uploaded file if present
  let newlyCreatedKey: string | null = null;
  if (uploadedFile) {
    try {
      const { storageKey, publicUrl } = await processAndSaveUploadedImage(uploadedFile, "facilities");
      newlyCreatedKey = storageKey;
      payload.imageUrl = publicUrl;
      payload.imageStorageKey = storageKey;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to process uploaded image.",
      };
    }
  }

  const parsed = facilityItemCreateSchema.safeParse(payload);
  if (!parsed.success) {
    if (newlyCreatedKey) await cleanupOrphanFile(newlyCreatedKey);
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const category = await prisma.facilityCategory.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      if (newlyCreatedKey) await cleanupOrphanFile(newlyCreatedKey);
      return { success: false, error: "Associated category does not exist." };
    }

    const slug = await generateUniqueItemSlug(data.title);

    const created = await prisma.$transaction(async (tx) => {
      const item = await tx.facilityItem.create({
        data: {
          categoryId: data.categoryId,
          title: data.title,
          slug,
          description: data.description,
          imageUrl: data.imageUrl ?? null,
          imageStorageKey: data.imageStorageKey ?? null,
          imageAlt: data.imageAlt,
          iconName: data.iconName,
          highlights: data.highlights,
          displayOrder: data.displayOrder,
          isPublished: data.isPublished,
        },
      });

      await recordAuditEvent({
        userId: user.id,
        action: "FACILITY_ITEM_CREATED",
        entityType: "FacilityItem",
        entityId: item.id,
        metadata: {
          title: data.title,
          categoryTitle: category.title,
          imageMasked: data.imageUrl ? "[PRESENT]" : "[NONE]",
          iconName: data.iconName,
        },
      });

      return item;
    });

    revalidateTag("facilities", "max");
    revalidatePath("/admin/life-at-school/facilities");
    revalidatePath("/facilities");

    return { success: true, data: { id: created.id } };
  } catch (err) {
    if (newlyCreatedKey) await cleanupOrphanFile(newlyCreatedKey);
    console.error("[createFacilityItemAction] Error:", err);
    return { success: false, error: "Failed to create facility item." };
  }
}

export async function updateFacilityItemAction(
  rawInput: unknown
): Promise<ActionResponse<{ id: string }>> {
  const user = await requireRole(["SUPER_ADMIN"]);

  let payload: Record<string, unknown>;
  let uploadedFile: File | null = null;
  let removeRequested = false;

  if (typeof FormData !== "undefined" && rawInput instanceof FormData) {
    uploadedFile = extractUploadedFile(rawInput, "image") || extractUploadedFile(rawInput, "file");
    removeRequested = isRemovalRequested(rawInput, "removeImage");
    const rawHighlights = rawInput.get("highlights");
    let parsedHighlights: string[] = [];
    if (typeof rawHighlights === "string") {
      try {
        parsedHighlights = JSON.parse(rawHighlights);
      } catch {
        parsedHighlights = rawHighlights
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    payload = {
      id: rawInput.get("id"),
      categoryId: rawInput.get("categoryId"),
      title: rawInput.get("title"),
      description: rawInput.get("description"),
      imageUrl: rawInput.get("imageUrl") || null,
      imageStorageKey: rawInput.get("imageStorageKey") || null,
      imageAlt: rawInput.get("imageAlt"),
      iconName: rawInput.get("iconName") || "BookOpen",
      highlights: parsedHighlights,
      displayOrder: rawInput.get("displayOrder") ?? 0,
      isPublished: rawInput.get("isPublished") !== "false",
    };
  } else if (typeof rawInput === "object" && rawInput !== null) {
    payload = { ...(rawInput as Record<string, unknown>) };
    removeRequested = (rawInput as Record<string, unknown>).removeImage === true;
  } else {
    return { success: false, error: "Invalid payload." };
  }

  let newlyCreatedKey: string | null = null;
  if (uploadedFile) {
    try {
      const { storageKey, publicUrl } = await processAndSaveUploadedImage(uploadedFile, "facilities");
      newlyCreatedKey = storageKey;
      payload.imageUrl = publicUrl;
      payload.imageStorageKey = storageKey;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to process uploaded image.",
      };
    }
  } else if (removeRequested) {
    payload.imageUrl = null;
    payload.imageStorageKey = null;
  }

  const parsed = facilityItemUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    if (newlyCreatedKey) await cleanupOrphanFile(newlyCreatedKey);
    return {
      success: false,
      error: "Validation failed.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const existing = await prisma.facilityItem.findUnique({
      where: { id: data.id },
    });

    if (!existing) {
      if (newlyCreatedKey) await cleanupOrphanFile(newlyCreatedKey);
      return { success: false, error: "Facility item not found." };
    }

    const previousKey = existing.imageStorageKey;

    const diff = computeFacilityItemDiff(existing, data);
    if (Object.keys(diff).length === 0 && !newlyCreatedKey) {
      return { success: true, data: { id: data.id } };
    }

    const slug =
      existing.title !== data.title
        ? await generateUniqueItemSlug(data.title, data.id)
        : existing.slug;

    await prisma.$transaction(async (tx) => {
      await tx.facilityItem.update({
        where: { id: data.id },
        data: {
          categoryId: data.categoryId,
          title: data.title,
          slug,
          description: data.description,
          imageUrl: data.imageUrl ?? null,
          imageStorageKey: data.imageStorageKey ?? null,
          imageAlt: data.imageAlt,
          iconName: data.iconName,
          highlights: data.highlights,
          displayOrder: data.displayOrder,
          isPublished: data.isPublished,
        },
      });

      await recordAuditEvent({
        userId: user.id,
        action: "FACILITY_ITEM_UPDATED",
        entityType: "FacilityItem",
        entityId: data.id,
        metadata: {
          title: data.title,
          changedFields: Object.keys(diff),
          diff,
        },
      });
    });

    // Cleanup previous image if replaced or removed
    if (previousKey && previousKey !== data.imageStorageKey) {
      await deleteManagedPhotoIfUnreferenced(previousKey);
    }

    revalidateTag("facilities", "max");
    revalidatePath("/admin/life-at-school/facilities");
    revalidatePath("/facilities");

    return { success: true, data: { id: data.id } };
  } catch (err) {
    if (newlyCreatedKey) await cleanupOrphanFile(newlyCreatedKey);
    console.error("[updateFacilityItemAction] Error:", err);
    return { success: false, error: "Failed to update facility item." };
  }
}

export async function deleteFacilityItemAction(
  rawInput: unknown
): Promise<ActionResponse<{ id: string }>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const parsed = deleteFacilityItemSchema.safeParse(rawInput);

  if (!parsed.success) {
    return { success: false, error: "Invalid facility item ID." };
  }

  const { id } = parsed.data;

  try {
    const existing = await prisma.facilityItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return { success: false, error: "Facility item not found." };
    }

    const previousKey = existing.imageStorageKey;

    await prisma.$transaction(async (tx) => {
      await tx.facilityItem.delete({
        where: { id },
      });

      await recordAuditEvent({
        userId: user.id,
        action: "FACILITY_ITEM_DELETED",
        entityType: "FacilityItem",
        entityId: id,
        metadata: {
          title: existing.title,
        },
      });
    });

    if (previousKey) {
      await deleteManagedPhotoIfUnreferenced(previousKey);
    }

    revalidateTag("facilities", "max");
    revalidatePath("/admin/life-at-school/facilities");
    revalidatePath("/facilities");

    return { success: true, data: { id } };
  } catch (err) {
    console.error("[deleteFacilityItemAction] Error:", err);
    return { success: false, error: "Failed to delete facility item." };
  }
}

export async function reorderFacilityItemsAction(
  rawInput: unknown
): Promise<ActionResponse<void>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const parsed = reorderFacilityItemsSchema.safeParse(rawInput);

  if (!parsed.success) {
    return { success: false, error: "Invalid items reorder payload." };
  }

  const { categoryId, orders } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      for (const item of orders) {
        await tx.facilityItem.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        });
      }

      await recordAuditEvent({
        userId: user.id,
        action: "FACILITY_ITEMS_REORDERED",
        entityType: "FacilityItem",
        entityId: orders[0]?.id || "unknown",
        metadata: { categoryId, count: orders.length, orders },
      });
    });

    revalidateTag("facilities", "max");
    revalidatePath("/admin/life-at-school/facilities");
    revalidatePath("/facilities");

    return { success: true };
  } catch (err) {
    console.error("[reorderFacilityItemsAction] Error:", err);
    return { success: false, error: "Failed to reorder facility items." };
  }
}

export async function toggleFacilityItemStatusAction(
  rawInput: unknown
): Promise<ActionResponse<{ isPublished: boolean }>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const parsed = toggleFacilityItemStatusSchema.safeParse(rawInput);

  if (!parsed.success) {
    return { success: false, error: "Invalid status payload." };
  }

  const { id, isPublished } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.facilityItem.update({
        where: { id },
        data: { isPublished },
      });

      await recordAuditEvent({
        userId: user.id,
        action: "FACILITY_ITEM_STATUS_CHANGED",
        entityType: "FacilityItem",
        entityId: id,
        metadata: { isPublished },
      });
    });

    revalidateTag("facilities", "max");
    revalidatePath("/admin/life-at-school/facilities");
    revalidatePath("/facilities");

    return { success: true, data: { isPublished } };
  } catch (err) {
    console.error("[toggleFacilityItemStatusAction] Error:", err);
    return { success: false, error: "Failed to update facility status." };
  }
}

