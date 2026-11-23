import { z } from "zod";

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface PublicAlumniOverview {
  badgeText: string | null;
  title: string | null;
  subtitle: string | null;
}

export interface PublicAlumniReunion {
  id: string;
  slug: string;
  title: string;
  description: string;
  heroImage: string | null;
  heroImageAlt: string | null;
  eventDate: string | null;
}

export interface PublicCareerOpportunity {
  id: string;
  slug: string;
  badgeText: string;
  title: string;
  description: string;
  contactEmail: string;
  emailSubject: string | null;
  ctaText: string;
}

export interface PublicAlumniData {
  overview: PublicAlumniOverview | null;
  reunions: PublicAlumniReunion[];
  opportunities: PublicCareerOpportunity[];
}

// ==========================================
// ZOD SCHEMAS FOR PUBLIC API VALIDATION
// ==========================================

export const publicAlumniOverviewSchema = z.object({
  badgeText: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
});

export const publicAlumniReunionSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  heroImage: z.string().nullable().optional(),
  heroImageAlt: z.string().nullable().optional(),
  eventDate: z.string().nullable().optional(),
});

export const publicCareerOpportunitySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  badgeText: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  contactEmail: z.string().email(),
  emailSubject: z.string().nullable().optional(),
  ctaText: z.string().min(1),
});

export const publicAlumniResponseSchema = z.object({
  success: z.boolean(),
  overview: publicAlumniOverviewSchema.nullable(),
  reunions: z.array(publicAlumniReunionSchema),
  opportunities: z.array(publicCareerOpportunitySchema),
});

// ==========================================
// STATIC FALLBACK DATA
// ==========================================

export const STATIC_ALUMNI_OVERVIEW: PublicAlumniOverview = {
  badgeText: "Students & Parents / Alumni",
  title: "Alumni Corner",
  subtitle:
    "Welcome to the Devasthaly Vidyapeeth Alumni Network. Celebrating memories, reunions, and enduring bonds.",
};

export const STATIC_ALUMNI_REUNIONS: PublicAlumniReunion[] = [
  {
    id: "static-reunion-1",
    slug: "annual-alumni-meet-reunion",
    title: "ALUMNI MEET & REUNION",
    description:
      "Reconnect with your alma mater, fellow batchmates, and teachers at Devasthaly Vidyapeeth, Chilkahar, Ballia.",
    heroImage: "/images/gallery/ALUMNI-REUNION.webp",
    heroImageAlt: "Devasthaly Vidyapeeth Alumni Reunion",
    eventDate: null,
  },
];

export const STATIC_CAREER_OPPORTUNITIES: PublicCareerOpportunity[] = [
  {
    id: "static-career-1",
    slug: "careers-alumni-faculty-association",
    badgeText: "Institutional Notice",
    title: "Careers & Alumni Faculty Association",
    description:
      "Devasthaly Vidyapeeth invites alumni scholars and experienced educators to join the academic mentoring team.",
    contactEmail: "principaldvp@gmail.com",
    emailSubject: "Alumni Association / Career Enquiry",
    ctaText: "Connect via Email",
  },
];

export const STATIC_ALUMNI_DATA: PublicAlumniData = {
  overview: STATIC_ALUMNI_OVERVIEW,
  reunions: STATIC_ALUMNI_REUNIONS,
  opportunities: STATIC_CAREER_OPPORTUNITIES,
};

// ==========================================
// BACKEND URL RESOLUTION & MEDIA HELPER
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

function resolveHeroImageUrl(url: string | null | undefined, backendOrigin: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("/api/public/media/")) {
    if (backendOrigin) {
      return `${backendOrigin}${url}`;
    }
  }
  return url;
}

// ==========================================
// PUBLIC FETCH METHODS
// ==========================================

/**
 * Fetches public alumni portal data (overview, reunions, career opportunities).
 * Uses 60s revalidation with stable cache tag "alumni".
 * Fallback to static data occurs strictly on network failure, non-200 HTTP, or Zod validation errors.
 * Preserves empty arrays if valid response from backend has reunions: [] or opportunities: [].
 */
export async function getPublicAlumni(): Promise<PublicAlumniData> {
  "use cache";
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return STATIC_ALUMNI_DATA;
  }

  const endpoint = `${backendOrigin}/api/public/alumni`;

  try {
    const isDev = process.env.NODE_ENV === "development";
    const res = await fetch(endpoint, {
      ...(isDev
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60, tags: ["alumni"] } }),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(
        `[Alumni] API returned HTTP ${res.status} from ${endpoint}. Using static fallback.`
      );
      return STATIC_ALUMNI_DATA;
    }

    const json = await res.json();
    const parsed = publicAlumniResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.warn(
        "[Alumni] Payload validation failed. Using static fallback.",
        parsed.error.issues
      );
      return STATIC_ALUMNI_DATA;
    }

    const { overview, reunions, opportunities } = parsed.data;

    return {
      overview: overview
        ? {
            badgeText: overview.badgeText || STATIC_ALUMNI_OVERVIEW.badgeText,
            title: overview.title || STATIC_ALUMNI_OVERVIEW.title,
            subtitle: overview.subtitle || STATIC_ALUMNI_OVERVIEW.subtitle,
          }
        : STATIC_ALUMNI_OVERVIEW,
      reunions: reunions.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        description: r.description,
        heroImage: resolveHeroImageUrl(r.heroImage, backendOrigin),
        heroImageAlt: r.heroImageAlt ?? null,
        eventDate: r.eventDate ?? null,
      })),
      opportunities: opportunities.map((o) => ({
        id: o.id,
        slug: o.slug,
        badgeText: o.badgeText,
        title: o.title,
        description: o.description,
        contactEmail: o.contactEmail,
        emailSubject: o.emailSubject ?? null,
        ctaText: o.ctaText,
      })),
    };
  } catch (error) {
    console.warn(
      `[Alumni] Failed to fetch alumni data from ${endpoint}. Using static fallback:`,
      error
    );
    return STATIC_ALUMNI_DATA;
  }
}
