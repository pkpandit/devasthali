"use server";

import "server-only";
import { revalidateTag, revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/server/prisma";
import { recordAuditEvent } from "@/lib/server/audit";
import { requireRole } from "@/lib/server/auth";
import {
  contactLocationSchema,
  contactHelplinesSchema,
  computeLocationDiff,
  computeHelplinesDiff,
  type ContactLocationInput,
  type ContactHelplinesInput,
} from "@/lib/validation/contact";

export interface ContactActionState<T = unknown> {
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
 * Update Campus Location, Map Embed & Directions (SUPER_ADMIN only)
 */
export async function updateContactLocation(
  rawInput: ContactLocationInput
): Promise<ContactActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = contactLocationSchema.safeParse(rawInput);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const fieldName = issue.path[0]?.toString() || "form";
        if (!fieldErrors[fieldName]) fieldErrors[fieldName] = [];
        fieldErrors[fieldName].push(issue.message);
      }
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors,
      };
    }

    const currentProfile = await prisma.siteProfile.findUnique({
      where: { id: "default" },
    });

    const oldData = (currentProfile as unknown as Record<string, unknown>) || {};
    const newData = parsed.data as Record<string, unknown>;
    const diff = computeLocationDiff(oldData, newData);

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.siteProfile.upsert({
        where: { id: "default" },
        update: {
          campusAddress: parsed.data.campusAddress ?? null,
          tehsil: parsed.data.tehsil ?? null,
          district: parsed.data.district ?? null,
          state: parsed.data.state ?? null,
          pinCode: parsed.data.pinCode ?? null,
          landmark: parsed.data.landmark ?? null,
          mapEmbedUrl: parsed.data.mapEmbedUrl ?? null,
          mapDirectionsUrl: parsed.data.mapDirectionsUrl ?? null,
          directionsOverview: parsed.data.directionsOverview ?? null,
          visitorGuidelines: parsed.data.visitorGuidelines ?? null,
        },
        create: {
          id: "default",
          schoolName: "Devasthaly Vidyapeeth",
          campusAddress: parsed.data.campusAddress ?? null,
          tehsil: parsed.data.tehsil ?? null,
          district: parsed.data.district ?? null,
          state: parsed.data.state ?? null,
          pinCode: parsed.data.pinCode ?? null,
          landmark: parsed.data.landmark ?? null,
          mapEmbedUrl: parsed.data.mapEmbedUrl ?? null,
          mapDirectionsUrl: parsed.data.mapDirectionsUrl ?? null,
          directionsOverview: parsed.data.directionsOverview ?? null,
          visitorGuidelines: parsed.data.visitorGuidelines ?? null,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "CONTACT_LOCATION_UPDATED",
          entityType: "SiteProfile",
          entityId: "default",
          metadata: {
            diff,
            updatedFields: Object.keys(diff),
          },
          ipAddress: clientIp,
        },
        tx
      );

      return result;
    });

    revalidateTag("profile", "max");
    revalidatePath("/admin/contact");

    return {
      success: true,
      data: updated,
    };
  } catch (err: unknown) {
    console.error("[updateContactLocation] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update campus location.",
    };
  }
}

/**
 * Update Campus Helplines, Working Hours & Emergency Desks (SUPER_ADMIN only)
 */
export async function updateContactHelplines(
  rawInput: ContactHelplinesInput
): Promise<ContactActionState> {
  try {
    const adminUser = await requireRole(["SUPER_ADMIN"]);
    const clientIp = await getClientIp();

    const parsed = contactHelplinesSchema.safeParse(rawInput);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const fieldName = issue.path[0]?.toString() || "form";
        if (!fieldErrors[fieldName]) fieldErrors[fieldName] = [];
        fieldErrors[fieldName].push(issue.message);
      }
      return {
        success: false,
        error: "Validation failed. Please review the highlighted fields.",
        fieldErrors,
      };
    }

    const currentProfile = await prisma.siteProfile.findUnique({
      where: { id: "default" },
    });

    const oldData = (currentProfile as unknown as Record<string, unknown>) || {};
    const newData = parsed.data as Record<string, unknown>;
    const diff = computeHelplinesDiff(oldData, newData);

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.siteProfile.upsert({
        where: { id: "default" },
        update: {
          primaryPhone: parsed.data.primaryPhone ?? null,
          admissionsPhone: parsed.data.admissionsPhone ?? null,
          receptionPhone: parsed.data.receptionPhone ?? null,
          hostelWardenPhone: parsed.data.hostelWardenPhone ?? null,
          whatsappNumber: parsed.data.whatsappNumber ?? null,
          officeEmail: parsed.data.officeEmail || null,
          principalEmail: parsed.data.principalEmail || null,
          workingHours: parsed.data.workingHours ?? null,
          emergencyMedicalPhone: parsed.data.emergencyMedicalPhone || null,
          emergencySecurityPhone: parsed.data.emergencySecurityPhone || null,
        },
        create: {
          id: "default",
          schoolName: "Devasthaly Vidyapeeth",
          primaryPhone: parsed.data.primaryPhone ?? null,
          admissionsPhone: parsed.data.admissionsPhone ?? null,
          receptionPhone: parsed.data.receptionPhone ?? null,
          hostelWardenPhone: parsed.data.hostelWardenPhone ?? null,
          whatsappNumber: parsed.data.whatsappNumber ?? null,
          officeEmail: parsed.data.officeEmail || null,
          principalEmail: parsed.data.principalEmail || null,
          workingHours: parsed.data.workingHours ?? null,
          emergencyMedicalPhone: parsed.data.emergencyMedicalPhone || null,
          emergencySecurityPhone: parsed.data.emergencySecurityPhone || null,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "CONTACT_HELPLINES_UPDATED",
          entityType: "SiteProfile",
          entityId: "default",
          metadata: {
            diff,
            updatedFields: Object.keys(diff),
          },
          ipAddress: clientIp,
        },
        tx
      );

      return result;
    });

    revalidateTag("profile", "max");
    revalidatePath("/admin/contact");

    return {
      success: true,
      data: updated,
    };
  } catch (err: unknown) {
    console.error("[updateContactHelplines] Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update helplines.",
    };
  }
}
