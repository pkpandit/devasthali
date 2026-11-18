import { z } from "zod";

/**
 * Validates internal paths, fragment links, and approved HTTPS URLs.
 * Rejects javascript:, data:, protocol-relative (//), unencrypted http:, spaces, and control characters.
 */
export function validateHomepageUrl(url?: string | null): { valid: boolean; error?: string } {
  if (!url || typeof url !== "string") {
    return { valid: true }; // optional URL check passes when null/undefined/empty
  }

  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return { valid: true };
  }

  // Reject control characters and whitespace
  if (/[\s\x00-\x1F\x7F]/.test(trimmed)) {
    return { valid: false, error: "URL contains invalid whitespace or control characters" };
  }

  // Reject dangerous schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return { valid: false, error: "URL scheme is not permitted for security reasons" };
  }

  // Reject protocol-relative URLs
  if (lower.startsWith("//")) {
    return { valid: false, error: "Protocol-relative URLs are not permitted" };
  }

  // Reject insecure http://
  if (lower.startsWith("http://")) {
    return { valid: false, error: "Insecure HTTP links are not permitted; please use HTTPS" };
  }

  // Allow same-page fragments (e.g. #transport)
  if (trimmed.startsWith("#")) {
    if (/^#[a-zA-Z0-9_\-]+$/.test(trimmed)) {
      return { valid: true };
    }
    return { valid: false, error: "Invalid fragment syntax; use format #section-name" };
  }

  // Allow root-relative internal paths (e.g. /admissions, /images/about/showcase.jpg, /facilities#transport)
  if (trimmed.startsWith("/")) {
    try {
      const parsed = new URL(trimmed, "https://local.internal");
      if (parsed.origin !== "https://local.internal") {
        return { valid: false, error: "Malformed internal path" };
      }
      return { valid: true };
    } catch {
      return { valid: false, error: "Malformed internal path" };
    }
  }

  // Allow approved HTTPS external URLs
  if (lower.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "https:") {
        return { valid: false, error: "Only HTTPS URLs are allowed" };
      }
      if (!parsed.hostname || parsed.hostname.length < 3 || !parsed.hostname.includes(".")) {
        return { valid: false, error: "External URL must have a valid domain hostname" };
      }
      return { valid: true };
    } catch {
      return { valid: false, error: "Malformed HTTPS URL" };
    }
  }

  return {
    valid: false,
    error: "URL must be a root-relative path (starting with '/') or a secure external link (starting with 'https://')",
  };
}

export const requiredHomepageUrlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .max(500, "URL cannot exceed 500 characters")
  .refine((val) => validateHomepageUrl(val).valid, {
    message: "Invalid URL. Must be internal (/path, /path#fragment) or secure HTTPS (https://...)",
  });

export const optionalHomepageUrlSchema = z
  .string()
  .trim()
  .max(500, "URL cannot exceed 500 characters")
  .nullable()
  .optional()
  .refine((val) => validateHomepageUrl(val).valid, {
    message: "Invalid URL. Must be internal (/path, /path#fragment) or secure HTTPS (https://...)",
  });

// ==========================================
// 1. HERO SECTION SCHEMAS
// ==========================================

export const homepageHeroSchema = z.object({
  badgeText: z.string().trim().max(120, "Badge cannot exceed 120 characters").nullable().optional(),
  heading: z.string().trim().min(1, "Heading is required").max(255, "Heading cannot exceed 255 characters"),
  highlightText: z.string().trim().max(100, "Highlight text cannot exceed 100 characters").nullable().optional(),
  subheading: z.string().trim().min(1, "Subheading is required").max(2000, "Subheading cannot exceed 2000 characters"),
  primaryCtaLabel: z.string().trim().min(1, "Primary CTA label is required").max(60, "Label cannot exceed 60 characters"),
  primaryCtaHref: requiredHomepageUrlSchema,
  secondaryCtaLabel: z.string().trim().max(60, "Secondary CTA label cannot exceed 60 characters").nullable().optional(),
  secondaryCtaHref: optionalHomepageUrlSchema,
  backgroundImageUrl: optionalHomepageUrlSchema,
  backgroundImageStorageKey: z.string().trim().max(255).nullable().optional(),
  isPublished: z.preprocess(
    (v) => (typeof v === "string" ? v === "true" || v === "1" : Boolean(v)),
    z.boolean().default(true)
  ),
});

export type HomepageHeroInput = z.infer<typeof homepageHeroSchema>;

// ==========================================
// 2. PRINCIPAL'S MESSAGE SCHEMAS
// ==========================================

export const homepagePrincipalMessageSchema = z.object({
  heading: z.string().trim().min(1, "Heading is required").max(120, "Heading cannot exceed 120 characters"),
  principalName: z.string().trim().min(1, "Principal name is required").max(120, "Name cannot exceed 120 characters"),
  principalDesignation: z.string().trim().min(1, "Designation is required").max(120, "Designation cannot exceed 120 characters"),
  quote: z.string().trim().min(1, "Quote is required").max(500, "Quote cannot exceed 500 characters"),
  excerpt: z.string().trim().min(1, "Excerpt is required").max(2000, "Excerpt cannot exceed 2000 characters"),
  imageUrl: optionalHomepageUrlSchema,
  imageStorageKey: z.string().trim().max(255).nullable().optional(),
  ctaLabel: z.string().trim().max(60, "CTA label cannot exceed 60 characters").nullable().optional(),
  ctaHref: optionalHomepageUrlSchema,
  isPublished: z.preprocess(
    (v) => (typeof v === "string" ? v === "true" || v === "1" : Boolean(v)),
    z.boolean().default(true)
  ),
});

export type HomepagePrincipalMessageInput = z.infer<typeof homepagePrincipalMessageSchema>;

