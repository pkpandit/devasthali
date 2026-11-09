import { z } from "zod";

export const admissionEnquirySchema = z.object({
  studentName: z
    .string()
    .trim()
    .min(2, "Student name must be at least 2 characters")
    .max(80, "Student name must not exceed 80 characters")
    .regex(/^[a-zA-Z\s.'-]+$/, "Student name can only contain letters, spaces, and periods"),
  parentName: z
    .string()
    .trim()
    .min(2, "Parent/Guardian name must be at least 2 characters")
    .max(80, "Parent name must not exceed 80 characters")
    .regex(/^[a-zA-Z\s.'-]+$/, "Parent name can only contain letters, spaces, and periods"),
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/[^0-9]/g, ""))
    .refine((val) => /^[6-9]\d{9}$/.test(val), {
      message: "Please enter a valid 10-digit Indian mobile number (e.g. 9450012345)",
    }),
  alternatePhone: z
    .string()
    .trim()
    .transform((val) => val.replace(/[^0-9]/g, ""))
    .optional()
    .refine((val) => !val || /^[6-9]\d{9}$/.test(val), {
      message: "Alternate phone must be a valid 10-digit mobile number",
    }),
  grade: z.string().min(1, "Please select the class seeking admission"),
  admissionType: z.enum(["Day-Scholar", "Residential Boarder"], {
    message: "Please select either Day-Scholar or Residential Boarder",
  }),
  city: z.string().trim().min(2, "City/Town location is required").max(60),
  message: z.string().trim().max(500, "Message must not exceed 500 characters").optional(),
  sendToWhatsapp: z.boolean().default(true),
  // Anti-Spam Honeypot field: must be empty when submitted by human
  website_honey: z.string().max(0, "Bot submission detected").optional().or(z.literal("")),
});

export type AdmissionEnquiryInput = z.infer<typeof admissionEnquirySchema>;
