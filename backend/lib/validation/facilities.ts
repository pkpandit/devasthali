import { z } from "zod";

// ==========================================
// MANAGED STORAGE KEY REGEX & VALIDATOR
// ==========================================

export const MANAGED_FACILITY_STORAGE_KEY_REGEX =
  /^facilities\/fac_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/;

export function isValidManagedFacilityKey(key: string | null | undefined): key is string {
  if (!key) return false;
  return MANAGED_FACILITY_STORAGE_KEY_REGEX.test(key);
}

// ==========================================
// ALLOWED ICON NAMES
// ==========================================

export const ALLOWED_FACILITY_ICONS = [
  "MonitorPlay",
  "FlaskConical",
  "Cpu",
  "Home",
  "Trophy",
  "Bus",
  "BookOpen",
  "HeartPulse",
  "Sparkles",
  "Shield",
] as const;

export type AllowedFacilityIcon = (typeof ALLOWED_FACILITY_ICONS)[number];

// ==========================================
// SAFE URL VALIDATION
// ==========================================

export function validateFacilityImageUrl(url: string | null | undefined): {
  valid: boolean;
  error?: string;
} {
  if (!url || typeof url !== "string") {
    return { valid: true };
  }

  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return { valid: true };
  }

  // Reject control characters and whitespace
  if (/[\s\x00-\x1F\x7F]/.test(trimmed)) {
    return { valid: false, error: "URL contains invalid whitespace or control characters." };
  }

  // Reject dangerous schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return { valid: false, error: "URL scheme is not permitted for security reasons." };
  }

  // Reject protocol-relative URLs
  if (lower.startsWith("//")) {
    return { valid: false, error: "Protocol-relative URLs are not permitted." };
  }

  // Reject insecure http://
  if (lower.startsWith("http://")) {
    return { valid: false, error: "Insecure HTTP links are not permitted; please use HTTPS." };
  }

  // Allow root-relative internal paths (e.g. /images/facilities/... or /api/public/media/facilities/...)
  if (trimmed.startsWith("/")) {
    if (trimmed.includes("..") || lower.includes("%2e%2e")) {
      return { valid: false, error: "Path traversal is not permitted." };
    }
    return { valid: true };
  }

  // Allow approved HTTPS external URLs
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") {
      return { valid: false, error: "Only secure HTTPS URLs are permitted." };
    }
    if (parsed.username || parsed.password) {
      return { valid: false, error: "Credentials in URLs are not permitted." };
    }
    const host = parsed.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "::1") {
      return { valid: false, error: "Localhost and loopback URLs are not permitted." };
    }
    if (!host.includes(".") || host.endsWith(".")) {
      return { valid: false, error: "Valid domain name required." };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format." };
  }
}

// ==========================================
// CATEGORY SCHEMAS
// ==========================================

export const facilityCategoryCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Category title cannot be empty.")
    .max(150, "Category title cannot exceed 150 characters."),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters.")
    .nullable()
    .optional(),
  displayOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const facilityCategoryUpdateSchema = z.object({
  id: z.string().min(1, "Category ID is required."),
  title: z
    .string()
    .trim()
    .min(1, "Category title cannot be empty.")
    .max(150, "Category title cannot exceed 150 characters."),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters.")
    .nullable()
    .optional(),
  displayOrder: z.coerce.number().int(),
  isPublished: z.boolean(),
});

export const reorderFacilityCategoriesSchema = z.object({
  orders: z
    .array(
      z.object({
        id: z.string().min(1),
        displayOrder: z.coerce.number().int(),
      })
    )
    .min(1, "At least one category order must be provided."),
});

export const toggleFacilityCategoryStatusSchema = z.object({
  id: z.string().min(1, "Category ID is required."),
  isPublished: z.boolean(),
});

export const deleteFacilityCategorySchema = z.object({
  id: z.string().min(1, "Category ID is required."),
});

// ==========================================
// FACILITY ITEM SCHEMAS
// ==========================================

