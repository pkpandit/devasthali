import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface PublicTopperDto {
  studentName: string;
  scorePercent: number;
  grade: string;
  stream: string | null;
  academicYear: string;
  achievement: string;
  photoUrl: string | null;
  isFeatured: boolean;
}

export async function GET() {
  try {
    const toppers = await prisma.boardResultTopper.findMany({
      orderBy: [
        { academicYear: "desc" },
        { displayOrder: "asc" },
        { scorePercent: "desc" },
        { id: "asc" },
      ],
      select: {
        studentName: true,
        scorePercent: true,
        grade: true,
        stream: true,
        academicYear: true,
        achievement: true,
        photoUrl: true,
        isFeatured: true,
      },
    });

    const payload: PublicTopperDto[] = toppers.map((t) => ({
      studentName: t.studentName,
      scorePercent: Number(t.scorePercent),
      grade: t.grade,
      stream: t.stream,
      academicYear: t.academicYear,
      achievement: t.achievement,
      photoUrl: t.photoUrl,
      isFeatured: t.isFeatured,
    }));

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
