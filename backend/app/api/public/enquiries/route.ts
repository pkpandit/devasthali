import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { recordAuditEvent } from "@/lib/server/audit";
import { enquirySubmissionSchema } from "@/lib/validation/admissions";
import { computeSaltedIpHash } from "@/lib/server/ip-hash";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const parsed = enquirySubmissionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Please correct the highlighted form errors.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Honeypot spam trap: return normal success without storing in database
    if (parsed.data.website_honey && parsed.data.website_honey.trim().length > 0) {
      return NextResponse.json(
        {
          success: true,
          message:
            "Enquiry submitted successfully. Our admissions desk will contact you shortly.",
        },
        { status: 200 }
      );
    }

    // Extract client IP and compute salted hash
    const forwarded = req.headers.get("x-forwarded-for");
    const clientIp = forwarded
      ? forwarded.split(",")[0].trim()
      : req.headers.get("x-real-ip") || null;
    const ipHash = computeSaltedIpHash(clientIp);

    // Durable rate limiting: max 5 submissions per 15 minutes per IP hash
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentCount = await prisma.enquirySubmission.count({
      where: {
        ipHash,
        createdAt: { gte: fifteenMinutesAgo },
      },
    });

    if (recentCount >= 5) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Too many enquiries submitted from this network. Please wait a few minutes before trying again.",
        },
        { status: 429 }
      );
    }

    const submission = await prisma.enquirySubmission.create({
      data: {
        studentName: parsed.data.studentName,
        parentName: parsed.data.parentName,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        grade: parsed.data.grade,
        message: parsed.data.message || null,
        ipHash,
        status: "PENDING",
      },
    });

    await recordAuditEvent({
      userId: null,
      action: "ENQUIRY_SUBMITTED",
      entityType: "EnquirySubmission",
      entityId: submission.id,
      metadata: {
        studentName: submission.studentName,
        grade: submission.grade,
        phone: submission.phone,
        email: submission.email,
      },
      ipAddress: null,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Enquiry submitted successfully. Our admissions desk will contact you shortly.",
      },
      {
        status: 201,
        headers: {
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (err) {
    console.error("[public-enquiries-api] Failed to submit enquiry:", err);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while processing your enquiry.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST" } });
}

export async function PUT() {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST" } });
}

export async function DELETE() {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST" } });
}

export async function PATCH() {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST" } });
}
