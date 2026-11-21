import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { isValidManagedAcademicKey } from "@/lib/server/storage";

export const dynamic = "force-dynamic";

export interface PublicAcademicWingDto {
  id: string;
  slug: string;
  stageBadge: string;
  title: string;
  description: string;
  highlights: string[];
  displayOrder: number;
}

export interface PublicAcademicStreamDto {
  id: string;
  slug: string;
  title: string;
  iconName: string;
  subjects: string[];
  careerHighlight: string;
  displayOrder: number;
}

export interface PublicAcademicAssessmentRuleDto {
  id: string;
  ruleText: string;
  displayOrder: number;
}

export interface PublicAcademicOverviewDto {
  heroBadge: string | null;
  heroImage: string | null;
  heroImageAlt: string | null;
  competitiveBadge: string | null;
  competitiveTitle: string | null;
  competitiveDescription: string | null;
  competitiveCtaText: string | null;
  competitiveCtaHref: string | null;
  assessmentParentNotice: string | null;
  assessmentProspectusNotice: string | null;
  assessmentProspectusUrl: string | null;
}

export interface PublicAcademicsApiResponse {
  success: boolean;
  overview: PublicAcademicOverviewDto;
  wings: PublicAcademicWingDto[];
  streams: PublicAcademicStreamDto[];
  assessmentRules: PublicAcademicAssessmentRuleDto[];
}

/**
 * Resolves hero image storage key or URL without localhost/127.0.0.1 leakage.
 */
function resolveAcademicHeroImageUrl(
  heroImage: string | null | undefined,
  heroImageStorageKey: string | null | undefined
): string | null {
  if (heroImageStorageKey && isValidManagedAcademicKey(heroImageStorageKey)) {
    const origin = process.env.PUBLIC_MEDIA_ORIGIN?.replace(/\/+$/, "");
    if (origin && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
      return `${origin}/api/public/media/${heroImageStorageKey}`;
    }
    return `/api/public/media/${heroImageStorageKey}`;
  }

  if (!heroImage) return null;

  // Preserve safe root-relative path (e.g. /images/facilities/science-lab.jpg)
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
 * Public academics endpoint returning published wings, streams, assessment regulations, and overview.
 * Cache policy: 60s shared max-age in production.
 */
export async function GET() {
  try {
    const [overviewRecord, wingsRecords, streamsRecords, assessmentRulesRecords] =
      await Promise.all([
        prisma.academicOverview.findUnique({
          where: { id: "default" },
        }),
        prisma.academicWing.findMany({
          where: { isPublished: true },
          orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            slug: true,
            stageBadge: true,
            title: true,
            description: true,
            highlights: true,
            displayOrder: true,
          },
        }),
        prisma.academicStream.findMany({
          where: { isPublished: true },
          orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            slug: true,
            title: true,
            iconName: true,
            subjects: true,
            careerHighlight: true,
            displayOrder: true,
          },
        }),
        prisma.academicAssessmentRule.findMany({
          where: { isPublished: true },
          orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
          select: {
            id: true,
            ruleText: true,
            displayOrder: true,
          },
        }),
      ]);

    const overview: PublicAcademicOverviewDto = {
      heroBadge: overviewRecord?.heroBadge || null,
      heroImage: resolveAcademicHeroImageUrl(
        overviewRecord?.heroImage,
        overviewRecord?.heroImageStorageKey
      ),
      heroImageAlt: overviewRecord?.heroImageAlt || null,
      competitiveBadge: overviewRecord?.competitiveBadge || null,
      competitiveTitle: overviewRecord?.competitiveTitle || null,
      competitiveDescription: overviewRecord?.competitiveDescription || null,
      competitiveCtaText: overviewRecord?.competitiveCtaText || null,
      competitiveCtaHref: overviewRecord?.competitiveCtaHref || null,
      assessmentParentNotice: overviewRecord?.assessmentParentNotice || null,
      assessmentProspectusNotice: overviewRecord?.assessmentProspectusNotice || null,
      assessmentProspectusUrl: overviewRecord?.assessmentProspectusUrl || null,
    };

    const response: PublicAcademicsApiResponse = {
      success: true,
      overview,
      wings: wingsRecords,
      streams: streamsRecords,
      assessmentRules: assessmentRulesRecords,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: unknown) {
    console.error("[public-academics-api] Failed to retrieve academic data:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load academic data." },
      { status: 500 }
    );
  }
}
