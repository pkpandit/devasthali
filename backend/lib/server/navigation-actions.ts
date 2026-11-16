"use server";

import "server-only";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/server/prisma";
import { recordAuditEvent } from "@/lib/server/audit";
import { AuthorizationError, requireRole } from "@/lib/server/auth";
import {
  navigationItemCreateSchema,
  navigationItemUpdateSchema,
  navigationItemDeleteSchema,
  navigationItemToggleSchema,
  navigationItemReorderSchema,
  navigationColumnCreateSchema,
  navigationColumnUpdateSchema,
  navigationColumnDeleteSchema,
  navigationColumnToggleSchema,
  navigationColumnReorderSchema,
  navigationLinkCreateSchema,
  navigationLinkUpdateSchema,
  navigationLinkDeleteSchema,
  navigationLinkToggleSchema,
  navigationLinkReorderSchema,
  getMaxColumnsForPanelType,
  computeNavigationItemDiff,
  computeNavigationColumnDiff,
  computeNavigationLinkDiff,
  formatZodErrors,
} from "@/lib/validation/navigation";

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
  if (payload instanceof FormData) {
    const obj: Record<string, unknown> = {};
    payload.forEach((value, key) => {
      if (value === "true") obj[key] = true;
      else if (value === "false") obj[key] = false;
      else if (value === "") obj[key] = null;
      else obj[key] = value;
    });
    return obj;
  }
  return payload;
}

function revalidateNavigationPaths() {
  try {
    revalidatePath("/admin/navigation");
    revalidatePath("/api/public/navigation");
    revalidatePath("/", "layout");
  } catch {
    // Graceful fallback in non-request contexts
  }
}

// ==========================================
// 1. Navigation Item Actions
// ==========================================

export async function createNavigationItemAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();
    const parsed = navigationItemCreateSchema.safeParse(parsePayload(rawPayload));

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors: formatZodErrors(parsed.error),
      };
    }

    const created = await prisma.$transaction(async (tx) => {
      // Determine next displayOrder if not explicitly specified
      let displayOrder = parsed.data.displayOrder;
      if (displayOrder === 0) {
        const last = await tx.navigationItem.findFirst({
          where: { location: parsed.data.location },
          orderBy: { displayOrder: "desc" },
          select: { displayOrder: true },
        });
        displayOrder = (last?.displayOrder ?? 0) + 1;
      }

      const item = await tx.navigationItem.create({
        data: {
          location: parsed.data.location,
          label: parsed.data.label,
          href: parsed.data.href,
          panelType: parsed.data.panelType,
          badge: parsed.data.badge || null,
          displayOrder,
          isPublished: parsed.data.isPublished,
          openInNewTab: parsed.data.openInNewTab,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "NAVIGATION_ITEM_CREATED",
          entityType: "NavigationItem",
          entityId: item.id,
          metadata: {
            item,
          },
          ipAddress: clientIp,
        },
        tx
      );

      return item;
    });

    revalidateNavigationPaths();
    return { success: true, data: created };
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create navigation item",
    };
  }
}

export async function updateNavigationItemAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();
    const parsed = navigationItemUpdateSchema.safeParse(parsePayload(rawPayload));

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors: formatZodErrors(parsed.error),
      };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.navigationItem.findUnique({
        where: { id: parsed.data.id },
        include: { columns: true },
      });

      if (!existing) {
        throw new Error("Navigation item not found");
      }

      // Check column count vs new panelType
      const maxCols = getMaxColumnsForPanelType(parsed.data.panelType);
      if (existing.columns.length > maxCols) {
        throw new Error(
          `Cannot change panel type to ${parsed.data.panelType}: item currently has ${existing.columns.length} columns (maximum allowed: ${maxCols})`
        );
      }

      const item = await tx.navigationItem.update({
        where: { id: parsed.data.id },
        data: {
          location: parsed.data.location,
          label: parsed.data.label,
          href: parsed.data.href,
          panelType: parsed.data.panelType,
          badge: parsed.data.badge || null,
          displayOrder: parsed.data.displayOrder,
          isPublished: parsed.data.isPublished,
          openInNewTab: parsed.data.openInNewTab,
        },
      });

      const diff = computeNavigationItemDiff(
        existing as unknown as Record<string, unknown>,
        item as unknown as Record<string, unknown>
      );

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "NAVIGATION_ITEM_UPDATED",
          entityType: "NavigationItem",
          entityId: item.id,
          metadata: {
            diff,
          },
          ipAddress: clientIp,
        },
        tx
      );

      return item;
    });

    revalidateNavigationPaths();
    return { success: true, data: updated };
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update navigation item",
    };
  }
}

