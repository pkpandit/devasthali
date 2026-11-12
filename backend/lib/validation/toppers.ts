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
 * Canonical BoardResultTopper input schema for create/update validation.
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

export type TopperInput = z.infer<typeof topperInputSchema>;
