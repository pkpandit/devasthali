import { z } from "zod";

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface PublicGeneralInstruction {
  id: string;
  ruleText: string;
  category: string;
  isCritical: boolean;
}

export interface PublicInstructionOverview {
  badgeText: string | null;
  title: string | null;
  subtitle: string | null;
  cardTitle: string | null;
  cardSubtitle: string | null;
}

export interface PublicInstructionsData {
  overview: PublicInstructionOverview | null;
  instructions: PublicGeneralInstruction[];
}

// ==========================================
// ZOD SCHEMAS FOR PUBLIC API VALIDATION
// ==========================================

export const publicGeneralInstructionSchema = z.object({
  id: z.string().min(1),
  ruleText: z.string().min(1),
  category: z.string().default("General Discipline"),
  isCritical: z.boolean().default(false),
});

export const publicInstructionOverviewSchema = z.object({
  badgeText: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
  cardTitle: z.string().nullable().optional(),
  cardSubtitle: z.string().nullable().optional(),
});

export const publicInstructionsResponseSchema = z.object({
  success: z.boolean(),
  overview: publicInstructionOverviewSchema.nullable(),
  instructions: z.array(publicGeneralInstructionSchema),
});

// ==========================================
// STATIC FALLBACK DATA
// ==========================================

export const STATIC_INSTRUCTION_OVERVIEW: PublicInstructionOverview = {
  badgeText: "Students & Parents / Guidelines",
  title: "General Instructions",
  subtitle:
    "Institutional code of conduct, discipline guidelines, and rules for students and guardians.",
  cardTitle: "School Rules & Regulations",
  cardSubtitle: "Devasthaly Vidyapeeth, Chilkahar, Ballia (U.P.)",
};

export const STATIC_GENERAL_INSTRUCTIONS: PublicGeneralInstruction[] = [
  {
    id: "static-inst-1",
    ruleText:
      "Attendance in prayer, physical training, social service assignments, sports and games, Yoga and Meditation classes and extension lecture of Saturday etc. is compulsory. Absence in any one of them would be treated as absent for the whole days and student fined accordingly.",
    category: "Attendance & Punctuality",
    isCritical: true,
  },
  {
    id: "static-inst-2",
    ruleText: "Students coming late will not be allowed to attend classes.",
    category: "Attendance & Punctuality",
    isCritical: true,
  },
  {
    id: "static-inst-3",
    ruleText:
      "Parents and servants also will not be allowed to meet a student during school hours. In special cases and emergencies they would be required to contact the Principal and seek permission.",
    category: "Parent & Visitor Guidelines",
    isCritical: true,
  },
  {
    id: "static-inst-4",
    ruleText:
      "Every student must be present on the day the school reopens after each vacation.",
    category: "Attendance & Punctuality",
    isCritical: false,
  },
  {
    id: "static-inst-5",
    ruleText:
      "Parents are advised to plan their holidays according to the vacation fixed by the school.",
    category: "Parent & Visitor Guidelines",
    isCritical: false,
  },
  {
    id: "static-inst-6",
    ruleText:
      "It is also advisable that parents do not disturb their child to attend weddings and other functions during the academic period.",
    category: "Academic Commitment",
    isCritical: false,
  },
  {
    id: "static-inst-7",
    ruleText:
      "No student can leave school premises during school hours without the written permission of the Principal.",
    category: "Leave & Campus Security",
    isCritical: true,
  },
  {
    id: "static-inst-8",
    ruleText:
      "The Principal has right to suspend any student if his / her conduct and / or progress is not satisfactory.",
    category: "Institutional Authority & Suspension",
    isCritical: true,
  },
  {
    id: "static-inst-9",
    ruleText:
      "Suggestions / complaints, if any, should be lodged in writing and in confidence to the Principal.",
    category: "Complaints & Suggestions",
    isCritical: false,
  },
];

export const STATIC_INSTRUCTIONS_DATA: PublicInstructionsData = {
  overview: STATIC_INSTRUCTION_OVERVIEW,
  instructions: STATIC_GENERAL_INSTRUCTIONS,
};

// ==========================================
// BACKEND URL RESOLUTION
// ==========================================

function getBackendOrigin(): string | null {
  if (process.env.BACKEND_INTERNAL_URL) {
    return process.env.BACKEND_INTERNAL_URL.replace(/\/+$/, "");
  }

  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://127.0.0.1:3001";
  }

  return null;
}

// ==========================================
// PUBLIC FETCH METHODS
// ==========================================

/**
 * Fetches public student code of conduct rules and instruction overview data.
 * Uses 60s revalidation with stable cache tag "instructions".
 * Fallback to static data occurs strictly on network failure, non-200 HTTP, or Zod validation errors.
 * Preserves empty array if valid response from backend has instructions: [].
 */
export async function getPublicInstructions(): Promise<PublicInstructionsData> {
  "use cache";
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return STATIC_INSTRUCTIONS_DATA;
  }

  const endpoint = `${backendOrigin}/api/public/instructions`;

  try {
    const isDev = process.env.NODE_ENV === "development";
    const res = await fetch(endpoint, {
      ...(isDev
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60, tags: ["instructions"] } }),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(
        `[Instructions] API returned HTTP ${res.status} from ${endpoint}. Using static fallback.`
      );
      return STATIC_INSTRUCTIONS_DATA;
    }

    const json = await res.json();
    const parsed = publicInstructionsResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.warn(
        "[Instructions] Payload validation failed. Using static fallback.",
        parsed.error.issues
      );
      return STATIC_INSTRUCTIONS_DATA;
    }

    const { overview, instructions } = parsed.data;

    return {
      overview: overview
        ? {
            badgeText: overview.badgeText || STATIC_INSTRUCTION_OVERVIEW.badgeText,
            title: overview.title || STATIC_INSTRUCTION_OVERVIEW.title,
            subtitle: overview.subtitle || STATIC_INSTRUCTION_OVERVIEW.subtitle,
            cardTitle: overview.cardTitle || STATIC_INSTRUCTION_OVERVIEW.cardTitle,
            cardSubtitle: overview.cardSubtitle || STATIC_INSTRUCTION_OVERVIEW.cardSubtitle,
          }
        : STATIC_INSTRUCTION_OVERVIEW,
      instructions: instructions.map((i) => ({
        id: i.id,
        ruleText: i.ruleText,
        category: i.category,
        isCritical: i.isCritical,
      })),
    };
  } catch (error) {
    console.warn(
      `[Instructions] Failed to fetch instructions from ${endpoint}. Using static fallback:`,
      error
    );
    return STATIC_INSTRUCTIONS_DATA;
  }
}
