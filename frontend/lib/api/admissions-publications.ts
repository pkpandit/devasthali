import { z } from "zod";
import type {
  PublicAdmissionsPublicationsData,
  PublicAdmissionOverview,
  PublicFeeStructurePage,
  PublicAdmissionProcedureRule,
  PublicEntranceExamSubject,
} from "@/types/content";

// ==========================================
// ZOD SCHEMAS FOR PUBLIC API VALIDATION
// ==========================================

export const publicAdmissionOverviewSchema = z.object({
  sessionLabel: z.string().default("2026-27"),
  feeStructureTitle: z.string().default("Fee Structure (Session 2026–27)"),
  feeStructureSubtitle: z.string().default("Official statutory fee schedule and prospectus for Devasthaly Vidyapeeth, Chilkahar, Ballia."),
  prospectusTitle: z.string().default("Official Devasthaly Vidyapeeth Prospectus"),
  prospectusDescription: z.string().default("Complete publication containing the vision of Founder Shri Chandra Shekhar, admission eligibility, code of conduct, academic syllabus, examination assessment rules, and hostel guidelines."),
  prospectusPdfUrl: z.string().default("/documents/original/prospectus-2.pdf"),
  prospectusDisplayLabel: z.string().default("Prospectus PDF (5.6 MB)"),
  admissionChartPdfUrl: z.string().default("/documents/original/new-admission-chart-2026-27.pdf"),
  admissionChartDisplayLabel: z.string().default("Admission Chart (722 KB)"),
});

export const publicFeeStructurePageSchema = z.object({
  id: z.string().min(1),
  pageNumber: z.number().int().min(1),
  title: z.string().min(1),
  imageUrl: z.string().min(1),
  displayOrder: z.number().int().default(0),
});

export const publicAdmissionProcedureRuleSchema = z.object({
  id: z.string().min(1),
  ruleText: z.string().min(1),
  displayOrder: z.number().int().default(0),
});

export const publicEntranceExamSubjectSchema = z.object({
  id: z.string().min(1),
  classGrade: z.string().min(1),
  subjects: z.string().min(1),
  displayOrder: z.number().int().default(0),
});

export const publicAdmissionsPublicationsResponseSchema = z.object({
  success: z.boolean(),
  overview: publicAdmissionOverviewSchema.nullable(),
  feePages: z.array(publicFeeStructurePageSchema).default([]),
  procedureRules: z.array(publicAdmissionProcedureRuleSchema).default([]),
  entranceSubjects: z.array(publicEntranceExamSubjectSchema).default([]),
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
 * Fetches published admissions publications data from backend:
 * - Publication overview (session label, titles, PDF download links)
 * - Scanned fee structure chart pages
 * - Admission procedure rules
 * - Entrance examination subjects
 *
 * Cache policy:
 * - Development: no-store
 * - Production: 60s cache revalidation with stable cache tag "admissions_publications"
 * - Preserves empty arrays [] if published collections are intentionally empty
 */
export async function getPublicAdmissionsPublications(): Promise<PublicAdmissionsPublicationsData> {
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return {
      overview: null,
      feePages: [],
      procedureRules: [],
      entranceSubjects: [],
    };
  }

  const endpoint = `${backendOrigin}/api/public/admissions/publications`;

  try {
    const isDev = process.env.NODE_ENV === "development";
    const res = await fetch(endpoint, {
      ...(isDev
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60, tags: ["admissions_publications"] } }),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(
        `[AdmissionsPublications] API returned HTTP ${res.status} from ${endpoint}. Returning empty state.`
      );
      return {
        overview: null,
        feePages: [],
        procedureRules: [],
        entranceSubjects: [],
      };
    }

    const json = await res.json();
    const parsed = publicAdmissionsPublicationsResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.warn(
        "[AdmissionsPublications] Response payload validation failed:",
        parsed.error.issues
      );
      return {
        overview: null,
        feePages: [],
        procedureRules: [],
        entranceSubjects: [],
      };
    }

    return {
      overview: parsed.data.overview as PublicAdmissionOverview | null,
      feePages: parsed.data.feePages as PublicFeeStructurePage[],
      procedureRules: parsed.data.procedureRules as PublicAdmissionProcedureRule[],
      entranceSubjects: parsed.data.entranceSubjects as PublicEntranceExamSubject[],
    };
  } catch (error) {
    console.warn(
      `[AdmissionsPublications] Failed to fetch data from ${endpoint}:`,
      error
    );
    return {
      overview: null,
      feePages: [],
      procedureRules: [],
      entranceSubjects: [],
    };
  }
}
