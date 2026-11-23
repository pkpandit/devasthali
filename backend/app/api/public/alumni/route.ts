import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { isValidManagedAlumniKey } from "@/lib/server/storage";

export const dynamic = "force-dynamic";

export interface PublicAlumniOverviewDto {
  badgeText: string | null;
  title: string | null;
  subtitle: string | null;
}

export interface PublicAlumniReunionDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  heroImage: string | null;
  heroImageAlt: string | null;
  eventDate: string | null;
}

export interface PublicCareerOpportunityDto {
  id: string;
  slug: string;
  badgeText: string;
  title: string;
  description: string;
  contactEmail: string;
  emailSubject: string | null;
  ctaText: string;
}

export interface PublicAlumniApiResponse {
  success: boolean;
  overview: PublicAlumniOverviewDto;
  reunions: PublicAlumniReunionDto[];
  opportunities: PublicCareerOpportunityDto[];
}

/**
 * Resolves reunion hero image storage key or URL without localhost/127.0.0.1 leakage.
 */
function resolveAlumniHeroImageUrl(
  heroImage: string | null | undefined,
  heroImageStorageKey: string | null | undefined
): string | null {
  if (heroImageStorageKey && isValidManagedAlumniKey(heroImageStorageKey)) {
    const origin = process.env.PUBLIC_MEDIA_ORIGIN?.replace(/\/+$/, "");
    if (origin && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
      return `${origin}/api/public/media/${heroImageStorageKey}`;
    }
    return `/api/public/media/${heroImageStorageKey}`;
  }

  if (!heroImage) return null;

  // Preserve safe root-relative path (e.g. /images/gallery/ALUMNI-REUNION.webp)
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
 * Public alumni endpoint returning published reunions, career opportunities, and overview.
 * Orders by displayOrder asc, createdAt asc.
 * Strictly omits displayOrder, isPublished, timestamps, and storage keys from public DTOs.
 * Cache policy: 60s shared max-age in production with 300s SWR.
 */
export async function GET() {
  try {
    const [overviewRecord, reunionRecords, careerRecords] = await Promise.all([
      prisma.alumniOverview.findUnique({
        where: { id: "default" },
      }),
      prisma.alumniReunion.findMany({
        where: { isPublished: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.careerOpportunity.findMany({
        where: { isPublished: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      }),
    ]);

    const overview: PublicAlumniOverviewDto = {
      badgeText: overviewRecord?.badgeText || null,
      title: overviewRecord?.title || null,
      subtitle: overviewRecord?.subtitle || null,
    };

    const reunions: PublicAlumniReunionDto[] = reunionRecords.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      heroImage: resolveAlumniHeroImageUrl(r.heroImage, r.heroImageStorageKey),
      heroImageAlt: r.heroImageAlt || null,
      eventDate: r.eventDate || null,
    }));

    const opportunities: PublicCareerOpportunityDto[] = careerRecords.map((c) => ({
      id: c.id,
      slug: c.slug,
      badgeText: c.badgeText,
      title: c.title,
      description: c.description,
      contactEmail: c.contactEmail,
      emailSubject: c.emailSubject || null,
      ctaText: c.ctaText,
    }));

    const response: PublicAlumniApiResponse = {
      success: true,
      overview,
      reunions,
      opportunities,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: unknown) {
    console.error("[public-alumni-api] Failed to retrieve alumni data:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load alumni data." },
      { status: 500 }
    );
  }
}
