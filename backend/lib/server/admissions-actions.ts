"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type {
  AdmissionStep,
  AdmissionEligibilityCriteria,
  AdmissionDocumentRequirement,
  AdmissionFaq,
  EnquirySubmission,
} from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import { requireRole } from "@/lib/server/auth";
import { recordAuditEvent } from "@/lib/server/audit";
import { computeSaltedIpHash } from "@/lib/server/ip-hash";
import {
  admissionStepSchema,
  admissionEligibilityCriteriaSchema,
  admissionDocumentRequirementSchema,
  admissionFaqSchema,
  enquirySubmissionSchema,
  enquiryStatusUpdateSchema,
  reorderItemsSchema,
} from "@/lib/validation/admissions";

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

function revalidateAdmissions() {
  try {
    revalidateTag("admissions");
    revalidatePath("/admin/admissions");
    revalidatePath("/admissions");
  } catch (err) {
    // In script or non-request contexts, revalidate might throw or be a no-op
    void err;
  }
}



// ==========================================
// PUBLIC ENQUIRY SUBMISSION
// ==========================================

export async function submitAdmissionEnquiry(
  input: unknown,
  clientIp?: string | null
): Promise<ActionResponse<{ message: string }>> {
  const parsed = enquirySubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please correct the highlighted errors.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Honeypot spam trap: return instant success without storing
  if (parsed.data.website_honey && parsed.data.website_honey.trim().length > 0) {
    return {
      success: true,
      data: {
        message:
          "Enquiry submitted successfully. Our admissions desk will contact you shortly.",
      },
    };
  }

  const ipHash = computeSaltedIpHash(clientIp);

  // Durable rate limiting: max 5 enquiries per IP hash per 15 minutes
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  const recentCount = await prisma.enquirySubmission.count({
    where: {
      ipHash,
      createdAt: { gte: fifteenMinutesAgo },
    },
  });

  if (recentCount >= 5) {
    return {
      success: false,
      error:
        "Too many enquiries submitted from this network. Please wait a few minutes before trying again.",
    };
  }

  const submission = await prisma.enquirySubmission.create({
    data: {
      studentName: parsed.data.studentName,
      parentName: parsed.data.parentName,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      grade: parsed.data.grade,
      message: parsed.data.message || null,
      ipHash,
      status: "PENDING",
    },
  });

  await recordAuditEvent({
    userId: null,
    action: "ENQUIRY_SUBMITTED",
    entityType: "EnquirySubmission",
    entityId: submission.id,
    metadata: {
      studentName: submission.studentName,
      grade: submission.grade,
      phone: submission.phone,
      email: submission.email,
    },
    ipAddress: null,
  });

  return {
    success: true,
    data: {
      message:
        "Enquiry submitted successfully. Our admissions desk will contact you shortly.",
    },
  };
}

// ==========================================
// ADMIN ENQUIRY MANAGEMENT (SUPER_ADMIN)
// ==========================================

export async function updateEnquiryStatus(
  input: unknown
): Promise<ActionResponse<EnquirySubmission>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const parsed = enquiryStatusUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid enquiry update payload.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await prisma.enquirySubmission.findUnique({
    where: { id: parsed.data.id },
  });
  if (!existing) {
    return { success: false, error: "Enquiry submission not found." };
  }

  const updated = await prisma.enquirySubmission.update({
    where: { id: parsed.data.id },
    data: {
      status: parsed.data.status,
      adminNotes: parsed.data.adminNotes ?? existing.adminNotes,
    },
  });

  await recordAuditEvent({
    userId: user.id,
    action: "ENQUIRY_STATUS_UPDATED",
    entityType: "EnquirySubmission",
    entityId: updated.id,
    metadata: {
      previousStatus: existing.status,
      newStatus: updated.status,
      adminNotes: updated.adminNotes,
    },
  });

  revalidateAdmissions();
  return { success: true, data: updated };
}

export async function deleteEnquiry(id: string): Promise<ActionResponse<void>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const existing = await prisma.enquirySubmission.findUnique({
    where: { id },
  });
  if (!existing) {
    return { success: false, error: "Enquiry submission not found." };
  }

  await prisma.enquirySubmission.delete({
    where: { id },
  });

  await recordAuditEvent({
    userId: user.id,
    action: "ENQUIRY_DELETED",
    entityType: "EnquirySubmission",
    entityId: id,
    metadata: {
      studentName: existing.studentName,
      grade: existing.grade,
      status: existing.status,
    },
  });

  revalidateAdmissions();
  return { success: true };
}

// ==========================================
// ADMISSION STEPS (SUPER_ADMIN)
// ==========================================

