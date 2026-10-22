"use server";

import { revalidatePath } from "next/cache";
import { admissionEnquirySchema, type AdmissionEnquiryInput } from "@/lib/validations/enquiry";
import type { ActionResponse } from "@/types";

export async function submitAdmissionEnquiry(
  rawInput: AdmissionEnquiryInput
): Promise<ActionResponse<{ enquiryId: string; whatsappRedirectUrl?: string }>> {
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
      console.warn("[SECURITY] Spam bot trapped via honeypot input:", {
        phone: data.phone,
        honey: data.website_honey,
      });
      // Return synthetic success to confuse automated crawlers
      return {
        success: true,
        message: "Enquiry recorded successfully. Our team will contact you shortly.",
        data: { enquiryId: "ENQ-BOT-TRAPPED" },
      };
    }

    // 3. Storing Enquiry (Simulated / Prisma ORM)
    const enquiryId = `DV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const record = {
      enquiryNumber: enquiryId,
      studentName: data.studentName,
      parentName: data.parentName,
      phone: data.phone,
      grade: data.grade,
      admissionType: data.admissionType,
      city: data.city,
      status: "NEW",
      createdAt: new Date().toISOString(),
    };

    console.log(`[ADMISSION ENGINE] Lead #${enquiryId} registered:`, record);

    // 4. WhatsApp Deep-Link Construction
    let whatsappRedirectUrl: string | undefined;
    if (data.sendToWhatsapp) {
      const text = encodeURIComponent(
        `Namaste Devasthaly Vidyapeeth, I have submitted an admission enquiry #${enquiryId} for ${data.studentName} seeking grade ${data.grade} (${data.admissionType}). Parent: ${data.parentName}, Mobile: ${data.phone}, Location: ${data.city}.`
      );
      whatsappRedirectUrl = `https://wa.me/919450067890?text=${text}`;
    }

    // 5. Selective ISR Cache Revalidation
    revalidatePath("/admin");
    revalidatePath("/admissions");

    return {
      success: true,
      message: "Admission enquiry logged successfully. Our admissions desk will call you within 4 hours.",
      data: {
        enquiryId,
        whatsappRedirectUrl,
      },
    };
  } catch (error) {
    console.error("[ADMISSION ENGINE ERROR]:", error);
    return {
      success: false,
      message: "An unexpected error occurred while processing your request. Please try calling directly.",
    };
  }
}
