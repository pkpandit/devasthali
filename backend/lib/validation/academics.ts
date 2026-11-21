import { z } from "zod";

export const ALLOWED_ACADEMIC_STREAM_ICONS = [
  "FlaskConical",
  "Award",
  "BookOpen",
] as const;

export type AcademicStreamIcon = (typeof ALLOWED_ACADEMIC_STREAM_ICONS)[number];

export function parseMultilineList(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((line) => line.length > 0);
  }
  if (typeof val === "string") {
    return val
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }
  return [];
}

export function isValidInternalPathOrHttpsUrl(val: string | null | undefined): boolean {
  if (!val || val.trim() === "") return false;
  const trimmed = val.trim();
  if (trimmed.startsWith("/")) {
    // Relative internal path (disallow javascript:, protocol-relative //, etc.)
    return !trimmed.startsWith("//") && !trimmed.toLowerCase().startsWith("/javascript:");
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// ==========================================
// ACADEMIC WING SCHEMAS
// ==========================================

export const academicWingCreateSchema = z.object({
  stageBadge: z.string().trim().min(2, "Stage badge is required (min 2 chars)").max(100),
  title: z.string().trim().min(2, "Title is required (min 2 chars)").max(150),
  description: z.string().trim().min(5, "Description is required (min 5 chars)").max(1000),
  highlights: z
    .preprocess(parseMultilineList, z.array(z.string().max(200, "Highlight cannot exceed 200 chars")).max(10, "Maximum 10 highlights allowed"))
    .default([]),
  displayOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const academicWingUpdateSchema = academicWingCreateSchema.partial().extend({
  id: z.string().min(1, "Wing ID is required"),
});

export const reorderAcademicWingsSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1, "At least one ID required for reordering"),
});

export const toggleAcademicWingStatusSchema = z.object({
  id: z.string().min(1, "Wing ID is required"),
});

export const deleteAcademicWingSchema = z.object({
  id: z.string().min(1, "Wing ID is required"),
});

// ==========================================
// ACADEMIC STREAM SCHEMAS
// ==========================================

export const academicStreamCreateSchema = z.object({
  title: z.string().trim().min(2, "Title is required (min 2 chars)").max(100),
  iconName: z.enum(ALLOWED_ACADEMIC_STREAM_ICONS, {
    message: "Icon must be one of FlaskConical, Award, or BookOpen",
  }),
  subjects: z
    .preprocess(parseMultilineList, z.array(z.string().max(150, "Subject name cannot exceed 150 chars")).max(10, "Maximum 10 subjects allowed"))
    .default([]),
  careerHighlight: z.string().trim().min(2, "Career highlight note is required (min 2 chars)").max(150),
  displayOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const academicStreamUpdateSchema = academicStreamCreateSchema.partial().extend({
  id: z.string().min(1, "Stream ID is required"),
});

export const reorderAcademicStreamsSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1, "At least one ID required for reordering"),
});

export const toggleAcademicStreamStatusSchema = z.object({
  id: z.string().min(1, "Stream ID is required"),
});

export const deleteAcademicStreamSchema = z.object({
  id: z.string().min(1, "Stream ID is required"),
});

// ==========================================
// ACADEMIC ASSESSMENT RULE SCHEMAS
// ==========================================

export const academicAssessmentRuleCreateSchema = z.object({
  ruleText: z.string().trim().min(5, "Rule text is required (min 5 chars)").max(1000),
  displayOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const academicAssessmentRuleUpdateSchema = academicAssessmentRuleCreateSchema.partial().extend({
  id: z.string().min(1, "Rule ID is required"),
});

export const reorderAcademicAssessmentRulesSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1, "At least one ID required for reordering"),
});

export const toggleAcademicAssessmentRuleStatusSchema = z.object({
  id: z.string().min(1, "Rule ID is required"),
});

export const deleteAcademicAssessmentRuleSchema = z.object({
  id: z.string().min(1, "Rule ID is required"),
});

// ==========================================
// ACADEMIC OVERVIEW SCHEMA
// ==========================================

export const academicOverviewUpdateSchema = z
  .object({
    heroBadge: z.string().trim().max(100).nullable().optional(),
    heroImage: z.string().trim().max(500).nullable().optional(),
    heroImageAlt: z.string().trim().max(255).nullable().optional(),
    heroImageStorageKey: z.string().trim().max(255).nullable().optional(),
    competitiveBadge: z.string().trim().max(100).nullable().optional(),
    competitiveTitle: z.string().trim().max(150).nullable().optional(),
    competitiveDescription: z.string().trim().max(1000).nullable().optional(),
    competitiveCtaText: z.string().trim().max(100).nullable().optional(),
    competitiveCtaHref: z
      .string()
      .trim()
      .max(255)
      .refine(
        (val) => !val || isValidInternalPathOrHttpsUrl(val),
        "CTA URL must be a valid internal path (starting with /) or secure HTTPS link"
      )
      .nullable()
      .optional(),
    assessmentParentNotice: z.string().trim().max(1000).nullable().optional(),
    assessmentProspectusNotice: z.string().trim().max(1000).nullable().optional(),
    assessmentProspectusUrl: z
      .string()
      .trim()
      .max(255)
      .refine(
        (val) => !val || isValidInternalPathOrHttpsUrl(val),
        "Prospectus URL must be a valid internal path (starting with /) or secure HTTPS link"
      )
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      // If heroImage is present and non-empty, heroImageAlt must be at least 5 chars
      if (data.heroImage && data.heroImage.trim() !== "") {
        return Boolean(data.heroImageAlt && data.heroImageAlt.trim().length >= 5);
      }
      return true;
    },
    {
      message: "Meaningful alt text (at least 5 characters) is required whenever a hero image is set",
      path: ["heroImageAlt"],
    }
  );

// ==========================================
// DIFF HELPERS FOR AUDIT LOGGING
// ==========================================

export function computeAcademicDiff(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of Object.keys(newData)) {
    const oldVal = oldData[key];
    const newVal = newData[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff[key] = { from: oldVal ?? null, to: newVal ?? null };
    }
  }
  return diff;
}