export async function createAdmissionStep(
  input: unknown
): Promise<ActionResponse<AdmissionStep>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const parsed = admissionStepSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed for admission step.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const step = await prisma.admissionStep.create({
    data: parsed.data,
  });

  await recordAuditEvent({
    userId: user.id,
    action: "ADMISSION_STEP_CREATED",
    entityType: "AdmissionStep",
    entityId: step.id,
    metadata: {
      stepNumber: step.stepNumber,
      title: step.title,
    },
  });

  revalidateAdmissions();
  return { success: true, data: step };
}

export async function updateAdmissionStep(
  id: string,
  input: unknown
): Promise<ActionResponse<AdmissionStep>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const parsed = admissionStepSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed for admission step.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await prisma.admissionStep.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, error: "Admission step not found." };
  }

  const updated = await prisma.admissionStep.update({
    where: { id },
    data: parsed.data,
  });

  await recordAuditEvent({
    userId: user.id,
    action: "ADMISSION_STEP_UPDATED",
    entityType: "AdmissionStep",
    entityId: updated.id,
    metadata: {
      stepNumber: updated.stepNumber,
      title: updated.title,
    },
  });

  revalidateAdmissions();
  return { success: true, data: updated };
}

export async function deleteAdmissionStep(
  id: string
): Promise<ActionResponse<void>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const existing = await prisma.admissionStep.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, error: "Admission step not found." };
  }

  await prisma.admissionStep.delete({ where: { id } });

  await recordAuditEvent({
    userId: user.id,
    action: "ADMISSION_STEP_DELETED",
    entityType: "AdmissionStep",
    entityId: id,
    metadata: {
      stepNumber: existing.stepNumber,
      title: existing.title,
    },
  });

  revalidateAdmissions();
  return { success: true };
}

export async function toggleAdmissionStepPublish(
  id: string
): Promise<ActionResponse<AdmissionStep>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const existing = await prisma.admissionStep.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, error: "Admission step not found." };
  }

  const updated = await prisma.admissionStep.update({
    where: { id },
    data: { isPublished: !existing.isPublished },
  });

  await recordAuditEvent({
    userId: user.id,
    action: "ADMISSION_STEP_STATUS_CHANGED",
    entityType: "AdmissionStep",
    entityId: updated.id,
    metadata: {
      stepNumber: updated.stepNumber,
      isPublished: updated.isPublished,
    },
  });

  revalidateAdmissions();
  return { success: true, data: updated };
}

export async function reorderAdmissionSteps(
  items: unknown
): Promise<ActionResponse<void>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const parsed = reorderItemsSchema.safeParse(items);
  if (!parsed.success) {
    return { success: false, error: "Invalid reorder payload." };
  }

  await prisma.$transaction(
    parsed.data.map((item) =>
      prisma.admissionStep.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      })
    )
  );

  await recordAuditEvent({
    userId: user.id,
    action: "ADMISSION_STEPS_REORDERED",
    entityType: "AdmissionStep",
    entityId: "batch",
    metadata: { count: parsed.data.length },
  });

  revalidateAdmissions();
  return { success: true };
}

// ==========================================
// ADMISSION ELIGIBILITY CRITERIA (SUPER_ADMIN)
// ==========================================

export async function createAdmissionEligibility(
  input: unknown
): Promise<ActionResponse<AdmissionEligibilityCriteria>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const parsed = admissionEligibilityCriteriaSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed for eligibility criteria.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const created = await prisma.admissionEligibilityCriteria.create({
    data: parsed.data,
  });

  await recordAuditEvent({
    userId: user.id,
    action: "ADMISSION_ELIGIBILITY_CREATED",
    entityType: "AdmissionEligibilityCriteria",
    entityId: created.id,
    metadata: {
      classGrade: created.classGrade,
      ageRequirement: created.ageRequirement,
    },
  });

  revalidateAdmissions();
  return { success: true, data: created };
}

export async function updateAdmissionEligibility(
  id: string,
  input: unknown
): Promise<ActionResponse<AdmissionEligibilityCriteria>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const parsed = admissionEligibilityCriteriaSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed for eligibility criteria.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await prisma.admissionEligibilityCriteria.findUnique({
    where: { id },
  });
  if (!existing) {
    return { success: false, error: "Eligibility criteria not found." };
  }

  const updated = await prisma.admissionEligibilityCriteria.update({
    where: { id },
    data: parsed.data,
  });

  await recordAuditEvent({
    userId: user.id,
    action: "ADMISSION_ELIGIBILITY_UPDATED",
    entityType: "AdmissionEligibilityCriteria",
    entityId: updated.id,
    metadata: {
      classGrade: updated.classGrade,
      ageRequirement: updated.ageRequirement,
    },
  });

  revalidateAdmissions();
  return { success: true, data: updated };
}

