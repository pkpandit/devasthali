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
  facultyMemberCreateSchema,
  facultyMemberUpdateSchema,
  facultyMemberDeleteSchema,
  facultyMemberToggleSchema,
  facultyMemberReorderSchema,
  normalizeFacultyPayload,
  computeFacultyDiff,
  formatZodErrors,
} from "@/lib/validation/faculty";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
}

// ==========================================
// DATA FETCHING FOR ADMIN
// ==========================================

export async function getAdminFacultyData() {
  await requireRole(["SUPER_ADMIN"]);

  const facultyMembers = await prisma.facultyMember.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });

  return { facultyMembers };
}

// ==========================================
// FACULTY MUTATION ACTIONS
// ==========================================

export async function createFacultyMember(
  rawPayload: unknown
): Promise<ActionResult<{ id: string }>> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const rawInput = (rawPayload && typeof rawPayload === "object" ? rawPayload : {}) as
    | FormData
    | Record<string, unknown>;

  const photoFile =
    extractUploadedFile(rawInput, "photoFile") ||
    extractUploadedFile(rawInput, "imageFile");

  let newlyManagedKey: string | null = null;
  let newlyPublicUrl: string | null = null;

  if (photoFile) {
    try {
      const saved = await processAndSaveUploadedImage(photoFile);
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

  const normalized = normalizeFacultyPayload(rawInput);
  if (newlyPublicUrl) {
    normalized.imageUrl = newlyPublicUrl;
    normalized.imageStorageKey = newlyManagedKey;
  }

  const parsed = facultyMemberCreateSchema.safeParse(normalized);
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
    name,
    designation,
    department,
    qualification,
    experienceYears,
    bio,
    imageUrl,
    imageStorageKey,
    imageAlt,
    displayOrder,
    isPublished,
  } = parsed.data;

  try {
    const created = await prisma.$transaction(async (tx) => {
      // Determine display order if left at 0
      let order = displayOrder;
      if (order === 0) {
        const last = await tx.facultyMember.findFirst({
          orderBy: { displayOrder: "desc" },
          select: { displayOrder: true },
        });
        order = (last?.displayOrder ?? -1) + 1;
      }

      const member = await tx.facultyMember.create({
        data: {
          name,
          designation,
          department,
          qualification: qualification ?? null,
          experienceYears,
          bio: bio ?? null,
          imageUrl: imageUrl ?? null,
          imageStorageKey: imageStorageKey ?? null,
          imageAlt: imageAlt ?? "",
          displayOrder: order,
          isPublished,
        },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "FACULTY_MEMBER_CREATED",
          entityType: "FacultyMember",
          entityId: member.id,
          metadata: {
            name: member.name,
            department: member.department,
            designation: member.designation,
            isPublished: member.isPublished,
            hasPhoto: Boolean(member.imageUrl && member.imageUrl.trim() !== ""),
          },
        },
        tx
      );

      return member;
    });

    revalidatePath("/admin/academics/faculty");
    return { success: true, data: { id: created.id } };
  } catch (error) {
    if (newlyManagedKey) {
      await cleanupOrphanFile(newlyManagedKey);
    }
    console.error("[createFacultyMember] Error:", error);
    return {
      success: false,
      error: "Failed to create faculty member record due to a database error.",
    };
  }
}

export async function updateFacultyMember(
  rawPayload: unknown
): Promise<ActionResult<{ id: string }>> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const rawInput = (rawPayload && typeof rawPayload === "object" ? rawPayload : {}) as
    | FormData
    | Record<string, unknown>;

  const photoFile =
    extractUploadedFile(rawInput, "photoFile") ||
    extractUploadedFile(rawInput, "imageFile");
  const isRemoval =
    isRemovalRequested(rawInput, "removePhoto") ||
    isRemovalRequested(rawInput, "removeImage");

  let newlyManagedKey: string | null = null;
  let newlyPublicUrl: string | null = null;

  if (photoFile) {
    try {
      const saved = await processAndSaveUploadedImage(photoFile);
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

  const normalized = normalizeFacultyPayload(rawInput);
  if (newlyPublicUrl) {
    normalized.imageUrl = newlyPublicUrl;
    normalized.imageStorageKey = newlyManagedKey;
  } else if (isRemoval) {
    normalized.imageUrl = null;
    normalized.imageStorageKey = null;
    normalized.imageAlt = "";
  }

  const parsed = facultyMemberUpdateSchema.safeParse(normalized);
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
    name,
    designation,
    department,
    qualification,
    experienceYears,
    bio,
    imageUrl,
    imageStorageKey,
    imageAlt,
    displayOrder,
    isPublished,
  } = parsed.data;

  try {
    const txResult = await prisma.$transaction(async (tx) => {
      const existing = await tx.facultyMember.findUnique({
        where: { id },
      });
      if (!existing) {
        throw new Error("Faculty member not found");
      }

      const updateData = {
        name,
        designation,
        department,
        qualification: qualification ?? null,
        experienceYears,
        bio: bio ?? null,
        imageUrl: imageUrl ?? null,
        imageStorageKey: imageStorageKey ?? null,
        imageAlt: imageAlt ?? "",
        displayOrder,
        isPublished,
      };

      const diff = computeFacultyDiff(
        existing as unknown as Record<string, unknown>,
        updateData as Record<string, unknown>
      );

      const member = await tx.facultyMember.update({
        where: { id },
        data: updateData,
      });

      if (Object.keys(diff).length > 0) {
        await recordAuditEvent(
          {
            userId: adminUser.id,
            action: "FACULTY_MEMBER_UPDATED",
            entityType: "FacultyMember",
            entityId: member.id,
            metadata: {
              diff,
              name: member.name,
              department: member.department,
            },
          },
          tx
        );
      }

      const oldStorageKeyToDelete =
        (newlyManagedKey || isRemoval) && existing.imageStorageKey
          ? existing.imageStorageKey
          : null;

      return { member, oldStorageKeyToDelete };
    });

    if (txResult.oldStorageKeyToDelete) {
      await deleteManagedPhotoIfUnreferenced(txResult.oldStorageKeyToDelete);
    }

    revalidatePath("/admin/academics/faculty");
    return { success: true, data: { id: txResult.member.id } };
  } catch (error) {
    if (newlyManagedKey) {
      await cleanupOrphanFile(newlyManagedKey);
    }
    console.error("[updateFacultyMember] Error:", error);
    const message =
      error instanceof Error && error.message === "Faculty member not found"
        ? "Faculty member not found."
        : "Failed to update faculty member record due to a database error.";
    return { success: false, error: message };
  }
}

