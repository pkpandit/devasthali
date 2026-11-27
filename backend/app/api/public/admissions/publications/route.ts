import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export interface PublicAdmissionOverviewDto {
  sessionLabel: string;
  feeStructureTitle: string;
  feeStructureSubtitle: string;
  prospectusTitle: string;
  prospectusDescription: string;
  prospectusPdfUrl: string;
  prospectusDisplayLabel: string;
  admissionChartPdfUrl: string;
  admissionChartDisplayLabel: string;
}

export interface PublicFeeStructurePageDto {
  id: string;
  pageNumber: number;
  title: string;
  imageUrl: string;
  displayOrder: number;
}

export interface PublicAdmissionProcedureRuleDto {
  id: string;
  ruleText: string;
  displayOrder: number;
}

export interface PublicEntranceExamSubjectDto {
  id: string;
  classGrade: string;
  subjects: string;
  displayOrder: number;
}

export interface PublicAdmissionsPublicationsApiResponse {
  success: boolean;
  overview: PublicAdmissionOverviewDto | null;
  feePages: PublicFeeStructurePageDto[];
  procedureRules: PublicAdmissionProcedureRuleDto[];
  entranceSubjects: PublicEntranceExamSubjectDto[];
}

/**
 * Public admissions publications endpoint returning published fee structure pages,
 * school prospectus metadata, admission procedure rules, and entrance examination subjects.
 *
 * Rules:
 * - Excludes unpublished records (isPublished: false).
 * - Excludes internal administrative IDs, timestamps, and audit metadata.
 * - Cache policy: 60s shared max-age with 300s stale-while-revalidate.
 */
export async function GET() {
  try {
    const [overviewRecord, feePages, procedureRules, entranceSubjects] =
      await Promise.all([
        prisma.admissionOverview.findUnique({
          where: { id: "default" },
        }),
        prisma.feeStructurePage.findMany({
          where: { isPublished: true },
          orderBy: [{ displayOrder: "asc" }, { pageNumber: "asc" }, { id: "asc" }],
          select: {
            id: true,
            pageNumber: true,
            title: true,
            imageUrl: true,
            displayOrder: true,
          },
        }),
        prisma.admissionProcedureRule.findMany({
          where: { isPublished: true },
          orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
          select: {
            id: true,
            ruleText: true,
            displayOrder: true,
          },
        }),
        prisma.entranceExamSubject.findMany({
          where: { isPublished: true },
          orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
          select: {
            id: true,
            classGrade: true,
            subjects: true,
            displayOrder: true,
          },
        }),
      ]);

    const overview: PublicAdmissionOverviewDto | null = overviewRecord
      ? {
          sessionLabel: overviewRecord.sessionLabel,
          feeStructureTitle: overviewRecord.feeStructureTitle,
          feeStructureSubtitle: overviewRecord.feeStructureSubtitle,
          prospectusTitle: overviewRecord.prospectusTitle,
          prospectusDescription: overviewRecord.prospectusDescription,
          prospectusPdfUrl: overviewRecord.prospectusPdfUrl,
          prospectusDisplayLabel: overviewRecord.prospectusDisplayLabel,
          admissionChartPdfUrl: overviewRecord.admissionChartPdfUrl,
          admissionChartDisplayLabel: overviewRecord.admissionChartDisplayLabel,
        }
      : null;

    const response: PublicAdmissionsPublicationsApiResponse = {
      success: true,
      overview,
      feePages,
      procedureRules,
      entranceSubjects,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err: unknown) {
    console.error("[public-admissions-publications-api] Failed to retrieve admissions publication data:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load admissions publication data." },
      { status: 500 }
    );
  }
}
