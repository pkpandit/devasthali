import { z } from "zod";

/**
 * Validates document URLs against approved static document paths.
 * Enforces:
 * 1. Must start with /documents/ (or /documents/original/)
 * 2. Must end with .pdf (case-insensitive)
 * 3. Prohibits path traversal (..), protocol injection, control chars, and backslashes
 */
export function isValidDocumentUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();

  // Strict path traversal and injection guards
  if (
    trimmed.includes("..") ||
    trimmed.includes("\\") ||
    trimmed.includes("\0") ||
    trimmed.includes("://") ||
    trimmed.startsWith("//")
  ) {
    return false;
  }

  // Must start with /documents/ and end with .pdf
  const pdfRegex = /^\/documents\/(?:[a-zA-Z0-9_\-]+\/)*[a-zA-Z0-9_\-\.]+\.pdf$/i;
  return pdfRegex.test(trimmed);
}

/**
 * Validates image URLs for scanned fee structure pages.
 * Enforces:
 * 1. Must start with /images/
 * 2. Must end with allowed raster image extensions (.jpg, .jpeg, .png, .webp)
 * 3. Prohibits path traversal, protocol injection, control chars, and backslashes
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();

  if (
    trimmed.includes("..") ||
    trimmed.includes("\\") ||
    trimmed.includes("\0") ||
    trimmed.includes("://") ||
    trimmed.startsWith("//")
  ) {
    return false;
  }

  const imgRegex = /^\/images\/(?:[a-zA-Z0-9_\-]+\/)*[a-zA-Z0-9_\-\.]+\.(?:jpg|jpeg|png|webp)$/i;
  return imgRegex.test(trimmed);
}

// ==========================================
// ADMISSION OVERVIEW SCHEMAS
// ==========================================

export const admissionOverviewUpdateSchema = z.object({
  sessionLabel: z
    .string()
    .trim()
    .min(1, "Session label is required")
    .max(50, "Session label too long"),
  feeStructureTitle: z
    .string()
    .trim()
    .min(1, "Fee structure title is required")
    .max(200, "Fee structure title too long"),
  feeStructureSubtitle: z
    .string()
    .trim()
    .min(1, "Fee structure subtitle is required")
    .max(500, "Fee structure subtitle too long"),
  prospectusTitle: z
    .string()
    .trim()
    .min(1, "Prospectus title is required")
    .max(200, "Prospectus title too long"),
  prospectusDescription: z
    .string()
    .trim()
    .min(1, "Prospectus description is required")
    .max(2000, "Prospectus description too long"),
  prospectusPdfUrl: z
    .string()
    .trim()
    .refine(isValidDocumentUrl, "Must be a valid approved static PDF document path (e.g. /documents/original/prospectus-2.pdf)"),
  prospectusDisplayLabel: z
    .string()
    .trim()
    .min(1, "Prospectus display label is required")
    .max(100, "Prospectus display label too long"),
  admissionChartPdfUrl: z
    .string()
    .trim()
    .refine(isValidDocumentUrl, "Must be a valid approved static PDF document path (e.g. /documents/original/new-admission-chart-2026-27.pdf)"),
  admissionChartDisplayLabel: z
    .string()
    .trim()
    .min(1, "Admission chart display label is required")
    .max(100, "Admission chart display label too long"),
});

export type AdmissionOverviewUpdateInput = z.infer<typeof admissionOverviewUpdateSchema>;

// ==========================================
// FEE STRUCTURE PAGE SCHEMAS
// ==========================================

export const feeStructurePageCreateSchema = z.object({
  pageNumber: z
    .number({ invalid_type_error: "Page number must be a number" })
    .int("Page number must be an integer")
    .min(1, "Page number must be at least 1"),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title too long"),
  imageUrl: z
    .string()
    .trim()
    .refine(isValidImageUrl, "Must be a valid fee structure image path (e.g. /images/admissions/fees/...)"),
  displayOrder: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

export const feeStructurePageUpdateSchema = z.object({
  id: z.string().min(1, "Page ID is required"),
  pageNumber: z
    .number({ invalid_type_error: "Page number must be a number" })
    .int("Page number must be an integer")
    .min(1, "Page number must be at least 1"),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title too long"),
  imageUrl: z
    .string()
    .trim()
    .refine(isValidImageUrl, "Must be a valid fee structure image path (e.g. /images/admissions/fees/...)"),
  displayOrder: z.number().int().min(0),
  isPublished: z.boolean(),
});

export const feeStructurePageDeleteSchema = z.object({
  id: z.string().min(1, "Page ID is required"),
});

export const feeStructurePagesReorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1, "Item ID is required"),
        displayOrder: z.number().int().min(0, "Display order must be non-negative"),
      })
    )
    .min(1, "At least one item is required to reorder"),
});

export const feeStructurePageToggleSchema = z.object({
  id: z.string().min(1, "Page ID is required"),
  isPublished: z.boolean(),
});

export type FeeStructurePageCreateInput = z.infer<typeof feeStructurePageCreateSchema>;
export type FeeStructurePageUpdateInput = z.infer<typeof feeStructurePageUpdateSchema>;

// ==========================================
// ADMISSION PROCEDURE RULE SCHEMAS
// ==========================================

export const admissionProcedureRuleCreateSchema = z.object({
  ruleText: z
    .string()
    .trim()
    .min(3, "Rule text must be at least 3 characters")
    .max(2000, "Rule text too long"),
  displayOrder: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

export const admissionProcedureRuleUpdateSchema = z.object({
  id: z.string().min(1, "Rule ID is required"),
  ruleText: z
    .string()
    .trim()
    .min(3, "Rule text must be at least 3 characters")
    .max(2000, "Rule text too long"),
  displayOrder: z.number().int().min(0),
  isPublished: z.boolean(),
});

export const admissionProcedureRuleDeleteSchema = z.object({
  id: z.string().min(1, "Rule ID is required"),
});

export const admissionProcedureRulesReorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1, "Item ID is required"),
        displayOrder: z.number().int().min(0, "Display order must be non-negative"),
      })
    )
    .min(1, "At least one item is required to reorder"),
});

export const admissionProcedureRuleToggleSchema = z.object({
  id: z.string().min(1, "Rule ID is required"),
  isPublished: z.boolean(),
});

export type AdmissionProcedureRuleCreateInput = z.infer<typeof admissionProcedureRuleCreateSchema>;
export type AdmissionProcedureRuleUpdateInput = z.infer<typeof admissionProcedureRuleUpdateSchema>;

// ==========================================
// ENTRANCE EXAM SUBJECT SCHEMAS
// ==========================================

export const entranceExamSubjectCreateSchema = z.object({
  classGrade: z
    .string()
    .trim()
    .min(1, "Class/Group is required")
    .max(100, "Class/Group too long"),
  subjects: z
    .string()
    .trim()
    .min(1, "Subjects are required")
    .max(255, "Subjects too long"),
  displayOrder: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

export const entranceExamSubjectUpdateSchema = z.object({
  id: z.string().min(1, "Subject entry ID is required"),
  classGrade: z
    .string()
    .trim()
    .min(1, "Class/Group is required")
    .max(100, "Class/Group too long"),
  subjects: z
    .string()
    .trim()
    .min(1, "Subjects are required")
    .max(255, "Subjects too long"),
  displayOrder: z.number().int().min(0),
  isPublished: z.boolean(),
});

export const entranceExamSubjectDeleteSchema = z.object({
  id: z.string().min(1, "Subject entry ID is required"),
});

export const entranceExamSubjectsReorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1, "Item ID is required"),
        displayOrder: z.number().int().min(0, "Display order must be non-negative"),
      })
    )
    .min(1, "At least one item is required to reorder"),
});

export const entranceExamSubjectToggleSchema = z.object({
  id: z.string().min(1, "Subject entry ID is required"),
  isPublished: z.boolean(),
});

export type EntranceExamSubjectCreateInput = z.infer<typeof entranceExamSubjectCreateSchema>;
export type EntranceExamSubjectUpdateInput = z.infer<typeof entranceExamSubjectUpdateSchema>;
