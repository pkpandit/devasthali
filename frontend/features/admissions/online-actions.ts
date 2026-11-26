"use server";

import { headers } from "next/headers";

function getBackendOrigin(): string {
  if (process.env.BACKEND_INTERNAL_URL) {
    return process.env.BACKEND_INTERNAL_URL.replace(/\/+$/, "");
  }
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "");
  }
  return "http://127.0.0.1:3001";
}

export interface PublicRegistrationSettings {
  isRegistrationOpen: boolean;
  academicYear: number;
  sessionCode: string;
  sessionLabel: string;
  guidanceNotice: string | null;
  closedMessage: string | null;
}

export interface SubmissionResponseData {
  applicationNumber: string;
  studentName: string;
  appliedClass: string;
  sessionCode: string;
  sessionLabel: string;
  submittedAt: string;
}

export interface SubmitApplicationPayload {
  idempotencyKey: string;
  appliedClass: string;
  studentName: string;
  dob: string;
  gender: string;
  nationality?: string;
  religion?: string;
  category?: string;
  mobile: string;
  email?: string;
  address: string;
  city?: string;
  fatherName: string;
  fatherMobile?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherMobile?: string;
  motherOccupation?: string;
  lastAttendedClass?: string;
  previousSchoolName?: string;
  previousSchoolBoard?: string;
  declarationAgreed: boolean;
  website_honey?: string;
}

export interface SubmitApplicationResult {
  success: boolean;
  data?: SubmissionResponseData;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Fetch public registration settings with no-store caching.
 * Fails closed if backend is unreachable or returns non-200.
 */
export async function getPublicRegistrationSettings(): Promise<PublicRegistrationSettings> {
  const fallbackSettings: PublicRegistrationSettings = {
    isRegistrationOpen: false,
    academicYear: 2026,
    sessionCode: "2026",
    sessionLabel: "2026-27",
    guidanceNotice: null,
    closedMessage:
      "Online registration for Session 2026-27 is currently closed. For admissions guidance or campus visits, please contact our counter.",
  };

  try {
    const origin = getBackendOrigin();
    const res = await fetch(`${origin}/api/public/admissions/registration-settings`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`[REGISTRATION_SETTINGS] Backend returned status ${res.status}. Failing closed.`);
      return fallbackSettings;
    }

    const json = await res.json();
    return {
      isRegistrationOpen: Boolean(json.isRegistrationOpen),
      academicYear: Number(json.academicYear) || 2026,
      sessionCode: String(json.sessionCode || "2026"),
      sessionLabel: String(json.sessionLabel || "2026-27"),
      guidanceNotice: json.guidanceNotice ? String(json.guidanceNotice) : null,
      closedMessage: json.closedMessage ? String(json.closedMessage) : fallbackSettings.closedMessage,
    };
  } catch (err) {
    console.error("[REGISTRATION_SETTINGS] Error fetching registration settings:", err);
    return fallbackSettings;
  }
}

/**
 * Submit online admission application to the backend API.
 */
export async function submitOnlineAdmissionApplication(
  payload: SubmitApplicationPayload
): Promise<SubmitApplicationResult> {
  try {
    const origin = getBackendOrigin();
    const endpoint = `${origin}/api/public/admissions/applications`;

    // Forward client headers where possible for trusted rate limiting
    const headerList = await headers();
    const clientIp =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerList.get("x-real-ip") ||
      "";

    const fetchHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (clientIp) {
      fetchHeaders["x-forwarded-for"] = clientIp;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: fetchHeaders,
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const json = await res.json().catch(() => ({}));

    if (res.status === 201 || res.status === 200) {
      return {
        success: true,
        data: json.data,
        message: json.message,
      };
    }

    if (res.status === 400) {
      return {
        success: false,
        error: json.error || "Please verify your application details and correct any errors.",
        fieldErrors: json.fieldErrors,
      };
    }

    if (res.status === 403) {
      return {
        success: false,
        error:
          json.error ||
          "Online registration is currently closed. Applications cannot be accepted at this time.",
      };
    }

    if (res.status === 409) {
      return {
        success: false,
        error:
          json.error ||
          "An active application with matching details already exists for this academic session.",
      };
    }

    if (res.status === 429) {
      return {
        success: false,
        error:
          json.error ||
          "Submission limit reached from your network. Please wait before attempting again or contact our helpline.",
      };
    }

    return {
      success: false,
      error:
        json.error ||
        "An unexpected error occurred while processing your registration. Please try again or contact our helpline.",
    };
  } catch (err) {
    console.error("[ONLINE_ADMISSION_SUBMISSION_ERROR]:", err);
    return {
      success: false,
      error:
        "Unable to connect to the admission portal server. Please check your connection or contact our admissions helpline.",
    };
  }
}
