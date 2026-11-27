"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type {
  AdmissionOverview,
  FeeStructurePage,
  AdmissionProcedureRule,
  EntranceExamSubject,
} from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import { requireRole } from "@/lib/server/auth";
import { recordAuditEvent } from "@/lib/server/audit";
import {
  admissionOverviewUpdateSchema,
  feeStructurePageCreateSchema,
  feeStructurePageUpdateSchema,
  feeStructurePageDeleteSchema,
  feeStructurePagesReorderSchema,
  feeStructurePageToggleSchema,
  admissionProcedureRuleCreateSchema,
  admissionProcedureRuleUpdateSchema,
  admissionProcedureRuleDeleteSchema,
  admissionProcedureRulesReorderSchema,
  admissionProcedureRuleToggleSchema,
  entranceExamSubjectCreateSchema,
  entranceExamSubjectUpdateSchema,
  entranceExamSubjectDeleteSchema,
  entranceExamSubjectsReorderSchema,
  entranceExamSubjectToggleSchema,
} from "@/lib/validation/admissions-publication";

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

function revalidateAdmissionsPublications() {
  try {
    revalidateTag("admissions_publications", "max");
    revalidatePath("/admin/admissions/fees");
    revalidatePath("/admin/admissions/prospectus");
    revalidatePath("/admin/admissions/procedure");
    revalidatePath("/admissions/fees");
    revalidatePath("/school-prospectus");
    revalidatePath("/admissions/procedure");
  } catch (err) {
    // In test runner or non-request execution contexts, revalidation is a no-op
    void err;
  }
}

// ==========================================
// ADMISSION PUBLICATION OVERVIEW ACTIONS
// ==========================================

export async function getAdmissionOverviewAction(): Promise<ActionResponse<AdmissionOverview>> {
  try {
    let overview = await prisma.admissionOverview.findUnique({
      where: { id: "default" },
    });

    if (!overview) {
      overview = await prisma.admissionOverview.create({
        data: {
          id: "default",
          sessionLabel: "2026-27",
          feeStructureTitle: "Fee Structure (Session 2026–27)",
          feeStructureSubtitle:
            "Official statutory fee schedule and prospectus for Devasthaly Vidyapeeth, Chilkahar, Ballia.",
          prospectusTitle: "Official Devasthaly Vidyapeeth Prospectus",
          prospectusDescription:
            "Complete publication containing the vision of Founder Shri Chandra Shekhar, admission eligibility, code of conduct, academic syllabus, examination assessment rules, and hostel guidelines.",
          prospectusPdfUrl: "/documents/original/prospectus-2.pdf",
          prospectusDisplayLabel: "Prospectus PDF (5.6 MB)",
          admissionChartPdfUrl: "/documents/original/new-admission-chart-2026-27.pdf",
          admissionChartDisplayLabel: "Admission Chart (722 KB)",
        },
      });
    }

    return { success: true, data: overview };
  } catch (error) {
    console.error("Error fetching admission overview:", error);
    return { success: false, error: "Failed to retrieve admission overview." };
  }
}

export async function updateAdmissionOverviewAction(
  input: unknown
): Promise<ActionResponse<AdmissionOverview>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const parsed = admissionOverviewUpdateSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted validation errors.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const updated = await prisma.admissionOverview.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        ...parsed.data,
      },
      update: parsed.data,
    });

    await recordAuditEvent({
      userId: user.id,
      action: "ADMISSION_OVERVIEW_UPDATED",
      entityType: "AdmissionOverview",
      entityId: "default",
      metadata: {
        sessionLabel: parsed.data.sessionLabel,
        feeStructureTitle: parsed.data.feeStructureTitle,
        prospectusPdfUrl: parsed.data.prospectusPdfUrl,
        admissionChartPdfUrl: parsed.data.admissionChartPdfUrl,
      },
    });

    revalidateAdmissionsPublications();
    return {
      success: true,
      data: updated,
      message: "Admission publications overview updated successfully.",
    };
  } catch (error) {
    console.error("Error updating admission overview:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update admission overview.",
    };
  }
}

