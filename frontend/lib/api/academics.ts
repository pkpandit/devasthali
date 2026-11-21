import { z } from "zod";

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface PublicAcademicWing {
  id: string;
  slug: string;
  stageBadge: string;
  title: string;
  description: string;
  highlights: string[];
  displayOrder: number;
}

export interface PublicAcademicStream {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  iconName: string;
  subjects: string[];
  competitiveBadge?: string | null;
  displayOrder: number;
}

export interface PublicAcademicAssessmentRule {
  id: string;
  ruleText: string;
  displayOrder: number;
}

export interface PublicAcademicOverview {
  heroBadge: string | null;
  heroImage: string | null;
  heroImageAlt: string | null;
  competitiveBadge: string | null;
  competitiveTitle: string | null;
  competitiveDescription: string | null;
  competitiveCtaText: string | null;
  competitiveCtaHref: string | null;
  assessmentParentNotice: string | null;
  assessmentProspectusNotice: string | null;
  assessmentProspectusUrl: string | null;
}

export interface PublicAcademicsData {
  overview: PublicAcademicOverview | null;
  wings: PublicAcademicWing[];
  streams: PublicAcademicStream[];
  assessmentRules: PublicAcademicAssessmentRule[];
}

// ==========================================
// ZOD SCHEMAS FOR PUBLIC API VALIDATION
// ==========================================

export const publicAcademicWingSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  stageBadge: z.string().default(""),
  title: z.string().min(1),
  description: z.string().default(""),
  highlights: z.array(z.string()).default([]),
  displayOrder: z.number().default(0),
});

export const publicAcademicStreamSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  iconName: z.string().default("BookOpen"),
  subjects: z.array(z.string()).default([]),
  competitiveBadge: z.string().nullable().optional(),
  displayOrder: z.number().default(0),
});

export const publicAcademicAssessmentRuleSchema = z.object({
  id: z.string().min(1),
  ruleText: z.string().min(1),
  displayOrder: z.number().default(0),
});

export const publicAcademicOverviewSchema = z.object({
  heroBadge: z.string().nullable().optional(),
  heroImage: z.string().nullable().optional(),
  heroImageAlt: z.string().nullable().optional(),
  competitiveBadge: z.string().nullable().optional(),
  competitiveTitle: z.string().nullable().optional(),
  competitiveDescription: z.string().nullable().optional(),
  competitiveCtaText: z.string().nullable().optional(),
  competitiveCtaHref: z.string().nullable().optional(),
  assessmentParentNotice: z.string().nullable().optional(),
  assessmentProspectusNotice: z.string().nullable().optional(),
  assessmentProspectusUrl: z.string().nullable().optional(),
});

export const publicAcademicsResponseSchema = z.object({
  success: z.boolean(),
  overview: publicAcademicOverviewSchema.nullable(),
  wings: z.array(publicAcademicWingSchema),
  streams: z.array(publicAcademicStreamSchema),
  assessmentRules: z.array(publicAcademicAssessmentRuleSchema),
});

// ==========================================
// STATIC FALLBACK DATA
// ==========================================

export const STATIC_ACADEMIC_WINGS: PublicAcademicWing[] = [
  {
    id: "static-wing-1",
    slug: "foundational-wing",
    stageBadge: "Stage 1: Foundational Wing",
    title: "Foundational Stage (LKG, UKG, Classes I & II)",
    description:
      "Focuses on playful, experiential learning that cultivates speech fluency, phonetic awareness, early mathematics, sensory stimulation, social sharing, and motor dexterity. Every child is given gentle, loving care in safe, well-equipped activity suites.",
    highlights: [
      "Phonics, picture-talk & vocabulary building",
      "Number games, counting & spatial geometry",
      "Coloring, craft, music, movement & physical play",
      "Safe, child-sized hygiene washrooms & nursery beds",
    ],
    displayOrder: 0,
  },
  {
    id: "static-wing-2",
    slug: "preparatory-middle-wing",
    stageBadge: "Stage 2: Preparatory & Middle Wing",
    title: "Preparatory & Middle Stage (Classes III to VIII)",
    description:
      "Transition from play to conceptual discovery. Students are introduced to structured science experiments, mathematical reasoning, world geography, history, and three-language proficiency (English, Hindi, Sanskrit).",
    highlights: [
      "Weekly physics, chemistry & biology lab visits",
      "Computer technology, typing, scratch & python coding",
      "Inter-house quizzes, debates & elocution contests",
      "Physical education, athletics, yoga, and gymnastics",
    ],
    displayOrder: 1,
  },
];

