import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getPublicMediaOrigin } from "@/lib/server/storage";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

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

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Leadership member slug is required" },
        { status: 400 }
      );
    }

    const member = await prisma.leadershipMember.findUnique({
      where: { slug: slug.trim() },
    });

    if (!member || !member.isPublished) {
      return NextResponse.json(
        {
          success: false,
          error: "Leadership message not found or not published",
        },
        {
          status: 404,
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    }

    const data = {
      id: member.id,
      role: member.role,
      slug: member.slug,
      pageTitle: member.pageTitle,
      breadcrumb: member.breadcrumb,
      badgeText: member.badgeText,
      name: member.name,
      designation: member.designation,
      termOrAffiliation: member.termOrAffiliation,
      location: member.location,
      shortIntro: member.shortIntro,
      quote: member.quote,
      messageBody: member.messageBody,
      imageUrl: resolveMediaUrl(member.imageUrl, member.imageStorageKey),
      imageAlt: member.imageAlt,
      signatureImageUrl: resolveMediaUrl(
        member.signatureImageUrl,
        member.signatureStorageKey
      ),
      signatureAlt: member.signatureAlt,
      bio: member.bio,
      ctaLabel: member.ctaLabel,
      ctaHref: member.ctaHref,
      displayOrder: member.displayOrder,
    };

    return NextResponse.json(
      {
        success: true,
        data,
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
    console.error("[GET /api/public/leadership/[slug]] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch leadership member content",
      },
      { status: 500 }
    );
  }
}
