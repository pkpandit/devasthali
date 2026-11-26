import { z } from "zod";
import crypto from "crypto";

export const ADMISSION_CLASSES = [
  "LKG",
  "UKG",
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "XI COMM",
  "XI MATHS",
  "XI BIO",
  "XI HUM",
] as const;

export type AdmissionClass = (typeof ADMISSION_CLASSES)[number];

export const APPLICATION_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "VERIFIED",
  "WITHDRAWN",
  "REJECTED",
  "ARCHIVED",
] as const;

export type ApplicationStatusType = (typeof APPLICATION_STATUSES)[number];

export const ALLOWED_STATUS_TRANSITIONS: Record<
  ApplicationStatusType,
  ApplicationStatusType[]
> = {
  SUBMITTED: ["UNDER_REVIEW", "WITHDRAWN", "REJECTED"],
  UNDER_REVIEW: ["VERIFIED", "WITHDRAWN", "REJECTED"],
  VERIFIED: ["ARCHIVED", "WITHDRAWN"],
  WITHDRAWN: ["ARCHIVED"],
  REJECTED: ["ARCHIVED"],
  ARCHIVED: [],
};

const UNAMBIGUOUS_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Validates that a string is an actual calendar date in YYYY-MM-DD format,
 * represents a real day in the Gregorian calendar, and is not in the future.
 */
export function isValidNonFutureCalendarDate(dobStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dobStr)) return false;
  const [yearStr, monthStr, dayStr] = dobStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  // Check days in month (handling leap years)
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) {
    return false;
  }

  const dateObj = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  return dateObj <= today;
}