// ==========================================
// 3. STATISTICS SCHEMAS
// ==========================================

export const homepageStatisticCreateSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(120, "Label cannot exceed 120 characters"),
  numericValue: z.string().trim().min(1, "Numeric value is required").max(40, "Value cannot exceed 40 characters"),
  suffix: z.string().trim().max(20, "Suffix cannot exceed 20 characters").nullable().optional(),
  subtext: z.string().trim().max(120, "Subtext cannot exceed 120 characters").nullable().optional(),
  badge: z.string().trim().max(40, "Badge cannot exceed 40 characters").nullable().optional(),
  iconName: z.string().trim().max(60, "Icon name cannot exceed 60 characters").nullable().optional(),
  imageUrl: optionalHomepageUrlSchema,
  imageStorageKey: z.string().trim().max(255).nullable().optional(),
  displayOrder: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
    z.number().int().min(0, "Display order must be non-negative").default(0)
  ),
  isPublished: z.preprocess(
    (v) => (typeof v === "string" ? v === "true" || v === "1" : Boolean(v)),
    z.boolean().default(true)
  ),
});

export type HomepageStatisticCreateInput = z.infer<typeof homepageStatisticCreateSchema>;

export const homepageStatisticUpdateSchema = homepageStatisticCreateSchema.extend({
  id: z.string().trim().min(1, "Statistic ID is required for updating"),
});

export type HomepageStatisticUpdateInput = z.infer<typeof homepageStatisticUpdateSchema>;

export const homepageStatisticDeleteSchema = z.object({
  id: z.string().trim().min(1, "Statistic ID is required for deletion"),
});

export const homepageStatisticToggleSchema = z.object({
  id: z.string().trim().min(1, "Statistic ID is required"),
  isPublished: z.boolean(),
});

export const homepageStatisticReorderSchema = z.object({
  statistics: z.array(
    z.object({
      id: z.string().trim().min(1),
      displayOrder: z.number().int().min(0),
    })
  ).min(1, "At least one statistic must be supplied for reordering"),
});

// ==========================================
// 4. HIGHLIGHTS SCHEMAS
// ==========================================

export const homepageHighlightCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title cannot exceed 120 characters"),
  description: z.string().trim().min(1, "Description is required").max(255, "Description cannot exceed 255 characters"),
  badge: z.string().trim().max(40, "Badge cannot exceed 40 characters").nullable().optional(),
  iconName: z.string().trim().max(60, "Icon name cannot exceed 60 characters").nullable().optional(),
  imageUrl: optionalHomepageUrlSchema,
  imageStorageKey: z.string().trim().max(255).nullable().optional(),
  ctaLabel: z.string().trim().min(1, "CTA label is required").max(60, "CTA label cannot exceed 60 characters"),
  ctaHref: requiredHomepageUrlSchema,
  displayOrder: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
    z.number().int().min(0, "Display order must be non-negative").default(0)
  ),
  isPublished: z.preprocess(
    (v) => (typeof v === "string" ? v === "true" || v === "1" : Boolean(v)),
    z.boolean().default(true)
  ),
});

export type HomepageHighlightCreateInput = z.infer<typeof homepageHighlightCreateSchema>;

export const homepageHighlightUpdateSchema = homepageHighlightCreateSchema.extend({
  id: z.string().trim().min(1, "Highlight ID is required for updating"),
});

export type HomepageHighlightUpdateInput = z.infer<typeof homepageHighlightUpdateSchema>;

export const homepageHighlightDeleteSchema = z.object({
  id: z.string().trim().min(1, "Highlight ID is required for deletion"),
});

export const homepageHighlightToggleSchema = z.object({
  id: z.string().trim().min(1, "Highlight ID is required"),
  isPublished: z.boolean(),
});

export const homepageHighlightReorderSchema = z.object({
  highlights: z.array(
    z.object({
      id: z.string().trim().min(1),
      displayOrder: z.number().int().min(0),
    })
  ).min(1, "At least one highlight must be supplied for reordering"),
});

// ==========================================
// 5. NORMALIZER & DIFF COMPUTATION HELPERS
// ==========================================

/**
 * Normalizes empty strings to null for database clean persistence.
 * Supports both FormData and plain object payloads.
 */
export function normalizeHomepagePayload(
  raw: FormData | Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (!raw) return result;

  if (typeof FormData !== "undefined" && raw instanceof FormData) {
    for (const [key, val] of raw.entries()) {
      if (typeof val === "string") {
        const trimmed = val.trim();
        result[key] = trimmed === "" ? null : trimmed;
      } else {
        result[key] = val;
      }
    }
  } else if (typeof raw === "object") {
    for (const [key, val] of Object.entries(raw)) {
      if (typeof val === "string") {
        const trimmed = val.trim();
        result[key] = trimmed === "" ? null : trimmed;
      } else {
        result[key] = val;
      }
    }
  }
  return result;
}

/**
 * Computes changed field diff for Homepage audit logs.
 */
export function computeHomepageDiff(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of Object.keys(newData)) {
    if (key === "updatedAt" || key === "createdAt" || key === "id") continue;
    const oldVal = oldData[key] ?? null;
    const newVal = newData[key] ?? null;
    if (oldVal !== newVal) {
      if (
        key === "backgroundImageUrl" ||
        key === "backgroundImageStorageKey" ||
        key === "imageUrl" ||
        key === "imageStorageKey"
      ) {
        diff[key] = {
          from: oldVal ? "[PRESENT]" : "[NONE]",
          to: newVal ? "[PRESENT]" : "[NONE]",
        };
      } else {
        diff[key] = { from: oldVal, to: newVal };
      }
    }
  }
  return diff;
}

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "root";
    if (!formatted[path]) {
      formatted[path] = issue.message;
    }
  }
  return formatted;
}
