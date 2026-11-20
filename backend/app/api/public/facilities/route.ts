import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { isValidManagedFacilityKey } from "@/lib/validation/facilities";

export const dynamic = "force-dynamic";

export interface PublicFacilityItemDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  iconName: string;
  highlights: string[];
  displayOrder: number;
}

export interface PublicFacilityCategoryDto {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  displayOrder: number;
  items: PublicFacilityItemDto[];
}

export interface PublicFacilitiesApiResponse {
  success: boolean;
  categories: PublicFacilityCategoryDto[];
}

/**
 * Resolves facility image storage key or URL without localhost/127.0.0.1 leakage.
 */
function resolveFacilityPublicImageUrl(
  imageUrl: string | null | undefined,
  imageStorageKey: string | null | undefined
): string {
  if (imageStorageKey && isValidManagedFacilityKey(imageStorageKey)) {
    const origin = process.env.PUBLIC_MEDIA_ORIGIN?.replace(/\/+$/, "");
    if (origin && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
      return `${origin}/api/public/media/${imageStorageKey}`;
    }
    return `/api/public/media/${imageStorageKey}`;
  }

  if (!imageUrl) return "";

  // Preserve safe root-relative path (e.g. /images/facilities/...)
  if (imageUrl.startsWith("/")) {
    return imageUrl;
  }

  // Sanitize external URLs — strip localhost/127.0.0.1 to relative path
  try {
    const parsed = new URL(imageUrl);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return parsed.pathname;
    }
    return imageUrl;
  } catch {
    return imageUrl;
  }
}

/**
 * Public facilities endpoint returning active categories with at least one published item.
 * Cache policy: 60s shared max-age in production.
 */
export async function GET() {
  try {
    const categories = await prisma.facilityCategory.findMany({
      where: {
        isPublished: true,
        items: {
          some: {
            isPublished: true,
          },
        },
      },
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "asc" },
      ],
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        displayOrder: true,
        items: {
          where: {
            isPublished: true,
          },
          orderBy: [
            { displayOrder: "asc" },
            { createdAt: "asc" },
          ],
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            imageUrl: true,
            imageStorageKey: true,
            imageAlt: true,
            iconName: true,
            highlights: true,
            displayOrder: true,
          },
        },
      },
    });

    const data: PublicFacilityCategoryDto[] = categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      title: cat.title,
      description: cat.description,
      displayOrder: cat.displayOrder,
      items: cat.items.map((item) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        description: item.description,
        image: resolveFacilityPublicImageUrl(item.imageUrl, item.imageStorageKey),
        imageAlt: item.imageAlt,
        iconName: item.iconName || "BookOpen",
        highlights: item.highlights,
        displayOrder: item.displayOrder,
      })),
    }));

    const isDev = process.env.NODE_ENV !== "production";
    const cacheControl = isDev
      ? "no-store, no-cache, must-revalidate"
      : "public, s-maxage=60, stale-while-revalidate=300";

    return NextResponse.json(
      {
        success: true,
        categories: data,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": cacheControl,
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (err) {
    console.error("[public-facilities-api] Failed to retrieve facilities:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load facilities.",
        categories: [],
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET" } });
}

export async function PUT() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET" } });
}

export async function DELETE() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET" } });
}

export async function PATCH() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET" } });
}
