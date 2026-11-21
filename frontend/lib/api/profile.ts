import { z } from "zod";
import { SCHOOL_INFO } from "@/lib/content/settings";

export const DirectoryCategoryEnum = z.enum([
  "ADMINISTRATION",
  "HOSTEL_WARDEN",
  "ACADEMIC_COORDINATOR",
  "OFFICE_ACCOUNTS",
  "SECURITY_TRANSPORT",
]);

export type DirectoryCategory = z.infer<typeof DirectoryCategoryEnum>;

export const publicSiteProfileSchema = z.object({
  schoolName: z.string().min(1),
  tagline: z.string().nullable().optional(),
  affiliationNo: z.string().nullable().optional(),
  schoolCode: z.string().nullable().optional(),
  establishedYear: z.number().nullable().optional(),
  legacyYearsText: z.string().nullable().optional(),
  schoolType: z.string().nullable().optional(),
  medium: z.string().nullable().optional(),
  gradesOffered: z.string().nullable().optional(),
  address: z.object({
    campus: z.string().nullable().optional(),
    tehsil: z.string().nullable().optional(),
    district: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    pinCode: z.string().nullable().optional(),
    landmark: z.string().nullable().optional(),
  }),
  location: z
    .object({
      mapEmbedUrl: z.string().nullable().optional(),
      mapDirectionsUrl: z.string().nullable().optional(),
      directionsOverview: z.string().nullable().optional(),
      visitorGuidelines: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  contacts: z.object({
    primaryPhone: z.string().nullable().optional(),
    admissionsPhone: z.string().nullable().optional(),
    receptionPhone: z.string().nullable().optional(),
    hostelWardenPhone: z.string().nullable().optional(),
    whatsappNumber: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    officeEmail: z.string().nullable().optional(),
    workingHours: z.string().nullable().optional(),
    emergencyMedicalPhone: z.string().nullable().optional(),
    emergencySecurityPhone: z.string().nullable().optional(),
  }),
  social: z.object({
    facebook: z.string().nullable().optional(),
    youtube: z.string().nullable().optional(),
    instagram: z.string().nullable().optional(),
  }),
  copyrightText: z.string().nullable().optional(),
});

export type PublicSiteProfileDto = z.infer<typeof publicSiteProfileSchema>;

export const publicDirectoryEntrySchema = z.object({
  id: z.string(),
  category: DirectoryCategoryEnum,
  roleTitle: z.string(),
  contactName: z.string().nullable(),
  department: z.string().nullable(),
  phoneNumber: z.string(),
  displayOrder: z.number(),
});

export type PublicDirectoryEntryDto = z.infer<typeof publicDirectoryEntrySchema>;
export const publicDirectoryArraySchema = z.array(publicDirectoryEntrySchema);

export const STATIC_FALLBACK_SITE_PROFILE: PublicSiteProfileDto = {
  schoolName: SCHOOL_INFO.name,
  tagline: SCHOOL_INFO.tagline,
  affiliationNo: SCHOOL_INFO.affiliationNo,
  schoolCode: SCHOOL_INFO.schoolCode,
  establishedYear: SCHOOL_INFO.establishedYear,
  legacyYearsText: SCHOOL_INFO.legacyYears,
  schoolType: SCHOOL_INFO.type,
  medium: SCHOOL_INFO.medium,
  gradesOffered: SCHOOL_INFO.grades,
  address: {
    campus: SCHOOL_INFO.address.campus,
    tehsil: SCHOOL_INFO.address.tehsil,
    district: SCHOOL_INFO.address.district,
    state: SCHOOL_INFO.address.state,
    pinCode: SCHOOL_INFO.address.pinCode,
    landmark: SCHOOL_INFO.address.landmark,
  },
  location: {
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14371.74567283457!2d84.0045237871582!3d25.772635999999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399263158c6e26cf%3A0xa193d5b0373ab71c!2sDevasthaly%20Vidyapeeth!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
    mapDirectionsUrl:
      "https://maps.google.com/?q=Devasthaly+Vidyapeeth+Chilkahar+Ballia+Uttar+Pradesh+277301",
    directionsOverview:
      "Located on the Ballia–Rasra State Highway near the Chilkahar bus stop. Direct private auto-rickshaws, roadways buses, and transport connectivity available from both Ballia (22 km) and Rasra (18 km) railway stations.",
    visitorGuidelines:
      "All visitors must report to the security gate for campus entry pass issuance. Visiting hours for prospective parents and guardians are Monday to Saturday, 8:30 AM to 1:30 PM. Advance appointments recommended for Principal or admissions counseling.",
  },
  contacts: {
    primaryPhone: SCHOOL_INFO.contacts.primaryPhone,
    admissionsPhone: SCHOOL_INFO.contacts.admissionsPhone,
    receptionPhone: SCHOOL_INFO.contacts.receptionPhone,
    hostelWardenPhone: SCHOOL_INFO.contacts.hostelWardenPhone,
    whatsappNumber: SCHOOL_INFO.contacts.whatsappNumber,
    email: SCHOOL_INFO.contacts.email,
    officeEmail: SCHOOL_INFO.contacts.officeEmail,
    workingHours: SCHOOL_INFO.contacts.workingHours,
    emergencyMedicalPhone: "9415805530",
    emergencySecurityPhone: "6307798158",
  },
  social: {
    facebook: SCHOOL_INFO.social.facebook,
    youtube: SCHOOL_INFO.social.youtube,
    instagram: SCHOOL_INFO.social.instagram,
  },
  copyrightText: "© 2025 Devasthaly Vidyapeeth, Chilkahar, Ballia. All Rights Reserved.",
};

export const STATIC_FALLBACK_DIRECTORY_ENTRIES: PublicDirectoryEntryDto[] = [
  // Academic Coordinators
  { id: "fallback-coord-1", category: "ACADEMIC_COORDINATOR", roleTitle: "CO-ORDINATOR", contactName: "MRS. ANITA SINGH", department: "IX to XII (GIRLS)", phoneNumber: "9616148210", displayOrder: 1 },
  { id: "fallback-coord-2", category: "ACADEMIC_COORDINATOR", roleTitle: "CO-ORDINATOR", contactName: "MRS. SADHANA MISHRA", department: "VI to VIII (GIRLS)", phoneNumber: "9161762457", displayOrder: 2 },
  { id: "fallback-coord-3", category: "ACADEMIC_COORDINATOR", roleTitle: "CO-ORDINATOR", contactName: "MR. NEERAJ SINGH", department: "XI & XII (BOYS)", phoneNumber: "9005122930", displayOrder: 3 },
  { id: "fallback-coord-4", category: "ACADEMIC_COORDINATOR", roleTitle: "CO-ORDINATOR", contactName: "MR. CHITRASEN SINGH", department: "IX & X (BOYS)", phoneNumber: "7376867376", displayOrder: 4 },
  { id: "fallback-coord-5", category: "ACADEMIC_COORDINATOR", roleTitle: "CO-ORDINATOR", contactName: "MR. RAMESHWAR SINGH", department: "VI to VIII (BOYS)", phoneNumber: "7860436565", displayOrder: 5 },
  { id: "fallback-coord-6", category: "ACADEMIC_COORDINATOR", roleTitle: "CO-ORDINATOR", contactName: "MRS. SITA SINGH", department: "L.K.G. to II nd", phoneNumber: "9415830247", displayOrder: 6 },
  { id: "fallback-coord-7", category: "ACADEMIC_COORDINATOR", roleTitle: "CO-ORDINATOR", contactName: "MRS. SADHANA ASTHANA", department: "III rd to V th", phoneNumber: "9506892222", displayOrder: 7 },

  // Hostel Wardens
  { id: "fallback-warden-1", category: "HOSTEL_WARDEN", roleTitle: "Chief Warden", contactName: "Mr. Dhirendra Singh", department: "Hostel Administration", phoneNumber: "6307010040", displayOrder: 10 },
  { id: "fallback-warden-2", category: "HOSTEL_WARDEN", roleTitle: "Warden", contactName: "Mrs. Shalini Singh", department: "Girls Hostel", phoneNumber: "9519051030", displayOrder: 11 },
  { id: "fallback-warden-3", category: "HOSTEL_WARDEN", roleTitle: "Draupadi Niketan (Kids Wing)", contactName: "Mrs. Shanti Verma", department: "Primary Hostel", phoneNumber: "8810973997, 8887526375", displayOrder: 12 },
  { id: "fallback-warden-4", category: "HOSTEL_WARDEN", roleTitle: "Warden", contactName: "Mrs. Beena Singh", department: "Girls Wing", phoneNumber: "8858451165, 9198069451", displayOrder: 13 },
  { id: "fallback-warden-5", category: "HOSTEL_WARDEN", roleTitle: "Warden", contactName: "Mrs. Archana Rai", department: "Girls Wing", phoneNumber: "8176841070, 7800529868", displayOrder: 14 },
  { id: "fallback-warden-6", category: "HOSTEL_WARDEN", roleTitle: "Sadanand Niketan", contactName: "Mr. Amit Singh", department: "Boys Hostel", phoneNumber: "7309186668", displayOrder: 15 },
  { id: "fallback-warden-7", category: "HOSTEL_WARDEN", roleTitle: "Warden", contactName: "Mr. Purushottam Ojha", department: "Boys Hostel", phoneNumber: "7355467982, 7003176352", displayOrder: 16 },
  { id: "fallback-warden-8", category: "HOSTEL_WARDEN", roleTitle: "Warden", contactName: "Mr. Ravi Prakash", department: "Boys Hostel", phoneNumber: "6387266720, 9473723117", displayOrder: 17 },
  { id: "fallback-warden-9", category: "HOSTEL_WARDEN", roleTitle: "Warden", contactName: "Mr. Akash", department: "Boys Hostel", phoneNumber: "8756641048, 9984117456", displayOrder: 18 },
  { id: "fallback-warden-10", category: "HOSTEL_WARDEN", roleTitle: "J.P. Niketan", contactName: "Mr. M. K. Ojha", department: "Senior Boys Hostel", phoneNumber: "9140702961, 9554960406", displayOrder: 19 },
  { id: "fallback-warden-11", category: "HOSTEL_WARDEN", roleTitle: "Warden", contactName: "Mr. Mrityunjay Singh", department: "Boys Hostel", phoneNumber: "8318399947, 7307368482", displayOrder: 20 },
  { id: "fallback-warden-12", category: "HOSTEL_WARDEN", roleTitle: "Warden", contactName: "Mr. Ashish Mani", department: "Boys Hostel", phoneNumber: "9651904529, 7052921300", displayOrder: 21 },

  // Administration
  { id: "fallback-admin-1", category: "ADMINISTRATION", roleTitle: "VICE-PRINCIPAL", contactName: "MRS. MAMTA SINGH", department: "Administration", phoneNumber: "6306580532", displayOrder: 30 },
  { id: "fallback-admin-2", category: "ADMINISTRATION", roleTitle: "Reception Desk", contactName: "Mr. B. C. Dubey", department: "Front Desk & Inquiries", phoneNumber: "9554960415", displayOrder: 31 },

  // Security & Medical (mapped to SECURITY_TRANSPORT)
  { id: "fallback-sec-1", category: "SECURITY_TRANSPORT", roleTitle: "Medical Emergency Desk", contactName: "Dr. Deepak Chaubey", department: "Campus Health Centre", phoneNumber: "9415805530", displayOrder: 40 },
  { id: "fallback-sec-2", category: "SECURITY_TRANSPORT", roleTitle: "Main Gate Security", contactName: "Guard 1st", department: "Campus Security", phoneNumber: "7753914135", displayOrder: 41 },
  { id: "fallback-sec-3", category: "SECURITY_TRANSPORT", roleTitle: "DVP School Security", contactName: "Guard 2nd", department: "Campus Security", phoneNumber: "6307798158", displayOrder: 42 },

  // Admissions & Accounts (mapped to OFFICE_ACCOUNTS)
  { id: "fallback-acc-1", category: "OFFICE_ACCOUNTS", roleTitle: "Fee Counter", contactName: "Mr. Mukesh Prasad", department: "Fee Counter 1", phoneNumber: "9250930763", displayOrder: 50 },
  { id: "fallback-acc-2", category: "OFFICE_ACCOUNTS", roleTitle: "Fee Counter", contactName: "Mr. Satyendra Singh", department: "Fee Counter 2", phoneNumber: "9451491906", displayOrder: 51 },
  { id: "fallback-acc-3", category: "OFFICE_ACCOUNTS", roleTitle: "Accountant", contactName: "Mr. Dhananjay", department: "Accounts & Finance", phoneNumber: "9554960408", displayOrder: 52 },
];

export function getBackendOrigin(): string | null {
  const envUrl = process.env.BACKEND_INTERNAL_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:3001";
  }

  return null;
}

/**
 * Server-side fetch for the institutional SiteProfile singleton.
 * Resiliently falls back to static SCHOOL_INFO when backend is unreachable.
 *
 * CROSS-PROCESS CACHE ISOLATION:
 * The frontend and backend run as separate Next.js application processes.
 * Backend revalidateTag calls do not invalidate the separate frontend process cache.
 * Instead:
 * - Development: updates reflect immediately via cache: "no-store".
 * - Production: updates reflect within the 60-second revalidation window via next: { revalidate: 60, tags: ["profile"] }.
 * - Fallback: preserves static SCHOOL_INFO fallback on network errors, non-200 HTTP, or Zod validation errors.
 */
export async function getPublicSiteProfile(): Promise<PublicSiteProfileDto> {
  "use cache";
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return STATIC_FALLBACK_SITE_PROFILE;
  }

  const endpoint = `${backendOrigin}/api/public/profile`;

  try {
    const isDev = process.env.NODE_ENV === "development";
    const res = await fetch(endpoint, {
      ...(isDev
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60, tags: ["profile"] } }),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(`[profile-api] Non-200 status (${res.status}) from ${endpoint}; using static fallback.`);
      return STATIC_FALLBACK_SITE_PROFILE;
    }

    const json = await res.json();
    const parsed = publicSiteProfileSchema.safeParse(json);
    if (!parsed.success) {
      console.warn("[profile-api] Profile schema validation failed; using static fallback.", parsed.error.issues);
      return STATIC_FALLBACK_SITE_PROFILE;
    }

    return parsed.data;
  } catch (err) {
    console.warn(`[profile-api] Network/fetch error connecting to ${endpoint}; using static fallback.`, err);
    return STATIC_FALLBACK_SITE_PROFILE;
  }
}