// ==========================================
// FEE STRUCTURE PAGE ACTIONS
// ==========================================

export async function createFeeStructurePageAction(
  input: unknown
): Promise<ActionResponse<FeeStructurePage>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const parsed = feeStructurePageCreateSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted validation errors.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    let displayOrder = parsed.data.displayOrder;
    if (displayOrder === 0) {
      const maxOrder = await prisma.feeStructurePage.aggregate({
        _max: { displayOrder: true },
      });
      displayOrder = (maxOrder._max.displayOrder ?? -1) + 1;
    }

    const created = await prisma.feeStructurePage.create({
      data: {
        pageNumber: parsed.data.pageNumber,
        title: parsed.data.title,
        imageUrl: parsed.data.imageUrl,
        displayOrder,
        isPublished: parsed.data.isPublished,
      },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "FEE_PAGE_CREATED",
      entityType: "FeeStructurePage",
      entityId: created.id,
      metadata: {
        pageNumber: created.pageNumber,
        title: created.title,
        displayOrder: created.displayOrder,
        isPublished: created.isPublished,
      },
    });

    revalidateAdmissionsPublications();
    return {
      success: true,
      data: created,
      message: `Fee structure page ${created.pageNumber} created successfully.`,
    };
  } catch (error) {
    console.error("Error creating fee structure page:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create fee structure page.",
    };
  }
}

export async function updateFeeStructurePageAction(
  input: unknown
): Promise<ActionResponse<FeeStructurePage>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const parsed = feeStructurePageUpdateSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted validation errors.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const existing = await prisma.feeStructurePage.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "Fee structure page not found." };
    }

    const updated = await prisma.feeStructurePage.update({
      where: { id: parsed.data.id },
      data: {
        pageNumber: parsed.data.pageNumber,
        title: parsed.data.title,
        imageUrl: parsed.data.imageUrl,
        displayOrder: parsed.data.displayOrder,
        isPublished: parsed.data.isPublished,
      },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "FEE_PAGE_UPDATED",
      entityType: "FeeStructurePage",
      entityId: updated.id,
      metadata: {
        pageNumber: updated.pageNumber,
        title: updated.title,
        isPublished: updated.isPublished,
      },
    });

    revalidateAdmissionsPublications();
    return {
      success: true,
      data: updated,
      message: `Fee structure page ${updated.pageNumber} updated successfully.`,
    };
  } catch (error) {
    console.error("Error updating fee structure page:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update fee structure page.",
    };
  }
}

export async function deleteFeeStructurePageAction(
  input: unknown
): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const parsed = feeStructurePageDeleteSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: "Invalid fee structure page ID." };
    }

    const existing = await prisma.feeStructurePage.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "Fee structure page not found." };
    }

    // Retain static assets; delete only database reference
    await prisma.feeStructurePage.delete({
      where: { id: parsed.data.id },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "FEE_PAGE_DELETED",
      entityType: "FeeStructurePage",
      entityId: parsed.data.id,
      metadata: {
        pageNumber: existing.pageNumber,
        title: existing.title,
      },
    });

    revalidateAdmissionsPublications();
    return {
      success: true,
      data: { id: parsed.data.id },
      message: `Fee structure page ${existing.pageNumber} removed successfully.`,
    };
  } catch (error) {
    console.error("Error deleting fee structure page:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete fee structure page.",
    };
  }
}

export async function toggleFeeStructurePageStatusAction(
  input: unknown
): Promise<ActionResponse<FeeStructurePage>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const parsed = feeStructurePageToggleSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: "Invalid toggle parameters." };
    }

    const existing = await prisma.feeStructurePage.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "Fee structure page not found." };
    }

    const updated = await prisma.feeStructurePage.update({
      where: { id: parsed.data.id },
      data: { isPublished: parsed.data.isPublished },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "FEE_PAGE_STATUS_CHANGED",
      entityType: "FeeStructurePage",
      entityId: updated.id,
      metadata: {
        pageNumber: updated.pageNumber,
        isPublished: updated.isPublished,
      },
    });

    revalidateAdmissionsPublications();
    return {
      success: true,
      data: updated,
      message: `Fee page ${updated.pageNumber} publication status set to ${updated.isPublished ? "published" : "hidden"}.`,
    };
  } catch (error) {
    console.error("Error toggling fee structure page status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to change fee page publication status.",
    };
  }
}

