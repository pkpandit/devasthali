import { z } from "zod";

/**
 * Validates internal paths and approved HTTPS URLs for event links and cover images.
 * Rejects javascript:, data:, protocol-relative (//), unencrypted http:, spaces, and control characters.
 */
export function validateEventUrl(url?: string | null): { valid: boolean; error?: string } {
  if (!url || typeof url !== "string") {
    return { valid: true };
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

  // Allow root-relative internal paths (e.g. /notices, /events/debate, /images/events/...)
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

export const optionalEventUrlSchema = z
  .string()
  .trim()
  .max(500, "URL cannot exceed 500 characters")
  .nullable()
  .optional()
  .refine((val) => validateEventUrl(val).valid, {
    message: "Invalid URL. Must be internal (/path) or secure HTTPS (https://...)",
  });

/**
 * Text safety: rejects raw HTML tags and dangerous script content.
 */
function isSafePlainText(val?: string | null): boolean {
  if (!val) return true;
  return !/<[^>]+>/.test(val);
}

// ==========================================
// SCHOOL EVENT SCHEMAS
// ==========================================

export const schoolEventBaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Event title is required")
    .max(150, "Event title cannot exceed 150 characters")
    .refine(isSafePlainText, { message: "HTML tags are not permitted in event title" }),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(2000, "Description cannot exceed 2000 characters")
    .refine(isSafePlainText, { message: "HTML tags are not permitted in description" }),
  eventDate: z
    .string()
    .trim()
    .min(1, "Display date is required")
    .max(80, "Display date cannot exceed 80 characters")
    .refine(isSafePlainText, { message: "HTML tags are not permitted in event date" }),
  isoDate: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v instanceof Date ? v.toISOString().split("T")[0] : v),
    z
      .string()
      .trim()
      .min(1, "ISO date is required")
      .max(30, "ISO date cannot exceed 30 characters")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "ISO date must follow YYYY-MM-DD format")
  ),
  time: z
    .string()
    .trim()
    .max(80, "Time cannot exceed 80 characters")
    .nullable()
    .optional()
    .refine(isSafePlainText, { message: "HTML tags are not permitted in time" }),
  location: z
    .string()
    .trim()
    .max(150, "Location cannot exceed 150 characters")
    .nullable()
    .optional()
    .refine(isSafePlainText, { message: "HTML tags are not permitted in location" }),
  category: z
    .string()
    .trim()
    .max(80, "Category cannot exceed 80 characters")
    .default("School Event")
    .refine(isSafePlainText, { message: "HTML tags are not permitted in category" }),
  linkHref: optionalEventUrlSchema,
  linkLabel: z
    .string()
    .trim()
    .max(80, "Link label cannot exceed 80 characters")
    .nullable()
    .optional()
    .refine(isSafePlainText, { message: "HTML tags are not permitted in link label" }),
  coverImageUrl: optionalEventUrlSchema,
  coverImageStorageKey: z.string().trim().max(255).nullable().optional(),
  coverImageAlt: z
    .string()
    .trim()
    .max(255, "Alt text cannot exceed 255 characters")
    .default(""),
  displayOrder: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
    z.number().int().min(0, "Display order must be non-negative").default(0)
  ),
  isPublished: z.preprocess(
    (v) => (typeof v === "string" ? v === "true" || v === "1" : Boolean(v)),
    z.boolean().default(true)
  ),
});

function validateEventImageAlt(data: {
  coverImageUrl?: string | null;
  coverImageStorageKey?: string | null;
  coverImageAlt?: string | null;
}) {
  const hasImage = Boolean(
    (data.coverImageUrl && data.coverImageUrl.trim().length > 0) ||
      (data.coverImageStorageKey && data.coverImageStorageKey.trim().length > 0)
  );
  if (hasImage) {
    return Boolean(data.coverImageAlt && data.coverImageAlt.trim().length > 0);
  }
  return true;
}

export const schoolEventCreateSchema = schoolEventBaseSchema.refine(validateEventImageAlt, {
  message: "Alt text is required whenever a cover image is uploaded or specified",
  path: ["coverImageAlt"],
});

export type SchoolEventCreateInput = z.infer<typeof schoolEventCreateSchema>;

export const schoolEventUpdateSchema = schoolEventBaseSchema
  .extend({
    id: z.string().trim().min(1, "Event ID is required"),
  })
  .refine(validateEventImageAlt, {
    message: "Alt text is required whenever a cover image is uploaded or specified",
    path: ["coverImageAlt"],
  });

export type SchoolEventUpdateInput = z.infer<typeof schoolEventUpdateSchema>;

export const schoolEventDeleteSchema = z.object({
  id: z.string().trim().min(1, "Event ID is required"),
});

export const schoolEventToggleSchema = z.object({
  id: z.string().trim().min(1, "Event ID is required"),
  isPublished: z.boolean(),
});

export const schoolEventsReorderSchema = z.object({
  orderedIds: z.array(z.string().trim().min(1)).min(1, "At least one ID must be provided"),
});

// ==========================================
// NORMALIZATION & DIFF HELPERS
// ==========================================

export function normalizeEventPayload(
  raw: FormData | Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  if (!raw) return result;

  if (typeof FormData !== "undefined" && raw instanceof FormData) {
    for (const [key, value] of raw.entries()) {
      if (typeof value === "string") {
        const trimmed = value.trim();
        result[key] = trimmed.length === 0 ? null : trimmed;
      } else {
        result[key] = value;
      }
    }
  } else if (typeof raw === "object") {
    for (const [key, value] of Object.entries(raw)) {
      if (typeof value === "string") {
        const trimmed = value.trim();
        result[key] = trimmed.length === 0 ? null : trimmed;
      } else {
        result[key] = value;
      }
    }
  }

  if (result.coverImageAlt === null) {
    result.coverImageAlt = "";
  }

  return result;
}

export function computeEventDiff(
  existing: Record<string, unknown>,
  updated: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  const ignoreKeys = new Set(["id", "createdAt", "updatedAt"]);

  for (const [key, newVal] of Object.entries(updated)) {
    if (ignoreKeys.has(key)) continue;

    let oldVal = existing[key];
    if (oldVal instanceof Date) {
      oldVal = oldVal.toISOString().split("T")[0];
    }
    let formattedNew = newVal;
    if (formattedNew instanceof Date) {
      formattedNew = formattedNew.toISOString().split("T")[0];
    }

    const normOld = oldVal === "" ? null : oldVal;
    const normNew = formattedNew === "" ? null : formattedNew;

    if (normOld !== normNew) {
      if (key === "coverImageUrl" || key === "coverImageStorageKey") {
        diff[key] = {
          from: normOld ? "[PRESENT]" : "[NONE]",
          to: normNew ? "[PRESENT]" : "[NONE]",
        };
      } else {
        diff[key] = { from: normOld, to: normNew };
      }
    }
  }

  return diff;
}

export function formatZodErrors(issues: z.ZodIssue[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const field = issue.path.join(".");
    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}
