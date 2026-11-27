import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export interface PublicHostelFeatureDto {
  id: string;
  title: string;
  description: string;
  displayOrder: number;
}

export interface PublicHostelSectionDto {
  badge: string;
  title: string;
  description: string;
  features: PublicHostelFeatureDto[];
}

export interface PublicTransportSectionDto {
  badge: string;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
}

export interface PublicLifeAtSchoolOverviewApiResponse {
  success: boolean;
  hostel: PublicHostelSectionDto | null;
  transport: PublicTransportSectionDto | null;
}

/**
 * Public Life at School Overview endpoint returning published hostel and transport sections.
 *
 * Rules:
 * - Excludes unpublished hostel features (isPublished: false).
 * - Excludes internal timestamps and administrative metadata.
 * - Cache policy: 60s shared max-age with 300s stale-while-revalidate.
 */
export async function GET() {
  try {
    const [hostelRecord, transportRecord] = await Promise.all([
      prisma.hostelSection.findUnique({
        where: { id: "default" },
        include: {
          features: {
            where: { isPublished: true },
            orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
            select: {
              id: true,
              title: true,
              description: true,
              displayOrder: true,
            },
          },
        },
      }),
      prisma.transportSection.findUnique({
        where: { id: "default" },
        select: {
          badge: true,
          title: true,
          description: true,
          ctaText: true,
          ctaUrl: true,
        },
      }),
    ]);

    const hostelDto: PublicHostelSectionDto | null = hostelRecord
      ? {
          badge: hostelRecord.badge,
          title: hostelRecord.title,
          description: hostelRecord.description,
          features: hostelRecord.features.map((f) => ({
            id: f.id,
            title: f.title,
            description: f.description,
            displayOrder: f.displayOrder,
          })),
        }
      : null;

    const transportDto: PublicTransportSectionDto | null = transportRecord
      ? {
          badge: transportRecord.badge,
          title: transportRecord.title,
          description: transportRecord.description,
          ctaText: transportRecord.ctaText,
          ctaUrl: transportRecord.ctaUrl,
        }
      : null;

    const responsePayload: PublicLifeAtSchoolOverviewApiResponse = {
      success: true,
      hostel: hostelDto,
      transport: transportDto,
    };

    const isDev = process.env.NODE_ENV !== "production";
    const cacheControl = isDev
      ? "no-store, no-cache, must-revalidate"
      : "public, s-maxage=60, stale-while-revalidate=300";

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        "Cache-Control": cacheControl,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[LifeAtSchoolPublicApi] GET /api/public/life-at-school/overview error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve life-at-school overview data.",
      },
      {
        status: 500,
        headers: { "X-Content-Type-Options": "nosniff" },
      }
    );
  }
}
