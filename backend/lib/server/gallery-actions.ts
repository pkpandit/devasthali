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
  galleryAlbumCreateSchema,
  galleryAlbumUpdateSchema,
  galleryAlbumDeleteSchema,
  galleryAlbumToggleSchema,
  galleryAlbumsReorderSchema,
  galleryImageCreateSchema,
  galleryImageUpdateSchema,
  galleryImageDeleteSchema,
  galleryImageToggleSchema,
  galleryImagesReorderSchema,
  normalizeGalleryPayload,
  computeGalleryAlbumDiff,
  computeGalleryImageDiff,
  formatZodErrors,
} from "@/lib/validation/gallery";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function revalidateGalleryRoutes() {
  revalidatePath("/admin/life-at-school/gallery");
  revalidatePath("/api/public/gallery");
  revalidatePath("/gallery");
}

// ==========================================
// DATA FETCHING FOR ADMIN
// ==========================================

export async function getAdminGalleryData() {
  await requireRole(["SUPER_ADMIN"]);

  const albums = await prisma.galleryAlbum.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    include: {
      images: {
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  return { albums };
}

// ==========================================
// GALLERY ALBUM MUTATION ACTIONS
// ==========================================

export async function createGalleryAlbum(
  rawPayload: unknown
): Promise<ActionResult<{ id: string }>> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const rawInput = (rawPayload && typeof rawPayload === "object" ? rawPayload : {}) as
    | FormData
    | Record<string, unknown>;

  const photoFile =
    extractUploadedFile(rawInput, "coverImageFile") ||
    extractUploadedFile(rawInput, "imageFile") ||
    extractUploadedFile(rawInput, "photoFile");

  let newlyManagedKey: string | null = null;
  let newlyPublicUrl: string | null = null;

  if (photoFile) {
    try {
      const saved = await processAndSaveUploadedImage(photoFile, "gallery");
      newlyManagedKey = saved.storageKey;
      newlyPublicUrl = saved.publicUrl;
    } catch (procErr) {
      if (procErr instanceof ImageProcessingError) {
        return {
          success: false,
          error: procErr.message,
          fieldErrors: { coverImageFile: procErr.message },
        };
      }
      return {
        success: false,
        error:
          "Failed to process uploaded cover image. Please ensure it is a valid JPEG, PNG, or WebP image under 2 MiB.",
      };
    }
  }

  const normalized = normalizeGalleryPayload(rawInput);
  if (newlyPublicUrl) {
    normalized.coverImageUrl = newlyPublicUrl;
    normalized.coverImageStorageKey = newlyManagedKey;
  }

  const parsed = galleryAlbumCreateSchema.safeParse(normalized);
  if (!parsed.success) {
    if (newlyManagedKey) {
      await cleanupOrphanFile(newlyManagedKey);
    }
    return {
      success: false,
      error: "Validation failed. Please correct the highlighted errors.",
      fieldErrors: formatZodErrors(parsed.error.issues),
    };
  }

  const {
    title,
    description,
    category,
    coverImageUrl,
    coverImageStorageKey,
    coverImageAlt,
    displayOrder,
    isPublished,
  } = parsed.data;

  try {
    const created = await prisma.$transaction(async (tx) => {
      let order = displayOrder;
      if (order === 0) {
        const last = await tx.galleryAlbum.findFirst({
          orderBy: { displayOrder: "desc" },
          select: { displayOrder: true },
        });
        order = (last?.displayOrder ?? -1) + 1;
      }

      const album = await tx.galleryAlbum.create({
        data: {
          title,
          description: description ?? null,
          category,
          coverImageUrl: coverImageUrl as string,
          coverImageStorageKey: coverImageStorageKey ?? null,
          coverImageAlt: coverImageAlt ?? "",
          displayOrder: order,
          isPublished,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "GALLERY_ALBUM_CREATED",
          entityType: "GalleryAlbum",
          entityId: album.id,
          metadata: {
            title: album.title,
            category: album.category,
            isPublished: album.isPublished,
            hasCover: Boolean(album.coverImageUrl && album.coverImageUrl.trim() !== ""),
          },
        },
        tx
      );

      return album;
    });

    revalidateGalleryRoutes();
    return { success: true, data: { id: created.id } };
  } catch (error) {
    if (newlyManagedKey) {
      await cleanupOrphanFile(newlyManagedKey);
    }
    console.error("[createGalleryAlbum] Error:", error);
    return {
      success: false,
      error: "Failed to create gallery album due to a database error.",
    };
  }
}

export async function updateGalleryAlbum(
  rawPayload: unknown
): Promise<ActionResult<{ id: string }>> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const rawInput = (rawPayload && typeof rawPayload === "object" ? rawPayload : {}) as
    | FormData
    | Record<string, unknown>;

  const photoFile =
    extractUploadedFile(rawInput, "coverImageFile") ||
    extractUploadedFile(rawInput, "imageFile") ||
    extractUploadedFile(rawInput, "photoFile");
  const isRemoval =
    isRemovalRequested(rawInput, "removeCoverImage") ||
    isRemovalRequested(rawInput, "removeImage") ||
    isRemovalRequested(rawInput, "removePhoto");

  let newlyManagedKey: string | null = null;
  let newlyPublicUrl: string | null = null;

  if (photoFile) {
    try {
      const saved = await processAndSaveUploadedImage(photoFile, "gallery");
      newlyManagedKey = saved.storageKey;
      newlyPublicUrl = saved.publicUrl;
    } catch (procErr) {
      if (procErr instanceof ImageProcessingError) {
        return {
          success: false,
          error: procErr.message,
          fieldErrors: { coverImageFile: procErr.message },
        };
      }
      return {
        success: false,
        error:
          "Failed to process uploaded cover image. Please ensure it is a valid JPEG, PNG, or WebP image under 2 MiB.",
      };
    }
  }

  if (isRemoval && !newlyPublicUrl) {
    if (newlyManagedKey) {
      await cleanupOrphanFile(newlyManagedKey);
    }
    return {
      success: false,
      error: "A cover image is required for gallery albums.",
      fieldErrors: { coverImageFile: "A cover image cannot be removed without replacement." },
    };
  }

  const normalized = normalizeGalleryPayload(rawInput);
  if (newlyPublicUrl) {
    normalized.coverImageUrl = newlyPublicUrl;
    normalized.coverImageStorageKey = newlyManagedKey;
  }

  const parsed = galleryAlbumUpdateSchema.safeParse(normalized);
  if (!parsed.success) {
    if (newlyManagedKey) {
      await cleanupOrphanFile(newlyManagedKey);
    }
    return {
      success: false,
      error: "Validation failed. Please correct the highlighted errors.",
      fieldErrors: formatZodErrors(parsed.error.issues),
    };
  }

  const {
    id,
    title,
    description,
    category,
    coverImageUrl,
    coverImageStorageKey,
    coverImageAlt,
    displayOrder,
    isPublished,
  } = parsed.data;

  const existing = await prisma.galleryAlbum.findUnique({
    where: { id },
  });

  if (!existing) {
    if (newlyManagedKey) {
      await cleanupOrphanFile(newlyManagedKey);
    }
    return { success: false, error: "Gallery album record not found." };
  }

  const oldStorageKey = existing.coverImageStorageKey;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const album = await tx.galleryAlbum.update({
        where: { id },
        data: {
          title,
          description: description ?? null,
          category,
          coverImageUrl: (coverImageUrl ?? existing.coverImageUrl) as string,
          coverImageStorageKey: newlyPublicUrl
            ? newlyManagedKey
            : coverImageStorageKey !== undefined
            ? coverImageStorageKey
            : existing.coverImageStorageKey,
          coverImageAlt: coverImageAlt || existing.coverImageAlt,
          displayOrder,
          isPublished,
        },
      });

      const diff = computeGalleryAlbumDiff(
        existing as unknown as Record<string, unknown>,
        album as unknown as Record<string, unknown>
      );

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "GALLERY_ALBUM_UPDATED",
          entityType: "GalleryAlbum",
          entityId: album.id,
          metadata: {
            title: album.title,
            changes: diff,
          },
        },
        tx
      );

      return album;
    });

    if (oldStorageKey && oldStorageKey !== updated.coverImageStorageKey) {
      await deleteManagedPhotoIfUnreferenced(oldStorageKey);
    }

    revalidateGalleryRoutes();
    return { success: true, data: { id: updated.id } };
  } catch (error) {
    if (newlyManagedKey) {
      await cleanupOrphanFile(newlyManagedKey);
    }
    console.error("[updateGalleryAlbum] Error:", error);
    return {
      success: false,
      error: "Failed to update gallery album due to a database error.",
    };
  }
}

