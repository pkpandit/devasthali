import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { buildPublicMediaUrl, isValidManagedKey, getPublicMediaOrigin } from "@/lib/server/storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface PublicTopperDto {
  id: string;
  studentName: string;
  scorePercent: number;
  grade: string;
  stream: string | null;
  academicYear: string;
  achievement: string;
  photoUrl: string | null;
  photoAlt: string;
  displayOrder: number;
  isFeatured: boolean;
}

export async function GET() {
  try {
    const toppers = await prisma.boardResultTopper.findMany({
      where: {
        isPublished: true,
      },
      orderBy: [
        { displayOrder: "asc" },
        { academicYear: "desc" },
        { scorePercent: "desc" },
        { id: "asc" },
      ],
      select: {
        id: true,
        studentName: true,
        scorePercent: true,
        grade: true,
        stream: true,
        academicYear: true,
        achievement: true,
        photoUrl: true,
        photoStorageKey: true,
        photoAlt: true,
        displayOrder: true,
        isFeatured: true,
      },
    });

    const mediaOrigin = getPublicMediaOrigin();

    const payload: PublicTopperDto[] = toppers.map((t) => {
      let resolvedPhotoUrl = t.photoUrl;
      if (t.photoStorageKey && isValidManagedKey(t.photoStorageKey)) {
        resolvedPhotoUrl = buildPublicMediaUrl(t.photoStorageKey);
      } else if (resolvedPhotoUrl) {
        if (!resolvedPhotoUrl.startsWith("/")) {
          try {
            const parsed = new URL(resolvedPhotoUrl);
            if (parsed.pathname.startsWith("/api/public/media/")) {
              resolvedPhotoUrl = `${mediaOrigin}${parsed.pathname}`;
            }
          } catch {
            // Keep as is if unparseable
          }
        }
      }

      const resolvedPhotoAlt = (t.photoAlt && t.photoAlt.trim() !== "")
        ? t.photoAlt.trim()
        : (resolvedPhotoUrl ? `Photo of ${t.studentName} - ${t.grade} CBSE Topper` : "");

      return {
        id: t.id,
        studentName: t.studentName,
        scorePercent: Number(t.scorePercent),
        grade: t.grade,
        stream: t.stream,
        academicYear: t.academicYear,
        achievement: t.achievement,
        photoUrl: resolvedPhotoUrl,
        photoAlt: resolvedPhotoAlt,
        displayOrder: t.displayOrder,
        isFeatured: t.isFeatured,
      };
    });

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[GET /api/public/toppers] Failed to retrieve public toppers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
        },
      }
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
