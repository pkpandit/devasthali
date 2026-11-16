import { z } from "zod";
import { DirectoryCategory } from "@prisma/client";

/**
 * Normalizes Indian and general phone strings while preserving readability.
 * Strips dangerous characters and excessive whitespace.
 */
export function normalizePhoneString(input: string): string {
  if (!input) return "";
  return input.trim().replace(/\s+/g, " ");
}

/**
 * Canonical Schema for Updating Global SiteProfile
 */
export const siteProfileUpdateSchema = z.object({
  schoolName: z
    .string()
    .trim()
    .min(2, "School name must be at least 2 characters")
    .max(100, "School name cannot exceed 100 characters"),
  tagline: z.string().trim().max(200, "Tagline cannot exceed 200 characters").nullable().optional(),
  affiliationNo: z.string().trim().max(20, "Affiliation number cannot exceed 20 characters").nullable().optional(),
  schoolCode: z.string().trim().max(20, "School code cannot exceed 20 characters").nullable().optional(),
  establishedYear: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int().min(1800, "Established year must be valid").max(2100).nullable().optional()
  ),
  legacyYearsText: z.string().trim().max(20).nullable().optional(),
  schoolType: z.string().trim().max(100).nullable().optional(),
  medium: z.string().trim().max(100).nullable().optional(),
  gradesOffered: z.string().trim().max(150).nullable().optional(),

  // Physical Address
  campusAddress: z.string().trim().max(150).nullable().optional(),
  tehsil: z.string().trim().max(50).nullable().optional(),
  district: z.string().trim().max(50).nullable().optional(),
  state: z.string().trim().max(50).nullable().optional(),
  pinCode: z.string().trim().max(10).nullable().optional(),
  landmark: z.string().trim().max(200).nullable().optional(),

  // Primary Helplines
  primaryPhone: z
    .string()
    .trim()
    .min(7, "Primary phone must be at least 7 digits")
    .max(30, "Primary phone cannot exceed 30 characters")
    .nullable()
    .optional(),
  admissionsPhone: z
    .string()
    .trim()
    .min(7, "Admissions phone must be at least 7 digits")
    .max(30, "Admissions phone cannot exceed 30 characters")
    .nullable()
    .optional(),
  receptionPhone: z.string().trim().max(30).nullable().optional(),
  hostelWardenPhone: z.string().trim().max(30).nullable().optional(),
  whatsappNumber: z.string().trim().max(30).nullable().optional(),
  officeEmail: z
    .string()
    .trim()
    .email("Office email must be a valid email address")
    .or(z.literal(""))
    .nullable()
    .optional(),
  principalEmail: z
    .string()
    .trim()
    .email("Principal email must be a valid email address")
    .or(z.literal(""))
    .nullable()
    .optional(),
  workingHours: z.string().trim().max(100).nullable().optional(),

  // Social Channels
  facebookUrl: z
    .string()
    .trim()
    .url("Facebook URL must be a valid HTTPS URL")
    .or(z.literal(""))
    .nullable()
    .optional(),
  youtubeUrl: z
    .string()
    .trim()
    .url("YouTube URL must be a valid HTTPS URL")
    .or(z.literal(""))
    .nullable()
    .optional(),
  instagramUrl: z
    .string()
    .trim()
    .url("Instagram URL must be a valid HTTPS URL")
    .or(z.literal(""))
    .nullable()
    .optional(),

  // Compliance & Copyright
  copyrightText: z.string().trim().max(200).nullable().optional(),
});

export type SiteProfileUpdateInput = z.infer<typeof siteProfileUpdateSchema>;

/**
 * Canonical Schema for Creating Campus Directory Entry
 */
export const campusDirectoryCreateSchema = z.object({
  category: z.nativeEnum(DirectoryCategory, {
    message: "A valid directory category must be selected",
  }),
  roleTitle: z
    .string()
    .trim()
    .min(2, "Role title must be at least 2 characters")
    .max(100, "Role title cannot exceed 100 characters"),
  contactName: z.string().trim().max(100, "Contact name cannot exceed 100 characters").nullable().optional(),
  department: z.string().trim().max(100, "Department cannot exceed 100 characters").nullable().optional(),
  phoneNumber: z
    .string()
    .trim()
    .min(5, "Phone number must be at least 5 characters")
    .max(100, "Phone number cannot exceed 100 characters"),
  displayOrder: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : Number(v)),
    z.number().int().min(0, "Display order must be non-negative").default(0)
  ),
  isPublished: z.preprocess(
    (v) => (typeof v === "string" ? v === "true" || v === "1" : Boolean(v)),
    z.boolean().default(true)
  ),
});

export type CampusDirectoryCreateInput = z.infer<typeof campusDirectoryCreateSchema>;

/**
 * Canonical Schema for Updating Campus Directory Entry
 */
export const campusDirectoryUpdateSchema = campusDirectoryCreateSchema.extend({
  id: z.string().trim().min(1, "Entry ID is required for updating"),
});

export type CampusDirectoryUpdateInput = z.infer<typeof campusDirectoryUpdateSchema>;

/**
 * Schema for Deleting Campus Directory Entry
 */
export const campusDirectoryDeleteSchema = z.object({
  id: z.string().trim().min(1, "Entry ID is required for deletion"),
});

/**
 * Schema for Toggling Publication Status
 */
export const campusDirectoryToggleSchema = z.object({
  id: z.string().trim().min(1, "Entry ID is required"),
  isPublished: z.boolean(),
});

/**
 * Schema for Reordering Directory Entries
 */
export const campusDirectoryReorderSchema = z.object({
  entries: z.array(
    z.object({
      id: z.string().trim().min(1),
      displayOrder: z.number().int().min(0),
    })
  ).min(1, "At least one entry must be supplied for reordering"),
});

/**
 * Normalizes empty strings to null for database clean persistence.
 */
export function normalizeProfilePayload(
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

/**
 * Computes changed field diff for SiteProfile audit logs.
 */
export function computeProfileDiff(
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

/**
 * Computes changed field diff for CampusDirectoryEntry audit logs.
 */
export function computeDirectoryDiff(
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

/**
 * Standard Zod Error Formatter
 */
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!fieldErrors[path]) {
      fieldErrors[path] = [];
    }
    fieldErrors[path].push(issue.message);
  }
  return fieldErrors;
}
