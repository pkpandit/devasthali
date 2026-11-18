"use server";

import "server-only";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/server/prisma";
import { recordAuditEvent } from "@/lib/server/audit";
import { AuthorizationError, requireRole } from "@/lib/server/auth";
import {
  extractUploadedFile,
  isRemovalRequested,
  processAndSaveUploadedImage,
  cleanupOrphanFile,
  ImageProcessingError,
  deleteManagedPhotoIfUnreferenced,
} from "@/lib/server/admin-media";
import {
  homepageHeroSchema,
  homepagePrincipalMessageSchema,
  homepageStatisticCreateSchema,
  homepageStatisticUpdateSchema,
  homepageStatisticDeleteSchema,
  homepageStatisticToggleSchema,
  homepageStatisticReorderSchema,
  homepageHighlightCreateSchema,
  homepageHighlightUpdateSchema,
  homepageHighlightDeleteSchema,
  homepageHighlightToggleSchema,
  homepageHighlightReorderSchema,
  normalizeHomepagePayload,
  computeHomepageDiff,
  formatZodErrors,
} from "@/lib/validation/homepage";

export interface ActionState<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
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

function revalidateHomepagePaths() {
  try {
    revalidatePath("/admin/homepage");
    revalidatePath("/api/public/homepage");
    revalidatePath("/");
    revalidatePath("/principals-message");
  } catch {
    // Graceful fallback in non-request contexts
  }
}

// ==========================================
// 1. HERO SECTION ACTIONS
// ==========================================

export async function updateHomepageHeroAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  let newlyManagedKey: string | null = null;
  let newlyPublicUrl: string | null = null;

  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const imageFile =
      extractUploadedFile(rawPayload, "backgroundImageFile") ||
      extractUploadedFile(rawPayload, "imageFile") ||
      extractUploadedFile(rawPayload, "photoFile");
    const isRemoval =
      isRemovalRequested(rawPayload, "removeBackgroundImage") ||
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
            fieldErrors: { backgroundImageFile: procErr.message },
          };
        }
        return {
          success: false,
          error:
            "Failed to process uploaded background image. Please ensure it is a valid JPEG, PNG, or WebP image under 2 MiB.",
        };
      }
    }

    const normalized = normalizeHomepagePayload(parsePayload(rawPayload));
    if (newlyPublicUrl) {
      normalized.backgroundImageUrl = newlyPublicUrl;
      normalized.backgroundImageStorageKey = newlyManagedKey;
    } else if (isRemoval) {
      normalized.backgroundImageUrl = null;
      normalized.backgroundImageStorageKey = null;
    }

    const parsed = homepageHeroSchema.safeParse(normalized);

    if (!parsed.success) {
      if (newlyManagedKey) await cleanupOrphanFile(newlyManagedKey);
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors: formatZodErrors(parsed.error),
      };
    }

    const currentHero = await prisma.homepageHero.findUnique({
      where: { id: "default" },
    });

    const diff = computeHomepageDiff(
      (currentHero as unknown as Record<string, unknown>) || {},
      parsed.data as Record<string, unknown>
    );

    const oldStorageKeyToDelete =
      (newlyManagedKey || isRemoval) && currentHero?.backgroundImageStorageKey
        ? currentHero.backgroundImageStorageKey
        : null;

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.homepageHero.upsert({
        where: { id: "default" },
        update: parsed.data,
        create: {
          id: "default",
          ...parsed.data,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "HOMEPAGE_HERO_UPDATED",
          entityType: "HomepageHero",
          entityId: "default",
          metadata: {
            changedFields: diff,
            changedCount: Object.keys(diff).length,
          },
          ipAddress: clientIp,
        },
        tx
      );

      return result;
    });

    if (oldStorageKeyToDelete) {
      await deleteManagedPhotoIfUnreferenced(oldStorageKeyToDelete);
    }

    revalidateHomepagePaths();

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    if (newlyManagedKey) await cleanupOrphanFile(newlyManagedKey);
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        error: "Forbidden: Super Administrator privileges required.",
      };
    }
    console.error("Failed to update homepage hero:", error);
    return {
      success: false,
      error: "An unexpected error occurred while saving the Hero section.",
    };
  }
}

// ==========================================
// 2. PRINCIPAL'S MESSAGE ACTIONS
// ==========================================

export async function updateHomepagePrincipalMessageAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  let newlyManagedKey: string | null = null;
  let newlyPublicUrl: string | null = null;

  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const imageFile =
      extractUploadedFile(rawPayload, "photoFile") ||
      extractUploadedFile(rawPayload, "imageFile");
    const isRemoval =
      isRemovalRequested(rawPayload, "removePhoto") ||
      isRemovalRequested(rawPayload, "removeImage");

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
            fieldErrors: { photoFile: procErr.message },
          };
        }
        return {
          success: false,
          error:
            "Failed to process uploaded photo. Please ensure it is a valid JPEG, PNG, or WebP image under 2 MiB.",
        };
      }
    }

    const normalized = normalizeHomepagePayload(parsePayload(rawPayload));
    if (newlyPublicUrl) {
      normalized.imageUrl = newlyPublicUrl;
      normalized.imageStorageKey = newlyManagedKey;
    } else if (isRemoval) {
      normalized.imageUrl = null;
      normalized.imageStorageKey = null;
    }

    const parsed = homepagePrincipalMessageSchema.safeParse(normalized);

    if (!parsed.success) {
      if (newlyManagedKey) await cleanupOrphanFile(newlyManagedKey);
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors: formatZodErrors(parsed.error),
      };
    }

    const currentPrincipal = await prisma.homepagePrincipalMessage.findUnique({
      where: { id: "default" },
    });

    const diff = computeHomepageDiff(
      (currentPrincipal as unknown as Record<string, unknown>) || {},
      parsed.data as Record<string, unknown>
    );

    const oldStorageKeyToDelete =
      (newlyManagedKey || isRemoval) && currentPrincipal?.imageStorageKey
        ? currentPrincipal.imageStorageKey
        : null;

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.homepagePrincipalMessage.upsert({
        where: { id: "default" },
        update: parsed.data,
        create: {
          id: "default",
          ...parsed.data,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "HOMEPAGE_PRINCIPAL_UPDATED",
          entityType: "HomepagePrincipalMessage",
          entityId: "default",
          metadata: {
            changedFields: diff,
            changedCount: Object.keys(diff).length,
          },
          ipAddress: clientIp,
        },
        tx
      );

      return result;
    });

    if (oldStorageKeyToDelete) {
      await deleteManagedPhotoIfUnreferenced(oldStorageKeyToDelete);
    }

    revalidateHomepagePaths();

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    if (newlyManagedKey) await cleanupOrphanFile(newlyManagedKey);
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        error: "Forbidden: Super Administrator privileges required.",
      };
    }
    console.error("Failed to update principal message:", error);
    return {
      success: false,
      error: "An unexpected error occurred while saving the Principal's message.",
    };
  }
}

// ==========================================
// 3. KEY STATISTICS ACTIONS
// ==========================================

export async function createHomepageStatisticAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  let newlyManagedKey: string | null = null;
  let newlyPublicUrl: string | null = null;

  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

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

    const normalized = normalizeHomepagePayload(parsePayload(rawPayload));
    if (newlyPublicUrl) {
      normalized.imageUrl = newlyPublicUrl;
      normalized.imageStorageKey = newlyManagedKey;
    }

    const parsed = homepageStatisticCreateSchema.safeParse(normalized);

    if (!parsed.success) {
      if (newlyManagedKey) await cleanupOrphanFile(newlyManagedKey);
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors: formatZodErrors(parsed.error),
      };
    }

    const created = await prisma.$transaction(async (tx) => {
      let displayOrder = parsed.data.displayOrder;
      if (displayOrder === 0) {
        const last = await tx.homepageStatistic.findFirst({
          orderBy: { displayOrder: "desc" },
          select: { displayOrder: true },
        });
        displayOrder = (last?.displayOrder ?? -1) + 1;
      }

      const result = await tx.homepageStatistic.create({
        data: {
          ...parsed.data,
          displayOrder,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "HOMEPAGE_STATISTIC_CREATED",
          entityType: "HomepageStatistic",
          entityId: result.id,
          metadata: {
            label: result.label,
            numericValue: result.numericValue,
            displayOrder: result.displayOrder,
            isPublished: result.isPublished,
          },
          ipAddress: clientIp,
        },
        tx
      );

      return result;
    });

    revalidateHomepagePaths();

    return {
      success: true,
      data: created,
    };
  } catch (error) {
    if (newlyManagedKey) await cleanupOrphanFile(newlyManagedKey);
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        error: "Forbidden: Super Administrator privileges required.",
      };
    }
    console.error("Failed to create homepage statistic:", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating the statistic.",
    };
  }
}

