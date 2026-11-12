"use server";

import "server-only";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import { recordAuditEvent } from "@/lib/server/audit";
import { AuthorizationError, requireRole } from "@/lib/server/auth";
import {
  topperDeleteSchema,
  topperInputSchema,
  topperUpdateSchema,
  formatZodErrors,
  normalizeTopperPayload,
  computeTopperDiff,
} from "@/lib/validation/toppers";

export interface ActionState<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Extracts client IP from request headers for audit logging.
 */
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
 * Server Action: Create a new BoardResultTopper.
 * Restricted strictly to SUPER_ADMIN.
 * Accepts either (prevState, formData) or direct (formData) invocation.
 */
export async function createTopperAction(
  prevStateOrInput: ActionState | FormData | Record<string, unknown> | null | undefined,
  formDataOrUndefined?: FormData | Record<string, unknown>
): Promise<ActionState<{ id: string }>> {
  try {
    // 1. Authorization: Enforce SUPER_ADMIN role before validation or DB access
    let user;
    try {
      user = await requireRole(["SUPER_ADMIN"]);
    } catch (authErr) {
      if (authErr instanceof AuthorizationError) {
        return {
          success: false,
          error: "Access denied. SUPER_ADMIN privileges required.",
        };
      }
      throw authErr;
    }

    // 2. Resolve input whether invoked as (prevState, formData) or directly as (payload)
    const rawInput =
      formDataOrUndefined !== undefined
        ? formDataOrUndefined
        : (prevStateOrInput as FormData | Record<string, unknown>);

    const normalized = normalizeTopperPayload(rawInput);
    const parsed = topperInputSchema.safeParse(normalized);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed. Please correct the highlighted fields.",
        fieldErrors: formatZodErrors(parsed.error),
      };
    }

    const data = parsed.data;
    const clientIp = await getClientIp();

    // 3. Transactional mutation & audit log creation
    const created = await prisma.$transaction(async (tx) => {
      const topper = await tx.boardResultTopper.create({
        data: {
          studentName: data.studentName,
          scorePercent: new Prisma.Decimal(data.scorePercent),
          grade: data.grade,
          stream: data.stream ?? null,
          academicYear: data.academicYear,
          achievement: data.achievement,
          photoUrl: data.photoUrl ?? null,
          displayOrder: data.displayOrder,
          isFeatured: data.isFeatured,
        },
      });

      await recordAuditEvent(
        {
          action: "TOPPER_CREATED",
          entityType: "BoardResultTopper",
          entityId: topper.id,
          userId: user.id,
          ipAddress: clientIp,
          metadata: {
            studentName: topper.studentName,
            grade: topper.grade,
            stream: topper.stream,
            academicYear: topper.academicYear,
            scorePercent: Number(topper.scorePercent),
            achievement: topper.achievement,
            displayOrder: topper.displayOrder,
            isFeatured: topper.isFeatured,
            hasPhoto: Boolean(topper.photoUrl && topper.photoUrl.trim() !== ""),
          },
        },
        tx
      );

      return topper;
    });

    revalidatePath("/admin/academics/results");
    return { success: true, data: { id: created.id } };
  } catch (err) {
    console.error("[createTopperAction] Unexpected mutation failure:", err);
    return {
      success: false,
      error: "An unexpected error occurred while saving the topper record. Please try again.",
    };
  }
}

/**
 * Server Action: Update an existing BoardResultTopper.
 * Uses full editable payload replacement.
 * Restricted strictly to SUPER_ADMIN.
 * Accepts either (prevState, formData) or direct (formData) invocation.
 */
