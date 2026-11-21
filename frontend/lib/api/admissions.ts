import { z } from "zod";
import type {
  PublicAdmissionsData,
  AdmissionStepItem,
  AdmissionEligibilityCriteriaItem,
  AdmissionDocumentRequirementItem,
  AdmissionFaqItem,
} from "@/types/content";
import { ADMISSION_DOCUMENTS_REQUIRED } from "@/lib/content/admissions";
import { HOME_FAQ_DATA } from "@/lib/content/home";

// ==========================================
// ZOD SCHEMAS FOR PUBLIC API VALIDATION
// ==========================================

export const publicAdmissionStepSchema = z.object({
  id: z.string().min(1),
  stepNumber: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(""),
  displayOrder: z.number().default(0),
});

export const publicAdmissionEligibilitySchema = z.object({
  id: z.string().min(1),
  classGrade: z.string().min(1),
  ageRequirement: z.string().min(1),
  evaluationMode: z.string().min(1),
  displayOrder: z.number().default(0),
});

export const publicAdmissionDocumentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  displayOrder: z.number().default(0),
});

export const publicAdmissionFaqSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  displayOrder: z.number().default(0),
});

export const publicAdmissionsResponseSchema = z.object({
  success: z.boolean(),
  steps: z.array(publicAdmissionStepSchema).default([]),
  eligibilityCriteria: z.array(publicAdmissionEligibilitySchema).default([]),
  documentRequirements: z.array(publicAdmissionDocumentSchema).default([]),
  faqs: z.array(publicAdmissionFaqSchema).default([]),
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

/**
 * Builds static fallback data when backend is completely unreachable or throws.
 */
export function getStaticFallbackAdmissions(): PublicAdmissionsData {
  const steps: AdmissionStepItem[] = [
    {
      id: "step-1",
      stepNumber: "01",
      title: "Online Enquiry",
      description: "Submit the quick form below or send a WhatsApp message to receive the 2026–27 prospectus.",
      displayOrder: 0,
    },
    {
      id: "step-2",
      stepNumber: "02",
      title: "Campus Interaction",
      description: "Visit our Chilkahar campus for an informal interaction (LKG-I) or diagnostic assessment (II-XI).",
      displayOrder: 1,
    },
    {
      id: "step-3",
      stepNumber: "03",
      title: "Document Verification",
      description: "Verification of child's birth certificate, Aadhaar card, previous report cards, and transfer certificate.",
      displayOrder: 2,
    },
    {
      id: "step-4",
      stepNumber: "04",
      title: "Provisional Enrollment",
      description: "Complete registration fee payment, uniform requisition, and hostel room allocation (for boarders).",
      displayOrder: 3,
    },
  ];

  const eligibilityCriteria: AdmissionEligibilityCriteriaItem[] = [
    {
      id: "elig-1",
      classGrade: "LKG / Nursery",
      ageRequirement: "3 to 4 Years",
      evaluationMode: "Informal Parent-Child Observation",
      displayOrder: 0,
    },
    {
      id: "elig-2",
      classGrade: "UKG / KG",
      ageRequirement: "4 to 5 Years",
      evaluationMode: "Basic Learning Readiness Assessment",
      displayOrder: 1,
    },
    {
      id: "elig-3",
      classGrade: "Class I",
      ageRequirement: "6+ Years (NEP Mandate)",
      evaluationMode: "Oral & Written Readiness",
      displayOrder: 2,
    },
    {
      id: "elig-4",
      classGrade: "Classes II to VIII",
      ageRequirement: "Age commensurate with grade",
      evaluationMode: "Written Aptitude Test (English & Mathematics)",
      displayOrder: 3,
    },
    {
      id: "elig-5",
      classGrade: "Class IX & X",
      ageRequirement: "13+ / 14+ Years",
      evaluationMode: "Diagnostic Test (Eng, Math, Sci) & Previous Marksheet",
      displayOrder: 4,
    },
    {
      id: "elig-6",
      classGrade: "Class XI (Sci/Com/Hum)",
      ageRequirement: "Class X Board Qualified",
      evaluationMode: "Class X Board Percentage & Stream Aptitude Counselling",
      displayOrder: 5,
    },
  ];

  const documentRequirements: AdmissionDocumentRequirementItem[] =
    ADMISSION_DOCUMENTS_REQUIRED.map((doc, idx) => ({
      id: `doc-${idx + 1}`,
      title: doc,
      description: null,
      displayOrder: idx,
    }));

  const faqs: AdmissionFaqItem[] = HOME_FAQ_DATA.map((faq, idx) => ({
    id: `faq-${idx + 1}`,
    question: faq.question,
    answer: faq.answer,
    displayOrder: idx,
  }));

  return {
    steps,
    eligibilityCriteria,
    documentRequirements,
    faqs,
  };
}

// ==========================================
// PUBLIC FETCH METHOD
// ==========================================

/**
 * Fetches published admissions steps, eligibility table, document requirements, and FAQs.
 * Uses 60s cache revalidation with stable cache tag "admissions".
 *
 * CRITICAL EMPTY-ARRAY INTEGRITY:
 * An intentionally empty published collection returns [] and renders empty.
 * Fallback is activated strictly on network error, non-200 HTTP, or Zod validation failure.
 */
export async function getPublicAdmissions(): Promise<PublicAdmissionsData> {
  "use cache";
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return getStaticFallbackAdmissions();
  }

  const endpoint = `${backendOrigin}/api/public/admissions`;

  try {
    const isDev = process.env.NODE_ENV === "development";
    const res = await fetch(endpoint, {
      ...(isDev
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60, tags: ["admissions"] } }),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(
        `[Admissions] API returned HTTP ${res.status} from ${endpoint}. Using static fallback.`
      );
      return getStaticFallbackAdmissions();
    }

    const json = await res.json();
    const parsed = publicAdmissionsResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.warn(
        "[Admissions] Payload validation failed. Using static fallback.",
        parsed.error.issues
      );
      return getStaticFallbackAdmissions();
    }

    // Authoritative return: preserves exact arrays returned by backend (even if empty)
    return {
      steps: parsed.data.steps,
      eligibilityCriteria: parsed.data.eligibilityCriteria,
      documentRequirements: parsed.data.documentRequirements.map((d) => ({
        id: d.id,
        title: d.title,
        description: d.description ?? null,
        displayOrder: d.displayOrder,
      })),
      faqs: parsed.data.faqs,
    };
  } catch (error) {
    console.warn(
      `[Admissions] Failed to fetch admissions data from ${endpoint}. Using static fallback:`,
      error
    );
    return getStaticFallbackAdmissions();
  }
}