export const STATIC_ACADEMIC_STREAMS: PublicAcademicStream[] = [
  {
    id: "static-stream-science",
    slug: "science-stream",
    title: "Science Stream",
    description: null,
    iconName: "FlaskConical",
    subjects: [
      "English Core (Compulsory)",
      "Physics & Chemistry",
      "Mathematics (PCM) OR Biology (PCB)",
      "Elective: Computer Science / Physical Ed",
    ],
    competitiveBadge: "Includes NEET/JEE Foundation",
    displayOrder: 0,
  },
  {
    id: "static-stream-commerce",
    slug: "commerce-stream",
    title: "Commerce Stream",
    description: null,
    iconName: "Award",
    subjects: [
      "English Core (Compulsory)",
      "Accountancy & Business Studies",
      "Economics",
      "Mathematics / Applied Math",
      "Elective: Informatics Practices / PE",
    ],
    competitiveBadge: "Includes CUET & CA Foundation",
    displayOrder: 1,
  },
  {
    id: "static-stream-humanities",
    slug: "humanities-stream",
    title: "Humanities Stream",
    description: null,
    iconName: "BookOpen",
    subjects: [
      "English Core & Hindi Core",
      "History & Political Science",
      "Geography / Economics",
      "Physical Education / Psychology",
    ],
    competitiveBadge: "Focus on Civil Services & Law",
    displayOrder: 2,
  },
];

export const STATIC_ACADEMIC_RULES: PublicAcademicAssessmentRule[] = [
  {
    id: "static-rule-1",
    ruleText:
      "Promotions will be decided on the average marks obtained in the Terminal and Final Examinations in addition to the year’s work including the unit test. To pass in any subject, a student has to secure 35% marks except for languages. Any students who losses the progress card will be fined Rs. 25/-.",
    displayOrder: 0,
  },
  {
    id: "static-rule-2",
    ruleText:
      "Those students who are absent for any of the termination is punishable with expulsion from terminal/unit examination will not be tested earlier or later.",
    displayOrder: 1,
  },
  {
    id: "static-rule-3",
    ruleText:
      "Willful breach of any of the regulations for the conduct of Examination is punishable with expulsion from examination or if subsequently discovered cancelling of paper.",
    displayOrder: 2,
  },
];

export const STATIC_ACADEMIC_OVERVIEW: PublicAcademicOverview = {
  heroBadge: "Experimental Laboratory Learning",
  heroImage: "/images/facilities/science-lab.jpg",
  heroImageAlt: "Devasthaly Vidyapeeth advanced science laboratory practical learning session",
  competitiveBadge: "Integrated Career Preparation",
  competitiveTitle: "NEET, JEE & CUET Foundational Guidance",
  competitiveDescription:
    "We eliminate the stress of outstation coaching by offering integrated competitive foundation modules on campus, including mock OMR testing, concept-clearing doubt desks, and Olympiad problem-solving.",
  competitiveCtaText: "Apply for Class XI Admission",
  competitiveCtaHref: "/admissions",
  assessmentParentNotice:
    "The Parents/Guardians of these students are free to come to the school and meet the class teachers to know the progress of their children/wards on this day.",
  assessmentProspectusNotice:
    "Download the official school prospectus for comprehensive academic curriculum and regulations.",
  assessmentProspectusUrl: "/documents/original/prospectus-2.pdf",
};