export const facilityItemCreateSchema = z.object({
  categoryId: z.string().min(1, "Category is required."),
  title: z
    .string()
    .trim()
    .min(1, "Facility title cannot be empty.")
    .max(200, "Facility title cannot exceed 200 characters."),
  description: z
    .string()
    .trim()
    .min(1, "Description cannot be empty.")
    .max(5000, "Description cannot exceed 5000 characters."),
  imageUrl: z
    .string()
    .trim()
    .max(500, "Image URL cannot exceed 500 characters.")
    .nullable()
    .optional()
    .refine((val) => validateFacilityImageUrl(val).valid, {
      message: "Invalid image URL.",
    }),
  imageStorageKey: z
    .string()
    .trim()
    .max(255)
    .nullable()
    .optional()
    .refine(
      (val) => !val || isValidManagedFacilityKey(val),
      "Invalid facility image storage key."
    ),
  imageAlt: z
    .string()
    .trim()
    .min(3, "Image alt text must be at least 3 characters.")
    .max(255, "Image alt text cannot exceed 255 characters."),
  iconName: z
    .enum(ALLOWED_FACILITY_ICONS, {
      message: "Please select a valid icon.",
    })
    .default("BookOpen"),
  highlights: z
    .array(z.string().trim().max(100, "Highlight cannot exceed 100 characters."))
    .max(10, "Maximum 10 highlights allowed.")
    .default([]),
  displayOrder: z.coerce.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const facilityItemUpdateSchema = z.object({
  id: z.string().min(1, "Facility ID is required."),
  categoryId: z.string().min(1, "Category is required."),
  title: z
    .string()
    .trim()
    .min(1, "Facility title cannot be empty.")
    .max(200, "Facility title cannot exceed 200 characters."),
  description: z
    .string()
    .trim()
    .min(1, "Description cannot be empty.")
    .max(5000, "Description cannot exceed 5000 characters."),
  imageUrl: z
    .string()
    .trim()
    .max(500, "Image URL cannot exceed 500 characters.")
    .nullable()
    .optional()
    .refine((val) => validateFacilityImageUrl(val).valid, {
      message: "Invalid image URL.",
    }),
  imageStorageKey: z
    .string()
    .trim()
    .max(255)
    .nullable()
    .optional()
    .refine(
      (val) => !val || isValidManagedFacilityKey(val),
      "Invalid facility image storage key."
    ),
  imageAlt: z
    .string()
    .trim()
    .min(3, "Image alt text must be at least 3 characters.")
    .max(255, "Image alt text cannot exceed 255 characters."),
  iconName: z
    .enum(ALLOWED_FACILITY_ICONS, {
      message: "Please select a valid icon.",
    })
    .default("BookOpen"),
  highlights: z
    .array(z.string().trim().max(100, "Highlight cannot exceed 100 characters."))
    .max(10, "Maximum 10 highlights allowed.")
    .default([]),
  displayOrder: z.coerce.number().int(),
  isPublished: z.boolean(),
});

export const reorderFacilityItemsSchema = z.object({
  categoryId: z.string().min(1, "Category ID is required."),
  orders: z
    .array(
      z.object({
        id: z.string().min(1),
        displayOrder: z.coerce.number().int(),
      })
    )
    .min(1, "At least one item order must be provided."),
});

export const toggleFacilityItemStatusSchema = z.object({
  id: z.string().min(1, "Facility ID is required."),
  isPublished: z.boolean(),
});

export const deleteFacilityItemSchema = z.object({
  id: z.string().min(1, "Facility ID is required."),
});

// ==========================================
// AUDIT DIFF COMPUTATION WITH MASKING
// ==========================================

export function computeCategoryDiff(
  oldCat: {
    title: string;
    description: string | null;
    displayOrder: number;
    isPublished: boolean;
  },
  newCat: {
    title: string;
    description?: string | null;
    displayOrder: number;
    isPublished: boolean;
  }
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};

  if (oldCat.title !== newCat.title) {
    diff.title = { from: oldCat.title, to: newCat.title };
  }
  if ((oldCat.description ?? null) !== (newCat.description ?? null)) {
    diff.description = { from: oldCat.description, to: newCat.description ?? null };
  }
  if (oldCat.displayOrder !== newCat.displayOrder) {
    diff.displayOrder = { from: oldCat.displayOrder, to: newCat.displayOrder };
  }
  if (oldCat.isPublished !== newCat.isPublished) {
    diff.isPublished = { from: oldCat.isPublished, to: newCat.isPublished };
  }

  return diff;
}

export function computeFacilityItemDiff(
  oldItem: {
    title: string;
    categoryId: string;
    description: string;
    imageUrl: string | null;
    imageStorageKey: string | null;
    imageAlt: string;
    iconName: string | null;
    highlights: string[];
    displayOrder: number;
    isPublished: boolean;
  },
  newItem: {
    title: string;
    categoryId: string;
    description: string;
    imageUrl?: string | null;
    imageStorageKey?: string | null;
    imageAlt: string;
    iconName?: string | null;
    highlights?: string[];
    displayOrder: number;
    isPublished: boolean;
  }
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};

  if (oldItem.title !== newItem.title) {
    diff.title = { from: oldItem.title, to: newItem.title };
  }
  if (oldItem.categoryId !== newItem.categoryId) {
    diff.categoryId = { from: oldItem.categoryId, to: newItem.categoryId };
  }
  if (oldItem.description !== newItem.description) {
    diff.description = { from: "[OLD_DESCRIPTION]", to: "[NEW_DESCRIPTION]" };
  }
  if ((oldItem.imageUrl ?? null) !== (newItem.imageUrl ?? null)) {
    diff.imageUrl = {
      from: oldItem.imageUrl ? "[PRESENT]" : "[NONE]",
      to: newItem.imageUrl ? "[PRESENT]" : "[NONE]",
    };
  }
  if ((oldItem.imageStorageKey ?? null) !== (newItem.imageStorageKey ?? null)) {
    diff.imageStorageKey = {
      from: oldItem.imageStorageKey ? "[PRESENT]" : "[NONE]",
      to: newItem.imageStorageKey ? "[PRESENT]" : "[NONE]",
    };
  }
  if (oldItem.imageAlt !== newItem.imageAlt) {
    diff.imageAlt = { from: oldItem.imageAlt, to: newItem.imageAlt };
  }
  if ((oldItem.iconName ?? null) !== (newItem.iconName ?? null)) {
    diff.iconName = { from: oldItem.iconName, to: newItem.iconName ?? null };
  }
  if (JSON.stringify(oldItem.highlights) !== JSON.stringify(newItem.highlights ?? [])) {
    diff.highlights = { from: oldItem.highlights, to: newItem.highlights ?? [] };
  }
  if (oldItem.displayOrder !== newItem.displayOrder) {
    diff.displayOrder = { from: oldItem.displayOrder, to: newItem.displayOrder };
  }
  if (oldItem.isPublished !== newItem.isPublished) {
    diff.isPublished = { from: oldItem.isPublished, to: newItem.isPublished };
  }

  return diff;
}
