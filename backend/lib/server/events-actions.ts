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
  schoolEventCreateSchema,
  schoolEventUpdateSchema,
  schoolEventDeleteSchema,
  schoolEventToggleSchema,
  schoolEventsReorderSchema,
  normalizeEventPayload,
  computeEventDiff,
  formatZodErrors,
} from "@/lib/validation/events";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function revalidateEventsRoutes() {
  revalidatePath("/admin/academics/events");
  revalidatePath("/api/public/events");
  revalidatePath("/events");
}

// ==========================================
// DATA FETCHING FOR ADMIN
// ==========================================

export async function getAdminEventsData() {
  await requireRole(["SUPER_ADMIN"]);

  const events = await prisma.schoolEvent.findMany({
    orderBy: [{ displayOrder: "asc" }, { isoDate: "asc" }, { createdAt: "asc" }],
  });

  return { events };
}

// ==========================================
// SCHOOL EVENT MUTATION ACTIONS
// ==========================================

export async function createSchoolEvent(
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
      const saved = await processAndSaveUploadedImage(photoFile, "events");
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

  const normalized = normalizeEventPayload(rawInput);
  if (newlyPublicUrl) {
    normalized.coverImageUrl = newlyPublicUrl;
    normalized.coverImageStorageKey = newlyManagedKey;
  }

  const parsed = schoolEventCreateSchema.safeParse(normalized);
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
    eventDate,
    isoDate,
    time,
    location,
    category,
    linkHref,
    linkLabel,
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
        const last = await tx.schoolEvent.findFirst({
          orderBy: { displayOrder: "desc" },
          select: { displayOrder: true },
        });
        order = (last?.displayOrder ?? -1) + 1;
      }

      const event = await tx.schoolEvent.create({
        data: {
          title,
          description: description as string,
          eventDate,
          isoDate: new Date(isoDate.includes("T") ? isoDate : isoDate + "T00:00:00.000Z"),
          time: time ?? null,
          location: location ?? null,
          category,
          linkHref: linkHref ?? null,
          linkLabel: linkLabel ?? null,
          coverImageUrl: coverImageUrl ?? null,
          coverImageStorageKey: coverImageStorageKey ?? null,
          coverImageAlt: coverImageAlt ?? "",
          displayOrder: order,
          isPublished,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "SCHOOL_EVENT_CREATED",
          entityType: "SchoolEvent",
          entityId: event.id,
          metadata: {
            title: event.title,
            isoDate: event.isoDate ? event.isoDate.toISOString().split("T")[0] : null,
            category: event.category,
            isPublished: event.isPublished,
            hasCover: Boolean(event.coverImageUrl && event.coverImageUrl.trim() !== ""),
          },
        },
        tx
      );

      return event;
    });

    revalidateEventsRoutes();
    return { success: true, data: { id: created.id } };
  } catch (error) {
    if (newlyManagedKey) {
      await cleanupOrphanFile(newlyManagedKey);
    }
    console.error("[createSchoolEvent] Error:", error);
    return {
      success: false,
      error: "Failed to create school event due to a database error.",
    };
  }
}

export async function updateSchoolEvent(
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
      const saved = await processAndSaveUploadedImage(photoFile, "events");
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

  const normalized = normalizeEventPayload(rawInput);
  if (isRemoval) {
    normalized.coverImageUrl = null;
    normalized.coverImageStorageKey = null;
    normalized.coverImageAlt = "";
  } else if (newlyPublicUrl) {
    normalized.coverImageUrl = newlyPublicUrl;
    normalized.coverImageStorageKey = newlyManagedKey;
  }

  const parsed = schoolEventUpdateSchema.safeParse(normalized);
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
    eventDate,
    isoDate,
    time,
    location,
    category,
    linkHref,
    linkLabel,
    coverImageUrl,
    coverImageStorageKey,
    coverImageAlt,
    displayOrder,
    isPublished,
  } = parsed.data;

  const existing = await prisma.schoolEvent.findUnique({
    where: { id },
  });

  if (!existing) {
    if (newlyManagedKey) {
      await cleanupOrphanFile(newlyManagedKey);
    }
    return { success: false, error: "School event record not found." };
  }

  const oldStorageKey = existing.coverImageStorageKey;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const event = await tx.schoolEvent.update({
        where: { id },
        data: {
          title,
          description: (description ?? existing.description) as string,
          eventDate,
          isoDate: isoDate
            ? new Date(isoDate.includes("T") ? isoDate : isoDate + "T00:00:00.000Z")
            : existing.isoDate,
          time: time ?? null,
          location: location ?? null,
          category,
          linkHref: linkHref ?? null,
          linkLabel: linkLabel ?? null,
          coverImageUrl: isRemoval
            ? null
            : coverImageUrl ?? existing.coverImageUrl,
          coverImageStorageKey: isRemoval
            ? null
            : newlyPublicUrl
            ? newlyManagedKey
            : coverImageStorageKey !== undefined
            ? coverImageStorageKey
            : existing.coverImageStorageKey,
          coverImageAlt: isRemoval ? "" : coverImageAlt || existing.coverImageAlt,
          displayOrder,
          isPublished,
        },
      });

      const diff = computeEventDiff(
        existing as unknown as Record<string, unknown>,
        event as unknown as Record<string, unknown>
      );

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "SCHOOL_EVENT_UPDATED",
          entityType: "SchoolEvent",
          entityId: event.id,
          metadata: {
            title: event.title,
            changes: diff,
          },
        },
        tx
      );

      return event;
    });

    if (oldStorageKey && oldStorageKey !== updated.coverImageStorageKey) {
      await deleteManagedPhotoIfUnreferenced(oldStorageKey);
    }

    revalidateEventsRoutes();
    return { success: true, data: { id: updated.id } };
  } catch (error) {
    if (newlyManagedKey) {
      await cleanupOrphanFile(newlyManagedKey);
    }
    console.error("[updateSchoolEvent] Error:", error);
    return {
      success: false,
      error: "Failed to update school event due to a database error.",
    };
  }
}