export async function deleteGalleryAlbum(
  rawPayload: unknown
): Promise<ActionResult<{ id: string }>> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = galleryAlbumDeleteSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid album ID.",
      fieldErrors: formatZodErrors(parsed.error.issues),
    };
  }

  const { id } = parsed.data;

  const existing = await prisma.galleryAlbum.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!existing) {
    return { success: false, error: "Gallery album not found." };
  }

  const albumStorageKey = existing.coverImageStorageKey;
  const childStorageKeys = existing.images
    .map((img) => img.imageStorageKey)
    .filter((k): k is string => Boolean(k));

  try {
    await prisma.$transaction(async (tx) => {
      await tx.galleryAlbum.delete({
        where: { id },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "GALLERY_ALBUM_DELETED",
          entityType: "GalleryAlbum",
          entityId: id,
          metadata: {
            title: existing.title,
            category: existing.category,
            deletedImagesCount: existing.images.length,
          },
        },
        tx
      );
    });

    if (albumStorageKey) {
      await deleteManagedPhotoIfUnreferenced(albumStorageKey);
    }
    for (const key of childStorageKeys) {
      await deleteManagedPhotoIfUnreferenced(key);
    }

    revalidateGalleryRoutes();
    return { success: true, data: { id } };
  } catch (error) {
    console.error("[deleteGalleryAlbum] Error:", error);
    return {
      success: false,
      error: "Failed to delete gallery album due to a database error.",
    };
  }
}

