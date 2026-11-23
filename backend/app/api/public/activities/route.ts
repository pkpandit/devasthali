import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { isValidManagedActivityKey } from "@/lib/server/storage";

export const dynamic = "force-dynamic";

export interface PublicStudentClubDto {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  iconName: string;
  displayOrder: number;
}

export interface PublicActivityOverviewDto {
  badgeText: string | null;
  title: string | null;
  subtitle: string | null;
  arenaSize: string | null;
  cardTitle: string | null;
  cardSubtitle: string | null;
  narrativeParagraph1: string | null;
  narrativeParagraph2: string | null;
  heroImage: string | null;
  heroImageAlt: string | null;
}

export interface PublicActivitiesApiResponse {
  success: boolean;
  overview: PublicActivityOverviewDto;
  clubs: PublicStudentClubDto[];
}

/**
 * Resolves hero image storage key or URL without localhost/127.0.0.1 leakage.
 */
function resolveActivityHeroImageUrl(
  heroImage: string | null | undefined,
  heroImageStorageKey: string | null | undefined
): string | null {
  if (heroImageStorageKey && isValidManagedActivityKey(heroImageStorageKey)) {
    const origin = process.env.PUBLIC_MEDIA_ORIGIN?.replace(/\/+$/, "");
    if (origin && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
      return `${origin}/api/public/media/${heroImageStorageKey}`;
    }
    return `/api/public/media/${heroImageStorageKey}`;
  }

  if (!heroImage) return null;

  // Preserve safe root-relative path (e.g. /images/campus/sports-complex.webp)
  if (heroImage.startsWith("/")) {
    return heroImage;
  }

  // Sanitize external URLs — strip localhost/127.0.0.1 to relative path
  try {
    const parsed = new URL(heroImage);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return parsed.pathname;
    }
    return heroImage;
  } catch {
    return heroImage;
  }
}

/**
 * Public activities endpoint returning published clubs and activity overview.
 * Cache policy: 60s shared max-age in production.
 */
export async function GET() {
  try {
    const [overviewRecord, clubsRecords] = await Promise.all([
      prisma.activityOverview.findUnique({
        where: { id: "default" },
      }),
      prisma.studentClub.findMany({
        where: { isPublished: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          slug: true,
          name: true,
          category: true,
          description: true,
          iconName: true,
          displayOrder: true,
        },
      }),
    ]);

    const overview: PublicActivityOverviewDto = {
      badgeText: overviewRecord?.badgeText || null,
      title: overviewRecord?.title || null,
      subtitle: overviewRecord?.subtitle || null,
      arenaSize: overviewRecord?.arenaSize || null,
      cardTitle: overviewRecord?.cardTitle || null,
      cardSubtitle: overviewRecord?.cardSubtitle || null,
      narrativeParagraph1: overviewRecord?.narrativeParagraph1 || null,
      narrativeParagraph2: overviewRecord?.narrativeParagraph2 || null,
      heroImage: resolveActivityHeroImageUrl(
        overviewRecord?.heroImage,
        overviewRecord?.heroImageStorageKey
      ),
      heroImageAlt: overviewRecord?.heroImageAlt || null,
    };

    const response: PublicActivitiesApiResponse = {
      success: true,
      overview,
      clubs: clubsRecords,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: unknown) {
    console.error("[public-activities-api] Failed to retrieve activities data:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load activities data." },
      { status: 500 }
    );
  }
}
