import { z } from "zod";

/**
 * Validates that a string is a secure HTTPS Google Maps embed iframe URL.
 * Only official Google Maps embed domains and paths are permitted.
 * Strictly prevents javascript:, data:, external malicious hosts, or iframe phishing.
 */
export function isValidGoogleMapsEmbedUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== "string") return false;
  try {
    const parsed = new URL(urlStr.trim());
    if (parsed.protocol !== "https:") return false;

    const hostname = parsed.hostname.toLowerCase();
    const validHosts = ["www.google.com", "google.com", "maps.google.com"];
    if (!validHosts.includes(hostname)) return false;

    const pathname = parsed.pathname.toLowerCase();
    // Standard Google Maps embed: /maps/embed
    if (pathname.startsWith("/maps/embed")) return true;
    // Legacy Google Maps embed query parameter: /maps with output=embed
    if (pathname === "/maps" && parsed.searchParams.get("output") === "embed") return true;

    return false;
  } catch {
    return false;
  }
}

/**
 * Validates that a string is a secure HTTPS Google Maps navigation / directions URL.
 */
export function isValidGoogleMapsDirectionsUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== "string") return false;
  try {
    const parsed = new URL(urlStr.trim());
    if (parsed.protocol !== "https:") return false;

    const hostname = parsed.hostname.toLowerCase();
    const validHosts = [
      "www.google.com",
      "google.com",
      "maps.google.com",
      "maps.app.goo.gl",
      "goo.gl",
    ];
    if (!validHosts.includes(hostname)) return false;

    return true;
  } catch {
    return false;
  }
}

const indianPhoneRegex = /^(\+91[\-\s]?)?[6-9]\d{9}$/;

export const contactLocationSchema = z.object({
  campusAddress: z
    .string()
    .trim()
    .max(200, "Campus address cannot exceed 200 characters")
    .nullable()
    .optional(),
  tehsil: z
    .string()
    .trim()
    .max(100, "Tehsil cannot exceed 100 characters")
    .nullable()
    .optional(),
  district: z
    .string()
    .trim()
    .max(100, "District cannot exceed 100 characters")
    .nullable()
    .optional(),
  state: z
    .string()
    .trim()
    .max(100, "State cannot exceed 100 characters")
    .nullable()
    .optional(),
  pinCode: z
    .string()
    .trim()
    .max(20, "PIN code cannot exceed 20 characters")
    .nullable()
    .optional(),
  landmark: z
    .string()
    .trim()
    .max(300, "Landmark cannot exceed 300 characters")
    .nullable()
    .optional(),
  mapEmbedUrl: z
    .string()
    .trim()
    .max(1000, "Map embed URL cannot exceed 1000 characters")
    .refine((val) => !val || isValidGoogleMapsEmbedUrl(val), {
      message:
        "Map embed URL must be a valid HTTPS Google Maps embed link (e.g., https://www.google.com/maps/embed?...)",
    })
    .nullable()
    .optional(),
  mapDirectionsUrl: z
    .string()
    .trim()
    .max(1000, "Directions URL cannot exceed 1000 characters")
    .refine((val) => !val || isValidGoogleMapsDirectionsUrl(val), {
      message:
        "Directions URL must be a valid HTTPS Google Maps navigation link",
    })
    .nullable()
    .optional(),
  directionsOverview: z
    .string()
    .trim()
    .max(2000, "Directions overview cannot exceed 2000 characters")
    .nullable()
    .optional(),
  visitorGuidelines: z
    .string()
    .trim()
    .max(2000, "Visitor guidelines cannot exceed 2000 characters")
    .nullable()
    .optional(),
});

export type ContactLocationInput = z.infer<typeof contactLocationSchema>;

export const contactHelplinesSchema = z.object({
  primaryPhone: z
    .string()
    .trim()
    .max(30, "Primary phone cannot exceed 30 characters")
    .nullable()
    .optional(),
  admissionsPhone: z
    .string()
    .trim()
    .max(30, "Admissions phone cannot exceed 30 characters")
    .nullable()
    .optional(),
  receptionPhone: z
    .string()
    .trim()
    .max(30, "Reception phone cannot exceed 30 characters")
    .nullable()
    .optional(),
  hostelWardenPhone: z
    .string()
    .trim()
    .max(30, "Hostel warden phone cannot exceed 30 characters")
    .nullable()
    .optional(),
  whatsappNumber: z
    .string()
    .trim()
    .max(30, "WhatsApp number cannot exceed 30 characters")
    .nullable()
    .optional(),
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
  workingHours: z
    .string()
    .trim()
    .max(150, "Working hours cannot exceed 150 characters")
    .nullable()
    .optional(),
  emergencyMedicalPhone: z
    .string()
    .trim()
    .refine((val) => !val || indianPhoneRegex.test(val.replace(/\s+/g, "")), {
      message: "Medical emergency phone must be a valid 10-digit Indian phone number",
    })
    .or(z.literal(""))
    .nullable()
    .optional(),
  emergencySecurityPhone: z
    .string()
    .trim()
    .refine((val) => !val || indianPhoneRegex.test(val.replace(/\s+/g, "")), {
      message: "Security emergency phone must be a valid 10-digit Indian phone number",
    })
    .or(z.literal(""))
    .nullable()
    .optional(),
});

export type ContactHelplinesInput = z.infer<typeof contactHelplinesSchema>;

export function computeLocationDiff(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  const keys = [
    "campusAddress",
    "tehsil",
    "district",
    "state",
    "pinCode",
    "landmark",
    "mapEmbedUrl",
    "mapDirectionsUrl",
    "directionsOverview",
    "visitorGuidelines",
  ];

  for (const key of keys) {
    const oldVal = oldData[key] ?? null;
    const newVal = newData[key] ?? null;
    if (oldVal !== newVal) {
      diff[key] = { from: oldVal, to: newVal };
    }
  }

  return diff;
}

export function computeHelplinesDiff(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  const keys = [
    "primaryPhone",
    "admissionsPhone",
    "receptionPhone",
    "hostelWardenPhone",
    "whatsappNumber",
    "officeEmail",
    "principalEmail",
    "workingHours",
    "emergencyMedicalPhone",
    "emergencySecurityPhone",
  ];

  for (const key of keys) {
    const oldVal = oldData[key] ?? null;
    const newVal = newData[key] ?? null;
    if (oldVal !== newVal) {
      diff[key] = { from: oldVal, to: newVal };
    }
  }

  return diff;
}
