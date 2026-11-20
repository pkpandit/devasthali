import { z } from "zod";
import type { MandatoryDisclosureSection } from "@/types/content";
import {
  MANDATORY_COMPLIANCE_DOCS,
  MANDATORY_RESULTS_ACADEMICS,
} from "@/lib/content/mandatory-disclosure";

// ==========================================
// ZOD SCHEMAS FOR PUBLIC API VALIDATION
// ==========================================

export const publicDisclosureDocumentSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  fileUrl: z.string().min(1),
  linkLabel: z.string().default("VIEW/DOWNLOAD"),
  fileSizeBytes: z.number().default(0),
  fileSize: z.string().default("PDF Document"),
  fileType: z.string().default("application/pdf"),
  displayOrder: z.number().default(0),
});

export const publicDisclosureSectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  displayOrder: z.number().default(0),
  documents: z.array(publicDisclosureDocumentSchema).default([]),
});

export const publicDisclosureResponseSchema = z.object({
  success: z.boolean(),
  sections: z.array(publicDisclosureSectionSchema),
});

// ==========================================
// STATIC FALLBACK DATA
// ==========================================

export function getStaticFallbackSections(): MandatoryDisclosureSection[] {
  return [
    {
      id: "static-documents-and-information",
      title: "DOCUMENTS AND INFORMATION",
      description: null,
      displayOrder: 1,
      documents: MANDATORY_COMPLIANCE_DOCS.map((doc, idx) => ({
        id: doc.id || `static-doc-b-${idx + 1}`,
        title: doc.doc,
        description: doc.description || null,
        fileUrl: doc.file,
        linkLabel: doc.linkLabel || "VIEW/DOWNLOAD",
        fileSizeBytes: 0,
        fileSize: doc.size || "PDF Document",
        fileType: "application/pdf",
        displayOrder: idx + 1,
      })),
    },
    {
      id: "static-results-and-academics",
      title: "RESULTS AND ACADEMICS",
      description: null,
      displayOrder: 2,
      documents: MANDATORY_RESULTS_ACADEMICS.map((doc, idx) => ({
        id: doc.id || `static-doc-c-${idx + 1}`,
        title: doc.doc,
        description: doc.description || null,
        fileUrl: doc.file,
        linkLabel: doc.linkLabel || "VIEW/DOWNLOAD",
        fileSizeBytes: 0,
        fileSize: doc.size || "PDF Document",
        fileType: "application/pdf",
        displayOrder: idx + 1,
      })),
    },
  ];
}

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
 * Fetches public mandatory disclosure sections and documents from backend API.
 * Uses 60s revalidation with stable cache tag "mandatory-disclosure".
 *
 * CRITICAL EMPTY-ARRAY INTEGRITY:
 * An intentionally empty published collection returns [] and renders empty.
 * Fallback is activated strictly on network error, non-200 HTTP, or Zod validation failure.
 */
export async function getPublicMandatoryDisclosure(): Promise<MandatoryDisclosureSection[]> {
  "use cache";
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return getStaticFallbackSections();
  }

  const endpoint = `${backendOrigin}/api/public/mandatory-disclosure`;

  try {
    const isDev = process.env.NODE_ENV === "development";
    const res = await fetch(endpoint, {
      ...(isDev
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60, tags: ["mandatory-disclosure"] } }),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(
        `[MandatoryDisclosure] API returned HTTP ${res.status} from ${endpoint}. Using static fallback.`
      );
      return getStaticFallbackSections();
    }

    const json = await res.json();
    const parsed = publicDisclosureResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.warn(
        "[MandatoryDisclosure] Payload validation failed. Using static fallback.",
        parsed.error.issues
      );
      return getStaticFallbackSections();
    }

    // Map into canonical MandatoryDisclosureSection[]
    const sections: MandatoryDisclosureSection[] = parsed.data.sections.map((sec) => ({
      id: sec.id,
      title: sec.title,
      description: sec.description ?? null,
      displayOrder: sec.displayOrder,
      documents: sec.documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        description: doc.description ?? null,
        fileUrl: doc.fileUrl,
        linkLabel: doc.linkLabel || "VIEW/DOWNLOAD",
        fileSizeBytes: doc.fileSizeBytes,
        fileSize: doc.fileSize,
        fileType: doc.fileType,
        displayOrder: doc.displayOrder,
      })),
    }));

    return sections;
  } catch (error) {
    console.warn(
      `[MandatoryDisclosure] Failed to fetch mandatory disclosure from ${endpoint}. Using static fallback:`,
      error
    );
    return getStaticFallbackSections();
  }
}
