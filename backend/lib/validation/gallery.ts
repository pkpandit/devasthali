import { z } from "zod";

export const GALLERY_CATEGORIES = [
  "Campus",
  "Academics",
  "Sports",
  "Events",
  "Hostel",
  "Faculty",
  "Achievements",
] as const;

export const galleryCategoryEnum = z.enum(GALLERY_CATEGORIES);
export type GalleryCategory = z.infer<typeof galleryCategoryEnum>;

/**
 * Validates internal paths and approved HTTPS URLs for gallery images.
 * Rejects javascript:, data:, protocol-relative (//), unencrypted http:, spaces, and control characters.
 */
export function validateGalleryUrl(url?: string | null): { valid: boolean; error?: string } {
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

  // Allow root-relative internal paths (e.g. /images/gallery/...)
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

export const optionalGalleryUrlSchema = z
  .string()
  .trim()
  .max(500, "URL cannot exceed 500 characters")
  .nullable()
  .optional()
  .refine((val) => validateGalleryUrl(val).valid, {
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
// GALLERY ALBUM SCHEMAS
// ==========================================

export const galleryAlbumBaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Album title is required")
    .max(150, "Album title cannot exceed 150 characters")
    .refine(isSafePlainText, { message: "HTML tags are not permitted in album title" }),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .nullable()
    .optional()
    .refine(isSafePlainText, { message: "HTML tags are not permitted in description" }),
  category: galleryCategoryEnum.default("Campus"),
  coverImageUrl: optionalGalleryUrlSchema,
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

function validateAlbumAlt(data: {
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

export const galleryAlbumCreateSchema = galleryAlbumBaseSchema
  .refine(
    (data) =>
      Boolean(
        (data.coverImageUrl && data.coverImageUrl.trim().length > 0) ||
          (data.coverImageStorageKey && data.coverImageStorageKey.trim().length > 0)
      ),
    {
      message: "Cover image is required for gallery albums",
      path: ["coverImageUrl"],
    }
  )
  .refine(validateAlbumAlt, {
    message: "Alt text is required whenever a cover image is uploaded or specified",
    path: ["coverImageAlt"],
  });

export type GalleryAlbumCreateInput = z.infer<typeof galleryAlbumCreateSchema>;

export const galleryAlbumUpdateSchema = galleryAlbumBaseSchema
  .extend({
    id: z.string().trim().min(1, "Album ID is required"),
  })
  .refine(validateAlbumAlt, {
    message: "Alt text is required whenever a cover image is uploaded or specified",
    path: ["coverImageAlt"],
  });

export type GalleryAlbumUpdateInput = z.infer<typeof galleryAlbumUpdateSchema>;

export const galleryAlbumDeleteSchema = z.object({
  id: z.string().trim().min(1, "Album ID is required"),
});

export const galleryAlbumToggleSchema = z.object({
  id: z.string().trim().min(1, "Album ID is required"),
  isPublished: z.boolean(),
});

export const galleryAlbumsReorderSchema = z.object({
  orderedIds: z.array(z.string().trim().min(1)).min(1, "At least one ID must be provided"),
});

// ==========================================
// GALLERY IMAGE SCHEMAS
// ==========================================

export const galleryImageBaseSchema = z.object({
  albumId: z.string().trim().min(1, "Album ID is required"),
  imageUrl: optionalGalleryUrlSchema,
  imageStorageKey: z.string().trim().max(255).nullable().optional(),
  imageAlt: z
    .string()
    .trim()
    .max(255, "Alt text cannot exceed 255 characters")
    .default(""),
  caption: z
    .string()
    .trim()
    .max(255, "Caption cannot exceed 255 characters")
    .nullable()
    .optional()
    .refine(isSafePlainText, { message: "HTML tags are not permitted in caption" }),
  displayOrder: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
    z.number().int().min(0, "Display order must be non-negative").default(0)
  ),
  isPublished: z.preprocess(
    (v) => (typeof v === "string" ? v === "true" || v === "1" : Boolean(v)),
    z.boolean().default(true)
  ),
});

function validatePhotoAlt(data: {
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

export const galleryImageCreateSchema = galleryImageBaseSchema
  .refine(
    (data) =>
      Boolean(
        (data.imageUrl && data.imageUrl.trim().length > 0) ||
          (data.imageStorageKey && data.imageStorageKey.trim().length > 0)
      ),
    {
      message: "An image file or valid image URL is required",
      path: ["imageUrl"],
    }
  )
  .refine(validatePhotoAlt, {
    message: "Alt text is required whenever an image is uploaded or specified",
    path: ["imageAlt"],
  });

export type GalleryImageCreateInput = z.infer<typeof galleryImageCreateSchema>;

export const galleryImageUpdateSchema = galleryImageBaseSchema
  .extend({
    id: z.string().trim().min(1, "Image ID is required"),
  })
  .refine(validatePhotoAlt, {
    message: "Alt text is required whenever an image is uploaded or specified",
    path: ["imageAlt"],
  });

export type GalleryImageUpdateInput = z.infer<typeof galleryImageUpdateSchema>;

export const galleryImageDeleteSchema = z.object({
  id: z.string().trim().min(1, "Image ID is required"),
});

export const galleryImageToggleSchema = z.object({
  id: z.string().trim().min(1, "Image ID is required"),
  isPublished: z.boolean(),
});

export const galleryImagesReorderSchema = z.object({
  orderedIds: z.array(z.string().trim().min(1)).min(1, "At least one ID must be provided"),
});

// ==========================================
// NORMALIZATION & DIFF HELPERS
// ==========================================

export function normalizeGalleryPayload(
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
  if (result.imageAlt === null) {
    result.imageAlt = "";
  }

  return result;
}

export function computeGalleryAlbumDiff(
  existing: Record<string, unknown>,
  updated: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  const ignoreKeys = new Set(["id", "createdAt", "updatedAt", "images"]);

  for (const [key, newVal] of Object.entries(updated)) {
    if (ignoreKeys.has(key)) continue;

    const oldVal = existing[key];
    const normOld = oldVal === "" ? null : oldVal;
    const normNew = newVal === "" ? null : newVal;

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

export function computeGalleryImageDiff(
  existing: Record<string, unknown>,
  updated: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  const ignoreKeys = new Set(["id", "createdAt", "updatedAt", "album"]);

  for (const [key, newVal] of Object.entries(updated)) {
    if (ignoreKeys.has(key)) continue;

    const oldVal = existing[key];
    const normOld = oldVal === "" ? null : oldVal;
    const normNew = newVal === "" ? null : newVal;

    if (normOld !== normNew) {
      if (key === "imageUrl" || key === "imageStorageKey") {
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
