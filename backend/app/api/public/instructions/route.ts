import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export interface PublicGeneralInstructionDto {
  id: string;
  ruleText: string;
  category: string;
  isCritical: boolean;
}

export interface PublicInstructionOverviewDto {
  badgeText: string | null;
  title: string | null;
  subtitle: string | null;
  cardTitle: string | null;
  cardSubtitle: string | null;
}

export interface PublicInstructionsApiResponse {
  success: boolean;
  overview: PublicInstructionOverviewDto;
  instructions: PublicGeneralInstructionDto[];
}

/**
 * Public instructions endpoint returning published student code of conduct rules and overview.
 * Orders by displayOrder asc, createdAt asc.
 * Strictly omits displayOrder, isPublished, and internal timestamps from the public DTO.
 * Cache policy: 60s shared max-age in production with 300s SWR.
 */
export async function GET() {
  try {
    const [overviewRecord, instructionRecords] = await Promise.all([
      prisma.instructionOverview.findUnique({
        where: { id: "default" },
      }),
      prisma.generalInstruction.findMany({
        where: { isPublished: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          ruleText: true,
          category: true,
          isCritical: true,
        },
      }),
    ]);

    const overview: PublicInstructionOverviewDto = {
      badgeText: overviewRecord?.badgeText || null,
      title: overviewRecord?.title || null,
      subtitle: overviewRecord?.subtitle || null,
      cardTitle: overviewRecord?.cardTitle || null,
      cardSubtitle: overviewRecord?.cardSubtitle || null,
    };

    const response: PublicInstructionsApiResponse = {
      success: true,
      overview,
      instructions: instructionRecords,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: unknown) {
    console.error("[public-instructions-api] Failed to retrieve instructions data:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load instructions data." },
      { status: 500 }
    );
  }
}
