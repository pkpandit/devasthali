import { z } from "zod";

/**
 * Validates internal paths, fragment links, and approved HTTPS URLs.
 * Rejects javascript:, data:, protocol-relative (//), unencrypted http:, spaces, and control characters.
 */
export function validateAboutLeadershipUrl(url?: string | null): { valid: boolean; error?: string } {
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

  // Allow root-relative internal paths (e.g. /admissions, /images/leadership/...)
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

export const requiredAboutUrlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .max(500, "URL cannot exceed 500 characters")
  .refine((val) => validateAboutLeadershipUrl(val).valid, {
    message: "Invalid URL. Must be internal (/path, /path#fragment) or secure HTTPS (https://...)",
  });

export const optionalAboutUrlSchema = z
  .string()
  .trim()
  .max(500, "URL cannot exceed 500 characters")
  .nullable()
  .optional()
  .refine((val) => validateAboutLeadershipUrl(val).valid, {
    message: "Invalid URL. Must be internal (/path, /path#fragment) or secure HTTPS (https://...)",
  });

// ==========================================
// 1. ABOUT SCHOOL SCHEMAS
// ==========================================

export const aboutPageSettingSchema = z.object({
  breadcrumb: z.string().trim().max(120, "Breadcrumb cannot exceed 120 characters").default("Home / About School"),
  heading: z.string().trim().min(1, "Heading is required").max(120, "Heading cannot exceed 120 characters"),
  subheading: z.string().trim().max(1000, "Subheading cannot exceed 1000 characters").default(""),
  showcaseImageUrl: optionalAboutUrlSchema,
  showcaseImageStorageKey: z.string().trim().max(255).nullable().optional(),
  showcaseImageAlt: z.string().trim().max(255, "Alt text cannot exceed 255 characters").nullable().optional(),
  showcaseBadge: z.string().trim().max(60, "Badge cannot exceed 60 characters").nullable().optional(),
  isPublished: z.preprocess(
    (v) => (typeof v === "string" ? v === "true" || v === "1" : Boolean(v)),
    z.boolean().default(true)
  ),
});

export type AboutPageSettingInput = z.infer<typeof aboutPageSettingSchema>;

export const aboutCredentialCreateSchema = z.object({
  category: z.string().trim().min(1, "Category is required").max(60, "Category cannot exceed 60 characters"),
  title: z.string().trim().min(1, "Title is required").max(120, "Title cannot exceed 120 characters"),
  subtext: z.string().trim().min(1, "Subtext is required").max(120, "Subtext cannot exceed 120 characters"),
  iconName: z.string().trim().max(60).nullable().optional(),
  displayOrder: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
    z.number().int().min(0, "Display order must be non-negative").default(0)
  ),
  isPublished: z.preprocess(
    (v) => (typeof v === "string" ? v === "true" || v === "1" : Boolean(v)),
    z.boolean().default(true)
  ),
});

export type AboutCredentialCreateInput = z.infer<typeof aboutCredentialCreateSchema>;

export const aboutCredentialUpdateSchema = aboutCredentialCreateSchema.extend({
  id: z.string().trim().min(1, "Credential ID is required for updating"),
});

export type AboutCredentialUpdateInput = z.infer<typeof aboutCredentialUpdateSchema>;

export const aboutCredentialDeleteSchema = z.object({
  id: z.string().trim().min(1, "Credential ID is required"),
});

export const aboutCredentialToggleSchema = z.object({
  id: z.string().trim().min(1, "Credential ID is required"),
  isPublished: z.boolean(),
});

export const aboutCredentialReorderSchema = z.object({
  credentials: z.array(
    z.object({
      id: z.string().trim().min(1),
      displayOrder: z.number().int().min(0),
    })
  ).min(1, "At least one credential must be supplied for reordering"),
});

export const aboutNarrativeSectionCreateSchema = z.object({
  heading: z.string().trim().max(120, "Section heading cannot exceed 120 characters").nullable().optional(),
  body: z.string().trim().min(1, "Paragraph narrative body is required"),
  imageUrl: optionalAboutUrlSchema,
  imageStorageKey: z.string().trim().max(255).nullable().optional(),
  imageAlt: z.string().trim().max(255).nullable().optional(),
  displayOrder: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
    z.number().int().min(0, "Display order must be non-negative").default(0)
  ),
  isPublished: z.preprocess(
    (v) => (typeof v === "string" ? v === "true" || v === "1" : Boolean(v)),
    z.boolean().default(true)
  ),
});

export type AboutNarrativeSectionCreateInput = z.infer<typeof aboutNarrativeSectionCreateSchema>;

export const aboutNarrativeSectionUpdateSchema = aboutNarrativeSectionCreateSchema.extend({
  id: z.string().trim().min(1, "Narrative section ID is required for updating"),
});

export type AboutNarrativeSectionUpdateInput = z.infer<typeof aboutNarrativeSectionUpdateSchema>;

export const aboutNarrativeSectionDeleteSchema = z.object({
  id: z.string().trim().min(1, "Section ID is required"),
});

export const aboutNarrativeSectionToggleSchema = z.object({
  id: z.string().trim().min(1, "Section ID is required"),
  isPublished: z.boolean(),
});

export const aboutNarrativeSectionReorderSchema = z.object({
  sections: z.array(
    z.object({
      id: z.string().trim().min(1),
      displayOrder: z.number().int().min(0),
    })
  ).min(1, "At least one section must be supplied for reordering"),
});

// ==========================================
// 2. VISION & MISSION SCHEMAS
// ==========================================

