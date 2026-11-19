import { z } from "zod";
import type { DownloadCategoryGroup } from "@/types/content";
import { DOWNLOAD_SECTIONS } from "@/lib/content/downloads";

// ==========================================
// ZOD SCHEMAS FOR PUBLIC API VALIDATION
// ==========================================

export const publicDownloadDocumentSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  file: z.string().min(1),
  size: z.string().default("PDF Document"),
  fileType: z.string().default("application/pdf"),
  displayOrder: z.number().default(0),
});

export const publicDownloadCategorySchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  category: z.string().min(1),
  description: z.string().nullable().optional(),
  displayOrder: z.number().default(0),
  docs: z.array(publicDownloadDocumentSchema).default([]),
});

export const publicDownloadsResponseSchema = z.object({
  success: z.boolean(),
  categories: z.array(publicDownloadCategorySchema),
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
// PUBLIC FETCH METHODS
// ==========================================

/**
 * Fetches public downloads and document categories from the backend API.
 * Uses 60s revalidation with stable cache tag "downloads".
 *
 * CRITICAL EMPTY-ARRAY INTEGRITY:
 * An intentionally empty published collection returns [] and renders empty.
 * Fallback is activated strictly on network error, non-200 HTTP, or Zod validation failure.
 */
export async function getPublicDownloads(): Promise<DownloadCategoryGroup[]> {
  "use cache";
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return DOWNLOAD_SECTIONS;
  }

  const endpoint = `${backendOrigin}/api/public/downloads`;

  try {
    const isDev = process.env.NODE_ENV === "development";
    const res = await fetch(endpoint, {
      ...(isDev
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60, tags: ["downloads"] } }),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(
        `[Downloads] API returned HTTP ${res.status} from ${endpoint}. Using static fallback.`
      );
      return DOWNLOAD_SECTIONS;
    }

    const json = await res.json();
    const parsed = publicDownloadsResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.warn(
        "[Downloads] Payload validation failed. Using static fallback.",
        parsed.error.issues
      );
      return DOWNLOAD_SECTIONS;
    }

    // Map into canonical DownloadCategoryGroup[]
    const categories: DownloadCategoryGroup[] = parsed.data.categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      category: cat.category,
      description: cat.description,
      docs: cat.docs.map((doc) => ({
        id: doc.id,
        title: doc.title,
        size: doc.size,
        file: doc.file,
        description: doc.description,
      })),
    }));

    return categories;
  } catch (error) {
    console.warn(
      `[Downloads] Failed to fetch downloads from ${endpoint}. Using static fallback:`,
      error
    );
    return DOWNLOAD_SECTIONS;
  }
}
