import { z } from "zod";

export const TOPPER_POLICY = {
  STUDENT_NAME_MIN_LENGTH: 2,
  STUDENT_NAME_MAX_LENGTH: 100,
  ACHIEVEMENT_MIN_LENGTH: 3,
  ACHIEVEMENT_MAX_LENGTH: 200,
  STREAM_MAX_LENGTH: 50,
  MIN_SCORE_PERCENT: 0.0,
  MAX_SCORE_PERCENT: 100.0,
  ACADEMIC_YEAR_REGEX: /^\d{4}-\d{2}$/,
} as const;

export const gradeEnum = z.enum(["Class X", "Class XII"]);

/**
 * Score percentage validator:
 * Enforces range 0.00 to 100.00 and allows at most 2 decimal places.
 */
export const scorePercentSchema = z
  .number()
  .min(TOPPER_POLICY.MIN_SCORE_PERCENT, "Score percentage cannot be negative.")
  .max(TOPPER_POLICY.MAX_SCORE_PERCENT, "Score percentage cannot exceed 100.00.")
  .refine(
    (val) => {
      // Check for at most 2 decimal places
      const str = val.toString();
      if (!str.includes(".")) return true;
      const decimals = str.split(".")[1];
      return decimals.length <= 2;
    },
    { message: "Score percentage must have at most 2 decimal places." }
  );

/**
 * Academic year format validator:
 * Enforces YYYY-YY (e.g., 2024-25, 2025-26).
 */
export const academicYearSchema = z
  .string()
  .trim()
  .regex(TOPPER_POLICY.ACADEMIC_YEAR_REGEX, "Academic year must be in YYYY-YY format (e.g. 2024-25).");

/**
 * Safe photo URL schema:
 * Allows empty/null/undefined or valid HTTP/HTTPS URLs and root-relative paths.
 */
export const photoUrlSchema = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine(
    (val) => {
      if (!val || val.length === 0) return true;
      if (val.startsWith("/")) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Photo URL must be a valid HTTP(S) URL or a root-relative path." }
  );

/**
 * Canonical BoardResultTopper input schema for record creation.
 */
export const topperInputSchema = z
  .object({
    studentName: z
      .string()
      .trim()
      .min(TOPPER_POLICY.STUDENT_NAME_MIN_LENGTH, `Student name must be at least ${TOPPER_POLICY.STUDENT_NAME_MIN_LENGTH} characters.`)
      .max(TOPPER_POLICY.STUDENT_NAME_MAX_LENGTH, `Student name must not exceed ${TOPPER_POLICY.STUDENT_NAME_MAX_LENGTH} characters.`),
    scorePercent: scorePercentSchema,
    grade: gradeEnum,
    stream: z
      .string()
      .trim()
      .max(TOPPER_POLICY.STREAM_MAX_LENGTH, `Stream must not exceed ${TOPPER_POLICY.STREAM_MAX_LENGTH} characters.`)
      .optional()
      .nullable(),
    academicYear: academicYearSchema,
    achievement: z
      .string()
      .trim()
      .min(TOPPER_POLICY.ACHIEVEMENT_MIN_LENGTH, `Achievement must be at least ${TOPPER_POLICY.ACHIEVEMENT_MIN_LENGTH} characters.`)
      .max(TOPPER_POLICY.ACHIEVEMENT_MAX_LENGTH, `Achievement must not exceed ${TOPPER_POLICY.ACHIEVEMENT_MAX_LENGTH} characters.`),
    photoUrl: photoUrlSchema,
    displayOrder: z
      .number()
      .int("Display order must be an integer.")
      .min(0, "Display order must be a non-negative integer.")
      .default(0),
    isFeatured: z.boolean().default(true),
  });

/**
 * Distinct update schema requiring non-empty ID and the full editable payload.
 * Intentionally contains NO silent defaults to prevent accidental overwrites.
 */
export const topperUpdateSchema = z
  .object({
    id: z
      .string()
      .trim()
      .min(1, "Record ID is required for update."),
    studentName: z
      .string()
      .trim()
      .min(TOPPER_POLICY.STUDENT_NAME_MIN_LENGTH, `Student name must be at least ${TOPPER_POLICY.STUDENT_NAME_MIN_LENGTH} characters.`)
      .max(TOPPER_POLICY.STUDENT_NAME_MAX_LENGTH, `Student name must not exceed ${TOPPER_POLICY.STUDENT_NAME_MAX_LENGTH} characters.`),
    scorePercent: scorePercentSchema,
    grade: gradeEnum,
    stream: z
      .string()
      .trim()
      .max(TOPPER_POLICY.STREAM_MAX_LENGTH, `Stream must not exceed ${TOPPER_POLICY.STREAM_MAX_LENGTH} characters.`)
      .optional()
      .nullable(),
    academicYear: academicYearSchema,
    achievement: z
      .string()
      .trim()
      .min(TOPPER_POLICY.ACHIEVEMENT_MIN_LENGTH, `Achievement must be at least ${TOPPER_POLICY.ACHIEVEMENT_MIN_LENGTH} characters.`)
      .max(TOPPER_POLICY.ACHIEVEMENT_MAX_LENGTH, `Achievement must not exceed ${TOPPER_POLICY.ACHIEVEMENT_MAX_LENGTH} characters.`),
    photoUrl: photoUrlSchema,
    displayOrder: z
      .number()
      .int("Display order must be an integer.")
      .min(0, "Display order must be a non-negative integer."),
    isFeatured: z.boolean(),
  });

/**
 * Delete schema requiring a non-empty ID.
 */
export const topperDeleteSchema = z
  .object({
    id: z
      .string()
      .trim()
      .min(1, "Record ID is required for deletion."),
  });

export type TopperInput = z.infer<typeof topperInputSchema>;
export type TopperUpdateInput = z.infer<typeof topperUpdateSchema>;
export type TopperDeleteInput = z.infer<typeof topperDeleteSchema>;

/**
 * Maps Zod issues to a structured fieldErrors dictionary.
 */
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] ? String(issue.path[0]) : "form";
    if (!fieldErrors[key]) fieldErrors[key] = [];
    fieldErrors[key].push(issue.message);
  }
  return fieldErrors;
}

