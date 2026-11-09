"use server";

import { admissionEnquirySchema, type AdmissionEnquiryInput } from "@/lib/validations/enquiry";
import type { ActionResponse } from "@/types";
import { SCHOOL_INFO } from "@/lib/content/settings";

export async function submitAdmissionEnquiry(
  rawInput: AdmissionEnquiryInput
): Promise<ActionResponse<{ enquiryId?: string; whatsappRedirectUrl?: string }>> {
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
        success: false,
        message: "Online admission enquiry submission is currently unavailable.",
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

    // 4. Online persistence is not active - accurately inform parent with verified alternatives
    return {
      success: false,
      message:
        "Online admission enquiry submission is not yet available. Please contact our admissions desk directly at 9554960408 / 9554960415, email principaldvp@gmail.com, or visit the school campus at Chilkahar, Ballia.",
      data: {
        whatsappRedirectUrl,
      },
    };
  } catch (error) {
    console.error("[ADMISSION ENGINE ERROR]:", error);
    return {
      success: false,
      message:
        "Online admission submission is not yet available. Please call our admissions desk directly at 9554960408.",
    };
  }
}
