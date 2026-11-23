import { z } from "zod";

export const ALLOWED_ACTIVITY_ICONS = [
  "Palette",
  "Sparkles",
  "Compass",
  "Music",
  "Activity",
  "Award",
  "Trophy",
  "Mic",
  "HeartHandshake",
  "BookOpen",
  "Dumbbell",
  "Smile",
] as const;

export type AllowedActivityIcon = (typeof ALLOWED_ACTIVITY_ICONS)[number];

export function isValidRelativeOrHttpUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:")) return false;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") return false;
    return true;
  } catch {
    return false;
  }
}

export const studentClubCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Club name must be at least 2 characters")
    .max(120, "Club name must not exceed 120 characters"),
  category: z
    .string()
    .trim()
    .min(2, "Category must be at least 2 characters")
    .max(80, "Category must not exceed 80 characters")
    .default("Cultural & Creative"),
  description: z
    .string()
    .trim()
    .max(1000, "Description must not exceed 1000 characters")
    .optional()
    .nullable(),
  iconName: z
    .enum(ALLOWED_ACTIVITY_ICONS, {
      message: `Invalid icon. Allowed icons: ${ALLOWED_ACTIVITY_ICONS.join(", ")}`,
    })
    .default("Activity"),
  displayOrder: z.coerce
    .number()
    .int()
    .min(0, "Display order must be a non-negative number")
    .default(0),
  isPublished: z.boolean().default(true),
});

export const studentClubUpdateSchema = z.object({
  id: z.string().min(1, "Club ID is required"),
  name: z
    .string()
    .trim()
    .min(2, "Club name must be at least 2 characters")
    .max(120, "Club name must not exceed 120 characters")
    .optional(),
  category: z
    .string()
    .trim()
    .min(2, "Category must be at least 2 characters")
    .max(80, "Category must not exceed 80 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .max(1000, "Description must not exceed 1000 characters")
    .optional()
    .nullable(),
  iconName: z.enum(ALLOWED_ACTIVITY_ICONS).optional(),
  displayOrder: z.coerce.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
});

export const studentClubDeleteSchema = z.object({
  id: z.string().min(1, "Club ID is required"),
});

export const toggleStudentClubStatusSchema = z.object({
  id: z.string().min(1, "Club ID is required"),
});

export const reorderStudentClubsSchema = z.object({
  orderedIds: z
    .array(z.string().min(1, "Invalid club ID"))
    .min(1, "At least one club ID required"),
});

export const activityOverviewUpdateSchema = z
  .object({
    badgeText: z.string().trim().max(100, "Badge text must not exceed 100 characters").nullable().optional(),
    title: z.string().trim().max(150, "Title must not exceed 150 characters").nullable().optional(),
    subtitle: z.string().trim().max(300, "Subtitle must not exceed 300 characters").nullable().optional(),
    arenaSize: z.string().trim().max(60, "Arena size must not exceed 60 characters").nullable().optional(),
    cardTitle: z.string().trim().max(150, "Card title must not exceed 150 characters").nullable().optional(),
    cardSubtitle: z.string().trim().max(200, "Card subtitle must not exceed 200 characters").nullable().optional(),
    narrativeParagraph1: z
      .string()
      .trim()
      .max(2000, "Paragraph 1 must not exceed 2000 characters")
      .nullable()
      .optional(),
    narrativeParagraph2: z
      .string()
      .trim()
      .max(2000, "Paragraph 2 must not exceed 2000 characters")
      .nullable()
      .optional(),
    heroImage: z.string().trim().max(500).nullable().optional(),
    heroImageAlt: z.string().trim().max(255).nullable().optional(),
    heroImageStorageKey: z.string().trim().max(255).nullable().optional(),
  })
  .refine(
    (data) => {
      const hasImage = Boolean(data.heroImage && data.heroImage.trim().length > 0);
      if (!hasImage) return true;
      const alt = data.heroImageAlt ? data.heroImageAlt.trim() : "";
      return alt.length >= 5;
    },
    {
      message:
        "Meaningful alt text (at least 5 characters) is required whenever a showcase image is provided or retained.",
      path: ["heroImageAlt"],
    }
  );

// ==========================================
// DIFF HELPERS FOR AUDIT LOGGING
// ==========================================

export function computeActivityDiff(
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

export type StudentClubCreateInput = z.infer<typeof studentClubCreateSchema>;
export type StudentClubUpdateInput = z.infer<typeof studentClubUpdateSchema>;
export type ActivityOverviewUpdateInput = z.infer<typeof activityOverviewUpdateSchema>;
