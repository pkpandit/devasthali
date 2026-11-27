import { z } from "zod";

/**
 * Validates that an avatar image URL is a safe, approved relative static asset path under /images/.
 * Must match /images/*.webp|jpg|jpeg|png and disallow path traversal / null bytes / external schemes.
 */
export function isValidTestimonialAvatarUrl(
  url: string | null | undefined
): boolean {
  if (!url || typeof url !== "string") return false;

  const trimmed = url.trim();

  // Must begin with /images/
  if (!trimmed.startsWith("/images/")) return false;

  // Reject traversal, backslashes, double slashes, and null characters
  if (
    trimmed.includes("..") ||
    trimmed.includes("\\") ||
    trimmed.includes("//", 1) ||
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

  // Match approved static asset pattern
  return /^\/images\/[a-zA-Z0-9_\-\/]+\.(webp|jpg|jpeg|png)$/i.test(trimmed);
}

// ==========================================
// HOMEPAGE TESTIMONIAL SCHEMAS
// ==========================================

export const homepageTestimonialCreateSchema = z.object({
  author: z
    .string()
    .trim()
    .min(1, "Author name is required")
    .max(150, "Author name cannot exceed 150 characters"),
  relationship: z
    .string()
    .trim()
    .min(1, "Relationship / role is required")
    .max(200, "Relationship cannot exceed 200 characters"),
  subject: z
    .string()
    .trim()
    .max(150, "Subject cannot exceed 150 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  quote: z
    .string()
    .trim()
    .min(1, "Quote is required")
    .max(3000, "Quote cannot exceed 3000 characters"),
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5")
    .default(5),
  avatarUrl: z
    .string()
    .trim()
    .max(500, "Avatar URL cannot exceed 500 characters")
    .refine((val) => !val || isValidTestimonialAvatarUrl(val), {
      message:
        "Avatar URL must be an approved static image path (e.g. /images/*/*.webp|jpg|png)",
    })
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  monogram: z
    .string()
    .trim()
    .min(1, "Monogram is required")
    .max(10, "Monogram cannot exceed 10 characters")
    .default("★"),
  displayOrder: z
    .number()
    .int("Display order must be an integer")
    .min(0, "Display order must be >= 0")
    .default(0),
  isPublished: z.boolean().default(true),
});

export type HomepageTestimonialCreateInput = z.infer<
  typeof homepageTestimonialCreateSchema
>;

export const homepageTestimonialUpdateSchema = z.object({
  id: z.string().trim().min(1, "Testimonial ID is required"),
  author: z
    .string()
    .trim()
    .min(1, "Author name is required")
    .max(150, "Author name cannot exceed 150 characters"),
  relationship: z
    .string()
    .trim()
    .min(1, "Relationship / role is required")
    .max(200, "Relationship cannot exceed 200 characters"),
  subject: z
    .string()
    .trim()
    .max(150, "Subject cannot exceed 150 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  quote: z
    .string()
    .trim()
    .min(1, "Quote is required")
    .max(3000, "Quote cannot exceed 3000 characters"),
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5")
    .default(5),
  avatarUrl: z
    .string()
    .trim()
    .max(500, "Avatar URL cannot exceed 500 characters")
    .refine((val) => !val || isValidTestimonialAvatarUrl(val), {
      message:
        "Avatar URL must be an approved static image path (e.g. /images/*/*.webp|jpg|png)",
    })
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  monogram: z
    .string()
    .trim()
    .min(1, "Monogram is required")
    .max(10, "Monogram cannot exceed 10 characters")
    .default("★"),
  displayOrder: z
    .number()
    .int("Display order must be an integer")
    .min(0, "Display order must be >= 0")
    .optional(),
  isPublished: z.boolean().optional(),
});

export type HomepageTestimonialUpdateInput = z.infer<
  typeof homepageTestimonialUpdateSchema
>;

export const homepageTestimonialDeleteSchema = z.object({
  id: z.string().trim().min(1, "Testimonial ID is required"),
});

export type HomepageTestimonialDeleteInput = z.infer<
  typeof homepageTestimonialDeleteSchema
>;

export const homepageTestimonialToggleSchema = z.object({
  id: z.string().trim().min(1, "Testimonial ID is required"),
});

export type HomepageTestimonialToggleInput = z.infer<
  typeof homepageTestimonialToggleSchema
>;

export const homepageTestimonialsReorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().trim().min(1, "Item ID is required"),
        displayOrder: z.number().int().min(0, "Display order must be >= 0"),
      })
    )
    .min(1, "At least one item is required for reordering")
    .refine(
      (items) => {
        const ids = new Set(items.map((i) => i.id));
        return ids.size === items.length;
      },
      { message: "Item IDs must be unique in reorder list" }
    ),
});

export type HomepageTestimonialsReorderInput = z.infer<
  typeof homepageTestimonialsReorderSchema
>;