export async function reorderFeeStructurePagesAction(
  input: unknown
): Promise<ActionResponse<{ reorderedCount: number }>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const parsed = feeStructurePagesReorderSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid reorder payload.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await prisma.$transaction(
      parsed.data.items.map((item) =>
        prisma.feeStructurePage.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    await recordAuditEvent({
      userId: user.id,
      action: "FEE_PAGES_REORDERED",
      entityType: "FeeStructurePage",
      entityId: "bulk",
      metadata: { itemCount: parsed.data.items.length },
    });

    revalidateAdmissionsPublications();
    return {
      success: true,
      data: { reorderedCount: parsed.data.items.length },
      message: "Fee structure pages reordered successfully.",
    };
  } catch (error) {
    console.error("Error reordering fee structure pages:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reorder fee structure pages.",
    };
  }
}

// ==========================================
// ADMISSION PROCEDURE RULE ACTIONS
// ==========================================

export async function createAdmissionProcedureRuleAction(
  input: unknown
): Promise<ActionResponse<AdmissionProcedureRule>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const parsed = admissionProcedureRuleCreateSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted validation errors.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    let displayOrder = parsed.data.displayOrder;
    if (displayOrder === 0) {
      const maxOrder = await prisma.admissionProcedureRule.aggregate({
        _max: { displayOrder: true },
      });
      displayOrder = (maxOrder._max.displayOrder ?? -1) + 1;
    }

    const created = await prisma.admissionProcedureRule.create({
      data: {
        ruleText: parsed.data.ruleText,
        displayOrder,
        isPublished: parsed.data.isPublished,
      },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "ADMISSION_RULE_CREATED",
      entityType: "AdmissionProcedureRule",
      entityId: created.id,
      metadata: {
        displayOrder: created.displayOrder,
        isPublished: created.isPublished,
        ruleTextLength: created.ruleText.length,
      },
    });

    revalidateAdmissionsPublications();
    return {
      success: true,
      data: created,
      message: "Admission procedure rule created successfully.",
    };
  } catch (error) {
    console.error("Error creating admission procedure rule:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create admission procedure rule.",
    };
  }
}

export async function updateAdmissionProcedureRuleAction(
  input: unknown
): Promise<ActionResponse<AdmissionProcedureRule>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const parsed = admissionProcedureRuleUpdateSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted validation errors.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const existing = await prisma.admissionProcedureRule.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "Admission procedure rule not found." };
    }

    const updated = await prisma.admissionProcedureRule.update({
      where: { id: parsed.data.id },
      data: {
        ruleText: parsed.data.ruleText,
        displayOrder: parsed.data.displayOrder,
        isPublished: parsed.data.isPublished,
      },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "ADMISSION_RULE_UPDATED",
      entityType: "AdmissionProcedureRule",
      entityId: updated.id,
      metadata: {
        displayOrder: updated.displayOrder,
        isPublished: updated.isPublished,
        ruleTextLength: updated.ruleText.length,
      },
    });

    revalidateAdmissionsPublications();
    return {
      success: true,
      data: updated,
      message: "Admission procedure rule updated successfully.",
    };
  } catch (error) {
    console.error("Error updating admission procedure rule:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update admission procedure rule.",
    };
  }
}

