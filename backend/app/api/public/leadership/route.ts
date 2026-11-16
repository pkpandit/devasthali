import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getPublicMediaOrigin } from "@/lib/server/storage";

export const dynamic = "force-dynamic";

function resolveMediaUrl(
  url: string | null | undefined,
  storageKey: string | null | undefined
): string | null {
  if (storageKey) {
    const origin = getPublicMediaOrigin();
    return `${origin}/api/public/media/${storageKey}`;
  }
  return url || null;
}

export async function GET() {
  try {
    const memberRecords = await prisma.leadershipMember.findMany({
      where: { isPublished: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });

    const members = memberRecords.map((m) => ({
      id: m.id,
      role: m.role,
      slug: m.slug,
      pageTitle: m.pageTitle,
      breadcrumb: m.breadcrumb,
      badgeText: m.badgeText,
      name: m.name,
      designation: m.designation,
      termOrAffiliation: m.termOrAffiliation,
      location: m.location,
      shortIntro: m.shortIntro,
      quote: m.quote,
      messageBody: m.messageBody,
      imageUrl: resolveMediaUrl(m.imageUrl, m.imageStorageKey),
      imageAlt: m.imageAlt,
      signatureImageUrl: resolveMediaUrl(m.signatureImageUrl, m.signatureStorageKey),
      signatureAlt: m.signatureAlt,
      bio: m.bio,
      ctaLabel: m.ctaLabel,
      ctaHref: m.ctaHref,
      displayOrder: m.displayOrder,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          members,
        },
        meta: {
          version: 1,
          generatedAt: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("[GET /api/public/leadership] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch public leadership content",
      },
      { status: 500 }
    );
  }
}