export async function deleteFacultyMember(
  rawPayload: unknown
): Promise<ActionResult<{ id: string }>> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = facultyMemberDeleteSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return { success: false, error: "Invalid faculty member identifier." };
  }

  const { id } = parsed.data;

  try {
    const txResult = await prisma.$transaction(async (tx) => {
      const existing = await tx.facultyMember.findUnique({
        where: { id },
      });
      if (!existing) {
        throw new Error("Faculty member not found");
      }

      await tx.facultyMember.delete({
        where: { id },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "FACULTY_MEMBER_DELETED",
          entityType: "FacultyMember",
          entityId: id,
          metadata: {
            deletedName: existing.name,
            deletedDepartment: existing.department,
            deletedDesignation: existing.designation,
          },
        },
        tx
      );

      return { oldStorageKeyToDelete: existing.imageStorageKey };
    });

    if (txResult.oldStorageKeyToDelete) {
      await deleteManagedPhotoIfUnreferenced(txResult.oldStorageKeyToDelete);
    }

    revalidatePath("/admin/academics/faculty");
    return { success: true, data: { id } };
  } catch (error) {
    console.error("[deleteFacultyMember] Error:", error);
    const message =
      error instanceof Error && error.message === "Faculty member not found"
        ? "Faculty member not found."
        : "Failed to delete faculty member record due to a database error.";
    return { success: false, error: message };
  }
}

export async function toggleFacultyPublish(
  rawPayload: unknown
): Promise<ActionResult<{ id: string; isPublished: boolean }>> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = facultyMemberToggleSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return { success: false, error: "Invalid toggle payload." };
  }

  const { id, isPublished } = parsed.data;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.facultyMember.findUnique({ where: { id } });
      if (!existing) throw new Error("Faculty member not found");

      const member = await tx.facultyMember.update({
        where: { id },
        data: { isPublished },
      });

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "FACULTY_MEMBER_STATUS_CHANGED",
          entityType: "FacultyMember",
          entityId: id,
          metadata: {
            name: member.name,
            from: existing.isPublished,
            to: isPublished,
          },
        },
        tx
      );

      return member;
    });

    revalidatePath("/admin/academics/faculty");
    return {
      success: true,
      data: { id: updated.id, isPublished: updated.isPublished },
    };
  } catch (error) {
    console.error("[toggleFacultyPublish] Error:", error);
    return { success: false, error: "Failed to update publication status." };
  }
}

export async function reorderFacultyMembers(
  rawPayload: unknown
): Promise<ActionResult<{ success: boolean }>> {
  const adminUser = await requireRole(["SUPER_ADMIN"]);

  const parsed = facultyMemberReorderSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return { success: false, error: "Invalid reorder payload." };
  }

  const { orderedIds } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx.facultyMember.update({
          where: { id: orderedIds[i] },
          data: { displayOrder: i },
        });
      }

      await recordAuditEvent(
        {
          userId: adminUser.id,
          action: "FACULTY_MEMBERS_REORDERED",
          entityType: "FacultyMember",
          entityId: "bulk-reorder",
          metadata: { orderedIds },
        },
        tx
      );
    });

    revalidatePath("/admin/academics/faculty");
    return { success: true, data: { success: true } };
  } catch (error) {
    console.error("[reorderFacultyMembers] Error:", error);
    return { success: false, error: "Failed to reorder faculty members." };
  }
}
