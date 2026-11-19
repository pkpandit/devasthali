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
    const albumRecords = await prisma.galleryAlbum.findMany({
      where: { isPublished: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      include: {
        images: {
          where: { isPublished: true },
          orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    const albums = albumRecords.map((album) => ({
      id: album.id,
      title: album.title,
      description: album.description,
      category: album.category,
      coverImage: resolveMediaUrl(album.coverImageUrl, album.coverImageStorageKey) || album.coverImageUrl,
      coverImageAlt: album.coverImageAlt || album.title,
      displayOrder: album.displayOrder,
      photos: album.images.map((img) => ({
        id: img.id,
        src: resolveMediaUrl(img.imageUrl, img.imageStorageKey) || img.imageUrl,
        imageAlt: img.imageAlt || album.title,
        caption: img.caption || "",
        displayOrder: img.displayOrder,
      })),
    }));

    const categories = Array.from(new Set(albumRecords.map((a) => a.category))).sort();

    return NextResponse.json(
      {
        success: true,
        data: {
          albums,
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
    console.error("[GET /api/public/gallery] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch gallery albums",
      },
      { status: 500 }
    );
  }
}