export const visionMissionSettingSchema = z.object({
  breadcrumb: z.string().trim().max(120).default("About School / Vision & Mission"),
  heading: z.string().trim().min(1, "Heading is required").max(120),
  subheading: z.string().trim().max(1000).default(""),
  visionTitle: z.string().trim().min(1, "Vision title is required").max(120),
  visionBody: z.string().trim().min(1, "Vision body is required"),
  visionIcon: z.string().trim().max(60).default("Compass"),
  missionTitle: z.string().trim().min(1, "Mission title is required").max(120),
  missionBody: z.string().trim().min(1, "Mission body is required"),
  missionIcon: z.string().trim().max(60).default("Target"),
  isPublished: z.preprocess(
    (v) => (typeof v === "string" ? v === "true" || v === "1" : Boolean(v)),
    z.boolean().default(true)
  ),
});

export type VisionMissionSettingInput = z.infer<typeof visionMissionSettingSchema>;

export const institutionalCoreValueCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().min(1, "Description is required"),
  iconName: z.string().trim().max(60).nullable().optional(),
  displayOrder: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
    z.number().int().min(0).default(0)
  ),
  isPublished: z.preprocess(
    (v) => (typeof v === "string" ? v === "true" || v === "1" : Boolean(v)),
    z.boolean().default(true)
  ),
});

export type InstitutionalCoreValueCreateInput = z.infer<typeof institutionalCoreValueCreateSchema>;

export const institutionalCoreValueUpdateSchema = institutionalCoreValueCreateSchema.extend({
  id: z.string().trim().min(1, "Core Value ID is required for updating"),
});

export type InstitutionalCoreValueUpdateInput = z.infer<typeof institutionalCoreValueUpdateSchema>;

export const institutionalCoreValueDeleteSchema = z.object({
  id: z.string().trim().min(1, "Core Value ID is required"),
});

export const institutionalCoreValueToggleSchema = z.object({
  id: z.string().trim().min(1, "Core Value ID is required"),
  isPublished: z.boolean(),
});

export const institutionalCoreValueReorderSchema = z.object({
  values: z.array(
    z.object({
      id: z.string().trim().min(1),
      displayOrder: z.number().int().min(0),
    })
  ).min(1, "At least one value must be supplied for reordering"),
});

// ==========================================
// 3. LEADERSHIP MEMBERS SCHEMAS
// ==========================================

export const leadershipRoleEnum = z.enum([
  "FOUNDER",
  "PATRON",
  "PRESIDENT",
  "MANAGER",
  "PRINCIPAL",
]);

export const leadershipSlugs: Record<z.infer<typeof leadershipRoleEnum>, string> = {
  FOUNDER: "founders-message",
  PATRON: "patrons-message",
  PRESIDENT: "presidents-message",
  MANAGER: "managers-message",
  PRINCIPAL: "principals-message",
};

export const leadershipMemberUpdateSchema = z.object({
  id: z.string().trim().min(1, "Leadership member ID is required"),
  role: leadershipRoleEnum,
  pageTitle: z.string().trim().min(1, "Page title is required").max(120),
  breadcrumb: z.string().trim().max(120).default("About School / Leadership"),
  badgeText: z.string().trim().min(1, "Badge text is required").max(60),
  name: z.string().trim().min(1, "Name is required").max(120),
  designation: z.string().trim().min(1, "Designation is required").max(120),
  termOrAffiliation: z.string().trim().max(120).nullable().optional(),
  location: z.string().trim().max(200).nullable().optional(),
  shortIntro: z.string().trim().min(1, "Short introduction is required").max(1000),
  quote: z.string().trim().nullable().optional(),
  messageBody: z.string().trim().min(1, "Editorial message body is required"),
  imageUrl: optionalAboutUrlSchema,
  imageStorageKey: z.string().trim().max(255).nullable().optional(),
  imageAlt: z.string().trim().max(255).nullable().optional(),
  signatureImageUrl: optionalAboutUrlSchema,
  signatureStorageKey: z.string().trim().max(255).nullable().optional(),
  signatureAlt: z.string().trim().max(255).nullable().optional(),
  bio: z.string().trim().nullable().optional(),
  ctaLabel: z.string().trim().max(60).nullable().optional(),
  ctaHref: optionalAboutUrlSchema,
  isPublished: z.preprocess(
    (v) => (typeof v === "string" ? v === "true" || v === "1" : Boolean(v)),
    z.boolean().default(true)
  ),
});

export type LeadershipMemberUpdateInput = z.infer<typeof leadershipMemberUpdateSchema>;

export const leadershipMemberToggleSchema = z.object({
  id: z.string().trim().min(1, "Leadership member ID is required"),
  isPublished: z.boolean(),
});

export const leadershipMemberReorderSchema = z.object({
  members: z.array(
    z.object({
      id: z.string().trim().min(1),
      displayOrder: z.number().int().min(0),
    })
  ).min(1, "At least one leadership member must be supplied for reordering"),
});

// ==========================================
// 4. NORMALIZERS & DIFF COMPUTATION HELPERS
// ==========================================

export function normalizeAboutPayload(
  raw: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (typeof val === "string") {
      const trimmed = val.trim();
      result[key] = trimmed === "" ? null : trimmed;
    } else {
      result[key] = val;
    }
  }
  return result;
}

export function computeAboutLeadershipDiff(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of Object.keys(newData)) {
    if (key === "updatedAt" || key === "createdAt" || key === "id") continue;
    const oldVal = oldData[key] ?? null;
    const newVal = newData[key] ?? null;
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