export async function deleteAdmissionEligibility(
  id: string
): Promise<ActionResponse<void>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const existing = await prisma.admissionEligibilityCriteria.findUnique({
    where: { id },
  });
  if (!existing) {
    return { success: false, error: "Eligibility criteria not found." };
  }

  await prisma.admissionEligibilityCriteria.delete({ where: { id } });

  await recordAuditEvent({
    userId: user.id,
    action: "ADMISSION_ELIGIBILITY_DELETED",
    entityType: "AdmissionEligibilityCriteria",
    entityId: id,
    metadata: {
      classGrade: existing.classGrade,
    },
  });

  revalidateAdmissions();
  return { success: true };
}

export async function toggleAdmissionEligibilityPublish(
  id: string
): Promise<ActionResponse<AdmissionEligibilityCriteria>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const existing = await prisma.admissionEligibilityCriteria.findUnique({
    where: { id },
  });
  if (!existing) {
    return { success: false, error: "Eligibility criteria not found." };
  }

  const updated = await prisma.admissionEligibilityCriteria.update({
    where: { id },
    data: { isPublished: !existing.isPublished },
  });

  await recordAuditEvent({
    userId: user.id,
    action: "ADMISSION_ELIGIBILITY_STATUS_CHANGED",
    entityType: "AdmissionEligibilityCriteria",
    entityId: updated.id,
    metadata: {
      classGrade: updated.classGrade,
      isPublished: updated.isPublished,
    },
  });

  revalidateAdmissions();
  return { success: true, data: updated };
}

export async function reorderAdmissionEligibility(
  items: unknown
): Promise<ActionResponse<void>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const parsed = reorderItemsSchema.safeParse(items);
  if (!parsed.success) {
    return { success: false, error: "Invalid reorder payload." };
  }

  await prisma.$transaction(
    parsed.data.map((item) =>
      prisma.admissionEligibilityCriteria.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      })
    )
  );

  await recordAuditEvent({
    userId: user.id,
    action: "ADMISSION_ELIGIBILITY_REORDERED",
    entityType: "AdmissionEligibilityCriteria",
    entityId: "batch",
    metadata: { count: parsed.data.length },
  });

  revalidateAdmissions();
  return { success: true };
}

// ==========================================
// ADMISSION DOCUMENT REQUIREMENTS (SUPER_ADMIN)
// ==========================================

export async function createAdmissionDocumentRequirement(
  input: unknown
): Promise<ActionResponse<AdmissionDocumentRequirement>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const parsed = admissionDocumentRequirementSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed for document requirement.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const created = await prisma.admissionDocumentRequirement.create({
    data: parsed.data,
  });

  await recordAuditEvent({
    userId: user.id,
    action: "ADMISSION_DOC_REQ_CREATED",
    entityType: "AdmissionDocumentRequirement",
    entityId: created.id,
    metadata: {
      title: created.title,
    },
  });

  revalidateAdmissions();
  return { success: true, data: created };
}

export async function updateAdmissionDocumentRequirement(
  id: string,
  input: unknown
): Promise<ActionResponse<AdmissionDocumentRequirement>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const parsed = admissionDocumentRequirementSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed for document requirement.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await prisma.admissionDocumentRequirement.findUnique({
    where: { id },
  });
  if (!existing) {
    return { success: false, error: "Document requirement not found." };
  }

  const updated = await prisma.admissionDocumentRequirement.update({
    where: { id },
    data: parsed.data,
  });

  await recordAuditEvent({
    userId: user.id,
    action: "ADMISSION_DOC_REQ_UPDATED",
    entityType: "AdmissionDocumentRequirement",
    entityId: updated.id,
    metadata: {
      title: updated.title,
    },
  });

  revalidateAdmissions();
  return { success: true, data: updated };
}

export async function deleteAdmissionDocumentRequirement(
  id: string
): Promise<ActionResponse<void>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const existing = await prisma.admissionDocumentRequirement.findUnique({
    where: { id },
  });
  if (!existing) {
    return { success: false, error: "Document requirement not found." };
  }

  await prisma.admissionDocumentRequirement.delete({ where: { id } });

  await recordAuditEvent({
    userId: user.id,
    action: "ADMISSION_DOC_REQ_DELETED",
    entityType: "AdmissionDocumentRequirement",
    entityId: id,
    metadata: {
      title: existing.title,
    },
  });

  revalidateAdmissions();
  return { success: true };
}

