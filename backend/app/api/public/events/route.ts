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
    const eventRecords = await prisma.schoolEvent.findMany({
      where: { isPublished: true },
      orderBy: [{ displayOrder: "asc" }, { isoDate: "asc" }, { createdAt: "asc" }],
    });

    const events = eventRecords.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      desc: e.description,
      eventDate: e.eventDate,
      date: e.eventDate,
      isoDate: e.isoDate ? e.isoDate.toISOString().split("T")[0] : "",
      time: e.time,
      location: e.location,
      venue: e.location,
      category: e.category,
      linkHref: e.linkHref,
      linkLabel: e.linkLabel,
      coverImageUrl: resolveMediaUrl(e.coverImageUrl, e.coverImageStorageKey),
      coverImageAlt: e.coverImageAlt || e.title,
      displayOrder: e.displayOrder,
    }));

    const categories = Array.from(new Set(eventRecords.map((e) => e.category).filter(Boolean))).sort();

    return NextResponse.json(
      {
        success: true,
        data: {
          events,
          categories,
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
    console.error("[GET /api/public/events] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch school events",
      },
      { status: 500 }
    );
  }
}