/**
 * Normalizes input coming from FormData or raw JSON object into typed primitives
 * so Zod validation schemas can parse them cleanly.
 */
export function normalizeTopperPayload(
  rawInput: FormData | Record<string, unknown>
): Record<string, unknown> {
  const raw: Record<string, unknown> = {};

  if (typeof FormData !== "undefined" && rawInput instanceof FormData) {
    rawInput.forEach((value, key) => {
      raw[key] = value;
    });
  } else {
    Object.assign(raw, rawInput);
  }

  // Parse numeric scorePercent if provided as string
  if (typeof raw.scorePercent === "string") {
    const trimmed = raw.scorePercent.trim();
    if (trimmed !== "") {
      const num = Number(trimmed);
      raw.scorePercent = Number.isNaN(num) ? raw.scorePercent : num;
    }
  }

  // Parse numeric displayOrder if provided as string
  if (typeof raw.displayOrder === "string") {
    const trimmed = raw.displayOrder.trim();
    if (trimmed !== "") {
      const num = Number(trimmed);
      raw.displayOrder = Number.isNaN(num) ? raw.displayOrder : num;
    }
  }

  // Parse boolean isFeatured if provided as string
  if (typeof raw.isFeatured === "string") {
    const trimmed = raw.isFeatured.trim().toLowerCase();
    if (trimmed === "true" || trimmed === "on" || trimmed === "1") {
      raw.isFeatured = true;
    } else if (trimmed === "false" || trimmed === "0") {
      raw.isFeatured = false;
    }
  }

  // Normalize empty strings to null for optional fields
  if (typeof raw.stream === "string" && raw.stream.trim() === "") {
    raw.stream = null;
  }
  if (typeof raw.photoUrl === "string" && raw.photoUrl.trim() === "") {
    raw.photoUrl = null;
  }

  return raw;
}

export interface TopperDiffResult {
  changedFields: string[];
  diff: Record<string, { from: unknown; to: unknown }>;
}

