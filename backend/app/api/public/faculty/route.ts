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
    const facultyRecords = await prisma.facultyMember.findMany({
      where: { isPublished: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });

    const faculty = facultyRecords.map((f) => ({
      id: f.id,
      name: f.name,
      designation: f.designation,
      department: f.department,
      qualification: f.qualification,
      experienceYears: f.experienceYears,
      bio: f.bio,
      imageUrl: resolveMediaUrl(f.imageUrl, f.imageStorageKey),
      imageAlt: f.imageAlt || `${f.name} - ${f.designation}`,
      displayOrder: f.displayOrder,
    }));

    // Extract unique sorted departments for metadata / future filtering
    const departments = Array.from(new Set(facultyRecords.map((f) => f.department))).sort();

    return NextResponse.json(
      {
        success: true,
        data: {
          faculty,
          departments,
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
    console.error("[GET /api/public/faculty] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch faculty directory",
      },
      { status: 500 }
    );
  }
}
