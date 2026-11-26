"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/server/prisma";
import { requireRole } from "@/lib/server/auth";
import { recordAuditEvent } from "@/lib/server/audit";
import {
  applicationStatusUpdateSchema,
  registrationSettingsUpdateSchema,
  ALLOWED_STATUS_TRANSITIONS,
  type ApplicationStatusType,
} from "@/lib/validation/online-admissions";

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface SerializedRegistrationSettings {
  id: string;
  isRegistrationOpen: boolean;
  sessionLabel: string;
  guidanceNotice: string | null;
  closedMessage: string | null;
}

/**
 * Retrieves the current online registration settings.
 * Fails closed if the database record is missing.
 */
export async function getAdmissionRegistrationSettings(): Promise<SerializedRegistrationSettings> {
  try {
    const settings = await prisma.admissionRegistrationSetting.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      // Fail closed
      return {
        id: "default",
        isRegistrationOpen: false,
        sessionLabel: "2026-27",
        guidanceNotice: null,
        closedMessage:
          "Online registration is currently closed. Please contact the admissions counter.",
      };
    }

    return {
      id: settings.id,
      isRegistrationOpen: settings.isRegistrationOpen,
      sessionLabel: settings.sessionLabel,
      guidanceNotice: settings.guidanceNotice,
      closedMessage: settings.closedMessage,
    };
  } catch (err) {
    console.error("Failed to read admission registration settings:", err);
    // Fail closed on database failure
    return {
      id: "default",
      isRegistrationOpen: false,
      sessionLabel: "2026-27",
      guidanceNotice: null,
      closedMessage: "Registration system is currently unavailable.",
    };
  }
}

/**
 * Updates registration settings (Open/Close toggle, session label, notices).
 * Protected: Requires SUPER_ADMIN session.
 */
export async function updateAdmissionRegistrationSettingsAction(
  rawInput: unknown
): Promise<ActionResponse<SerializedRegistrationSettings>> {
  await requireRole(["SUPER_ADMIN"]);

  const parsed = registrationSettingsUpdateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please correct the highlighted validation errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const updated = await prisma.admissionRegistrationSetting.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        isRegistrationOpen: data.isRegistrationOpen,
        sessionLabel: data.sessionLabel,
        guidanceNotice: data.guidanceNotice || null,
        closedMessage: data.closedMessage || null,
      },
      update: {
        isRegistrationOpen: data.isRegistrationOpen,
        sessionLabel: data.sessionLabel,
        guidanceNotice: data.guidanceNotice || null,
        closedMessage: data.closedMessage || null,
      },
    });

    await recordAuditEvent({
      userId: null,
      action: "REGISTRATION_SETTINGS_UPDATED",
      entityType: "AdmissionRegistrationSetting",
      entityId: updated.id,
      metadata: {
        isRegistrationOpen: updated.isRegistrationOpen,
        sessionLabel: updated.sessionLabel,
      },
      ipAddress: null,
    });

    try {
      revalidateTag("admissions-settings", "max");
      revalidatePath("/admin/admissions/online-form");
    } catch {
      // In test/non-request environments
    }

    return {
      success: true,
      data: {
        id: updated.id,
        isRegistrationOpen: updated.isRegistrationOpen,
        sessionLabel: updated.sessionLabel,
        guidanceNotice: updated.guidanceNotice,
        closedMessage: updated.closedMessage,
      },
    };
  } catch (err) {
    console.error("Failed to update registration settings:", err);
    return {
      success: false,
      error: "An unexpected error occurred while saving registration settings.",
    };
  }
}

/**
 * Updates application status and internal admin notes.
 * Enforces allowed status transitions.
 * Protected: Requires SUPER_ADMIN session.
 */
export async function updateAdmissionApplicationStatusAction(
  rawInput: unknown
): Promise<ActionResponse<{ id: string; status: ApplicationStatusType; updatedAt: string }>> {
  await requireRole(["SUPER_ADMIN"]);

  const parsed = applicationStatusUpdateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid input parameters.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { id, status: newStatus, adminNotes } = parsed.data;

  try {
    const existing = await prisma.admissionApplication.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        applicationNumber: true,
        sessionCode: true,
      },
    });

    if (!existing) {
      return { success: false, error: "Application record not found." };
    }

    const currentStatus = existing.status as ApplicationStatusType;

    // Check if status is transitioning
    if (currentStatus !== newStatus) {
      const allowedNext = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
      if (!allowedNext.includes(newStatus)) {
        return {
          success: false,
          error: `Status transition from ${currentStatus} to ${newStatus} is not permitted.`,
        };
      }
    }

    const updated = await prisma.admissionApplication.update({
      where: { id },
      data: {
        status: newStatus,
        adminNotes: adminNotes ?? undefined,
      },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });

    // Record audit event without exposing applicant PII
    await recordAuditEvent({
      userId: null,
      action: "APPLICATION_STATUS_UPDATED",
      entityType: "AdmissionApplication",
      entityId: existing.id,
      metadata: {
        applicationNumber: existing.applicationNumber,
        sessionCode: existing.sessionCode,
        previousStatus: currentStatus,
        newStatus,
      },
      ipAddress: null,
    });

    try {
      revalidatePath("/admin/admissions/online-form");
    } catch {
      // In test/non-request environments
    }

    return {
      success: true,
      data: {
        id: updated.id,
        status: updated.status as ApplicationStatusType,
        updatedAt: updated.updatedAt.toISOString(),
      },
    };
  } catch (err) {
    console.error("Failed to update admission application status:", err);
    return {
      success: false,
      error: "An unexpected error occurred while updating the application status.",
    };
  }
}