export async function deleteAdmissionProcedureRuleAction(
  input: unknown
): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const parsed = admissionProcedureRuleDeleteSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: "Invalid procedure rule ID." };
    }

    const existing = await prisma.admissionProcedureRule.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "Admission procedure rule not found." };
    }

    await prisma.admissionProcedureRule.delete({
      where: { id: parsed.data.id },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "ADMISSION_RULE_DELETED",
      entityType: "AdmissionProcedureRule",
      entityId: parsed.data.id,
      metadata: {
        ruleSnippet: existing.ruleText.slice(0, 50),
      },
    });

    revalidateAdmissionsPublications();
    return {
      success: true,
      data: { id: parsed.data.id },
      message: "Admission procedure rule deleted successfully.",
    };
  } catch (error) {
    console.error("Error deleting admission procedure rule:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete admission procedure rule.",
    };
  }
}

export async function toggleAdmissionProcedureRuleStatusAction(
  input: unknown
): Promise<ActionResponse<AdmissionProcedureRule>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const parsed = admissionProcedureRuleToggleSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: "Invalid toggle parameters." };
    }

    const existing = await prisma.admissionProcedureRule.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "Admission procedure rule not found." };
    }

    const updated = await prisma.admissionProcedureRule.update({
      where: { id: parsed.data.id },
      data: { isPublished: parsed.data.isPublished },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "ADMISSION_RULE_STATUS_CHANGED",
      entityType: "AdmissionProcedureRule",
      entityId: updated.id,
      metadata: { isPublished: updated.isPublished },
    });

    revalidateAdmissionsPublications();
    return {
      success: true,
      data: updated,
      message: `Rule publication status set to ${updated.isPublished ? "published" : "hidden"}.`,
    };
  } catch (error) {
    console.error("Error toggling admission rule status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to change rule publication status.",
    };
  }
}

export async function reorderAdmissionProcedureRulesAction(
  input: unknown
): Promise<ActionResponse<{ reorderedCount: number }>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const parsed = admissionProcedureRulesReorderSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid reorder payload.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await prisma.$transaction(
      parsed.data.items.map((item) =>
        prisma.admissionProcedureRule.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    await recordAuditEvent({
      userId: user.id,
      action: "ADMISSION_RULES_REORDERED",
      entityType: "AdmissionProcedureRule",
      entityId: "bulk",
      metadata: { itemCount: parsed.data.items.length },
    });

    revalidateAdmissionsPublications();
    return {
      success: true,
      data: { reorderedCount: parsed.data.items.length },
      message: "Admission procedure rules reordered successfully.",
    };
  } catch (error) {
    console.error("Error reordering admission procedure rules:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reorder admission procedure rules.",
    };
  }
}

// ==========================================
// ENTRANCE EXAM SUBJECT ACTIONS
// ==========================================

export async function createEntranceExamSubjectAction(
  input: unknown
): Promise<ActionResponse<EntranceExamSubject>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const parsed = entranceExamSubjectCreateSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted validation errors.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    let displayOrder = parsed.data.displayOrder;
    if (displayOrder === 0) {
      const maxOrder = await prisma.entranceExamSubject.aggregate({
        _max: { displayOrder: true },
      });
      displayOrder = (maxOrder._max.displayOrder ?? -1) + 1;
    }

    const created = await prisma.entranceExamSubject.create({
      data: {
        classGrade: parsed.data.classGrade,
        subjects: parsed.data.subjects,
        displayOrder,
        isPublished: parsed.data.isPublished,
      },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "ENTRANCE_SUBJECT_CREATED",
      entityType: "EntranceExamSubject",
      entityId: created.id,
      metadata: {
        classGrade: created.classGrade,
        subjects: created.subjects,
        displayOrder: created.displayOrder,
        isPublished: created.isPublished,
      },
    });

    revalidateAdmissionsPublications();
    return {
      success: true,
      data: created,
      message: `Entrance exam subjects for "${created.classGrade}" created successfully.`,
    };
  } catch (error) {
    console.error("Error creating entrance exam subject:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create entrance exam subject.",
    };
  }
}

