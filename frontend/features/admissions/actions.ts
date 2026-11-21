"use server";

import { admissionEnquirySchema, type AdmissionEnquiryInput } from "@/lib/validations/enquiry";
import type { ActionResponse } from "@/types";
import { SCHOOL_INFO } from "@/lib/content/settings";

function getBackendOrigin(): string {
  if (process.env.BACKEND_INTERNAL_URL) {
    return process.env.BACKEND_INTERNAL_URL.replace(/\/+$/, "");
  }
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "");
  }
  return "http://127.0.0.1:3001";
}

export async function submitAdmissionEnquiry(
  rawInput: AdmissionEnquiryInput
): Promise<ActionResponse<{ message?: string; whatsappRedirectUrl?: string }>> {
  try {
    // 1. Zod Server Validation
    const validationResult = admissionEnquirySchema.safeParse(rawInput);

    if (!validationResult.success) {
      const fieldErrors: Record<string, string[]> = {};
      validationResult.error.issues.forEach((issue) => {
        const path = issue.path[0]?.toString() || "form";
        fieldErrors[path] = fieldErrors[path] || [];
        fieldErrors[path].push(issue.message);
      });

      return {
        success: false,
        message: "Please correct the highlighted errors in the form.",
        errors: fieldErrors,
      };
    }

    const data = validationResult.data;

    // 2. Anti-Spam Honeypot Verification
    if (data.website_honey && data.website_honey.trim() !== "") {
      return {
        success: true,
        message:
          "Enquiry submitted successfully. Our admissions desk will contact you shortly.",
      };
    }

    // 3. Construct WhatsApp deep-link to verified school helpline if requested
    let whatsappRedirectUrl: string | undefined;
    if (data.sendToWhatsapp) {
      const text = encodeURIComponent(
        `Namaste Devasthaly Vidyapeeth, I would like to enquire about admission for ${data.studentName} seeking grade ${data.grade} (${data.admissionType}). Parent: ${data.parentName}, Mobile: ${data.phone}, Location: ${data.city}.`
      );
      whatsappRedirectUrl = `https://wa.me/${SCHOOL_INFO.contacts.whatsappNumber}?text=${text}`;
    }

    // 4. Send to backend endpoint
    const backendOrigin = getBackendOrigin();
    const endpoint = `${backendOrigin}/api/public/enquiries`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentName: data.studentName,
        parentName: data.parentName,
        phone: data.phone,
        grade: `${data.grade} (${data.admissionType})`,
        message: `[City: ${data.city}] ${data.message || ""}`.trim(),
        website_honey: data.website_honey || "",
      }),
    });

    const json = await res.json().catch(() => ({}));

    if (res.status === 201 || res.status === 200) {
      return {
        success: true,
        message:
          json.message ||
          "Enquiry submitted successfully. Our admissions desk will contact you shortly.",
        data: {
          whatsappRedirectUrl,
        },
      };
    }

    return {
      success: false,
      message:
        json.error ||
        "An error occurred while submitting your enquiry. Please try again or call our admissions helpline.",
    };
  } catch (error) {
    console.error("[ADMISSION ENGINE ERROR]:", error);
    return {
      success: false,
      message:
        "Unable to submit enquiry at this moment. Please call our admissions desk directly.",
    };
  }
}
