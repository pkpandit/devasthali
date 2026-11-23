import { z } from "zod";

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface PublicStudentClub {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  iconName: string;
  displayOrder: number;
}

export interface PublicActivityOverview {
  badgeText: string | null;
  title: string | null;
  subtitle: string | null;
  arenaSize: string | null;
  cardTitle: string | null;
  cardSubtitle: string | null;
  narrativeParagraph1: string | null;
  narrativeParagraph2: string | null;
  heroImage: string | null;
  heroImageAlt: string | null;
}

export interface PublicActivitiesData {
  overview: PublicActivityOverview | null;
  clubs: PublicStudentClub[];
}

// ==========================================
// ZOD SCHEMAS FOR PUBLIC API VALIDATION
// ==========================================

export const publicStudentClubSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  category: z.string().default("Cultural & Creative"),
  description: z.string().nullable().optional(),
  iconName: z.string().default("Activity"),
  displayOrder: z.number().default(0),
});

export const publicActivityOverviewSchema = z.object({
  badgeText: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
  arenaSize: z.string().nullable().optional(),
  cardTitle: z.string().nullable().optional(),
  cardSubtitle: z.string().nullable().optional(),
  narrativeParagraph1: z.string().nullable().optional(),
  narrativeParagraph2: z.string().nullable().optional(),
  heroImage: z.string().nullable().optional(),
  heroImageAlt: z.string().nullable().optional(),
});

export const publicActivitiesResponseSchema = z.object({
  success: z.boolean(),
  overview: publicActivityOverviewSchema.nullable(),
  clubs: z.array(publicStudentClubSchema),
});

// ==========================================
// STATIC FALLBACK DATA
// ==========================================

export const STATIC_ACTIVITY_OVERVIEW: PublicActivityOverview = {
  badgeText: "Life at School / Activities",
  title: "Co-Curricular Activities",
  subtitle:
    "Enhancing personality, talent, and all-round development in our 22,000 sq ft dedicated activity complex.",
  arenaSize: "22,000 sq ft",
  cardTitle: "Holistic Personality Enrichment",
  cardSubtitle: "Devasthaly Vidyapeeth, Chilkahar, Ballia (U.P.)",
  narrativeParagraph1:
    "Devasthaly Vidyapeeth provides a wide variety of extra-curricular activities catering to each individual’s needs, talents and interest. Devasthaly Vidyapeeth works towards enhancing the personality of each child for all-round development, thereby nurturing the students to become a global citizen, who can compete and reside worldwide. Devasthaly Vidyapeeth, at regular intervals organises different activities and competitions in its separately built up area of 22000 sq ft.",
  narrativeParagraph2:
    "Devasthaly Vidyapeeth encourages its students to have a balanced involvement in the academic and extra curricular activities. Students are exposed to dance, music and other cultural events by number of inter House competitions and club activities including fine arts, computer graphics, nature club, vocal & instrumental music, western & Indian classical dance, house keeping and cooking club.",
  heroImage: null,
  heroImageAlt: null,
};