/**
 * Server-side fetch for published campus directory contacts.
 * Resiliently falls back to static contact lists when backend is unreachable.
 *
 * CROSS-PROCESS CACHE ISOLATION:
 * The frontend and backend run as separate Next.js application processes.
 * Backend revalidateTag calls do not invalidate the separate frontend process cache.
 * Instead:
 * - Development: updates reflect immediately via cache: "no-store".
 * - Production: updates reflect within the 60-second revalidation window via next: { revalidate: 60, tags: ["directory"] }.
 * - Fallback: preserves static contact list fallback on network errors, non-200 HTTP, or Zod validation errors.
 */
export async function getPublicCampusDirectory(): Promise<PublicDirectoryEntryDto[]> {
  "use cache";
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return STATIC_FALLBACK_DIRECTORY_ENTRIES;
  }

  const endpoint = `${backendOrigin}/api/public/directory`;

  try {
    const isDev = process.env.NODE_ENV === "development";
    const res = await fetch(endpoint, {
      ...(isDev
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60, tags: ["directory"] } }),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(`[directory-api] Non-200 status (${res.status}) from ${endpoint}; using static fallback.`);
      return STATIC_FALLBACK_DIRECTORY_ENTRIES;
    }

    const json = await res.json();
    const parsed = publicDirectoryArraySchema.safeParse(json);
    if (!parsed.success) {
      console.warn("[directory-api] Directory schema validation failed; using static fallback.", parsed.error.issues);
      return STATIC_FALLBACK_DIRECTORY_ENTRIES;
    }

    return parsed.data;
  } catch (err) {
    console.warn(`[directory-api] Network/fetch error connecting to ${endpoint}; using static fallback.`, err);
    return STATIC_FALLBACK_DIRECTORY_ENTRIES;
  }
}

/**
 * Safely validate whether an embed URL points to trusted Google Maps HTTPS embed endpoint.
 */
export function isValidGoogleMapsEmbedUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    const isGoogle = host === "www.google.com" || host === "google.com" || host === "maps.google.com";
    if (!isGoogle) return false;
    return (
      parsed.pathname.startsWith("/maps/embed") ||
      (parsed.pathname.startsWith("/maps") && parsed.searchParams.get("output") === "embed")
    );
  } catch {
    return false;
  }
}
