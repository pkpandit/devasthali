import { z } from "zod";
import type { FacilityCategoryGroup, FacilityItem } from "@/types/content";
import { FACILITIES_DATA, FACILITY_IMAGE_MAP } from "@/lib/content/facilities";

// ==========================================
// ZOD SCHEMAS FOR PUBLIC API VALIDATION
// ==========================================

export const publicFacilityItemSchema = z.object({
  id: z.string().min(1),
  slug: z.string().optional(),
  title: z.string().min(1),
  description: z.string().default(""),
  image: z.string().default(""),
  imageAlt: z.string().default(""),
  iconName: z.string().default("BookOpen"),
  highlights: z.array(z.string()).default([]),
  displayOrder: z.number().default(0),
});

export const publicFacilityCategorySchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  displayOrder: z.number().default(0),
  items: z.array(publicFacilityItemSchema).default([]),
});

export const publicFacilitiesResponseSchema = z.object({
  success: z.boolean(),
  categories: z.array(publicFacilityCategorySchema),
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
 * Builds fallback category groups from static FACILITIES_DATA.
 */
function getStaticFallbackCategories(): FacilityCategoryGroup[] {
  const categoryMap = new Map<string, FacilityItem[]>();

  for (const item of FACILITIES_DATA) {
    const list = categoryMap.get(item.category) || [];
    list.push({
      ...item,
      image: FACILITY_IMAGE_MAP[item.id] || item.image || "/images/facilities/campus-grounds.jpg",
      imageAlt: item.title,
    });
    categoryMap.set(item.category, list);
  }

  return Array.from(categoryMap.entries()).map(([catTitle, items], index) => ({
    title: catTitle,
    displayOrder: index,
    items,
  }));
}

// ==========================================
// PUBLIC FETCH METHODS
// ==========================================

/**
 * Fetches public facilities and infrastructure categories from backend API.
 * Uses 60s revalidation with stable cache tag "facilities".
 *
 * CRITICAL EMPTY-ARRAY INTEGRITY:
 * An intentionally empty published collection returns [] and renders empty.
 * Fallback is activated strictly on network error, non-200 HTTP, or Zod validation failure.
 */
export async function getPublicFacilities(): Promise<FacilityCategoryGroup[]> {
  "use cache";
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return getStaticFallbackCategories();
  }

  const endpoint = `${backendOrigin}/api/public/facilities`;

  try {
    const isDev = process.env.NODE_ENV === "development";
    const res = await fetch(endpoint, {
      ...(isDev
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60, tags: ["facilities"] } }),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(
        `[Facilities] API returned HTTP ${res.status} from ${endpoint}. Using static fallback.`
      );
      return getStaticFallbackCategories();
    }

    const json = await res.json();
    const parsed = publicFacilitiesResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.warn(
        "[Facilities] Payload validation failed. Using static fallback.",
        parsed.error.issues
      );
      return getStaticFallbackCategories();
    }

    // Map into canonical FacilityCategoryGroup[]
    const categories: FacilityCategoryGroup[] = parsed.data.categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      title: cat.title,
      description: cat.description,
      displayOrder: cat.displayOrder,
      items: cat.items.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        category: cat.title,
        description: item.description,
        iconName: item.iconName,
        highlights: item.highlights,
        image: item.image || "/images/facilities/campus-grounds.jpg",
        imageAlt: item.imageAlt || item.title,
      })),
    }));

    return categories;
  } catch (error) {
    console.warn(
      `[Facilities] Failed to fetch facilities from ${endpoint}. Using static fallback:`,
      error
    );
    return getStaticFallbackCategories();
  }
}

/**
 * Convenience helper returning flattened FacilityItem[] across all published categories.
 * Preserves authoritative empty array when categories is empty.
 */
export async function getPublicFacilityItems(): Promise<FacilityItem[]> {
  const groups = await getPublicFacilities();
  return groups.flatMap((group) => group.items);
}