export async function deleteNavigationItemAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();
    const parsed = navigationItemDeleteSchema.safeParse(parsePayload(rawPayload));

    if (!parsed.success) {
      return { success: false, error: "Invalid item ID" };
    }

    await prisma.$transaction(async (tx) => {
      const existing = await tx.navigationItem.findUnique({
        where: { id: parsed.data.id },
      });

      if (!existing) {
        throw new Error("Navigation item not found");
      }

      await tx.navigationItem.delete({
        where: { id: parsed.data.id },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "NAVIGATION_ITEM_DELETED",
          entityType: "NavigationItem",
          entityId: parsed.data.id,
          metadata: {
            deletedItem: existing,
          },
          ipAddress: clientIp,
        },
        tx
      );
    });

    revalidateNavigationPaths();
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete navigation item",
    };
  }
}

export async function toggleNavigationItemStatusAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();
    const parsed = navigationItemToggleSchema.safeParse(parsePayload(rawPayload));

    if (!parsed.success) {
      return { success: false, error: "Invalid parameters" };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.navigationItem.findUnique({
        where: { id: parsed.data.id },
      });

      if (!existing) {
        throw new Error("Navigation item not found");
      }

      const item = await tx.navigationItem.update({
        where: { id: parsed.data.id },
        data: { isPublished: parsed.data.isPublished },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "NAVIGATION_ITEM_STATUS_CHANGED",
          entityType: "NavigationItem",
          entityId: item.id,
          metadata: {
            diff: {
              isPublished: { from: existing.isPublished, to: item.isPublished },
            },
          },
          ipAddress: clientIp,
        },
        tx
      );

      return item;
    });

    revalidateNavigationPaths();
    return { success: true, data: updated };
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle navigation item status",
    };
  }
}

export async function reorderNavigationItemsAction(
  _prevState: ActionState | null,
  rawPayload: Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();
    const parsed = navigationItemReorderSchema.safeParse(rawPayload);

    if (!parsed.success) {
      return { success: false, error: "Invalid reorder payload" };
    }

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < parsed.data.itemIds.length; i++) {
        await tx.navigationItem.update({
          where: { id: parsed.data.itemIds[i] },
          data: { displayOrder: i + 1 },
        });
      }

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "NAVIGATION_ITEMS_REORDERED",
          entityType: "NavigationItem",
          entityId: parsed.data.location,
          metadata: {
            location: parsed.data.location,
            order: parsed.data.itemIds,
          },
          ipAddress: clientIp,
        },
        tx
      );
    });

    revalidateNavigationPaths();
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to reorder navigation items",
    };
  }
}

// ==========================================
// 2. Navigation Column Actions
// ==========================================

export async function createNavigationColumnAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();
    const parsed = navigationColumnCreateSchema.safeParse(parsePayload(rawPayload));

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors: formatZodErrors(parsed.error),
      };
    }

    const created = await prisma.$transaction(async (tx) => {
      const parentItem = await tx.navigationItem.findUnique({
        where: { id: parsed.data.itemId },
        include: { columns: true },
      });

      if (!parentItem) {
        throw new Error("Parent navigation item not found");
      }

      if (parentItem.location !== "HEADER_PRIMARY") {
        throw new Error("Columns are only permitted on Header Primary navigation items");
      }

      const maxCols = getMaxColumnsForPanelType(parentItem.panelType);
      if (maxCols === 0) {
        throw new Error(`Cannot add columns to an item with panel type ${parentItem.panelType}. Change panel type to COMPACT, MEDIUM, or MEGA first.`);
      }

      if (parentItem.columns.length >= maxCols) {
        throw new Error(`Maximum column limit reached for ${parentItem.panelType} panel (max: ${maxCols})`);
      }

      let displayOrder = parsed.data.displayOrder;
      if (displayOrder === 0) {
        const last = await tx.navigationColumn.findFirst({
          where: { itemId: parsed.data.itemId },
          orderBy: { displayOrder: "desc" },
          select: { displayOrder: true },
        });
        displayOrder = (last?.displayOrder ?? 0) + 1;
      }

      const col = await tx.navigationColumn.create({
        data: {
          itemId: parsed.data.itemId,
          heading: parsed.data.heading || null,
          displayOrder,
          isPublished: parsed.data.isPublished,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "NAVIGATION_COLUMN_CREATED",
          entityType: "NavigationColumn",
          entityId: col.id,
          metadata: {
            column: col,
          },
          ipAddress: clientIp,
        },
        tx
      );

      return col;
    });

    revalidateNavigationPaths();
    return { success: true, data: created };
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create column",
    };
  }
}

