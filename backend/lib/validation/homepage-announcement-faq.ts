import { z } from "zod";

/**
 * Approved internal relative paths for Announcement CTA URLs.
 * Restricted to approved application routes (/alumni, /admissions, /contact, /notices, /facilities).
 */
export const APPROVED_ANNOUNCEMENT_CTA_PATHS = [
  "/alumni",
  "/admissions",
  "/contact",
  "/notices",
  "/facilities",
];

/**
 * Validates that an Announcement image URL is a safe, approved relative static asset path.
 * Must match /images/announcements/*.webp|jpg|jpeg|png and disallow path traversal / null bytes.
 */
export function isValidAnnouncementImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;

  const trimmed = url.trim();

  // Must begin with /images/announcements/
  if (!trimmed.startsWith("/images/announcements/")) return false;

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
  return /^\/images\/announcements\/[a-zA-Z0-9_\-\.]+\.(webp|jpg|jpeg|png)$/i.test(trimmed);
}

/**
 * Validates that an Announcement CTA URL is a safe, approved relative internal path.
 * Disallows protocol schemes, protocol-relative '//', backslashes, directory traversal,
 * query/hash injection attacks, and control/null characters.
 */
export function isValidAnnouncementCtaUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;

  const trimmed = url.trim();

  // Must begin with a single slash and not '//'
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

  // Strip query and hash to validate target base path
  const basePath = trimmed.split("?")[0].split("#")[0];

  // Must be in approved paths list
  return APPROVED_ANNOUNCEMENT_CTA_PATHS.includes(basePath);
}

// ==========================================
// HOMEPAGE ANNOUNCEMENT SCHEMAS
// ==========================================

export const homepageAnnouncementUpdateSchema = z.object({
  enabled: z.boolean(),
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title is required")
    .max(150, "Title cannot exceed 150 characters"),
  badge: z
    .string()
    .trim()
    .max(50, "Badge cannot exceed 50 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  subtitle: z
    .string()
    .trim()
    .max(200, "Subtitle cannot exceed 200 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  imageUrl: z
    .string({ required_error: "Image URL is required" })
    .trim()
    .min(1, "Image URL is required")
    .max(500, "Image URL cannot exceed 500 characters")
    .refine(isValidAnnouncementImageUrl, {
      message:
        "Image URL must be an approved static announcement asset path (e.g. /images/announcements/*.webp)",
    }),
  imageAlt: z
    .string({ required_error: "Image alt text is required" })
    .trim()
    .min(1, "Image alt text is required")
    .max(255, "Image alt text cannot exceed 255 characters"),
  linkHref: z
    .string({ required_error: "Link target is required" })
    .trim()
    .min(1, "Link target is required")
    .max(255, "Link target cannot exceed 255 characters")
    .refine(isValidAnnouncementCtaUrl, {
      message:
        "Link target must be an approved internal path (/alumni, /admissions, /contact, /notices, /facilities)",
    }),
  linkLabel: z
    .string({ required_error: "Link label is required" })
    .trim()
    .min(1, "Link label is required")
    .max(100, "Link label cannot exceed 100 characters"),
  delayMs: z
    .number({ required_error: "Display delay is required" })
    .int("Delay must be an integer")
    .min(0, "Delay cannot be negative")
    .max(30000, "Delay cannot exceed 30,000ms (30 seconds)"),
  dismissalKey: z
    .string({ required_error: "Dismissal key is required" })
    .trim()
    .min(1, "Dismissal key is required")
    .max(100, "Dismissal key cannot exceed 100 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Dismissal key can only contain alphanumeric characters, underscores, and hyphens"
    ),
});

export type HomepageAnnouncementUpdateInput = z.infer<
  typeof homepageAnnouncementUpdateSchema
>;

// ==========================================
// HOMEPAGE FAQ SCHEMAS
// ==========================================

export const homepageFaqCreateSchema = z.object({
  question: z
    .string({ required_error: "Question is required" })
    .trim()
    .min(1, "Question is required")
    .max(300, "Question cannot exceed 300 characters"),
  answer: z
    .string({ required_error: "Answer is required" })
    .trim()
    .min(1, "Answer is required")
    .max(5000, "Answer cannot exceed 5000 characters"),
  displayOrder: z
    .number()
    .int("Display order must be an integer")
    .min(0, "Display order must be >= 0")
    .default(0),
  isPublished: z.boolean().default(true),
});

export type HomepageFaqCreateInput = z.infer<typeof homepageFaqCreateSchema>;

export const homepageFaqUpdateSchema = z.object({
  id: z.string().trim().min(1, "FAQ ID is required"),
  question: z
    .string({ required_error: "Question is required" })
    .trim()
    .min(1, "Question is required")
    .max(300, "Question cannot exceed 300 characters"),
  answer: z
    .string({ required_error: "Answer is required" })
    .trim()
    .min(1, "Answer is required")
    .max(5000, "Answer cannot exceed 5000 characters"),
  displayOrder: z
    .number()
    .int("Display order must be an integer")
    .min(0, "Display order must be >= 0")
    .optional(),
  isPublished: z.boolean().optional(),
});

export type HomepageFaqUpdateInput = z.infer<typeof homepageFaqUpdateSchema>;

export const homepageFaqDeleteSchema = z.object({
  id: z.string().trim().min(1, "FAQ ID is required"),
});

export type HomepageFaqDeleteInput = z.infer<typeof homepageFaqDeleteSchema>;

export const homepageFaqToggleSchema = z.object({
  id: z.string().trim().min(1, "FAQ ID is required"),
});

export type HomepageFaqToggleInput = z.infer<typeof homepageFaqToggleSchema>;

export const homepageFaqsReorderSchema = z.object({
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

export type HomepageFaqsReorderInput = z.infer<typeof homepageFaqsReorderSchema>;
