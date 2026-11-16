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
    const [settingRecord, credentialsRecords, narrativeRecords] = await Promise.all([
      prisma.aboutPageSetting.findUnique({
        where: { id: "default" },
      }),
      prisma.aboutCredential.findMany({
        where: { isPublished: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.aboutNarrativeSection.findMany({
        where: { isPublished: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      }),
    ]);

    const setting =
      settingRecord && settingRecord.isPublished
        ? {
            breadcrumb: settingRecord.breadcrumb,
            heading: settingRecord.heading,
            subheading: settingRecord.subheading,
            showcaseImageUrl: resolveMediaUrl(
              settingRecord.showcaseImageUrl,
              settingRecord.showcaseImageStorageKey
            ),
            showcaseImageAlt: settingRecord.showcaseImageAlt,
            showcaseBadge: settingRecord.showcaseBadge,
          }
        : null;

    const credentials = credentialsRecords.map((c) => ({
      id: c.id,
      category: c.category,
      title: c.title,
      subtext: c.subtext,
      iconName: c.iconName,
      displayOrder: c.displayOrder,
    }));

    const narrativeSections = narrativeRecords.map((n) => ({
      id: n.id,
      heading: n.heading,
      body: n.body,
      imageUrl: resolveMediaUrl(n.imageUrl, n.imageStorageKey),
      imageAlt: n.imageAlt,
      displayOrder: n.displayOrder,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          setting,
          credentials,
          narrativeSections,
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
    console.error("[GET /api/public/about] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch public about content",
      },
      { status: 500 }
    );
  }
}