export async function toggleGalleryAlbumStatus(
  rawPayload: unknown
): Promise<ActionResult<{ id: string; isPublished: boolean }>> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = galleryAlbumToggleSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid input parameters.",
      fieldErrors: formatZodErrors(parsed.error.issues),
    };
  }

  const { id, isPublished } = parsed.data;

  const existing = await prisma.galleryAlbum.findUnique({
    where: { id },
  });

  if (!existing) {
    return { success: false, error: "Gallery album not found." };
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const album = await tx.galleryAlbum.update({
        where: { id },
        data: { isPublished },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "GALLERY_ALBUM_STATUS_CHANGED",
          entityType: "GalleryAlbum",
          entityId: id,
          metadata: {
            title: existing.title,
            from: existing.isPublished,
            to: isPublished,
          },
        },
        tx
      );

      return album;
    });

    revalidateGalleryRoutes();
    return { success: true, data: { id: updated.id, isPublished: updated.isPublished } };
  } catch (error) {
    console.error("[toggleGalleryAlbumStatus] Error:", error);
    return {
      success: false,
      error: "Failed to update album publish status.",
    };
  }
}

export async function reorderGalleryAlbums(
  rawPayload: unknown
): Promise<ActionResult<{ count: number }>> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = galleryAlbumsReorderSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid ordering payload.",
      fieldErrors: formatZodErrors(parsed.error.issues),
    };
  }

  const { orderedIds } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx.galleryAlbum.update({
          where: { id: orderedIds[i] },
          data: { displayOrder: i },
        });
      }

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "GALLERY_ALBUMS_REORDERED",
          entityType: "GalleryAlbum",
          entityId: "batch",
          metadata: {
            orderedIds,
            count: orderedIds.length,
          },
        },
        tx
      );
    });

    revalidateGalleryRoutes();
    return { success: true, data: { count: orderedIds.length } };
  } catch (error) {
    console.error("[reorderGalleryAlbums] Error:", error);
    return {
      success: false,
      error: "Failed to reorder gallery albums.",
    };
  }
}

// ==========================================
// GALLERY IMAGE MUTATION ACTIONS
// ==========================================