export async function updateNavigationColumnAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();
    const parsed = navigationColumnUpdateSchema.safeParse(parsePayload(rawPayload));

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors: formatZodErrors(parsed.error),
      };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.navigationColumn.findUnique({
        where: { id: parsed.data.id },
      });

      if (!existing) {
        throw new Error("Navigation column not found");
      }

      const col = await tx.navigationColumn.update({
        where: { id: parsed.data.id },
        data: {
          heading: parsed.data.heading || null,
          displayOrder: parsed.data.displayOrder,
          isPublished: parsed.data.isPublished,
        },
      });

      const diff = computeNavigationColumnDiff(
        existing as unknown as Record<string, unknown>,
        col as unknown as Record<string, unknown>
      );

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "NAVIGATION_COLUMN_UPDATED",
          entityType: "NavigationColumn",
          entityId: col.id,
          metadata: {
            diff,
          },
          ipAddress: clientIp,
        },
        tx
      );

      return col;
    });

    revalidateNavigationPaths();
    return { success: true, data: updated };
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update column",
    };
  }
}

export async function deleteNavigationColumnAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();
    const parsed = navigationColumnDeleteSchema.safeParse(parsePayload(rawPayload));

    if (!parsed.success) {
      return { success: false, error: "Invalid column ID" };
    }

    await prisma.$transaction(async (tx) => {
      const existing = await tx.navigationColumn.findUnique({
        where: { id: parsed.data.id },
      });

      if (!existing) {
        throw new Error("Navigation column not found");
      }

      await tx.navigationColumn.delete({
        where: { id: parsed.data.id },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "NAVIGATION_COLUMN_DELETED",
          entityType: "NavigationColumn",
          entityId: parsed.data.id,
          metadata: {
            deletedColumn: existing,
          },
          ipAddress: clientIp,
        },
        tx
      );
    });

    revalidateNavigationPaths();
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete column",
    };
  }
}

export async function toggleNavigationColumnStatusAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();
    const parsed = navigationColumnToggleSchema.safeParse(parsePayload(rawPayload));

    if (!parsed.success) {
      return { success: false, error: "Invalid parameters" };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.navigationColumn.findUnique({
        where: { id: parsed.data.id },
      });

      if (!existing) {
        throw new Error("Navigation column not found");
      }

      const col = await tx.navigationColumn.update({
        where: { id: parsed.data.id },
        data: { isPublished: parsed.data.isPublished },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "NAVIGATION_COLUMN_STATUS_CHANGED",
          entityType: "NavigationColumn",
          entityId: col.id,
          metadata: {
            diff: {
              isPublished: { from: existing.isPublished, to: col.isPublished },
            },
          },
          ipAddress: clientIp,
        },
        tx
      );

      return col;
    });

    revalidateNavigationPaths();
    return { success: true, data: updated };
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle column status",
    };
  }
}

export async function reorderNavigationColumnsAction(
  _prevState: ActionState | null,
  rawPayload: Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();
    const parsed = navigationColumnReorderSchema.safeParse(rawPayload);

    if (!parsed.success) {
      return { success: false, error: "Invalid reorder payload" };
    }

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < parsed.data.columnIds.length; i++) {
        await tx.navigationColumn.update({
          where: { id: parsed.data.columnIds[i] },
          data: { displayOrder: i + 1 },
        });
      }

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "NAVIGATION_COLUMNS_REORDERED",
          entityType: "NavigationColumn",
          entityId: parsed.data.itemId,
          metadata: {
            itemId: parsed.data.itemId,
            order: parsed.data.columnIds,
          },
          ipAddress: clientIp,
        },
        tx
      );
    });

    revalidateNavigationPaths();
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to reorder columns",
    };
  }
}

// ==========================================
// 3. Navigation Link Actions
// ==========================================

export async function createNavigationLinkAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();
    const parsed = navigationLinkCreateSchema.safeParse(parsePayload(rawPayload));

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors: formatZodErrors(parsed.error),
      };
    }

    const created = await prisma.$transaction(async (tx) => {
      const parentColumn = await tx.navigationColumn.findUnique({
        where: { id: parsed.data.columnId },
      });

      if (!parentColumn) {
        throw new Error("Parent navigation column not found");
      }

      let displayOrder = parsed.data.displayOrder;
      if (displayOrder === 0) {
        const last = await tx.navigationLinkItem.findFirst({
          where: { columnId: parsed.data.columnId },
          orderBy: { displayOrder: "desc" },
          select: { displayOrder: true },
        });
        displayOrder = (last?.displayOrder ?? 0) + 1;
      }

      const link = await tx.navigationLinkItem.create({
        data: {
          columnId: parsed.data.columnId,
          label: parsed.data.label,
          href: parsed.data.href,
          badge: parsed.data.badge || null,
          displayOrder,
          isPublished: parsed.data.isPublished,
          openInNewTab: parsed.data.openInNewTab,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "NAVIGATION_LINK_CREATED",
          entityType: "NavigationLinkItem",
          entityId: link.id,
          metadata: {
            link,
          },
          ipAddress: clientIp,
        },
        tx
      );

      return link;
    });

    revalidateNavigationPaths();
    return { success: true, data: created };
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create link",
    };
  }
}