export async function deleteSchoolEvent(
  rawPayload: unknown
): Promise<ActionResult<{ id: string }>> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = schoolEventDeleteSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid event ID.",
      fieldErrors: formatZodErrors(parsed.error.issues),
    };
  }

  const { id } = parsed.data;

  const existing = await prisma.schoolEvent.findUnique({
    where: { id },
  });

  if (!existing) {
    return { success: false, error: "School event not found." };
  }

  const storageKey = existing.coverImageStorageKey;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.schoolEvent.delete({
        where: { id },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "SCHOOL_EVENT_DELETED",
          entityType: "SchoolEvent",
          entityId: id,
          metadata: {
            title: existing.title,
            isoDate: existing.isoDate ? existing.isoDate.toISOString().split("T")[0] : null,
            category: existing.category,
          },
        },
        tx
      );
    });

    if (storageKey) {
      await deleteManagedPhotoIfUnreferenced(storageKey);
    }

    revalidateEventsRoutes();
    return { success: true, data: { id } };
  } catch (error) {
    console.error("[deleteSchoolEvent] Error:", error);
    return {
      success: false,
      error: "Failed to delete school event due to a database error.",
    };
  }
}

export async function toggleSchoolEventStatus(
  rawPayload: unknown
): Promise<ActionResult<{ id: string; isPublished: boolean }>> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = schoolEventToggleSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid input parameters.",
      fieldErrors: formatZodErrors(parsed.error.issues),
    };
  }

  const { id, isPublished } = parsed.data;

  const existing = await prisma.schoolEvent.findUnique({
    where: { id },
  });

  if (!existing) {
    return { success: false, error: "School event not found." };
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const event = await tx.schoolEvent.update({
        where: { id },
        data: { isPublished },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "SCHOOL_EVENT_STATUS_CHANGED",
          entityType: "SchoolEvent",
          entityId: id,
          metadata: {
            title: existing.title,
            from: existing.isPublished,
            to: isPublished,
          },
        },
        tx
      );

      return event;
    });

    revalidateEventsRoutes();
    return { success: true, data: { id: updated.id, isPublished: updated.isPublished } };
  } catch (error) {
    console.error("[toggleSchoolEventStatus] Error:", error);
    return {
      success: false,
      error: "Failed to update event publish status.",
    };
  }
}

export async function reorderSchoolEvents(
  rawPayload: unknown
): Promise<ActionResult<{ count: number }>> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = schoolEventsReorderSchema.safeParse(rawPayload);
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
        await tx.schoolEvent.update({
          where: { id: orderedIds[i] },
          data: { displayOrder: i },
        });
      }

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "SCHOOL_EVENTS_REORDERED",
          entityType: "SchoolEvent",
          entityId: "batch",
          metadata: {
            orderedIds,
            count: orderedIds.length,
          },
        },
        tx
      );
    });

    revalidateEventsRoutes();
    return { success: true, data: { count: orderedIds.length } };
  } catch (error) {
    console.error("[reorderSchoolEvents] Error:", error);
    return {
      success: false,
      error: "Failed to reorder school events.",
    };
  }
}