export async function updateEntranceExamSubjectAction(
  input: unknown
): Promise<ActionResponse<EntranceExamSubject>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const parsed = entranceExamSubjectUpdateSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "Please correct the highlighted validation errors.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const existing = await prisma.entranceExamSubject.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "Entrance exam subject entry not found." };
    }

    const updated = await prisma.entranceExamSubject.update({
      where: { id: parsed.data.id },
      data: {
        classGrade: parsed.data.classGrade,
        subjects: parsed.data.subjects,
        displayOrder: parsed.data.displayOrder,
        isPublished: parsed.data.isPublished,
      },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "ENTRANCE_SUBJECT_UPDATED",
      entityType: "EntranceExamSubject",
      entityId: updated.id,
      metadata: {
        classGrade: updated.classGrade,
        subjects: updated.subjects,
        isPublished: updated.isPublished,
      },
    });

    revalidateAdmissionsPublications();
    return {
      success: true,
      data: updated,
      message: `Entrance exam subjects for "${updated.classGrade}" updated successfully.`,
    };
  } catch (error) {
    console.error("Error updating entrance exam subject:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update entrance exam subject.",
    };
  }
}

export async function deleteEntranceExamSubjectAction(
  input: unknown
): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const parsed = entranceExamSubjectDeleteSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: "Invalid entrance exam subject ID." };
    }

    const existing = await prisma.entranceExamSubject.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "Entrance exam subject entry not found." };
    }

    await prisma.entranceExamSubject.delete({
      where: { id: parsed.data.id },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "ENTRANCE_SUBJECT_DELETED",
      entityType: "EntranceExamSubject",
      entityId: parsed.data.id,
      metadata: {
        classGrade: existing.classGrade,
      },
    });

    revalidateAdmissionsPublications();
    return {
      success: true,
      data: { id: parsed.data.id },
      message: `Entrance exam subjects for "${existing.classGrade}" deleted successfully.`,
    };
  } catch (error) {
    console.error("Error deleting entrance exam subject:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete entrance exam subject.",
    };
  }
}

export async function toggleEntranceExamSubjectStatusAction(
  input: unknown
): Promise<ActionResponse<EntranceExamSubject>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const parsed = entranceExamSubjectToggleSchema.safeParse(input);

    if (!parsed.success) {
      return { success: false, error: "Invalid toggle parameters." };
    }

    const existing = await prisma.entranceExamSubject.findUnique({
      where: { id: parsed.data.id },
    });

    if (!existing) {
      return { success: false, error: "Entrance exam subject entry not found." };
    }

    const updated = await prisma.entranceExamSubject.update({
      where: { id: parsed.data.id },
      data: { isPublished: parsed.data.isPublished },
    });

    await recordAuditEvent({
      userId: user.id,
      action: "ENTRANCE_SUBJECT_STATUS_CHANGED",
      entityType: "EntranceExamSubject",
      entityId: updated.id,
      metadata: {
        classGrade: updated.classGrade,
        isPublished: updated.isPublished,
      },
    });

    revalidateAdmissionsPublications();
    return {
      success: true,
      data: updated,
      message: `Status for "${updated.classGrade}" set to ${updated.isPublished ? "published" : "hidden"}.`,
    };
  } catch (error) {
    console.error("Error toggling entrance exam subject status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to change entrance subject publication status.",
    };
  }
}

export async function reorderEntranceExamSubjectsAction(
  input: unknown
): Promise<ActionResponse<{ reorderedCount: number }>> {
  try {
    const user = await requireRole(["SUPER_ADMIN"]);
    const parsed = entranceExamSubjectsReorderSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid reorder payload.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    await prisma.$transaction(
      parsed.data.items.map((item) =>
        prisma.entranceExamSubject.update({
          where: { id: item.id },
          data: { displayOrder: item.displayOrder },
        })
      )
    );

    await recordAuditEvent({
      userId: user.id,
      action: "ENTRANCE_SUBJECTS_REORDERED",
      entityType: "EntranceExamSubject",
      entityId: "bulk",
      metadata: { itemCount: parsed.data.items.length },
    });

    revalidateAdmissionsPublications();
    return {
      success: true,
      data: { reorderedCount: parsed.data.items.length },
      message: "Entrance exam subjects reordered successfully.",
    };
  } catch (error) {
    console.error("Error reordering entrance exam subjects:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reorder entrance exam subjects.",
    };
  }
}
