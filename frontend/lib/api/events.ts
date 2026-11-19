import { z } from "zod";

// ==========================================
// PUBLIC EVENT INTERFACES
// ==========================================

export interface PublicEventItem {
  id?: string;
  title: string;
  description?: string;
  desc: string;
  eventDate?: string;
  date: string;
  isoDate: string;
  time: string;
  location?: string | null;
  venue: string;
  category: string;
  linkHref?: string | null;
  linkLabel?: string | null;
  coverImageUrl?: string | null;
  coverImageAlt?: string;
  displayOrder?: number;
}

export interface PublicEventsData {
  events: PublicEventItem[];
  categories: string[];
}

// ==========================================
// ZOD SCHEMAS FOR PUBLIC API VALIDATION
// ==========================================

export const publicSchoolEventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  desc: z.string().optional(),
  eventDate: z.string().optional(),
  date: z.string().optional(),
  isoDate: z.string().default(""),
  time: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  category: z.string().default("School Event"),
  linkHref: z.string().nullable().optional(),
  linkLabel: z.string().nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
  coverImageAlt: z.string().default(""),
  displayOrder: z.number().default(0),
});

export const publicEventsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    events: z.array(publicSchoolEventSchema),
    categories: z.array(z.string()).default([]),
  }),
});

// ==========================================
// STATIC EMERGENCY FALLBACK
// ==========================================

export const STATIC_FALLBACK_EVENTS: PublicEventsData = {
  events: [
    {
      date: "25 Nov 2025",
      isoDate: "2025-11-25",
      title: "Inter-School English Debate Competition",
      time: "9:30 AM – 1:30 PM",
      venue: "Auditorium Hall, Devasthaly Campus",
      desc: "Topic: 'Artificial Intelligence & the Future of Human Intellect' with participating CBSE schools from Ballia, Mau, and Ghazipur.",
      category: "Academic Competition",
    },
    {
      date: "12 Dec 2025",
      isoDate: "2025-12-12",
      title: "Annual Sports Meet & Athletic Championship",
      time: "8:00 AM – 4:00 PM",
      venue: "5-Acre Sports Complex",
      desc: "Track and field events, relay races, martial arts demonstrations, and march-past by school houses.",
      category: "Sports & Athletics",
    },
    {
      date: "05 Jan 2026",
      isoDate: "2026-01-05",
      title: "CBSE Pre-Board Examination Series (Classes X & XII)",
      time: "10:00 AM – 1:15 PM",
      venue: "Senior Secondary Examination Block",
      desc: "Comprehensive mock board examination adhering to CBSE standardized marking scheme and OMR answer sheets.",
      category: "CBSE Examination",
    },
    {
      date: "26 Jan 2026",
      isoDate: "2026-01-26",
      title: "Republic Day Patriotic Parade & Cultural Gala",
      time: "8:00 AM – 11:30 AM",
      venue: "Main Campus Flagpole & Assembly Grounds",
      desc: "Flag hoisting by the Principal, NCC troop drill, patriotic songs, and distribution of student merit certificates.",
      category: "National Celebration",
    },
  ],
  categories: [
    "Academic Competition",
    "Sports & Athletics",
    "CBSE Examination",
    "National Celebration",
  ],
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
 * Fetches public school events from the backend API.
 * Uses 60s revalidation with stable cache tag "events".
 *
 * CRITICAL EMPTY-ARRAY INTEGRITY:
 * An intentionally empty published collection returns [] and renders empty.
 * Fallback is activated strictly on network error, non-200 HTTP, or Zod validation failure.
 */
export async function getPublicEvents(): Promise<PublicEventsData> {
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return STATIC_FALLBACK_EVENTS;
  }

  const endpoint = `${backendOrigin}/api/public/events`;

  try {
    const isDev = process.env.NODE_ENV === "development";
    const res = await fetch(endpoint, {
      ...(isDev
        ? { cache: "no-store" as const }
        : { next: { revalidate: 60, tags: ["events"] } }),
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(
        `[Events] API returned HTTP ${res.status} from ${endpoint}. Using static fallback.`
      );
      return STATIC_FALLBACK_EVENTS;
    }

    const json = await res.json();
    const parsed = publicEventsResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.warn(
        "[Events] Payload validation failed. Using static fallback.",
        parsed.error.issues
      );
      return STATIC_FALLBACK_EVENTS;
    }

    const events: PublicEventItem[] = parsed.data.data.events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      desc: e.desc || e.description || "",
      eventDate: e.eventDate,
      date: e.date || e.eventDate || "",
      isoDate: e.isoDate,
      time: e.time || "",
      location: e.location,
      venue: e.venue || e.location || "",
      category: e.category,
      linkHref: e.linkHref,
      linkLabel: e.linkLabel,
      coverImageUrl: e.coverImageUrl,
      coverImageAlt: e.coverImageAlt,
      displayOrder: e.displayOrder,
    }));

    return {
      events,
      categories: parsed.data.data.categories,
    };
  } catch (error) {
    console.warn(
      `[Events] Failed to fetch school events from ${endpoint}. Using static fallback:`,
      error
    );
    return STATIC_FALLBACK_EVENTS;
  }
}
