"use server";

import "server-only";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/server/prisma";
import { recordAuditEvent } from "@/lib/server/audit";
import { AuthorizationError, requireRole } from "@/lib/server/auth";
import {
  siteProfileUpdateSchema,
  campusDirectoryCreateSchema,
  campusDirectoryUpdateSchema,
  campusDirectoryDeleteSchema,
  campusDirectoryToggleSchema,
  campusDirectoryReorderSchema,
  formatZodErrors,
  computeProfileDiff,
  computeDirectoryDiff,
  normalizeProfilePayload,
} from "@/lib/validation/profile";

export interface ActionState<T = unknown> {
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

/**
 * 1. Read / Update Global SiteProfile (SUPER_ADMIN only)
 */
export async function updateSiteProfileAction(
  _prevState: ActionState | null,
  rawPayload: Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const normalized = normalizeProfilePayload(rawPayload);
    const parsed = siteProfileUpdateSchema.safeParse(normalized);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors: formatZodErrors(parsed.error),
      };
    }

    const currentProfile = await prisma.siteProfile.findUnique({
      where: { id: "default" },
    });

    const diff = computeProfileDiff(
      (currentProfile as unknown as Record<string, unknown>) || {},
      parsed.data as Record<string, unknown>
    );

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.siteProfile.upsert({
        where: { id: "default" },
        update: parsed.data,
        create: {
          id: "default",
          ...parsed.data,
        },
      });

      await recordAuditEvent({
        userId: adminUser.id,
        action: "SITE_PROFILE_UPDATED",
        entityType: "SiteProfile",
        entityId: "default",
        metadata: {
          changedFields: diff,
          changedCount: Object.keys(diff).length,
        },
        ipAddress: clientIp,
      });

      return result;
    });

    revalidatePath("/admin/contact/directory");
    revalidatePath("/");
    revalidatePath("/contact");

    return {
      success: true,
      data: updated,
    };
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return {
        success: false,
        error: "Access denied. Only Super Administrators can modify site identity settings.",
      };
    }
    console.error("[profile-action] updateSiteProfile error:", err);
    return {
      success: false,
      error: "An unexpected error occurred while saving site identity settings.",
    };
  }
}

/**
 * 2. Create CampusDirectoryEntry (SUPER_ADMIN only)
 */
export async function createCampusDirectoryEntryAction(
  _prevState: ActionState | null,
  rawPayload: Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const normalized = normalizeProfilePayload(rawPayload);
    const parsed = campusDirectoryCreateSchema.safeParse(normalized);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors: formatZodErrors(parsed.error),
      };
    }

    const created = await prisma.$transaction(async (tx) => {
      const entry = await tx.campusDirectoryEntry.create({
        data: parsed.data,
      });

      await recordAuditEvent({
        userId: adminUser.id,
        action: "DIRECTORY_ENTRY_CREATED",
        entityType: "CampusDirectoryEntry",
        entityId: entry.id,
        metadata: {
          roleTitle: entry.roleTitle,
          category: entry.category,
          contactName: entry.contactName,
          phoneNumber: entry.phoneNumber,
        },
        ipAddress: clientIp,
      });

      return entry;
    });

    revalidatePath("/admin/contact/directory");
    revalidatePath("/contact");

    return {
      success: true,
      data: created,
    };
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return {
        success: false,
        error: "Access denied. Only Super Administrators can create directory contacts.",
      };
    }
    console.error("[profile-action] createDirectoryEntry error:", err);
    return {
      success: false,
      error: "An unexpected error occurred while creating directory contact.",
    };
  }
}

/**
 * 3. Update CampusDirectoryEntry (SUPER_ADMIN only)
 */
export async function updateCampusDirectoryEntryAction(
  _prevState: ActionState | null,
  rawPayload: Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const normalized = normalizeProfilePayload(rawPayload);
    const parsed = campusDirectoryUpdateSchema.safeParse(normalized);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors: formatZodErrors(parsed.error),
      };
    }

    const { id, ...data } = parsed.data;

    const existing = await prisma.campusDirectoryEntry.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        error: "Directory entry not found.",
      };
    }

    const diff = computeDirectoryDiff(
      existing as unknown as Record<string, unknown>,
      data as Record<string, unknown>
    );

    const updated = await prisma.$transaction(async (tx) => {
      const entry = await tx.campusDirectoryEntry.update({
        where: { id },
        data,
      });

      await recordAuditEvent({
        userId: adminUser.id,
        action: "DIRECTORY_ENTRY_UPDATED",
        entityType: "CampusDirectoryEntry",
        entityId: entry.id,
        metadata: {
          changedFields: diff,
          changedCount: Object.keys(diff).length,
        },
        ipAddress: clientIp,
      });

      return entry;
    });

    revalidatePath("/admin/contact/directory");
    revalidatePath("/contact");

    return {
      success: true,
      data: updated,
    };
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return {
        success: false,
        error: "Access denied. Only Super Administrators can update directory contacts.",
      };
    }
    console.error("[profile-action] updateDirectoryEntry error:", err);
    return {
      success: false,
      error: "An unexpected error occurred while updating directory contact.",
    };
  }
}

