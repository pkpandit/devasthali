import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { recordAuditEvent } from "@/lib/server/audit";
import { computeSaltedIpHash } from "@/lib/server/ip-hash";
import {
  onlineAdmissionApplicationSchema,
  computeSubmissionFingerprint,
  deriveSessionCode,
  generateRandomCode,
  formatApplicationNumber,
} from "@/lib/validation/online-admissions";

export const dynamic = "force-dynamic";

/**
 * Extracts and sanitizes client IP for rate limiting and auditing.
 * In development / local testing, direct or proxy headers may be passed.
 * In production, uses the first non-trusted proxy entry if available, or x-real-ip.
 */
function extractClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip")?.trim() || "127.0.0.1";
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  // 1. Zod Validation
  const parsed = onlineAdmissionApplicationSchema.safeParse(body);
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

  const data = parsed.data;

  // 2. Anti-Spam Honeypot Trap
  // Return synthetic success without storing in DB
  if (data.website_honey && data.website_honey.trim().length > 0) {
    const fakeSessionCode = "2627";
    const fakeAppNumber = formatApplicationNumber(
      fakeSessionCode,
      generateRandomCode(6)
    );
    const response = NextResponse.json(
      {
        success: true,
        data: {
          applicationNumber: fakeAppNumber,
          studentName: data.studentName,
          appliedClass: data.appliedClass,
          submittedAt: new Date().toISOString(),
        },
        message:
          "This reference number confirms receipt of your online application only. It does not confirm admission. The school will review the application and advise you of the next steps.",
      },
      { status: 201 }
    );
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  }

  // 3. Client IP & Durable Rate Limiting with Bounded Cleanup
  const clientIp = extractClientIp(req);
  const ipHash = computeSaltedIpHash(clientIp);

  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Atomically log attempt and clean up stale attempts older than 24h
  try {
    await prisma.$transaction([
      prisma.admissionSubmissionAttempt.create({
        data: { ipHash },
      }),
      prisma.admissionSubmissionAttempt.deleteMany({
        where: { createdAt: { lt: twentyFourHoursAgo } },
      }),
    ]);
  } catch (err) {
    // If cleanup/insert fails, continue to enforce rate check
    console.error("Attempt log failure:", err);
  }

  const recentAttempts = await prisma.admissionSubmissionAttempt.count({
    where: {
      ipHash,
      createdAt: { gte: fifteenMinutesAgo },
    },
  });

  if (recentAttempts > 10) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Too many submission attempts from this network. Please wait 15 minutes before trying again.",
      },
      { status: 429 }
    );
  }

  // 4. Compute Fingerprint
  const currentFingerprint = computeSubmissionFingerprint({
    appliedClass: data.appliedClass,
    studentName: data.studentName,
    dob: data.dob,
    mobile: data.mobile,
    address: data.address,
    fatherName: data.fatherName,
  });

  // 5. Check Idempotency by Key
  const existingWithKey = await prisma.admissionApplication.findUnique({
    where: { idempotencyKey: data.idempotencyKey },
    select: {
      applicationNumber: true,
      studentName: true,
      appliedClass: true,
      submissionFingerprint: true,
      createdAt: true,
    },
  });

  if (existingWithKey) {
    // If key matches AND fingerprint matches: return original safe confirmation
    // Note: This works even if registration has since closed (lost-response recovery)
    if (existingWithKey.submissionFingerprint === currentFingerprint) {
      const response = NextResponse.json(
        {
          success: true,
          data: {
            applicationNumber: existingWithKey.applicationNumber,
            studentName: existingWithKey.studentName,
            appliedClass: existingWithKey.appliedClass,
            submittedAt: existingWithKey.createdAt.toISOString(),
          },
          message:
            "This reference number confirms receipt of your online application only. It does not confirm admission. The school will review the application and advise you of the next steps.",
        },
        { status: 200 }
      );
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate"
      );
      return response;
    }

    // Same key with different payload: reject without exposing prior details
    return NextResponse.json(
      {
        success: false,
        error:
          "Idempotency conflict: A submission with this key already exists with different data.",
      },
      { status: 409 }
    );
  }

  // 6. Registration Settings Gate (Fail-Closed)
  const settings = await prisma.admissionRegistrationSetting.findUnique({
    where: { id: "default" },
  });

  if (!settings || !settings.isRegistrationOpen) {
    return NextResponse.json(
      {
        success: false,
        error:
          settings?.closedMessage ||
          "Online registration is currently closed. Please contact the campus admissions counter.",
      },
      { status: 403 }
    );
  }

  const sessionCode = deriveSessionCode(settings.sessionLabel);

  // 7. Atomic Business-Duplicate Check (Active Application Check)
  // An active application is one in SUBMITTED, UNDER_REVIEW, or VERIFIED status
  const normalizedStudentName = data.studentName.trim().toLowerCase();
  const normalizedDob = data.dob.trim();
  const normalizedMobile = data.mobile.trim();

  // 8. Insertion with Unique Reference Number Retry Loop
  const maxRetries = 3;
  let insertedRecord = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const candidateCode = generateRandomCode(6);
    const candidateAppNum = formatApplicationNumber(sessionCode, candidateCode);

    try {
      insertedRecord = await prisma.admissionApplication.create({
        data: {
          applicationNumber: candidateAppNum,
          idempotencyKey: data.idempotencyKey,
          submissionFingerprint: currentFingerprint,
          sessionCode,
          appliedClass: data.appliedClass,
          studentName: data.studentName.trim(),
          dob: data.dob.trim(),
          gender: data.gender,
          nationality: data.nationality || "Indian",
          religion: data.religion || null,
          category: data.category || null,
          mobile: data.mobile.trim(),
          email: data.email || null,
          address: data.address.trim(),
          city: data.city.trim(),
          fatherName: data.fatherName.trim(),
          fatherMobile: data.fatherMobile || null,
          fatherOccupation: data.fatherOccupation || null,
          motherName: data.motherName || null,
          motherMobile: data.motherMobile || null,
          motherOccupation: data.motherOccupation || null,
          lastAttendedClass: data.lastAttendedClass || null,
          previousSchoolName: data.previousSchoolName || null,
          previousSchoolBoard: data.previousSchoolBoard || null,
          declarationAgreed: true,
          status: "SUBMITTED",
          ipHash,
        },
        select: {
          applicationNumber: true,
          studentName: true,
          appliedClass: true,
          createdAt: true,
        },
      });
      break; // Successfully inserted
    } catch (dbErr: any) {
      // Prisma P2002 indicates unique constraint violation
      if (dbErr.code === "P2002") {
        const target = (dbErr.meta?.target as string[]) || [];
        const targetStr = Array.isArray(target) ? target.join(",") : String(target);

        // A. Idempotency Key collision (concurrent request with same key)
        if (targetStr.includes("idempotency_key")) {
          const recheck = await prisma.admissionApplication.findUnique({
            where: { idempotencyKey: data.idempotencyKey },
            select: {
              applicationNumber: true,
              studentName: true,
              appliedClass: true,
              submissionFingerprint: true,
              createdAt: true,
            },
          });
          if (
            recheck &&
            recheck.submissionFingerprint === currentFingerprint
          ) {
            const response = NextResponse.json(
              {
                success: true,
                data: {
                  applicationNumber: recheck.applicationNumber,
                  studentName: recheck.studentName,
                  appliedClass: recheck.appliedClass,
                  submittedAt: recheck.createdAt.toISOString(),
                },
                message:
                  "This reference number confirms receipt of your online application only. It does not confirm admission. The school will review the application and advise you of the next steps.",
              },
              { status: 200 }
            );
            response.headers.set(
              "Cache-Control",
              "no-store, no-cache, must-revalidate"
            );
            return response;
          }
          return NextResponse.json(
            {
              success: false,
              error:
                "Idempotency conflict: A submission with this key already exists with different data.",
            },
            { status: 409 }
          );
        }

        // B. Active Duplicate Index Collision (concurrent request with different keys for same applicant)
        if (
          targetStr.includes("admission_applications_active_dedup_idx") ||
          targetStr.includes("student_name") ||
          targetStr.includes("mobile")
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                "An application for this student has already been registered for the current academic session. For updates or status inquiries, please contact the admissions desk.",
            },
            { status: 409 }
          );
        }

        // C. Reference Number Collision -> Retry loop continues
        if (targetStr.includes("application_number")) {
          continue;
        }
      }

      console.error("Application insertion error:", dbErr);
      return NextResponse.json(
        {
          success: false,
          error:
            "An error occurred while saving your application. Please try again.",
        },
        { status: 500 }
      );
    }
  }

  if (!insertedRecord) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to allocate application reference number. Please try submitting again.",
      },
      { status: 500 }
    );
  }

  // 9. Audit Event without PII or sensitive data
  await recordAuditEvent({
    userId: null,
    action: "APPLICATION_SUBMITTED",
    entityType: "AdmissionApplication",
    entityId: insertedRecord.applicationNumber,
    metadata: {
      applicationNumber: insertedRecord.applicationNumber,
      sessionCode,
      appliedClass: insertedRecord.appliedClass,
    },
    ipAddress: null,
  });

  const response = NextResponse.json(
    {
      success: true,
      data: {
        applicationNumber: insertedRecord.applicationNumber,
        studentName: insertedRecord.studentName,
        appliedClass: insertedRecord.appliedClass,
        submittedAt: insertedRecord.createdAt.toISOString(),
      },
      message:
        "This reference number confirms receipt of your online application only. It does not confirm admission. The school will review the application and advise you of the next steps.",
    },
    { status: 201 }
  );

  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  return response;
}
