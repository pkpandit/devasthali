import { z } from "zod";
import type { PublicFacultyData } from "@/types/faculty";
import { FACULTY_DATA, FACULTY_IMAGE_MAP } from "@/lib/content/academics";

// ==========================================
// ZOD SCHEMAS FOR PUBLIC API VALIDATION
// ==========================================

export const publicFacultyMemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  designation: z.string().min(1),
  department: z.string().min(1),
  qualification: z.string().nullable().optional(),
  experienceYears: z.number().default(0),
  bio: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  imageAlt: z.string().default(""),
  displayOrder: z.number().default(0),
});

export const publicFacultyResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    faculty: z.array(publicFacultyMemberSchema),
    departments: z.array(z.string()).default([]),
  }),
});

// ==========================================
// STATIC EMERGENCY FALLBACK
// ==========================================

export const STATIC_FALLBACK_FACULTY: PublicFacultyData = {
  faculty: FACULTY_DATA.map((fac, idx) => ({
    id: `fallback-faculty-${idx}`,
    name: fac.name,
    designation: fac.designation,
    department: fac.department,
    qualification: fac.qualification,
    experienceYears: fac.experienceYears,
    bio: null,
    imageUrl: FACULTY_IMAGE_MAP[fac.name] || "/images/academics/faculty/faculty-teachers.jpg",
    imageAlt: `${fac.name} - ${fac.designation}`,
    displayOrder: idx,
  })),
  departments: Array.from(new Set(FACULTY_DATA.map((f) => f.department))).sort(),
};

// ==========================================
// BACKEND URL RESOLUTION
// ==========================================

function getBackendOrigin(): string | null {
  if (process.env.BACKEND_INTERNAL_URL) {
    return process.env.BACKEND_INTERNAL_URL.replace(/\/+$/, "");
  }

  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://127.0.0.1:3001";
  }

  return null;
}

// ==========================================
// PUBLIC FETCH METHODS
// ==========================================

/**
 * Fetches public faculty directory from the backend API.
 * Uses 60s revalidation with stable cache tag "faculty".
 *
 * CRITICAL EMPTY-ARRAY INTEGRITY:
 * An intentionally empty published collection returns [] and renders empty.
 * Fallback is activated strictly on network error, non-200 HTTP, or Zod validation failure.
 */
export async function getPublicFaculty(): Promise<PublicFacultyData> {
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return STATIC_FALLBACK_FACULTY;
  }

  const endpoint = `${backendOrigin}/api/public/faculty`;

  try {
    const isDev = process.env.NODE_ENV === "development";
    const res = await fetch(endpoint, {
      ...(isDev
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60, tags: ["faculty"] } }),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(
        `[Faculty] API returned HTTP ${res.status} from ${endpoint}. Using static fallback.`
      );
      return STATIC_FALLBACK_FACULTY;
    }

    const json = await res.json();
    const parsed = publicFacultyResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.warn(
        "[Faculty] Payload validation failed. Using static fallback.",
        parsed.error.issues
      );
      return STATIC_FALLBACK_FACULTY;
    }

    return parsed.data.data;
  } catch (error) {
    console.warn(
      `[Faculty] Failed to fetch faculty directory from ${endpoint}. Using static fallback:`,
      error instanceof Error ? error.message : String(error)
    );
    return STATIC_FALLBACK_FACULTY;
  }
}