export async function createGalleryImage(
  rawPayload: unknown
): Promise<ActionResult<{ id: string }>> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const rawInput = (rawPayload && typeof rawPayload === "object" ? rawPayload : {}) as
    | FormData
    | Record<string, unknown>;

  const photoFile =
    extractUploadedFile(rawInput, "imageFile") ||
    extractUploadedFile(rawInput, "photoFile");

  let newlyManagedKey: string | null = null;
  let newlyPublicUrl: string | null = null;

  if (photoFile) {
    try {
      const saved = await processAndSaveUploadedImage(photoFile, "gallery");
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
          "Failed to process uploaded photo. Please ensure it is a valid JPEG, PNG, or WebP image under 2 MiB.",
      };
    }
  }

  const normalized = normalizeGalleryPayload(rawInput);
  if (newlyPublicUrl) {
    normalized.imageUrl = newlyPublicUrl;
    normalized.imageStorageKey = newlyManagedKey;
  }

  const parsed = galleryImageCreateSchema.safeParse(normalized);
  if (!parsed.success) {
    if (newlyManagedKey) {
      await cleanupOrphanFile(newlyManagedKey);
    }
    return {
      success: false,
      error: "Validation failed. Please correct the highlighted errors.",
      fieldErrors: formatZodErrors(parsed.error.issues),
    };
  }

  const {
    albumId,
    imageUrl,
    imageStorageKey,
    imageAlt,
    caption,
    displayOrder,
    isPublished,
  } = parsed.data;

  // Verify album exists
  const parentAlbum = await prisma.galleryAlbum.findUnique({
    where: { id: albumId },
  });

  if (!parentAlbum) {
    if (newlyManagedKey) {
      await cleanupOrphanFile(newlyManagedKey);
    }
    return {
      success: false,
      error: "Target gallery album does not exist.",
    };
  }

  try {
    const created = await prisma.$transaction(async (tx) => {
      let order = displayOrder;
      if (order === 0) {
        const last = await tx.galleryImage.findFirst({
          where: { albumId },
          orderBy: { displayOrder: "desc" },
          select: { displayOrder: true },
        });
        order = (last?.displayOrder ?? -1) + 1;
      }

      const img = await tx.galleryImage.create({
        data: {
          albumId,
          imageUrl: imageUrl as string,
          imageStorageKey: imageStorageKey ?? null,
          imageAlt: imageAlt ?? "",
          caption: caption ?? null,
          displayOrder: order,
          isPublished,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "GALLERY_IMAGE_CREATED",
          entityType: "GalleryImage",
          entityId: img.id,
          metadata: {
            albumId: img.albumId,
            albumTitle: parentAlbum.title,
            caption: img.caption,
            isPublished: img.isPublished,
          },
        },
        tx
      );

      return img;
    });

    revalidateGalleryRoutes();
    return { success: true, data: { id: created.id } };
  } catch (error) {
    if (newlyManagedKey) {
      await cleanupOrphanFile(newlyManagedKey);
    }
    console.error("[createGalleryImage] Error:", error);
    return {
      success: false,
      error: "Failed to create gallery image due to a database error.",
    };
  }
}

export async function updateGalleryImage(
  rawPayload: unknown
): Promise<ActionResult<{ id: string }>> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const rawInput = (rawPayload && typeof rawPayload === "object" ? rawPayload : {}) as
    | FormData
    | Record<string, unknown>;

  const photoFile =
    extractUploadedFile(rawInput, "imageFile") ||
    extractUploadedFile(rawInput, "photoFile");
  const isRemoval =
    isRemovalRequested(rawInput, "removeImage") ||
    isRemovalRequested(rawInput, "removePhoto");

  let newlyManagedKey: string | null = null;
  let newlyPublicUrl: string | null = null;

  if (photoFile) {
    try {
      const saved = await processAndSaveUploadedImage(photoFile, "gallery");
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
          "Failed to process uploaded photo. Please ensure it is a valid JPEG, PNG, or WebP image under 2 MiB.",
      };
    }
  }

  const normalized = normalizeGalleryPayload(rawInput);
  if (isRemoval) {
    normalized.imageUrl = null;
    normalized.imageStorageKey = null;
    normalized.imageAlt = "";
  } else if (newlyPublicUrl) {
    normalized.imageUrl = newlyPublicUrl;
    normalized.imageStorageKey = newlyManagedKey;
  }

  const parsed = galleryImageUpdateSchema.safeParse(normalized);
  if (!parsed.success) {
    if (newlyManagedKey) {
      await cleanupOrphanFile(newlyManagedKey);
    }
    return {
      success: false,
      error: "Validation failed. Please correct the highlighted errors.",
      fieldErrors: formatZodErrors(parsed.error.issues),
    };
  }

  const {
    id,
    albumId,
    imageUrl,
    imageStorageKey,
    imageAlt,
    caption,
    displayOrder,
    isPublished,
  } = parsed.data;

  const existing = await prisma.galleryImage.findUnique({
    where: { id },
  });

  if (!existing) {
    if (newlyManagedKey) {
      await cleanupOrphanFile(newlyManagedKey);
    }
    return { success: false, error: "Gallery image record not found." };
  }

  const oldStorageKey = existing.imageStorageKey;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const img = await tx.galleryImage.update({
        where: { id },
        data: {
          albumId,
          imageUrl: (imageUrl ?? existing.imageUrl) as string,
          imageStorageKey: imageStorageKey ?? (imageUrl ? null : existing.imageStorageKey),
          imageAlt: imageAlt ?? "",
          caption: caption ?? null,
          displayOrder,
          isPublished,
        },
      });

      const diff = computeGalleryImageDiff(
        existing as unknown as Record<string, unknown>,
        img as unknown as Record<string, unknown>
      );

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "GALLERY_IMAGE_UPDATED",
          entityType: "GalleryImage",
          entityId: img.id,
          metadata: {
            albumId: img.albumId,
            changes: diff,
          },
        },
        tx
      );

      return img;
    });

    if (oldStorageKey && oldStorageKey !== updated.imageStorageKey) {
      await deleteManagedPhotoIfUnreferenced(oldStorageKey);
    }

    revalidateGalleryRoutes();
    return { success: true, data: { id: updated.id } };
  } catch (error) {
    if (newlyManagedKey) {
      await cleanupOrphanFile(newlyManagedKey);
    }
    console.error("[updateGalleryImage] Error:", error);
    return {
      success: false,
      error: "Failed to update gallery image due to a database error.",
    };
  }
}