/**
 * Pure diffing utility comparing existing database record with validated update payload.
 * Masking rule: Photo URLs are NEVER exposed in diffs, only marked [NONE] or [PRESENT].
 */
export function computeTopperDiff(
  existing: {
    studentName: string;
    scorePercent: unknown;
    grade: string;
    stream: string | null;
    academicYear: string;
    achievement: string;
    photoUrl: string | null;
    photoStorageKey?: string | null;
    displayOrder: number;
    isFeatured: boolean;
  },
  updated: {
    studentName: string;
    scorePercent: number;
    grade: string;
    stream?: string | null;
    academicYear: string;
    achievement: string;
    photoUrl?: string | null;
    photoStorageKey?: string | null;
    displayOrder: number;
    isFeatured: boolean;
  }
): TopperDiffResult {
  const changedFields: string[] = [];
  const diff: Record<string, { from: unknown; to: unknown }> = {};

  if (existing.studentName !== updated.studentName) {
    changedFields.push("studentName");
    diff.studentName = { from: existing.studentName, to: updated.studentName };
  }

  const existingScore = Number(existing.scorePercent);
  const updatedScore = Number(updated.scorePercent);
  if (Math.abs(existingScore - updatedScore) >= 0.001) {
    changedFields.push("scorePercent");
    diff.scorePercent = {
      from: Number(existingScore.toFixed(2)),
      to: Number(updatedScore.toFixed(2)),
    };
  }

  if (existing.grade !== updated.grade) {
    changedFields.push("grade");
    diff.grade = { from: existing.grade, to: updated.grade };
  }

  const existingStream = existing.stream ?? null;
  const updatedStream = updated.stream ?? null;
  if (existingStream !== updatedStream) {
    changedFields.push("stream");
    diff.stream = { from: existingStream, to: updatedStream };
  }

  if (existing.academicYear !== updated.academicYear) {
    changedFields.push("academicYear");
    diff.academicYear = { from: existing.academicYear, to: updated.academicYear };
  }

  if (existing.achievement !== updated.achievement) {
    changedFields.push("achievement");
    diff.achievement = { from: existing.achievement, to: updated.achievement };
  }

  const existingPhoto = (existing.photoStorageKey ?? existing.photoUrl ?? "").trim();
  const updatedPhoto = (updated.photoStorageKey ?? updated.photoUrl ?? "").trim();
  const existingHasPhoto = existingPhoto !== "";
  const updatedHasPhoto = updatedPhoto !== "";
  if (existingPhoto !== updatedPhoto) {
    changedFields.push("photoUrl");
    diff.photoUrl = {
      from: existingHasPhoto ? "[PRESENT]" : "[NONE]",
      to: updatedHasPhoto ? "[PRESENT]" : "[NONE]",
    };
  }

  if (existing.displayOrder !== updated.displayOrder) {
    changedFields.push("displayOrder");
    diff.displayOrder = { from: existing.displayOrder, to: updated.displayOrder };
  }

  if (existing.isFeatured !== updated.isFeatured) {
    changedFields.push("isFeatured");
    diff.isFeatured = { from: existing.isFeatured, to: updated.isFeatured };
  }

  return { changedFields, diff };
}

/**
 * Strips sensitive keys (passwords, tokens, cookies, secrets) from any metadata object
 * to prevent accidental security leakage into audit logs.
 */
export function sanitizeAuditMetadata(
  meta?: Record<string, unknown> | null
): Record<string, unknown> | undefined {
  if (!meta) return undefined;

  const forbiddenKeys = new Set([
    "password",
    "passwordhash",
    "token",
    "rawtoken",
    "sessiontoken",
    "cookie",
    "cookies",
    "secret",
    "secretkey",
    "credential",
    "authorization",
    "apikey",
    "api_key",
  ]);

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    const lowerKey = key.toLowerCase();
    const isForbidden =
      forbiddenKeys.has(lowerKey) ||
      lowerKey.includes("password") ||
      lowerKey.includes("token") ||
      lowerKey.includes("secret") ||
      lowerKey.includes("cookie");

    if (isForbidden) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeAuditMetadata(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
