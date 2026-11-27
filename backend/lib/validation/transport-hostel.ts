import { z } from "zod";

/**
 * Approved internal relative paths for CTA URLs.
 * Restricted to approved application routes (/contact, /admissions, /facilities).
 */
const APPROVED_CTA_PATHS = ["/contact", "/admissions", "/facilities", "/online-admission-form"];

/**
 * Validates that a CTA URL is a safe, approved relative internal path.
 * Disallows protocol schemes, protocol-relative '//', backslashes, directory traversal,
 * query/hash injection attacks, and control/null characters.
 */
export function isValidInternalCtaUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;

  const trimmed = url.trim();

  // Must begin with a single slash
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return false;

  // Reject traversal, backslashes, and null characters
  if (
    trimmed.includes("..") ||
    trimmed.includes("\\") ||
    trimmed.includes("\0") ||
    trimmed.includes("%00") ||
    trimmed.includes("%2e%2e") ||
    trimmed.includes("%2f%2f")
  ) {
    return false;
  }

  // Reject dangerous schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.includes("javascript:") ||
    lower.includes("data:") ||
    lower.includes("vbscript:") ||
    lower.includes("http:") ||
    lower.includes("https:")
  ) {
    return false;
  }

  // Strip query and hash to validate target path
  const basePath = trimmed.split("?")[0].split("#")[0];

  // Must be in approved paths list
  return APPROVED_CTA_PATHS.includes(basePath);
}

// ==========================================
// HOSTEL SCHEMAS
// ==========================================

export const hostelSectionUpdateSchema = z.object({
  badge: z
    .string()
    .trim()
    .min(1, "Badge text is required")
    .max(100, "Badge text cannot exceed 100 characters"),
  title: z
    .string()
    .trim()
    .min(1, "Heading title is required")
    .max(200, "Heading title cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(3000, "Description cannot exceed 3000 characters"),
});

export type HostelSectionUpdateInput = z.infer<typeof hostelSectionUpdateSchema>;

export const hostelFeatureCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Feature title is required")
    .max(150, "Feature title cannot exceed 150 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Feature description is required")
    .max(2000, "Feature description cannot exceed 2000 characters"),
  displayOrder: z.number().int().min(0, "Display order must be >= 0").default(0),
  isPublished: z.boolean().default(true),
});

export type HostelFeatureCreateInput = z.infer<typeof hostelFeatureCreateSchema>;

export const hostelFeatureUpdateSchema = z.object({
  id: z.string().trim().min(1, "Feature ID is required"),
  title: z
    .string()
    .trim()
    .min(1, "Feature title is required")
    .max(150, "Feature title cannot exceed 150 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Feature description is required")
    .max(2000, "Feature description cannot exceed 2000 characters"),
  displayOrder: z.number().int().min(0, "Display order must be >= 0").optional(),
  isPublished: z.boolean().optional(),
});

export type HostelFeatureUpdateInput = z.infer<typeof hostelFeatureUpdateSchema>;

export const hostelFeatureDeleteSchema = z.object({
  id: z.string().trim().min(1, "Feature ID is required"),
});

export type HostelFeatureDeleteInput = z.infer<typeof hostelFeatureDeleteSchema>;

export const hostelFeaturesReorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().trim().min(1, "Item ID is required"),
        displayOrder: z.number().int().min(0, "Display order must be >= 0"),
      })
    )
    .min(1, "At least one item is required for reordering"),
});

export type HostelFeaturesReorderInput = z.infer<typeof hostelFeaturesReorderSchema>;

export const hostelFeatureToggleSchema = z.object({
  id: z.string().trim().min(1, "Feature ID is required"),
});

export type HostelFeatureToggleInput = z.infer<typeof hostelFeatureToggleSchema>;

// ==========================================
// TRANSPORT SCHEMAS
// ==========================================

export const transportSectionUpdateSchema = z.object({
  badge: z
    .string()
    .trim()
    .min(1, "Badge text is required")
    .max(100, "Badge text cannot exceed 100 characters"),
  title: z
    .string()
    .trim()
    .min(1, "Heading title is required")
    .max(200, "Heading title cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(3000, "Description cannot exceed 3000 characters"),
  ctaText: z
    .string()
    .trim()
    .min(1, "CTA link text is required")
    .max(150, "CTA link text cannot exceed 150 characters"),
  ctaUrl: z
    .string()
    .trim()
    .min(1, "CTA URL is required")
    .max(255, "CTA URL cannot exceed 255 characters")
    .refine(isValidInternalCtaUrl, {
      message: "CTA URL must be an approved relative internal path (e.g. /contact)",
    }),
});

export type TransportSectionUpdateInput = z.infer<typeof transportSectionUpdateSchema>;
