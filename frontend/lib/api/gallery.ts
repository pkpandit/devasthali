import { z } from "zod";
import { GALLERY_ALBUMS } from "@/lib/content/gallery";
import type { GalleryAlbum, GalleryCategory } from "@/types/content";

// ==========================================
// ZOD SCHEMAS FOR PUBLIC API VALIDATION
// ==========================================

export const publicGalleryPhotoSchema = z.object({
  id: z.string().optional(),
  src: z.string().min(1),
  imageAlt: z.string().default(""),
  caption: z.string().default(""),
  displayOrder: z.number().default(0),
});

export const publicGalleryAlbumSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  category: z.string().min(1),
  coverImage: z.string().min(1),
  coverImageAlt: z.string().default(""),
  displayOrder: z.number().default(0),
  photos: z.array(publicGalleryPhotoSchema).default([]),
});

export const publicGalleryResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    albums: z.array(publicGalleryAlbumSchema),
    categories: z.array(z.string()).default([]),
  }),
});

export interface PublicGalleryData {
  albums: GalleryAlbum[];
  categories: string[];
}

// ==========================================
// STATIC EMERGENCY FALLBACK
// ==========================================

export const STATIC_FALLBACK_GALLERY: PublicGalleryData = {
  albums: GALLERY_ALBUMS,
  categories: Array.from(new Set(GALLERY_ALBUMS.map((a) => a.category))).sort(),
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
 * Fetches public gallery albums and photos from the backend API.
 * Uses 60s revalidation with stable cache tag "gallery".
 *
 * CRITICAL EMPTY-ARRAY INTEGRITY:
 * An intentionally empty published collection returns [] and renders empty.
 * Fallback is activated strictly on network error, non-200 HTTP, or Zod validation failure.
 */
export async function getPublicGallery(): Promise<PublicGalleryData> {
  "use cache";
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return STATIC_FALLBACK_GALLERY;
  }

  const endpoint = `${backendOrigin}/api/public/gallery`;

  try {
    const isDev = process.env.NODE_ENV === "development";
    const res = await fetch(endpoint, {
      ...(isDev
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60, tags: ["gallery"] } }),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(
        `[Gallery] API returned HTTP ${res.status} from ${endpoint}. Using static fallback.`
      );
      return STATIC_FALLBACK_GALLERY;
    }

    const json = await res.json();
    const parsed = publicGalleryResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.warn(
        "[Gallery] Payload validation failed. Using static fallback.",
        parsed.error.issues
      );
      return STATIC_FALLBACK_GALLERY;
    }

    const albums: GalleryAlbum[] = parsed.data.data.albums.map((album) => ({
      id: album.id,
      title: album.title,
      description: album.description ?? undefined,
      category: album.category as GalleryCategory,
      coverImage: album.coverImage,
      photos: album.photos.map((p) => ({
        src: p.src,
        caption: p.caption,
      })),
    }));

    return {
      albums,
      categories: parsed.data.data.categories,
    };
  } catch (error) {
    console.warn(
      `[Gallery] Failed to fetch gallery albums from ${endpoint}. Using static fallback:`,
      error
    );
    return STATIC_FALLBACK_GALLERY;
  }
}