export async function updateNavigationLinkAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();
    const parsed = navigationLinkUpdateSchema.safeParse(parsePayload(rawPayload));

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors: formatZodErrors(parsed.error),
      };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.navigationLinkItem.findUnique({
        where: { id: parsed.data.id },
      });

      if (!existing) {
        throw new Error("Navigation link not found");
      }

      const link = await tx.navigationLinkItem.update({
        where: { id: parsed.data.id },
        data: {
          label: parsed.data.label,
          href: parsed.data.href,
          badge: parsed.data.badge || null,
          displayOrder: parsed.data.displayOrder,
          isPublished: parsed.data.isPublished,
          openInNewTab: parsed.data.openInNewTab,
        },
      });

      const diff = computeNavigationLinkDiff(
        existing as unknown as Record<string, unknown>,
        link as unknown as Record<string, unknown>
      );

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "NAVIGATION_LINK_UPDATED",
          entityType: "NavigationLinkItem",
          entityId: link.id,
          metadata: {
            diff,
          },
          ipAddress: clientIp,
        },
        tx
      );

      return link;
    });

    revalidateNavigationPaths();
    return { success: true, data: updated };
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update link",
    };
  }
}

export async function deleteNavigationLinkAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();
    const parsed = navigationLinkDeleteSchema.safeParse(parsePayload(rawPayload));

    if (!parsed.success) {
      return { success: false, error: "Invalid link ID" };
    }

    await prisma.$transaction(async (tx) => {
      const existing = await tx.navigationLinkItem.findUnique({
        where: { id: parsed.data.id },
      });

      if (!existing) {
        throw new Error("Navigation link not found");
      }

      await tx.navigationLinkItem.delete({
        where: { id: parsed.data.id },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "NAVIGATION_LINK_DELETED",
          entityType: "NavigationLinkItem",
          entityId: parsed.data.id,
          metadata: {
            deletedLink: existing,
          },
          ipAddress: clientIp,
        },
        tx
      );
    });

    revalidateNavigationPaths();
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete link",
    };
  }
}

export async function toggleNavigationLinkStatusAction(
  _prevState: ActionState | null,
  rawPayload: FormData | Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();
    const parsed = navigationLinkToggleSchema.safeParse(parsePayload(rawPayload));

    if (!parsed.success) {
      return { success: false, error: "Invalid parameters" };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.navigationLinkItem.findUnique({
        where: { id: parsed.data.id },
      });

      if (!existing) {
        throw new Error("Navigation link not found");
      }

      const link = await tx.navigationLinkItem.update({
        where: { id: parsed.data.id },
        data: { isPublished: parsed.data.isPublished },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "NAVIGATION_LINK_STATUS_CHANGED",
          entityType: "NavigationLinkItem",
          entityId: link.id,
          metadata: {
            diff: {
              isPublished: { from: existing.isPublished, to: link.isPublished },
            },
          },
          ipAddress: clientIp,
        },
        tx
      );

      return link;
    });

    revalidateNavigationPaths();
    return { success: true, data: updated };
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle link status",
    };
  }
}

export async function reorderNavigationLinksAction(
  _prevState: ActionState | null,
  rawPayload: Record<string, unknown>
): Promise<ActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();
    const parsed = navigationLinkReorderSchema.safeParse(rawPayload);

    if (!parsed.success) {
      return { success: false, error: "Invalid reorder payload" };
    }

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < parsed.data.linkIds.length; i++) {
        await tx.navigationLinkItem.update({
          where: { id: parsed.data.linkIds[i] },
          data: { displayOrder: i + 1 },
        });
      }

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "NAVIGATION_LINKS_REORDERED",
          entityType: "NavigationLinkItem",
          entityId: parsed.data.columnId,
          metadata: {
            columnId: parsed.data.columnId,
            order: parsed.data.linkIds,
          },
          ipAddress: clientIp,
        },
        tx
      );
    });

    revalidateNavigationPaths();
    return { success: true };
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to reorder links",
    };
  }
}