export async function deleteGalleryImage(
  rawPayload: unknown
): Promise<ActionResult<{ id: string }>> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = galleryImageDeleteSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid image ID.",
      fieldErrors: formatZodErrors(parsed.error.issues),
    };
  }

  const { id } = parsed.data;

  const existing = await prisma.galleryImage.findUnique({
    where: { id },
  });

  if (!existing) {
    return { success: false, error: "Gallery image not found." };
  }

  const storageKey = existing.imageStorageKey;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.galleryImage.delete({
        where: { id },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "GALLERY_IMAGE_DELETED",
          entityType: "GalleryImage",
          entityId: id,
          metadata: {
            albumId: existing.albumId,
            caption: existing.caption,
          },
        },
        tx
      );
    });

    if (storageKey) {
      await deleteManagedPhotoIfUnreferenced(storageKey);
    }

    revalidateGalleryRoutes();
    return { success: true, data: { id } };
  } catch (error) {
    console.error("[deleteGalleryImage] Error:", error);
    return {
      success: false,
      error: "Failed to delete gallery image due to a database error.",
    };
  }
}

export async function toggleGalleryImageStatus(
  rawPayload: unknown
): Promise<ActionResult<{ id: string; isPublished: boolean }>> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = galleryImageToggleSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid input parameters.",
      fieldErrors: formatZodErrors(parsed.error.issues),
    };
  }

  const { id, isPublished } = parsed.data;

  const existing = await prisma.galleryImage.findUnique({
    where: { id },
  });

  if (!existing) {
    return { success: false, error: "Gallery image not found." };
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const img = await tx.galleryImage.update({
        where: { id },
        data: { isPublished },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "GALLERY_IMAGE_STATUS_CHANGED",
          entityType: "GalleryImage",
          entityId: id,
          metadata: {
            albumId: existing.albumId,
            from: existing.isPublished,
            to: isPublished,
          },
        },
        tx
      );

      return img;
    });

    revalidateGalleryRoutes();
    return { success: true, data: { id: updated.id, isPublished: updated.isPublished } };
  } catch (error) {
    console.error("[toggleGalleryImageStatus] Error:", error);
    return {
      success: false,
      error: "Failed to update image publish status.",
    };
  }
}

export async function reorderGalleryImages(
  rawPayload: unknown
): Promise<ActionResult<{ count: number }>> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = galleryImagesReorderSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid ordering payload.",
      fieldErrors: formatZodErrors(parsed.error.issues),
    };
  }

  const { orderedIds } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx.galleryImage.update({
          where: { id: orderedIds[i] },
          data: { displayOrder: i },
        });
      }

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "GALLERY_IMAGES_REORDERED",
          entityType: "GalleryImage",
          entityId: "batch",
          metadata: {
            orderedIds,
            count: orderedIds.length,
          },
        },
        tx
      );
    });

    revalidateGalleryRoutes();
    return { success: true, data: { count: orderedIds.length } };
  } catch (error) {
    console.error("[reorderGalleryImages] Error:", error);
    return {
      success: false,
      error: "Failed to reorder gallery images.",
    };
  }
}
