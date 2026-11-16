import { z } from "zod";

export const NavigationLocationEnum = z.enum([
  "HEADER_PRIMARY",
  "FOOTER_ADMISSIONS",
  "FOOTER_COMMUNITY",
]);
export type NavigationLocationType = z.infer<typeof NavigationLocationEnum>;

export const NavigationPanelTypeEnum = z.enum([
  "NONE",
  "COMPACT",
  "MEDIUM",
  "MEGA",
]);
export type NavigationPanelTypeType = z.infer<typeof NavigationPanelTypeEnum>;

/**
 * Validates internal paths, fragment links, and approved HTTPS URLs.
 * Rejects javascript:, data:, protocol-relative (//), unencrypted http:, spaces, and control characters.
 */
export function validateNavigationUrl(url: string): { valid: boolean; error?: string } {
  if (!url || typeof url !== "string") {
    return { valid: false, error: "Destination URL is required" };
  }

  const trimmed = url.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "Destination URL cannot be empty" };
  }

  // Reject control characters and whitespace
  if (/[\s\x00-\x1F\x7F]/.test(trimmed)) {
    return { valid: false, error: "Destination URL contains invalid whitespace or control characters" };
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

  // Allow same-page fragments (e.g. #hostel)
  if (trimmed.startsWith("#")) {
    if (/^#[a-zA-Z0-9_\-]+$/.test(trimmed)) {
      return { valid: true };
    }
    return { valid: false, error: "Invalid fragment syntax; use format #section-name" };
  }

  // Allow root-relative internal paths (e.g. /about, /facilities#hostel, /admissions/fees?year=2026)
  if (trimmed.startsWith("/")) {
    try {
      // Validate path structure via URL constructor dummy origin
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

export const navigationUrlSchema = z
  .string()
  .min(1, "Destination URL is required")
  .max(500, "URL cannot exceed 500 characters")
  .refine((val) => validateNavigationUrl(val).valid, {
    message: "Invalid destination URL. Must be internal (/path, /path#fragment) or secure HTTPS (https://...)",
  });

// ==========================================
// Item Schemas
// ==========================================

export const navigationItemCreateSchema = z
  .object({
    location: NavigationLocationEnum.default("HEADER_PRIMARY"),
    label: z.string().trim().min(1, "Label is required").max(120, "Label cannot exceed 120 characters"),
    href: navigationUrlSchema,
    panelType: NavigationPanelTypeEnum.default("NONE"),
    badge: z.string().trim().max(50, "Badge cannot exceed 50 characters").nullable().optional(),
    displayOrder: z.coerce.number().int().min(0).default(0),
    isPublished: z.boolean().default(true),
    openInNewTab: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // Footer locations must strictly have panelType NONE
      if (data.location !== "HEADER_PRIMARY" && data.panelType !== "NONE") {
        return false;
      }
      return true;
    },
    {
      message: "Dropdown panel types are only supported on the Header Primary navigation",
      path: ["panelType"],
    }
  );

export const navigationItemUpdateSchema = navigationItemCreateSchema.extend({
  id: z.string().min(1, "Item ID is required"),
});

export const navigationItemDeleteSchema = z.object({
  id: z.string().min(1, "Item ID is required"),
});

export const navigationItemToggleSchema = z.object({
  id: z.string().min(1, "Item ID is required"),
  isPublished: z.boolean(),
});

export const navigationItemReorderSchema = z.object({
  location: NavigationLocationEnum,
  itemIds: z.array(z.string().min(1)).min(1, "At least one item ID is required"),
});

// ==========================================
// Column Schemas
// ==========================================

export const navigationColumnCreateSchema = z.object({
  itemId: z.string().min(1, "Parent Navigation Item ID is required"),
  heading: z.string().trim().max(120, "Heading cannot exceed 120 characters").nullable().optional(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

export const navigationColumnUpdateSchema = z.object({
  id: z.string().min(1, "Column ID is required"),
  heading: z.string().trim().max(120, "Heading cannot exceed 120 characters").nullable().optional(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

export const navigationColumnDeleteSchema = z.object({
  id: z.string().min(1, "Column ID is required"),
});

export const navigationColumnToggleSchema = z.object({
  id: z.string().min(1, "Column ID is required"),
  isPublished: z.boolean(),
});

export const navigationColumnReorderSchema = z.object({
  itemId: z.string().min(1, "Parent Navigation Item ID is required"),
  columnIds: z.array(z.string().min(1)).min(1, "At least one column ID is required"),
});

// ==========================================
// Link Schemas
// ==========================================

export const navigationLinkCreateSchema = z.object({
  columnId: z.string().min(1, "Parent Column ID is required"),
  label: z.string().trim().min(1, "Link label is required").max(120, "Label cannot exceed 120 characters"),
  href: navigationUrlSchema,
  badge: z.string().trim().max(50, "Badge cannot exceed 50 characters").nullable().optional(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
  openInNewTab: z.boolean().default(false),
});

export const navigationLinkUpdateSchema = z.object({
  id: z.string().min(1, "Link ID is required"),
  label: z.string().trim().min(1, "Link label is required").max(120, "Label cannot exceed 120 characters"),
  href: navigationUrlSchema,
  badge: z.string().trim().max(50, "Badge cannot exceed 50 characters").nullable().optional(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
  openInNewTab: z.boolean().default(false),
});

export const navigationLinkDeleteSchema = z.object({
  id: z.string().min(1, "Link ID is required"),
});

export const navigationLinkToggleSchema = z.object({
  id: z.string().min(1, "Link ID is required"),
  isPublished: z.boolean(),
});

export const navigationLinkReorderSchema = z.object({
  columnId: z.string().min(1, "Parent Column ID is required"),
  linkIds: z.array(z.string().min(1)).min(1, "At least one link ID is required"),
});

// ==========================================
// Column Limits Validator
// ==========================================

export function getMaxColumnsForPanelType(panelType: NavigationPanelTypeType): number {
  switch (panelType) {
    case "NONE":
      return 0;
    case "COMPACT":
      return 1;
    case "MEDIUM":
      return 2;
    case "MEGA":
      return 3;
    default:
      return 0;
  }
}

// ==========================================
// Diff Computation Utilities for Audit Logs
// ==========================================

export function computeNavigationItemDiff(
  oldItem: Record<string, unknown>,
  newItem: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  const trackedKeys = [
    "location",
    "label",
    "href",
    "panelType",
    "badge",
    "displayOrder",
    "isPublished",
    "openInNewTab",
  ];

  for (const key of trackedKeys) {
    const oldVal = oldItem[key] ?? null;
    const newVal = newItem[key] ?? null;
    if (oldVal !== newVal) {
      diff[key] = { from: oldVal, to: newVal };
    }
  }

  return diff;
}

export function computeNavigationColumnDiff(
  oldCol: Record<string, unknown>,
  newCol: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  const trackedKeys = ["heading", "displayOrder", "isPublished"];

  for (const key of trackedKeys) {
    const oldVal = oldCol[key] ?? null;
    const newVal = newCol[key] ?? null;
    if (oldVal !== newVal) {
      diff[key] = { from: oldVal, to: newVal };
    }
  }

  return diff;
}

export function computeNavigationLinkDiff(
  oldLink: Record<string, unknown>,
  newLink: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  const trackedKeys = ["label", "href", "badge", "displayOrder", "isPublished", "openInNewTab"];

  for (const key of trackedKeys) {
    const oldVal = oldLink[key] ?? null;
    const newVal = newLink[key] ?? null;
    if (oldVal !== newVal) {
      diff[key] = { from: oldVal, to: newVal };
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