export async function updateHomepageStatisticAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  let newlyManagedKey: string | null = null;
  let newlyPublicUrl: string | null = null;

  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

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

    const normalized = normalizeHomepagePayload(parsePayload(rawPayload));
    if (newlyPublicUrl) {
      normalized.imageUrl = newlyPublicUrl;
      normalized.imageStorageKey = newlyManagedKey;
    } else if (isRemoval) {
      normalized.imageUrl = null;
      normalized.imageStorageKey = null;
    }

    const parsed = homepageStatisticUpdateSchema.safeParse(normalized);

    if (!parsed.success) {
      if (newlyManagedKey) await cleanupOrphanFile(newlyManagedKey);
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors: formatZodErrors(parsed.error),
      };
    }

    const existing = await prisma.homepageStatistic.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      if (newlyManagedKey) await cleanupOrphanFile(newlyManagedKey);
      return {
        success: false,
        error: "Statistic record not found.",
      };
    }

    const { id, ...dataToUpdate } = parsed.data;

    const diff = computeHomepageDiff(
      existing as unknown as Record<string, unknown>,
      dataToUpdate as Record<string, unknown>
    );

    const oldStorageKeyToDelete =
      (newlyManagedKey || isRemoval) && existing.imageStorageKey
        ? existing.imageStorageKey
        : null;

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.homepageStatistic.update({
        where: { id },
        data: dataToUpdate,
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "HOMEPAGE_STATISTIC_UPDATED",
          entityType: "HomepageStatistic",
          entityId: id,
          metadata: {
            changedFields: diff,
            changedCount: Object.keys(diff).length,
          },
          ipAddress: clientIp,
        },
        tx
      );

      return result;
    });

    if (oldStorageKeyToDelete) {
      await deleteManagedPhotoIfUnreferenced(oldStorageKeyToDelete);
    }

    revalidateHomepagePaths();

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    if (newlyManagedKey) await cleanupOrphanFile(newlyManagedKey);
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        error: "Forbidden: Super Administrator privileges required.",
      };
    }
    console.error("Failed to update homepage statistic:", error);
    return {
      success: false,
      error: "An unexpected error occurred while updating the statistic.",
    };
  }
}

export async function deleteHomepageStatisticAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = homepageStatisticDeleteSchema.safeParse(parsePayload(rawPayload));
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid statistic ID.",
      };
    }

    const existing = await prisma.homepageStatistic.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return {
        success: false,
        error: "Statistic record not found or already deleted.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.homepageStatistic.delete({
        where: { id: parsed.data.id },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "HOMEPAGE_STATISTIC_DELETED",
          entityType: "HomepageStatistic",
          entityId: parsed.data.id,
          metadata: {
            label: existing.label,
            numericValue: existing.numericValue,
            displayOrder: existing.displayOrder,
          },
          ipAddress: clientIp,
        },
        tx
      );
    });

    if (existing.imageStorageKey) {
      await deleteManagedPhotoIfUnreferenced(existing.imageStorageKey);
    }

    revalidateHomepagePaths();

    return { success: true };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        error: "Forbidden: Super Administrator privileges required.",
      };
    }
    console.error("Failed to delete homepage statistic:", error);
    return {
      success: false,
      error: "An unexpected error occurred while deleting the statistic.",
    };
  }
}

export async function toggleHomepageStatisticStatusAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = homepageStatisticToggleSchema.safeParse(parsePayload(rawPayload));
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid payload for publication status toggle.",
      };
    }

    const existing = await prisma.homepageStatistic.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return {
        success: false,
        error: "Statistic record not found.",
      };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.homepageStatistic.update({
        where: { id: parsed.data.id },
        data: { isPublished: parsed.data.isPublished },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "HOMEPAGE_STATISTIC_STATUS_CHANGED",
          entityType: "HomepageStatistic",
          entityId: parsed.data.id,
          metadata: {
            label: existing.label,
            from: existing.isPublished,
            to: parsed.data.isPublished,
          },
          ipAddress: clientIp,
        },
        tx
      );

      return result;
    });

    revalidateHomepagePaths();

    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        error: "Forbidden: Super Administrator privileges required.",
      };
    }
    console.error("Failed to toggle homepage statistic status:", error);
    return {
      success: false,
      error: "An unexpected error occurred while toggling the status.",
    };
  }
}

export async function reorderHomepageStatisticsAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = homepageStatisticReorderSchema.safeParse(parsePayload(rawPayload));
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid ordering payload.",
      };
    }

    await prisma.$transaction(async (tx) => {
      for (const item of parsed.data.statistics) {
        await tx.homepageStatistic.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        });
      }

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "HOMEPAGE_STATISTICS_REORDERED",
          entityType: "HomepageStatistic",
          entityId: "batch",
          metadata: {
            reorderedCount: parsed.data.statistics.length,
            newOrders: parsed.data.statistics,
          },
          ipAddress: clientIp,
        },
        tx
      );
    });

    revalidateHomepagePaths();

    return { success: true };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        error: "Forbidden: Super Administrator privileges required.",
      };
    }
    console.error("Failed to reorder homepage statistics:", error);
    return {
      success: false,
      error: "An unexpected error occurred while reordering statistics.",
    };
  }
}

// ==========================================
// 4. PROMOTIONAL HIGHLIGHTS ACTIONS
// ==========================================

export async function createHomepageHighlightAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  let newlyManagedKey: string | null = null;
  let newlyPublicUrl: string | null = null;

  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

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

    const normalized = normalizeHomepagePayload(parsePayload(rawPayload));
    if (newlyPublicUrl) {
      normalized.imageUrl = newlyPublicUrl;
      normalized.imageStorageKey = newlyManagedKey;
    }

    const parsed = homepageHighlightCreateSchema.safeParse(normalized);

    if (!parsed.success) {
      if (newlyManagedKey) await cleanupOrphanFile(newlyManagedKey);
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors: formatZodErrors(parsed.error),
      };
    }

    const created = await prisma.$transaction(async (tx) => {
      let displayOrder = parsed.data.displayOrder;
      if (displayOrder === 0) {
        const last = await tx.homepageHighlight.findFirst({
          orderBy: { displayOrder: "desc" },
          select: { displayOrder: true },
        });
        displayOrder = (last?.displayOrder ?? -1) + 1;
      }

      const result = await tx.homepageHighlight.create({
        data: {
          ...parsed.data,
          displayOrder,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "HOMEPAGE_HIGHLIGHT_CREATED",
          entityType: "HomepageHighlight",
          entityId: result.id,
          metadata: {
            title: result.title,
            ctaHref: result.ctaHref,
            displayOrder: result.displayOrder,
            isPublished: result.isPublished,
          },
          ipAddress: clientIp,
        },
        tx
      );

      return result;
    });

    revalidateHomepagePaths();

    return {
      success: true,
      data: created,
    };
  } catch (error) {
    if (newlyManagedKey) await cleanupOrphanFile(newlyManagedKey);
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        error: "Forbidden: Super Administrator privileges required.",
      };
    }
    console.error("Failed to create homepage highlight:", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating the highlight.",
    };
  }
}

export async function updateHomepageHighlightAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  let newlyManagedKey: string | null = null;
  let newlyPublicUrl: string | null = null;

  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

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

    const normalized = normalizeHomepagePayload(parsePayload(rawPayload));
    if (newlyPublicUrl) {
      normalized.imageUrl = newlyPublicUrl;
      normalized.imageStorageKey = newlyManagedKey;
    } else if (isRemoval) {
      normalized.imageUrl = null;
      normalized.imageStorageKey = null;
    }

    const parsed = homepageHighlightUpdateSchema.safeParse(normalized);

    if (!parsed.success) {
      if (newlyManagedKey) await cleanupOrphanFile(newlyManagedKey);
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors: formatZodErrors(parsed.error),
      };
    }

    const existing = await prisma.homepageHighlight.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      if (newlyManagedKey) await cleanupOrphanFile(newlyManagedKey);
      return {
        success: false,
        error: "Highlight record not found.",
      };
    }

    const { id, ...dataToUpdate } = parsed.data;

    const diff = computeHomepageDiff(
      existing as unknown as Record<string, unknown>,
      dataToUpdate as Record<string, unknown>
    );

    const oldStorageKeyToDelete =
      (newlyManagedKey || isRemoval) && existing.imageStorageKey
        ? existing.imageStorageKey
        : null;

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.homepageHighlight.update({
        where: { id },
        data: dataToUpdate,
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "HOMEPAGE_HIGHLIGHT_UPDATED",
          entityType: "HomepageHighlight",
          entityId: id,
          metadata: {
            changedFields: diff,
            changedCount: Object.keys(diff).length,
          },
          ipAddress: clientIp,
        },
        tx
      );

      return result;
    });

    if (oldStorageKeyToDelete) {
      await deleteManagedPhotoIfUnreferenced(oldStorageKeyToDelete);
    }

    revalidateHomepagePaths();

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    if (newlyManagedKey) await cleanupOrphanFile(newlyManagedKey);
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        error: "Forbidden: Super Administrator privileges required.",
      };
    }
    console.error("Failed to update homepage highlight:", error);
    return {
      success: false,
      error: "An unexpected error occurred while updating the highlight.",
    };
  }
}

