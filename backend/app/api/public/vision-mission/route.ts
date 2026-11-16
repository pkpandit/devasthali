import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [settingRecord, coreValueRecords] = await Promise.all([
      prisma.visionMissionSetting.findUnique({
        where: { id: "default" },
      }),
      prisma.institutionalCoreValue.findMany({
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
            visionTitle: settingRecord.visionTitle,
            visionBody: settingRecord.visionBody,
            visionIcon: settingRecord.visionIcon,
            missionTitle: settingRecord.missionTitle,
            missionBody: settingRecord.missionBody,
            missionIcon: settingRecord.missionIcon,
          }
        : null;

    const coreValues = coreValueRecords.map((cv) => ({
      id: cv.id,
      title: cv.title,
      description: cv.description,
      iconName: cv.iconName,
      displayOrder: cv.displayOrder,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          setting,
          coreValues,
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
    console.error("[GET /api/public/vision-mission] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch public vision and mission content",
      },
      { status: 500 }
    );
  }
}