export const onlineAdmissionApplicationSchema = z.object({
  idempotencyKey: z
    .string()
    .trim()
    .min(10, "Invalid idempotency key")
    .max(64, "Idempotency key too long"),
  appliedClass: z.enum(ADMISSION_CLASSES, {
    errorMap: () => ({ message: "Please select a valid applied class" }),
  }),
  studentName: z
    .string()
    .trim()
    .min(2, "Student name must be at least 2 characters")
    .max(150, "Student name cannot exceed 150 characters"),
  dob: z
    .string()
    .trim()
    .refine(
      isValidNonFutureCalendarDate,
      "Please enter a valid, non-future calendar date of birth (YYYY-MM-DD)"
    ),
  gender: z.enum(["Male", "Female"], {
    errorMap: () => ({ message: "Please select gender (Male / Female)" }),
  }),
  nationality: z
    .string()
    .trim()
    .max(50, "Nationality cannot exceed 50 characters")
    .default("Indian"),
  religion: z
    .string()
    .trim()
    .max(50, "Religion cannot exceed 50 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  category: z
    .string()
    .trim()
    .max(50, "Category cannot exceed 50 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  mobile: z
    .string()
    .trim()
    .regex(
      /^(\+91[\-\s]?)?[0-9]{10,12}$/,
      "Please enter a valid 10-digit mobile number"
    ),
  email: z
    .string()
    .trim()
    .max(150, "Email cannot exceed 150 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null))
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      "Please enter a valid email address"
    ),
  address: z
    .string()
    .trim()
    .min(5, "Permanent address must be at least 5 characters")
    .max(500, "Permanent address cannot exceed 500 characters"),
  city: z
    .string()
    .trim()
    .min(2, "City / District is required")
    .max(100, "City cannot exceed 100 characters"),

  // Parents Details
  fatherName: z
    .string()
    .trim()
    .min(2, "Father's name must be at least 2 characters")
    .max(150, "Father's name cannot exceed 150 characters"),
  fatherMobile: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null))
    .refine(
      (val) => !val || /^(\+91[\-\s]?)?[0-9]{10,12}$/.test(val),
      "Please enter a valid mobile number for father"
    ),
  fatherOccupation: z
    .string()
    .trim()
    .max(150, "Father's occupation cannot exceed 150 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  motherName: z
    .string()
    .trim()
    .max(150, "Mother's name cannot exceed 150 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  motherMobile: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null))
    .refine(
      (val) => !val || /^(\+91[\-\s]?)?[0-9]{10,12}$/.test(val),
      "Please enter a valid mobile number for mother"
    ),
  motherOccupation: z
    .string()
    .trim()
    .max(150, "Mother's occupation cannot exceed 150 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),

  // Previous Academic Qualification
  lastAttendedClass: z
    .string()
    .trim()
    .max(50, "Last attended class cannot exceed 50 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  previousSchoolName: z
    .string()
    .trim()
    .max(255, "Previous school name cannot exceed 255 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
  previousSchoolBoard: z
    .string()
    .trim()
    .max(100, "Previous school board cannot exceed 100 characters")
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),

  // Explicit Agreement & Honeypot
  declarationAgreed: z.literal(true, {
    errorMap: () => ({
      message: "You must accept the declaration to submit the application",
    }),
  }),
  website_honey: z.string().optional().default(""),
});

export type OnlineAdmissionApplicationInput = z.infer<
  typeof onlineAdmissionApplicationSchema
>;

/**
 * Computes a deterministic SHA-256 fingerprint from normalized critical submission fields.
 */
export function computeSubmissionFingerprint(input: {
  appliedClass: string;
  studentName: string;
  dob: string;
  mobile: string;
  address: string;
  fatherName: string;
}): string {
  const normalized = [
    input.appliedClass.trim(),
    input.studentName.trim().toLowerCase(),
    input.dob.trim(),
    input.mobile.trim(),
    input.address.trim().toLowerCase(),
    input.fatherName.trim().toLowerCase(),
  ].join("|");

  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Derives a clean 4-character session code from sessionLabel.
 * e.g. "2026-27" -> "2627", "2025-26" -> "2526"
 */
export function deriveSessionCode(sessionLabel: string): string {
  const match = sessionLabel.match(/^(\d{2})(\d{2})-(\d{2})$/);
  if (match) {
    return `${match[2]}${match[3]}`;
  }
  return (
    sessionLabel.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase() ||
    "2627"
  );
}

/**
 * Validates session label format: e.g. "2026-27"
 */
export function isValidSessionLabel(sessionLabel: string): boolean {
  return /^\d{4}-\d{2}$/.test(sessionLabel.trim());
}

/**
 * Generates an unambiguous random uppercase alphanumeric code of given length.
 */
export function generateRandomCode(length = 6): string {
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += UNAMBIGUOUS_CHARS[bytes[i] % UNAMBIGUOUS_CHARS.length];
  }
  return result;
}

/**
 * Constructs canonical reference number in format: DVP-<session code>-<random code>
 * e.g. "DVP-2627-K8M4X9"
 */
export function formatApplicationNumber(
  sessionCode: string,
  randomCode: string
): string {
  return `DVP-${sessionCode}-${randomCode}`;
}

export const applicationStatusUpdateSchema = z.object({
  id: z.string().min(1, "Application ID is required"),
  status: z.enum(APPLICATION_STATUSES, {
    errorMap: () => ({ message: "Invalid application status" }),
  }),
  adminNotes: z
    .string()
    .trim()
    .max(2000, "Admin notes cannot exceed 2000 characters")
    .optional()
    .nullable(),
});

export type ApplicationStatusUpdateInput = z.infer<
  typeof applicationStatusUpdateSchema
>;

export const registrationSettingsUpdateSchema = z.object({
  isRegistrationOpen: z.boolean(),
  sessionLabel: z
    .string()
    .trim()
    .refine(
      isValidSessionLabel,
      "Session label must be in YYYY-YY format (e.g. 2026-27)"
    ),
  guidanceNotice: z
    .string()
    .trim()
    .max(2000, "Guidance notice cannot exceed 2000 characters")
    .optional()
    .nullable(),
  closedMessage: z
    .string()
    .trim()
    .max(2000, "Closed message cannot exceed 2000 characters")
    .optional()
    .nullable(),
});

export type RegistrationSettingsUpdateInput = z.infer<
  typeof registrationSettingsUpdateSchema
>;