export async function deleteHomepageHighlightAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = homepageHighlightDeleteSchema.safeParse(parsePayload(rawPayload));
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid highlight ID.",
      };
    }

    const existing = await prisma.homepageHighlight.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return {
        success: false,
        error: "Highlight record not found or already deleted.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.homepageHighlight.delete({
        where: { id: parsed.data.id },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "HOMEPAGE_HIGHLIGHT_DELETED",
          entityType: "HomepageHighlight",
          entityId: parsed.data.id,
          metadata: {
            title: existing.title,
            ctaHref: existing.ctaHref,
            displayOrder: existing.displayOrder,
          },
          ipAddress: clientIp,
        },
        tx
      );
    });

    if (existing.imageStorageKey) {
      await deleteManagedPhotoIfUnreferenced(existing.imageStorageKey);
    }

    revalidateHomepagePaths();

    return { success: true };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        error: "Forbidden: Super Administrator privileges required.",
      };
    }
    console.error("Failed to delete homepage highlight:", error);
    return {
      success: false,
      error: "An unexpected error occurred while deleting the highlight.",
    };
  }
}

export async function toggleHomepageHighlightStatusAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = homepageHighlightToggleSchema.safeParse(parsePayload(rawPayload));
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid payload for publication status toggle.",
      };
    }

    const existing = await prisma.homepageHighlight.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return {
        success: false,
        error: "Highlight record not found.",
      };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.homepageHighlight.update({
        where: { id: parsed.data.id },
        data: { isPublished: parsed.data.isPublished },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "HOMEPAGE_HIGHLIGHT_STATUS_CHANGED",
          entityType: "HomepageHighlight",
          entityId: parsed.data.id,
          metadata: {
            title: existing.title,
            from: existing.isPublished,
            to: parsed.data.isPublished,
          },
          ipAddress: clientIp,
        },
        tx
      );

      return result;
    });

    revalidateHomepagePaths();

    return { success: true, data: updated };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        error: "Forbidden: Super Administrator privileges required.",
      };
    }
    console.error("Failed to toggle homepage highlight status:", error);
    return {
      success: false,
      error: "An unexpected error occurred while toggling the status.",
    };
  }
}

export async function reorderHomepageHighlightsAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = homepageHighlightReorderSchema.safeParse(parsePayload(rawPayload));
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid ordering payload.",
      };
    }

    await prisma.$transaction(async (tx) => {
      for (const item of parsed.data.highlights) {
        await tx.homepageHighlight.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        });
      }

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "HOMEPAGE_HIGHLIGHTS_REORDERED",
          entityType: "HomepageHighlight",
          entityId: "batch",
          metadata: {
            reorderedCount: parsed.data.highlights.length,
            newOrders: parsed.data.highlights,
          },
          ipAddress: clientIp,
        },
        tx
      );
    });

    revalidateHomepagePaths();

    return { success: true };
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        error: "Forbidden: Super Administrator privileges required.",
      };
    }
    console.error("Failed to reorder homepage highlights:", error);
    return {
      success: false,
      error: "An unexpected error occurred while reordering highlights.",
    };
  }
}

// ==========================================
// 5. READ ACTIONS (SUPER_ADMIN ONLY)
// ==========================================

export async function getAdminHomepageData() {
  await requireRole(["SUPER_ADMIN"]);

  const [hero, principal, statistics, highlights] = await Promise.all([
    prisma.homepageHero.findUnique({
      where: { id: "default" },
    }),
    prisma.homepagePrincipalMessage.findUnique({
      where: { id: "default" },
    }),
    prisma.homepageStatistic.findMany({
      orderBy: { displayOrder: "asc" },
    }),
    prisma.homepageHighlight.findMany({
      orderBy: { displayOrder: "asc" },
    }),
  ]);

  return {
    hero,
    principal,
    statistics,
    highlights,
  };
}
