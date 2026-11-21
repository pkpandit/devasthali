import { z } from "zod";

export const admissionStepSchema = z.object({
  stepNumber: z
    .string()
    .trim()
    .min(1, "Step number is required")
    .max(20, "Step number cannot exceed 20 characters"),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(2000, "Description cannot exceed 2000 characters"),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

export type AdmissionStepInput = z.infer<typeof admissionStepSchema>;

export const admissionEligibilityCriteriaSchema = z.object({
  classGrade: z
    .string()
    .trim()
    .min(1, "Class or grade is required")
    .max(100, "Class or grade cannot exceed 100 characters"),
  ageRequirement: z
    .string()
    .trim()
    .min(1, "Age requirement is required")
    .max(200, "Age requirement cannot exceed 200 characters"),
  evaluationMode: z
    .string()
    .trim()
    .min(1, "Evaluation mode is required")
    .max(255, "Evaluation mode cannot exceed 255 characters"),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

export type AdmissionEligibilityCriteriaInput = z.infer<
  typeof admissionEligibilityCriteriaSchema
>;

export const admissionDocumentRequirementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title cannot exceed 255 characters"),
  description: z
    .string()
    .trim()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional()
    .nullable(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

export type AdmissionDocumentRequirementInput = z.infer<
  typeof admissionDocumentRequirementSchema
>;

export const admissionFaqSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question is required")
    .max(300, "Question cannot exceed 300 characters"),
  answer: z
    .string()
    .trim()
    .min(1, "Answer is required")
    .max(2000, "Answer cannot exceed 2000 characters"),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

export type AdmissionFaqInput = z.infer<typeof admissionFaqSchema>;

export const enquirySubmissionSchema = z.object({
  studentName: z
    .string()
    .trim()
    .min(2, "Student name must be at least 2 characters")
    .max(150, "Student name cannot exceed 150 characters"),
  parentName: z
    .string()
    .trim()
    .min(2, "Parent/Guardian name must be at least 2 characters")
    .max(150, "Parent/Guardian name cannot exceed 150 characters"),
  phone: z
    .string()
    .trim()
    .regex(
      /^(\+91[\-\s]?)?[0-9]{10,12}$/,
      "Please enter a valid phone number (10 to 12 digits)"
    ),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(150, "Email cannot exceed 150 characters")
    .optional()
    .or(z.literal("")),
  grade: z
    .string()
    .trim()
    .min(1, "Grade / Class sought is required")
    .max(100, "Grade cannot exceed 100 characters"),
  message: z
    .string()
    .trim()
    .max(2000, "Message cannot exceed 2000 characters")
    .optional()
    .or(z.literal("")),
  website_honey: z.string().optional().or(z.literal("")),
});

export type EnquirySubmissionInput = z.infer<typeof enquirySubmissionSchema>;

export const enquiryStatusUpdateSchema = z.object({
  id: z.string().min(1, "ID is required"),
  status: z.enum(["PENDING", "CONTACTED", "RESOLVED", "ARCHIVED"]),
  adminNotes: z
    .string()
    .trim()
    .max(2000, "Admin notes cannot exceed 2000 characters")
    .optional()
    .nullable(),
});

export type EnquiryStatusUpdateInput = z.infer<typeof enquiryStatusUpdateSchema>;

export const reorderItemsSchema = z.array(
  z.object({
    id: z.string().min(1, "ID is required"),
    displayOrder: z.coerce.number().int().min(0),
  })
);

export type ReorderItemsInput = z.infer<typeof reorderItemsSchema>;