export async function toggleAdmissionDocumentRequirementPublish(
  id: string
): Promise<ActionResponse<AdmissionDocumentRequirement>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const existing = await prisma.admissionDocumentRequirement.findUnique({
    where: { id },
  });
  if (!existing) {
    return { success: false, error: "Document requirement not found." };
  }

  const updated = await prisma.admissionDocumentRequirement.update({
    where: { id },
    data: { isPublished: !existing.isPublished },
  });

  await recordAuditEvent({
    userId: user.id,
    action: "ADMISSION_DOC_REQ_STATUS_CHANGED",
    entityType: "AdmissionDocumentRequirement",
    entityId: updated.id,
    metadata: {
      title: updated.title,
      isPublished: updated.isPublished,
    },
  });

  revalidateAdmissions();
  return { success: true, data: updated };
}

export async function reorderAdmissionDocumentRequirements(
  items: unknown
): Promise<ActionResponse<void>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const parsed = reorderItemsSchema.safeParse(items);
  if (!parsed.success) {
    return { success: false, error: "Invalid reorder payload." };
  }

  await prisma.$transaction(
    parsed.data.map((item) =>
      prisma.admissionDocumentRequirement.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      })
    )
  );

  await recordAuditEvent({
    userId: user.id,
    action: "ADMISSION_DOC_REQS_REORDERED",
    entityType: "AdmissionDocumentRequirement",
    entityId: "batch",
    metadata: { count: parsed.data.length },
  });

  revalidateAdmissions();
  return { success: true };
}

// ==========================================
// ADMISSION FAQS (SUPER_ADMIN)
// ==========================================

export async function createAdmissionFaq(
  input: unknown
): Promise<ActionResponse<AdmissionFaq>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const parsed = admissionFaqSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed for FAQ.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const created = await prisma.admissionFaq.create({
    data: parsed.data,
  });

  await recordAuditEvent({
    userId: user.id,
    action: "ADMISSION_FAQ_CREATED",
    entityType: "AdmissionFaq",
    entityId: created.id,
    metadata: {
      question: created.question,
    },
  });

  revalidateAdmissions();
  return { success: true, data: created };
}

export async function updateAdmissionFaq(
  id: string,
  input: unknown
): Promise<ActionResponse<AdmissionFaq>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const parsed = admissionFaqSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed for FAQ.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const existing = await prisma.admissionFaq.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, error: "FAQ not found." };
  }

  const updated = await prisma.admissionFaq.update({
    where: { id },
    data: parsed.data,
  });

  await recordAuditEvent({
    userId: user.id,
    action: "ADMISSION_FAQ_UPDATED",
    entityType: "AdmissionFaq",
    entityId: updated.id,
    metadata: {
      question: updated.question,
    },
  });

  revalidateAdmissions();
  return { success: true, data: updated };
}

export async function deleteAdmissionFaq(
  id: string
): Promise<ActionResponse<void>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const existing = await prisma.admissionFaq.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, error: "FAQ not found." };
  }

  await prisma.admissionFaq.delete({ where: { id } });

  await recordAuditEvent({
    userId: user.id,
    action: "ADMISSION_FAQ_DELETED",
    entityType: "AdmissionFaq",
    entityId: id,
    metadata: {
      question: existing.question,
    },
  });

  revalidateAdmissions();
  return { success: true };
}

export async function toggleAdmissionFaqPublish(
  id: string
): Promise<ActionResponse<AdmissionFaq>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const existing = await prisma.admissionFaq.findUnique({ where: { id } });
  if (!existing) {
    return { success: false, error: "FAQ not found." };
  }

  const updated = await prisma.admissionFaq.update({
    where: { id },
    data: { isPublished: !existing.isPublished },
  });

  await recordAuditEvent({
    userId: user.id,
    action: "ADMISSION_FAQ_STATUS_CHANGED",
    entityType: "AdmissionFaq",
    entityId: updated.id,
    metadata: {
      question: updated.question,
      isPublished: updated.isPublished,
    },
  });

  revalidateAdmissions();
  return { success: true, data: updated };
}

export async function reorderAdmissionFaqs(
  items: unknown
): Promise<ActionResponse<void>> {
  const user = await requireRole(["SUPER_ADMIN"]);
  const parsed = reorderItemsSchema.safeParse(items);
  if (!parsed.success) {
    return { success: false, error: "Invalid reorder payload." };
  }

  await prisma.$transaction(
    parsed.data.map((item) =>
      prisma.admissionFaq.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      })
    )
  );

  await recordAuditEvent({
    userId: user.id,
    action: "ADMISSION_FAQS_REORDERED",
    entityType: "AdmissionFaq",
    entityId: "batch",
    metadata: { count: parsed.data.length },
  });

  revalidateAdmissions();
  return { success: true };
}
