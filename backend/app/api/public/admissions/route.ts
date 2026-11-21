import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export interface PublicAdmissionStepDto {
  id: string;
  stepNumber: string;
  title: string;
  description: string;
  displayOrder: number;
}

export interface PublicAdmissionEligibilityDto {
  id: string;
  classGrade: string;
  ageRequirement: string;
  evaluationMode: string;
  displayOrder: number;
}

export interface PublicAdmissionDocumentDto {
  id: string;
  title: string;
  description: string | null;
  displayOrder: number;
}

export interface PublicAdmissionFaqDto {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
}

export interface PublicAdmissionsApiResponse {
  success: boolean;
  steps: PublicAdmissionStepDto[];
  eligibilityCriteria: PublicAdmissionEligibilityDto[];
  documentRequirements: PublicAdmissionDocumentDto[];
  faqs: PublicAdmissionFaqDto[];
}

export async function GET() {
  try {
    const [steps, eligibilityCriteria, documentRequirements, faqs] =
      await Promise.all([
        prisma.admissionStep.findMany({
          where: { isPublished: true },
          orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
          select: {
            id: true,
            stepNumber: true,
            title: true,
            description: true,
            displayOrder: true,
          },
        }),
        prisma.admissionEligibilityCriteria.findMany({
          where: { isPublished: true },
          orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
          select: {
            id: true,
            classGrade: true,
            ageRequirement: true,
            evaluationMode: true,
            displayOrder: true,
          },
        }),
        prisma.admissionDocumentRequirement.findMany({
          where: { isPublished: true },
          orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
          select: {
            id: true,
            title: true,
            description: true,
            displayOrder: true,
          },
        }),
        prisma.admissionFaq.findMany({
          where: { isPublished: true },
          orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
          select: {
            id: true,
            question: true,
            answer: true,
            displayOrder: true,
          },
        }),
      ]);

    const isDev = process.env.NODE_ENV !== "production";
    const cacheControl = isDev
      ? "no-store, no-cache, must-revalidate"
      : "public, s-maxage=60, stale-while-revalidate=300";

    const responsePayload: PublicAdmissionsApiResponse = {
      success: true,
      steps,
      eligibilityCriteria,
      documentRequirements,
      faqs,
    };

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        "Cache-Control": cacheControl,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[public-admissions-api] Failed to retrieve admissions data:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load admissions information.",
        steps: [],
        eligibilityCriteria: [],
        documentRequirements: [],
        faqs: [],
      },
      { status: 500 }
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
