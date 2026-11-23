import { z } from "zod";

// ==========================================
// 1. ALUMNI OVERVIEW SCHEMAS
// ==========================================

export const alumniOverviewUpdateSchema = z.object({
  badgeText: z
    .string()
    .max(80, "Badge text cannot exceed 80 characters")
    .nullable()
    .optional(),
  title: z
    .string()
    .max(120, "Title cannot exceed 120 characters")
    .nullable()
    .optional(),
  subtitle: z
    .string()
    .max(300, "Subtitle cannot exceed 300 characters")
    .nullable()
    .optional(),
});

export type AlumniOverviewUpdateInput = z.infer<typeof alumniOverviewUpdateSchema>;

// ==========================================
// 2. ALUMNI REUNION SCHEMAS
// ==========================================

export const alumniReunionCreateSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Reunion title must be at least 3 characters")
      .max(150, "Reunion title cannot exceed 150 characters"),
    description: z
      .string()
      .trim()
      .min(10, "Reunion description must be at least 10 characters")
      .max(800, "Reunion description cannot exceed 800 characters"),
    heroImage: z
      .string()
      .trim()
      .max(500, "Hero image path cannot exceed 500 characters")
      .nullable()
      .optional(),
    heroImageAlt: z
      .string()
      .trim()
      .max(200, "Hero image alt text cannot exceed 200 characters")
      .nullable()
      .optional(),
    heroImageStorageKey: z
      .string()
      .trim()
      .max(255, "Hero image storage key cannot exceed 255 characters")
      .nullable()
      .optional(),
    eventDate: z
      .string()
      .trim()
      .max(100, "Event date cannot exceed 100 characters")
      .nullable()
      .optional(),
    displayOrder: z.number().int().min(0).default(0),
    isPublished: z.boolean().default(true),
  })
  .refine(
    (data) => {
      const hasImage = Boolean(
        (data.heroImage && data.heroImage.trim().length > 0) ||
        (data.heroImageStorageKey && data.heroImageStorageKey.trim().length > 0)
      );
      if (hasImage) {
        return Boolean(data.heroImageAlt && data.heroImageAlt.trim().length >= 3);
      }
      return true;
    },
    {
      message: "Meaningful alt text is required whenever a hero image is configured",
      path: ["heroImageAlt"],
    }
  );

export type AlumniReunionCreateInput = z.infer<typeof alumniReunionCreateSchema>;

export const alumniReunionUpdateSchema = z
  .object({
    id: z.string().trim().min(1, "Reunion ID is required"),
    title: z
      .string()
      .trim()
      .min(3, "Reunion title must be at least 3 characters")
      .max(150, "Reunion title cannot exceed 150 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .min(10, "Reunion description must be at least 10 characters")
      .max(800, "Reunion description cannot exceed 800 characters")
      .optional(),
    heroImage: z
      .string()
      .trim()
      .max(500, "Hero image path cannot exceed 500 characters")
      .nullable()
      .optional(),
    heroImageAlt: z
      .string()
      .trim()
      .max(200, "Hero image alt text cannot exceed 200 characters")
      .nullable()
      .optional(),
    heroImageStorageKey: z
      .string()
      .trim()
      .max(255, "Hero image storage key cannot exceed 255 characters")
      .nullable()
      .optional(),
    eventDate: z
      .string()
      .trim()
      .max(100, "Event date cannot exceed 100 characters")
      .nullable()
      .optional(),
    displayOrder: z.number().int().min(0).optional(),
    isPublished: z.boolean().optional(),
  })
  .refine(
    (data) => {
      const hasImage = Boolean(
        (data.heroImage && data.heroImage.trim().length > 0) ||
        (data.heroImageStorageKey && data.heroImageStorageKey.trim().length > 0)
      );
      if (hasImage) {
        return Boolean(data.heroImageAlt && data.heroImageAlt.trim().length >= 3);
      }
      return true;
    },
    {
      message: "Meaningful alt text is required whenever a hero image is configured",
      path: ["heroImageAlt"],
    }
  );

export type AlumniReunionUpdateInput = z.infer<typeof alumniReunionUpdateSchema>;

export const alumniReunionDeleteSchema = z.object({
  id: z.string().trim().min(1, "Reunion ID is required"),
});

export const toggleAlumniReunionStatusSchema = z.object({
  id: z.string().trim().min(1, "Reunion ID is required"),
  isPublished: z.boolean(),
});

export const reorderAlumniReunionsSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().trim().min(1, "Item ID is required"),
        displayOrder: z.number().int().min(0),
      })
    )
    .min(1, "At least one item is required to reorder"),
});

// ==========================================
// 3. CAREER OPPORTUNITY SCHEMAS
// ==========================================

export const careerOpportunityCreateSchema = z.object({
  badgeText: z
    .string()
    .trim()
    .max(60, "Badge text cannot exceed 60 characters")
    .default("Institutional Notice"),
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title cannot exceed 150 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(800, "Description cannot exceed 800 characters"),
  contactEmail: z
    .string()
    .trim()
    .email("A valid contact email address is required")
    .max(150, "Contact email cannot exceed 150 characters"),
  emailSubject: z
    .string()
    .trim()
    .max(150, "Email subject cannot exceed 150 characters")
    .nullable()
    .optional(),
  ctaText: z
    .string()
    .trim()
    .max(60, "CTA text cannot exceed 60 characters")
    .default("Connect via Email"),
  displayOrder: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

export type CareerOpportunityCreateInput = z.infer<typeof careerOpportunityCreateSchema>;

export const careerOpportunityUpdateSchema = z.object({
  id: z.string().trim().min(1, "Opportunity ID is required"),
  badgeText: z
    .string()
    .trim()
    .max(60, "Badge text cannot exceed 60 characters")
    .optional(),
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title cannot exceed 150 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(800, "Description cannot exceed 800 characters")
    .optional(),
  contactEmail: z
    .string()
    .trim()
    .email("A valid contact email address is required")
    .max(150, "Contact email cannot exceed 150 characters")
    .optional(),
  emailSubject: z
    .string()
    .trim()
    .max(150, "Email subject cannot exceed 150 characters")
    .nullable()
    .optional(),
  ctaText: z
    .string()
    .trim()
    .max(60, "CTA text cannot exceed 60 characters")
    .optional(),
  displayOrder: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
});

export type CareerOpportunityUpdateInput = z.infer<typeof careerOpportunityUpdateSchema>;

export const careerOpportunityDeleteSchema = z.object({
  id: z.string().trim().min(1, "Opportunity ID is required"),
});

export const toggleCareerOpportunityStatusSchema = z.object({
  id: z.string().trim().min(1, "Opportunity ID is required"),
  isPublished: z.boolean(),
});

export const reorderCareerOpportunitiesSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().trim().min(1, "Item ID is required"),
        displayOrder: z.number().int().min(0),
      })
    )
    .min(1, "At least one item is required to reorder"),
});

// ==========================================
// 4. AUDIT DIFF COMPUTATION HELPER
// ==========================================

export function computeAlumniDiff<T extends Record<string, unknown>>(
  before: T,
  after: Partial<T>
): Record<string, { before: unknown; after: unknown }> {
  const diff: Record<string, { before: unknown; after: unknown }> = {};
  for (const [key, value] of Object.entries(after)) {
    if (value !== undefined && before[key] !== value) {
      diff[key] = {
        before: before[key],
        after: value,
      };
    }
  }
  return diff;
}
