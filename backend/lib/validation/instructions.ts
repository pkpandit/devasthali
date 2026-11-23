import { z } from "zod";

export const ALLOWED_INSTRUCTION_CATEGORIES = [
  "General Discipline",
  "Attendance & Punctuality",
  "Parent & Visitor Guidelines",
  "Leave & Campus Security",
  "Institutional Authority & Suspension",
  "Complaints & Suggestions",
  "Academic Commitment",
  "Dress Code & Uniform",
] as const;

export type AllowedInstructionCategory = (typeof ALLOWED_INSTRUCTION_CATEGORIES)[number];

export const generalInstructionCreateSchema = z.object({
  ruleText: z
    .string()
    .trim()
    .min(5, "Rule text must be at least 5 characters")
    .max(1000, "Rule text must not exceed 1000 characters"),
  category: z
    .enum(ALLOWED_INSTRUCTION_CATEGORIES, {
      message: `Invalid category. Allowed categories: ${ALLOWED_INSTRUCTION_CATEGORIES.join(", ")}`,
    })
    .default("General Discipline"),
  isCritical: z.boolean().default(false),
  displayOrder: z.coerce
    .number()
    .int()
    .min(0, "Display order must be a non-negative number")
    .default(0),
  isPublished: z.boolean().default(true),
});

export const generalInstructionUpdateSchema = z.object({
  id: z.string().min(1, "Instruction ID is required"),
  ruleText: z
    .string()
    .trim()
    .min(5, "Rule text must be at least 5 characters")
    .max(1000, "Rule text must not exceed 1000 characters")
    .optional(),
  category: z.enum(ALLOWED_INSTRUCTION_CATEGORIES).optional(),
  isCritical: z.boolean().optional(),
  displayOrder: z.coerce.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
});

export const generalInstructionDeleteSchema = z.object({
  id: z.string().min(1, "Instruction ID is required"),
});

export const toggleGeneralInstructionStatusSchema = z.object({
  id: z.string().min(1, "Instruction ID is required"),
});

export const reorderGeneralInstructionsSchema = z.object({
  orderedIds: z
    .array(z.string().min(1, "Invalid instruction ID"))
    .min(1, "At least one instruction ID required"),
});

export const instructionOverviewUpdateSchema = z.object({
  badgeText: z.string().trim().max(100, "Badge text must not exceed 100 characters").nullable().optional(),
  title: z.string().trim().max(150, "Title must not exceed 150 characters").nullable().optional(),
  subtitle: z.string().trim().max(300, "Subtitle must not exceed 300 characters").nullable().optional(),
  cardTitle: z.string().trim().max(150, "Card title must not exceed 150 characters").nullable().optional(),
  cardSubtitle: z.string().trim().max(200, "Card subtitle must not exceed 200 characters").nullable().optional(),
});

// ==========================================
// DIFF HELPERS FOR AUDIT LOGGING
// ==========================================

export function computeInstructionDiff(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of Object.keys(newData)) {
    const oldVal = oldData[key];
    const newVal = newData[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff[key] = { from: oldVal ?? null, to: newVal ?? null };
    }
  }
  return diff;
}

export type GeneralInstructionCreateInput = z.infer<typeof generalInstructionCreateSchema>;
export type GeneralInstructionUpdateInput = z.infer<typeof generalInstructionUpdateSchema>;
export type InstructionOverviewUpdateInput = z.infer<typeof instructionOverviewUpdateSchema>;