export const STATIC_ACADEMICS_DATA: PublicAcademicsData = {
  overview: STATIC_ACADEMIC_OVERVIEW,
  wings: STATIC_ACADEMIC_WINGS,
  streams: STATIC_ACADEMIC_STREAMS,
  assessmentRules: STATIC_ACADEMIC_RULES,
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
 * Fetches public academic curriculum data (wings, streams, assessment rules, overview).
 * Uses 60s revalidation with stable cache tag "academics".
 *
 * CRITICAL EMPTY-ARRAY INTEGRITY:
 * When backend explicitly returns empty collections (wings: [], streams: [], assessmentRules: []),
 * the empty arrays are authoritatively returned so the UI can render its designated empty state.
 * Fallback to static data occurs strictly on network failure, non-200 HTTP, or Zod validation errors.
 */
export async function getPublicAcademics(): Promise<PublicAcademicsData> {
  "use cache";
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return STATIC_ACADEMICS_DATA;
  }

  const endpoint = `${backendOrigin}/api/public/academics`;

  try {
    const isDev = process.env.NODE_ENV === "development";
    const res = await fetch(endpoint, {
      ...(isDev
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60, tags: ["academics"] } }),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(
        `[Academics] API returned HTTP ${res.status} from ${endpoint}. Using static fallback.`
      );
      return STATIC_ACADEMICS_DATA;
    }

    const json = await res.json();
    const parsed = publicAcademicsResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.warn(
        "[Academics] Payload validation failed. Using static fallback.",
        parsed.error.issues
      );
      return STATIC_ACADEMICS_DATA;
    }

    const { overview, wings, streams, assessmentRules } = parsed.data;

    return {
      overview: overview
        ? {
            heroBadge: overview.heroBadge || STATIC_ACADEMIC_OVERVIEW.heroBadge,
            heroImage: overview.heroImage || STATIC_ACADEMIC_OVERVIEW.heroImage,
            heroImageAlt: overview.heroImageAlt || STATIC_ACADEMIC_OVERVIEW.heroImageAlt,
            competitiveBadge: overview.competitiveBadge || STATIC_ACADEMIC_OVERVIEW.competitiveBadge,
            competitiveTitle: overview.competitiveTitle || STATIC_ACADEMIC_OVERVIEW.competitiveTitle,
            competitiveDescription:
              overview.competitiveDescription || STATIC_ACADEMIC_OVERVIEW.competitiveDescription,
            competitiveCtaText:
              overview.competitiveCtaText || STATIC_ACADEMIC_OVERVIEW.competitiveCtaText,
            competitiveCtaHref:
              overview.competitiveCtaHref || STATIC_ACADEMIC_OVERVIEW.competitiveCtaHref,
            assessmentParentNotice:
              overview.assessmentParentNotice || STATIC_ACADEMIC_OVERVIEW.assessmentParentNotice,
            assessmentProspectusNotice:
              overview.assessmentProspectusNotice || STATIC_ACADEMIC_OVERVIEW.assessmentProspectusNotice,
            assessmentProspectusUrl:
              overview.assessmentProspectusUrl || STATIC_ACADEMIC_OVERVIEW.assessmentProspectusUrl,
          }
        : STATIC_ACADEMIC_OVERVIEW,
      wings: wings.map((w) => ({
        id: w.id,
        slug: w.slug,
        stageBadge: w.stageBadge,
        title: w.title,
        description: w.description,
        highlights: w.highlights,
        displayOrder: w.displayOrder,
      })),
      streams: streams.map((s) => ({
        id: s.id,
        slug: s.slug,
        title: s.title,
        description: s.description,
        iconName: s.iconName,
        subjects: s.subjects,
        competitiveBadge: s.competitiveBadge,
        displayOrder: s.displayOrder,
      })),
      assessmentRules: assessmentRules.map((r) => ({
        id: r.id,
        ruleText: r.ruleText,
        displayOrder: r.displayOrder,
      })),
    };
  } catch (error) {
    console.warn(
      `[Academics] Failed to fetch academics from ${endpoint}. Using static fallback:`,
      error
    );
    return STATIC_ACADEMICS_DATA;
  }
}
