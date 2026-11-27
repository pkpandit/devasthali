import { z } from "zod";
import type {
  PublicLifeAtSchoolOverview,
  PublicHostelSection,
  PublicTransportSection,
} from "@/types/content";

// ==========================================
// ZOD SCHEMAS FOR PUBLIC API VALIDATION
// ==========================================

export const publicHostelFeatureSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  displayOrder: z.number().int().default(0),
});

export const publicHostelSectionSchema = z.object({
  badge: z.string().default("Residential Boarding Life"),
  title: z.string().default('A Safe, Caring "Home Away From Home"'),
  description: z.string().default(""),
  features: z.array(publicHostelFeatureSchema).default([]),
});

export const publicTransportSectionSchema = z.object({
  badge: z.string().default("Day-Scholar Transport Network"),
  title: z.string().default("Safe, GPS-Tracked Transportation Fleet"),
  description: z.string().default(""),
  ctaText: z.string().default("Contact Transport Coordinator for Pick-up Node Details →"),
  ctaUrl: z.string().default("/contact"),
});

export const publicLifeAtSchoolResponseSchema = z.object({
  success: z.boolean(),
  hostel: publicHostelSectionSchema.nullable(),
  transport: publicTransportSectionSchema.nullable(),
});

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
// PUBLIC FETCH METHOD
// ==========================================

/**
 * Fetches published Life at School overview (Residential Hostel & Safe Transport Fleet).
 *
 * Cache policy:
 * - Development: no-store
 * - Production: 60s cache revalidation with stable cache tag "life_at_school"
 * - Returns { hostel: null, transport: null } on network failure or schema mismatch
 */
export async function getPublicLifeAtSchoolOverview(): Promise<PublicLifeAtSchoolOverview> {
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return { hostel: null, transport: null };
  }

  const endpoint = `${backendOrigin}/api/public/life-at-school/overview`;

  try {
    const isDev = process.env.NODE_ENV === "development";
    const res = await fetch(endpoint, {
      ...(isDev
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60, tags: ["life_at_school"] } }),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(
        `[LifeAtSchool] API returned HTTP ${res.status} from ${endpoint}. Returning empty state.`
      );
      return { hostel: null, transport: null };
    }

    const json = await res.json();
    const parsed = publicLifeAtSchoolResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.warn(
        "[LifeAtSchool] Response payload validation failed:",
        parsed.error.issues
      );
      return { hostel: null, transport: null };
    }

    return {
      hostel: parsed.data.hostel as PublicHostelSection | null,
      transport: parsed.data.transport as PublicTransportSection | null,
    };
  } catch (error) {
    console.warn(
      `[LifeAtSchool] Failed to fetch data from ${endpoint}:`,
      error
    );
    return { hostel: null, transport: null };
  }
}