export async function updateTopperAction(
  prevStateOrInput: ActionState | FormData | Record<string, unknown> | null | undefined,
  formDataOrUndefined?: FormData | Record<string, unknown>
): Promise<ActionState<{ id: string; noOp?: boolean }>> {
  try {
    // 1. Authorization: Enforce SUPER_ADMIN role before validation or DB access
    let user;
    try {
      user = await requireRole(["SUPER_ADMIN"]);
    } catch (authErr) {
      if (authErr instanceof AuthorizationError) {
        return {
          success: false,
          error: "Access denied. SUPER_ADMIN privileges required.",
        };
      }
      throw authErr;
    }

    // 2. Resolve input whether invoked as (prevState, formData) or directly as (payload)
    const rawInput =
      formDataOrUndefined !== undefined
        ? formDataOrUndefined
        : (prevStateOrInput as FormData | Record<string, unknown>);

    const normalized = normalizeTopperPayload(rawInput);
    const parsed = topperUpdateSchema.safeParse(normalized);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed. Please correct the highlighted fields.",
        fieldErrors: formatZodErrors(parsed.error),
      };
    }

    const data = parsed.data;
    const clientIp = await getClientIp();

    // 3. Transactional mutation & audit log creation
    const txResult = await prisma.$transaction(async (tx) => {
      const existing = await tx.boardResultTopper.findUnique({
        where: { id: data.id },
      });

      if (!existing) {
        return { notFound: true as const };
      }

      const { changedFields, diff } = computeTopperDiff(existing, data);

      // If no editable field changed, return success with noOp=true and write no audit log
      if (changedFields.length === 0) {
        return { noOp: true as const, id: existing.id };
      }

      const updated = await tx.boardResultTopper.update({
        where: { id: data.id },
        data: {
          studentName: data.studentName,
          scorePercent: new Prisma.Decimal(data.scorePercent),
          grade: data.grade,
          stream: data.stream ?? null,
          academicYear: data.academicYear,
          achievement: data.achievement,
          photoUrl: data.photoUrl ?? null,
          displayOrder: data.displayOrder,
          isFeatured: data.isFeatured,
        },
      });

      await recordAuditEvent(
        {
          action: "TOPPER_UPDATED",
          entityType: "BoardResultTopper",
          entityId: updated.id,
          userId: user.id,
          ipAddress: clientIp,
          metadata: {
            changedFields,
            diff,
          },
        },
        tx
      );

      return { updated, noOp: false as const };
    });

    if ("notFound" in txResult && txResult.notFound) {
      return {
        success: false,
        error: "The record was not found or was already deleted by another administrator.",
      };
    }

    if ("noOp" in txResult && txResult.noOp) {
      return { success: true, data: { id: txResult.id, noOp: true } };
    }

    revalidatePath("/admin/academics/results");
    return { success: true, data: { id: txResult.updated.id } };
  } catch (err) {
    console.error("[updateTopperAction] Unexpected mutation failure:", err);
    return {
      success: false,
      error: "An unexpected error occurred while updating the topper record. Please try again.",
    };
  }
}

/**
 * Server Action: Hard delete a BoardResultTopper.
 * Restricted strictly to SUPER_ADMIN.
 * Accepts either (prevState, formData) or direct (formData) invocation.
 */
export async function deleteTopperAction(
  prevStateOrInput: ActionState | FormData | Record<string, unknown> | null | undefined,
  formDataOrUndefined?: FormData | Record<string, unknown>
): Promise<ActionState<{ id: string }>> {
  try {
    // 1. Authorization: Enforce SUPER_ADMIN role before validation or DB access
    let user;
    try {
      user = await requireRole(["SUPER_ADMIN"]);
    } catch (authErr) {
      if (authErr instanceof AuthorizationError) {
        return {
          success: false,
          error: "Access denied. SUPER_ADMIN privileges required.",
        };
      }
      throw authErr;
    }

    // 2. Resolve input whether invoked as (prevState, formData) or directly as (payload)
    const rawInput =
      formDataOrUndefined !== undefined
        ? formDataOrUndefined
        : (prevStateOrInput as FormData | Record<string, unknown>);

    const normalized = normalizeTopperPayload(rawInput);
    const parsed = topperDeleteSchema.safeParse(normalized);

    if (!parsed.success) {
      return {
        success: false,
        error: "Validation failed. Invalid or missing record identifier.",
        fieldErrors: formatZodErrors(parsed.error),
      };
    }

    const { id } = parsed.data;
    const clientIp = await getClientIp();

    // 3. Transactional mutation & audit log creation
    const txResult = await prisma.$transaction(async (tx) => {
      const existing = await tx.boardResultTopper.findUnique({
        where: { id },
      });

      if (!existing) {
        return { notFound: true as const };
      }

      // Explicit hard delete
      await tx.boardResultTopper.delete({
        where: { id },
      });

      await recordAuditEvent(
        {
          action: "TOPPER_DELETED",
          entityType: "BoardResultTopper",
          entityId: existing.id,
          userId: user.id,
          ipAddress: clientIp,
          metadata: {
            isHardDelete: true,
            deletedRecord: {
              studentName: existing.studentName,
              grade: existing.grade,
              stream: existing.stream,
              academicYear: existing.academicYear,
              scorePercent: Number(existing.scorePercent),
              achievement: existing.achievement,
              displayOrder: existing.displayOrder,
              isFeatured: existing.isFeatured,
              hasPhoto: Boolean(existing.photoUrl && existing.photoUrl.trim() !== ""),
            },
          },
        },
        tx
      );

      return { success: true as const, id: existing.id };
    });

    if ("notFound" in txResult && txResult.notFound) {
      return {
        success: false,
        error: "The record was not found or was already deleted by another administrator.",
      };
    }

    revalidatePath("/admin/academics/results");
    return { success: true, data: { id } };
  } catch (err) {
    console.error("[deleteTopperAction] Unexpected mutation failure:", err);
    return {
      success: false,
      error: "An unexpected error occurred while deleting the topper record. Please try again.",
    };
  }
}
