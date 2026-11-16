import { z } from "zod";

/**
 * Validates internal paths, fragment links, and approved HTTPS URLs for faculty images.
 * Rejects javascript:, data:, protocol-relative (//), unencrypted http:, spaces, and control characters.
 */
export function validateFacultyUrl(url?: string | null): { valid: boolean; error?: string } {
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

  // Allow root-relative internal paths (e.g. /images/academics/faculty/...)
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

export const optionalFacultyUrlSchema = z
  .string()
  .trim()
  .max(500, "URL cannot exceed 500 characters")
  .nullable()
  .optional()
  .refine((val) => validateFacultyUrl(val).valid, {
    message: "Invalid URL. Must be internal (/path) or secure HTTPS (https://...)",
  });

/**
 * Text safety: rejects raw HTML tags and dangerous script content.
 */
function isSafePlainText(val?: string | null): boolean {
  if (!val) return true;
  // Disallow HTML open/close tags
  return !/<[^>]+>/.test(val);
}

// Base Faculty Fields Schema
export const facultyMemberBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name cannot exceed 120 characters")
    .refine(isSafePlainText, { message: "HTML tags are not permitted in faculty name" }),
  designation: z
    .string()
    .trim()
    .min(1, "Designation is required")
    .max(120, "Designation cannot exceed 120 characters")
    .refine(isSafePlainText, { message: "HTML tags are not permitted in designation" }),
  department: z
    .string()
    .trim()
    .min(1, "Department is required")
    .max(120, "Department cannot exceed 120 characters")
    .refine(isSafePlainText, { message: "HTML tags are not permitted in department" }),
  qualification: z
    .string()
    .trim()
    .max(255, "Qualification cannot exceed 255 characters")
    .nullable()
    .optional()
    .refine(isSafePlainText, { message: "HTML tags are not permitted in qualification" }),
  experienceYears: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
    z
      .number()
      .int("Experience years must be an integer")
      .min(0, "Experience years cannot be negative")
      .max(99, "Experience years must be between 0 and 99")
      .default(0)
  ),
  bio: z
    .string()
    .trim()
    .max(2000, "Biography cannot exceed 2000 characters")
    .nullable()
    .optional()
    .refine(isSafePlainText, { message: "HTML tags are not permitted in biography" }),
  imageUrl: optionalFacultyUrlSchema,
  imageStorageKey: z.string().trim().max(255).nullable().optional(),
  imageAlt: z
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

/**
 * Image Alt Text Refinement:
 * When imageUrl or imageStorageKey is provided, a non-empty imageAlt is strictly required.
 */
function validateImageAlt(data: {
  imageUrl?: string | null;
  imageStorageKey?: string | null;
  imageAlt?: string | null;
}) {
  const hasImage = Boolean(
    (data.imageUrl && data.imageUrl.trim().length > 0) ||
      (data.imageStorageKey && data.imageStorageKey.trim().length > 0)
  );
  if (hasImage) {
    return Boolean(data.imageAlt && data.imageAlt.trim().length > 0);
  }
  return true;
}

export const facultyMemberCreateSchema = facultyMemberBaseSchema.refine(validateImageAlt, {
  message: "Alt text is required whenever a portrait image is uploaded or specified",
  path: ["imageAlt"],
});

export type FacultyMemberCreateInput = z.infer<typeof facultyMemberCreateSchema>;

export const facultyMemberUpdateSchema = facultyMemberBaseSchema
  .extend({
    id: z.string().trim().min(1, "Faculty member ID is required"),
  })
  .refine(validateImageAlt, {
    message: "Alt text is required whenever a portrait image is uploaded or specified",
    path: ["imageAlt"],
  });

export type FacultyMemberUpdateInput = z.infer<typeof facultyMemberUpdateSchema>;

export const facultyMemberDeleteSchema = z.object({
  id: z.string().trim().min(1, "Faculty member ID is required"),
});

export const facultyMemberToggleSchema = z.object({
  id: z.string().trim().min(1, "Faculty member ID is required"),
  isPublished: z.boolean(),
});

export const facultyMemberReorderSchema = z.object({
  orderedIds: z.array(z.string().trim().min(1)).min(1, "At least one ID must be provided"),
});

/**
 * Normalizes string inputs: trims values and transforms empty strings into null.
 */
export function normalizeFacultyPayload<T extends Record<string, unknown>>(data: T): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      result[key] = trimmed.length === 0 ? null : trimmed;
    } else {
      result[key] = value;
    }
  }

  // Preserve imageAlt fallback to empty string if null
  if (result.imageAlt === null) {
    result.imageAlt = "";
  }

  return result as T;
}

/**
 * Computes field-level differences for immutable audit logging.
 */
export function computeFacultyDiff(
  existing: Record<string, unknown>,
  updated: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};

  const ignoreKeys = new Set(["id", "createdAt", "updatedAt"]);

  for (const [key, newVal] of Object.entries(updated)) {
    if (ignoreKeys.has(key)) continue;

    const oldVal = existing[key];

    // Normalize empty strings and nulls for comparison
    const normOld = oldVal === "" ? null : oldVal;
    const normNew = newVal === "" ? null : newVal;

    if (normOld !== normNew) {
      diff[key] = { from: normOld, to: normNew };
    }
  }

  return diff;
}

/**
 * Formats Zod issues into a friendly field -> message map.
 */
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
