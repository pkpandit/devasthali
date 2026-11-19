import { z } from "zod";
import type { NoticeItem, NoticeCategory } from "@/types/content";
import { NOTICES_DATA } from "@/lib/content/notices";

export const publicNoticeAttachmentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  fileUrl: z.string().nullable().optional(),
  fileSize: z.string().nullable().optional(),
  fileType: z.string().default("application/pdf"),
  displayOrder: z.number().default(0),
});

export const publicNoticeSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  category: z.enum(["CIRCULAR", "EXAMINATION", "ADMISSION", "EVENT"]),
  categoryLabel: z.string().min(1),
  summary: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  isUrgent: z.boolean(),
  fileUrl: z.string().nullable().optional(),
  fileSize: z.string().nullable().optional(),
  publishDate: z.string().min(1),
  publishedAt: z.string().nullable().optional(),
  expiryDate: z.string().nullable().optional(),
  isNew: z.boolean(),
  attachments: z.array(publicNoticeAttachmentSchema).default([]),
});

export const publicNoticesResponseSchema = z.object({
  data: z.array(publicNoticeSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalItems: z.number().int().nonnegative(),
    totalPages: z.number().int().positive(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
  }),
});

export type PublicNoticeAttachmentDto = z.infer<typeof publicNoticeAttachmentSchema>;
export type PublicNoticeDto = z.infer<typeof publicNoticeSchema>;

export interface GetPublicNoticesOptions {
  category?: "CIRCULAR" | "EXAMINATION" | "ADMISSION" | "EVENT" | string;
  urgentOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface GetPublicNoticesResult {
  success: boolean;
  notices: NoticeItem[];
  total: number;
  isFallback: boolean;
}

/**
 * Resolves the backend origin strictly for server-side fetches.
 * - In development: defaults to http://127.0.0.1:3001 if BACKEND_INTERNAL_URL is not set.
 * - In production: requires an explicit BACKEND_INTERNAL_URL and will not fall back to loopback.
 */
export function getBackendOrigin(): string | null {
  const envUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:3001";
  }

  return null;
}

/**
 * Formats ISO date string into human-friendly format (e.g. "10 Nov 2026").
 */
export function formatNoticeDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

/**
 * Safely converts any category string to domain NoticeCategory.
 */
export function toNoticeCategory(cat: string): NoticeCategory {
  const upper = cat.toUpperCase();
  if (upper === "CIRCULAR" || upper.includes("CIRCULAR")) return "Circular";
  if (upper === "EXAMINATION" || upper.includes("EXAM")) return "Examination";
  if (upper === "ADMISSION" || upper.includes("ADMISSION")) return "Admission";
  if (upper === "EVENT" || upper.includes("EVENT")) return "Event";
  return "Circular";
}

/**
 * Maps a validated backend PublicNoticeDto into the frontend NoticeItem domain type.
 */
export function mapNoticeDtoToItem(dto: PublicNoticeDto): NoticeItem {
  return {
    id: dto.id,
    title: dto.title,
    category: toNoticeCategory(dto.category || dto.categoryLabel),
    date: formatNoticeDate(dto.publishDate),
    isNew: dto.isNew,
    fileUrl: dto.fileUrl || undefined,
    fileSize: dto.fileSize || undefined,
    summary: dto.summary || undefined,
    content: dto.content || undefined,
    attachments: (dto.attachments || []).map((att) => ({
      id: att.id,
      title: att.title,
      fileUrl: att.fileUrl || undefined,
      fileSize: att.fileSize || undefined,
      fileType: att.fileType,
      displayOrder: att.displayOrder,
    })),
  };
}

/**
 * Fetches published notices from the backend service with bounded timeout,
 * strict schema validation, and resilient static fallback.
 * Executed strictly server-side in Server Components.
 *
 * CRITICAL CACHE & EMPTY-ARRAY INTEGRITY:
 * - Prerenderable via Next.js "use cache" directive.
 * - In development: cache: "no-store"
 * - In production: next: { revalidate: 60, tags: ["notices"] }
 * - An intentionally empty published collection returns [] and renders empty.
 * - Fallback is activated strictly on network error, non-200 HTTP, or Zod validation failure.
 */
export async function getPublicNotices(
  options: GetPublicNoticesOptions = {}
): Promise<GetPublicNoticesResult> {
  "use cache";
  const backendOrigin = getBackendOrigin();

  // If backend is unconfigured in production, seamlessly return static fallback
  if (!backendOrigin) {
    return {
      success: false,
      notices: NOTICES_DATA,
      total: NOTICES_DATA.length,
      isFallback: true,
    };
  }

  const queryParams = new URLSearchParams();
  if (options.category) queryParams.set("category", options.category);
  if (options.urgentOnly) queryParams.set("urgentOnly", "true");
  if (options.page) queryParams.set("page", String(options.page));
  if (options.limit) queryParams.set("limit", String(options.limit));

  const queryString = queryParams.toString();
  const endpoint = `${backendOrigin}/api/public/notices${queryString ? `?${queryString}` : ""}`;

  try {
    const isDev = process.env.NODE_ENV === "development";
    const res = await fetch(endpoint, {
      method: "GET",
      ...(isDev
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60, tags: ["notices"] } }),
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(4000), // 4-second bounded timeout
    });

    if (!res.ok) {
      console.warn(`[notices-api] Backend returned status ${res.status}. Falling back to static data.`);
      return {
        success: false,
        notices: NOTICES_DATA,
        total: NOTICES_DATA.length,
        isFallback: true,
      };
    }

    const json = await res.json();
    const parseResult = publicNoticesResponseSchema.safeParse(json);

    if (!parseResult.success) {
      console.warn(
        "[notices-api] Received unexpected payload schema. Falling back to static data.",
        parseResult.error.issues
      );
      return {
        success: false,
        notices: NOTICES_DATA,
        total: NOTICES_DATA.length,
        isFallback: true,
      };
    }

    const dynamicNotices = parseResult.data.data.map(mapNoticeDtoToItem);

    // CRITICAL EMPTY-ARRAY INTEGRITY:
    // If backend legitimately returned zero published notices, return authoritative empty result.
    // Do NOT fall back to static notices on a successful empty collection.
    if (dynamicNotices.length === 0) {
      return {
        success: true,
        notices: [],
        total: 0,
        isFallback: false,
      };
    }

    return {
      success: true,
      notices: dynamicNotices,
      total: parseResult.data.pagination.totalItems,
      isFallback: false,
    };
  } catch (err: unknown) {
    const errorName = err instanceof Error ? err.name : "UnknownError";
    console.warn(`[notices-api] Connection error (${errorName}). Seamlessly using static fallback.`);
    return {
      success: false,
      notices: NOTICES_DATA,
      total: NOTICES_DATA.length,
      isFallback: true,
    };
  }
}