export const STATIC_STUDENT_CLUBS: PublicStudentClub[] = [
  {
    id: "static-club-1",
    slug: "fine-arts-painting",
    name: "Fine Arts & Painting",
    category: "Cultural & Creative",
    description: "Visual arts, sketching, watercolor, and traditional Indian painting techniques.",
    iconName: "Palette",
    displayOrder: 1,
  },
  {
    id: "static-club-2",
    slug: "computer-graphics-digital-design",
    name: "Computer Graphics & Digital Design",
    category: "Science & Technology",
    description: "Digital illustration, multimedia creation, graphic design, and basic animation skills.",
    iconName: "Sparkles",
    displayOrder: 2,
  },
  {
    id: "static-club-3",
    slug: "nature-environment-club",
    name: "Nature & Environment Club",
    category: "Social & Leadership",
    description: "Eco-initiatives, campus tree plantation, biodiversity awareness, and sustainability drives.",
    iconName: "Compass",
    displayOrder: 3,
  },
  {
    id: "static-club-4",
    slug: "vocal-instrumental-music",
    name: "Vocal & Instrumental Music",
    category: "Cultural & Creative",
    description: "Indian classical vocals, harmonium, keyboard, tabla, and choir performances.",
    iconName: "Music",
    displayOrder: 4,
  },
  {
    id: "static-club-5",
    slug: "western-indian-classical-dance",
    name: "Western & Indian Classical Dance",
    category: "Cultural & Creative",
    description: "Kathak, Bharatnatyam, folk dances, and synchronized contemporary choreography.",
    iconName: "Activity",
    displayOrder: 5,
  },
  {
    id: "static-club-6",
    slug: "house-keeping-culinary-cooking-club",
    name: "House Keeping & Culinary / Cooking Club",
    category: "Life Skills",
    description: "Fireless cooking, hospitality etiquette, nutritional hygiene, and practical home management.",
    iconName: "Award",
    displayOrder: 6,
  },
  {
    id: "static-club-7",
    slug: "inter-house-cultural-competitions",
    name: "Inter-House Cultural Competitions",
    category: "Competitions",
    description: "Annual intra-school competitions across music, dance, dramatics, and artistic displays.",
    iconName: "Trophy",
    displayOrder: 7,
  },
  {
    id: "static-club-8",
    slug: "debates-elocution-public-speaking",
    name: "Debates, Elocution & Public Speaking",
    category: "Literary & Debate",
    description: "Bilingual parliamentary debate, declamation, extempore, and MUN preparation.",
    iconName: "Mic",
    displayOrder: 8,
  },
];

export const STATIC_ACTIVITIES_DATA: PublicActivitiesData = {
  overview: STATIC_ACTIVITY_OVERVIEW,
  clubs: STATIC_STUDENT_CLUBS,
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
 * Fetches public co-curricular activities and student clubs data.
 * Uses 60s revalidation with stable cache tag "activities".
 * Fallback to static data occurs strictly on network failure, non-200 HTTP, or Zod validation errors.
 */
export async function getPublicActivities(): Promise<PublicActivitiesData> {
  "use cache";
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return STATIC_ACTIVITIES_DATA;
  }

  const endpoint = `${backendOrigin}/api/public/activities`;

  try {
    const isDev = process.env.NODE_ENV === "development";
    const res = await fetch(endpoint, {
      ...(isDev
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60, tags: ["activities"] } }),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(
        `[Activities] API returned HTTP ${res.status} from ${endpoint}. Using static fallback.`
      );
      return STATIC_ACTIVITIES_DATA;
    }

    const json = await res.json();
    const parsed = publicActivitiesResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.warn(
        "[Activities] Payload validation failed. Using static fallback.",
        parsed.error.issues
      );
      return STATIC_ACTIVITIES_DATA;
    }

    const { overview, clubs } = parsed.data;

    return {
      overview: overview
        ? {
            badgeText: overview.badgeText || STATIC_ACTIVITY_OVERVIEW.badgeText,
            title: overview.title || STATIC_ACTIVITY_OVERVIEW.title,
            subtitle: overview.subtitle || STATIC_ACTIVITY_OVERVIEW.subtitle,
            arenaSize: overview.arenaSize || STATIC_ACTIVITY_OVERVIEW.arenaSize,
            cardTitle: overview.cardTitle || STATIC_ACTIVITY_OVERVIEW.cardTitle,
            cardSubtitle: overview.cardSubtitle || STATIC_ACTIVITY_OVERVIEW.cardSubtitle,
            narrativeParagraph1:
              overview.narrativeParagraph1 || STATIC_ACTIVITY_OVERVIEW.narrativeParagraph1,
            narrativeParagraph2:
              overview.narrativeParagraph2 || STATIC_ACTIVITY_OVERVIEW.narrativeParagraph2,
            heroImage: overview.heroImage || null,
            heroImageAlt: overview.heroImageAlt || null,
          }
        : STATIC_ACTIVITY_OVERVIEW,
      clubs: clubs.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        category: c.category,
        description: c.description || null,
        iconName: c.iconName,
        displayOrder: c.displayOrder,
      })),
    };
  } catch (error) {
    console.warn(
      `[Activities] Failed to fetch activities from ${endpoint}. Using static fallback:`,
      error
    );
    return STATIC_ACTIVITIES_DATA;
  }
}
