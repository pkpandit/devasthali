import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import type { DirectoryCategory } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface PublicDirectoryEntryDto {
  id: string;
  category: DirectoryCategory;
  roleTitle: string;
  contactName: string | null;
  department: string | null;
  phoneNumber: string;
  displayOrder: number;
}

export async function GET() {
  try {
    const entries = await prisma.campusDirectoryEntry.findMany({
      where: { isPublished: true },
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "asc" },
      ],
      select: {
        id: true,
        category: true,
        roleTitle: true,
        contactName: true,
        department: true,
        phoneNumber: true,
        displayOrder: true,
      },
    });

    return NextResponse.json(entries, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("[public-directory-api] GET error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve campus directory" },
      { status: 500 }
    );
  }
}