/**
 * 4. Delete CampusDirectoryEntry (SUPER_ADMIN only)
 */
export async function deleteCampusDirectoryEntryAction(
  _prevState: ActionState | null,
  rawPayload: Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = campusDirectoryDeleteSchema.safeParse(rawPayload);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid request. Missing entry identifier.",
      };
    }

    const { id } = parsed.data;

    const existing = await prisma.campusDirectoryEntry.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        error: "Directory contact already deleted or does not exist.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.campusDirectoryEntry.delete({
        where: { id },
      });

      await recordAuditEvent({
        userId: adminUser.id,
        action: "DIRECTORY_ENTRY_DELETED",
        entityType: "CampusDirectoryEntry",
        entityId: id,
        metadata: {
          roleTitle: existing.roleTitle,
          contactName: existing.contactName,
          category: existing.category,
        },
        ipAddress: clientIp,
      });
    });

    revalidatePath("/admin/contact/directory");
    revalidatePath("/contact");

    return {
      success: true,
    };
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return {
        success: false,
        error: "Access denied. Only Super Administrators can delete directory contacts.",
      };
    }
    console.error("[profile-action] deleteDirectoryEntry error:", err);
    return {
      success: false,
      error: "An unexpected error occurred while deleting directory contact.",
    };
  }
}

/**
 * 5. Publish / Unpublish CampusDirectoryEntry (SUPER_ADMIN only)
 */
export async function toggleCampusDirectoryStatusAction(
  _prevState: ActionState | null,
  rawPayload: Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = campusDirectoryToggleSchema.safeParse(rawPayload);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid toggle payload.",
      };
    }

    const { id, isPublished } = parsed.data;

    const updated = await prisma.$transaction(async (tx) => {
      const entry = await tx.campusDirectoryEntry.update({
        where: { id },
        data: { isPublished },
      });

      await recordAuditEvent({
        userId: adminUser.id,
        action: "DIRECTORY_ENTRY_STATUS_CHANGED",
        entityType: "CampusDirectoryEntry",
        entityId: id,
        metadata: {
          isPublished,
          roleTitle: entry.roleTitle,
        },
        ipAddress: clientIp,
      });

      return entry;
    });

    revalidatePath("/admin/contact/directory");
    revalidatePath("/contact");

    return {
      success: true,
      data: updated,
    };
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return {
        success: false,
        error: "Access denied. Only Super Administrators can change publication status.",
      };
    }
    console.error("[profile-action] toggleDirectoryStatus error:", err);
    return {
      success: false,
      error: "An unexpected error occurred while toggling directory status.",
    };
  }
}

/**
 * 6. Reorder CampusDirectoryEntries (SUPER_ADMIN only)
 */
export async function reorderCampusDirectoryEntriesAction(
  _prevState: ActionState | null,
  rawPayload: Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = campusDirectoryReorderSchema.safeParse(rawPayload);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid reorder payload.",
      };
    }

    const { entries } = parsed.data;

    await prisma.$transaction(async (tx) => {
      for (const item of entries) {
        await tx.campusDirectoryEntry.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        });
      }

      await recordAuditEvent({
        userId: adminUser.id,
        action: "DIRECTORY_ENTRIES_REORDERED",
        entityType: "CampusDirectoryEntry",
        entityId: "batch",
        metadata: {
          reorderedCount: entries.length,
        },
        ipAddress: clientIp,
      });
    });

    revalidatePath("/admin/contact/directory");
    revalidatePath("/contact");

    return {
      success: true,
    };
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return {
        success: false,
        error: "Access denied. Only Super Administrators can reorder directory contacts.",
      };
    }
    console.error("[profile-action] reorderDirectoryEntries error:", err);
    return {
      success: false,
      error: "An unexpected error occurred while reordering directory entries.",
    };
  }
}
