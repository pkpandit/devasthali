import { z } from "zod";
import type { NavItem, FooterLinkItem } from "@/types/content";

export const publicNavItemChildSchema = z.object({
  name: z.string().min(1),
  href: z.string().min(1),
  badge: z.string().optional(),
  openInNewTab: z.boolean().optional(),
});

export const publicNavColumnSchema = z.object({
  heading: z.string().optional(),
  items: z.array(publicNavItemChildSchema),
});

export const publicNavItemSchema = z.object({
  name: z.string().min(1),
  href: z.string().min(1),
  badge: z.string().optional(),
  openInNewTab: z.boolean().optional(),
  panelType: z.enum(["compact", "medium", "mega"]).optional(),
  columns: z.array(publicNavColumnSchema).optional(),
});

export const publicFooterLinkItemSchema = z.object({
  name: z.string().min(1),
  href: z.string().min(1),
  openInNewTab: z.boolean().optional(),
});

export const publicNavigationResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    header: z.array(publicNavItemSchema),
    footerAdmissions: z.array(publicFooterLinkItemSchema),
    footerLife: z.array(publicFooterLinkItemSchema),
  }),
});

export interface PublicNavigationData {
  header: NavItem[];
  footerAdmissions: FooterLinkItem[];
  footerLife: FooterLinkItem[];
}

export const FALLBACK_HEADER_NAV: NavItem[] = [
  { name: "Home", href: "/" },
  {
    name: "About Us",
    href: "/about",
    panelType: "mega",
    columns: [
      {
        heading: "Overview & Heritage",
        items: [
          { name: "About School & Heritage", href: "/about" },
          { name: "Vision and Mission", href: "/vision-mission" },
          {
            name: "CBSE Mandatory Disclosure",
            href: "/mandatory-public-disclosure",
          },
        ],
      },
      {
        heading: "Leadership Messages",
        items: [
          { name: "Founder’s Message", href: "/founders-message" },
          { name: "Patron’s Message", href: "/patrons-message" },
          { name: "President’s Message", href: "/presidents-message" },
          { name: "Manager’s Message", href: "/managers-message" },
          { name: "Principal’s Message", href: "/principals-message" },
        ],
      },
    ],
  },
  {
    name: "Academics",
    href: "/academics",
    panelType: "mega",
    columns: [
      {
        heading: "Pedagogy & Structure",
        items: [
          { name: "Curriculum & Academic System", href: "/academic-system" },
          { name: "Faculty & Mentors Directory", href: "/faculty" },
        ],
      },
      {
        heading: "Excellence & Achievements",
        items: [
          {
            name: "Board Examination Results & Toppers",
            href: "/results",
            badge: "100% Pass",
          },
          { name: "Student Activities & Competitions", href: "/events" },
        ],
      },
    ],
  },
  {
    name: "Admissions",
    href: "/admissions",
    panelType: "mega",
    columns: [
      {
        heading: "Admission Information",
        items: [
          {
            name: "Admission Procedure & Entrance",
            href: "/admissions/procedure",
          },
          { name: "Fee Structure (2026–27)", href: "/admissions/fees" },
        ],
      },
      {
        heading: "Application & Prospectus",
        items: [
          { name: "School Prospectus", href: "/school-prospectus" },
          {
            name: "Online Admission Form",
            href: "/online-admission-form",
            badge: "Apply Now",
          },
        ],
      },
    ],
  },
  {
    name: "Life at School",
    href: "/facilities",
    panelType: "medium",
    columns: [
      {
        heading: "Campus & Boarding",
        items: [
          { name: "Campus Infrastructure & Facilities", href: "/facilities" },
          { name: "Hostels & Residential Care", href: "/facilities#hostel" },
          { name: "Safe Transport Network", href: "/facilities#transport" },
        ],
      },
      {
        heading: "Activities & Culture",
        items: [
          {
            name: "Co-Curricular Activities & Sports",
            href: "/co-curricular-activities",
          },
          { name: "Campus Photo Gallery", href: "/gallery" },
        ],
      },
    ],
  },
  {
    name: "Students & Parents",
    href: "/notices",
    panelType: "compact",
    columns: [
      {
        items: [
          { name: "Official Notices & Circulars", href: "/notices" },
          { name: "Downloads & Public Records", href: "/downloads" },
          {
            name: "General Instructions & Rules",
            href: "/general-instructions",
          },
          { name: "Alumni Corner & Reunion", href: "/alumni" },
        ],
      },
    ],
  },
  {
    name: "Contact",
    href: "/contact",
    panelType: "compact",
    columns: [
      {
        items: [
          { name: "Contact Us & Directory", href: "/contact" },
          { name: "How to Reach Campus", href: "/contact#location" },
        ],
      },
    ],
  },
];

export const FALLBACK_FOOTER_ADMISSIONS: FooterLinkItem[] = [
  { name: "Admissions 2026–27 Overview", href: "/admissions" },
  { name: "Admission Procedure & Guidelines", href: "/admissions/procedure" },
  { name: "Fee Schedule & Structure", href: "/admissions/fees" },
  { name: "School Prospectus (PDF)", href: "/school-prospectus" },
  { name: "Online Admission Form", href: "/online-admission-form" },
  { name: "CBSE Curriculum & Wings", href: "/academics" },
  { name: "Academic System & Assessment", href: "/academic-system" },
  { name: "Board Examination Results", href: "/results" },
];

export const FALLBACK_FOOTER_LIFE: FooterLinkItem[] = [
  { name: "Campus Facilities & 15-Acre Grounds", href: "/facilities" },
  { name: "Residential Hostels & Mess", href: "/facilities#hostel" },
  { name: "Safe Transport Network", href: "/facilities#transport" },
  { name: "Co-Curricular Activities & Sports", href: "/co-curricular-activities" },
  { name: "Campus Photo Gallery", href: "/gallery" },
  { name: "Official Notices & Circulars", href: "/notices" },
  { name: "General Instructions & Rules", href: "/general-instructions" },
  { name: "Alumni Network & Reunion", href: "/alumni" },
];

export const STATIC_FALLBACK_NAVIGATION: PublicNavigationData = {
  header: FALLBACK_HEADER_NAV,
  footerAdmissions: FALLBACK_FOOTER_ADMISSIONS,
  footerLife: FALLBACK_FOOTER_LIFE,
};

/**
 * Determines the internal or public API origin for backend calls.
 * Follows the established pattern from profile.ts:
 * 1. BACKEND_INTERNAL_URL (server-to-server internal URL)
 * 2. NEXT_PUBLIC_API_ORIGIN (public origin if configured)
 * 3. In development: "http://127.0.0.1:3001"
 * 4. In production without config: null (gracefully uses static fallback)
 */
export function getBackendOrigin(): string | null {
  const envUrl =
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_ORIGIN;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:3001";
  }

  return null;
}

/**
 * Fetches public navigation from the backend API.
 * Uses a measurable freshness policy (60s in production and development with Next.js cache).
 *
 * CRITICAL FALLBACK INTEGRITY:
 * - An intentionally empty published menu (data.header: []) is an authoritative response
 *   and will be rendered as empty, NOT replaced by the static fallback.
 * - Fallback is triggered ONLY when the backend is unreachable (network error), returns a non-200
 *   HTTP status code, or delivers an invalid payload that fails Zod validation.
 */
export async function getPublicNavigation(): Promise<PublicNavigationData> {
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return STATIC_FALLBACK_NAVIGATION;
  }

  const endpoint = `${backendOrigin}/api/public/navigation`;

  try {
    const res = await fetch(endpoint, {
      next: { revalidate: 60, tags: ["navigation"] },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(
        `[Navigation] API returned HTTP ${res.status} from ${endpoint}. Using static fallback.`
      );
      return STATIC_FALLBACK_NAVIGATION;
    }

    const json = await res.json();
    const parsed = publicNavigationResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.warn(
        "[Navigation] Payload validation failed. Using static fallback.",
        parsed.error.issues
      );
      return STATIC_FALLBACK_NAVIGATION;
    }

    // Authoritative success: return data as-is, even if header or footer arrays are empty
    return parsed.data.data;
  } catch (error) {
    console.warn(
      `[Navigation] Failed to fetch navigation from ${endpoint}. Using static fallback:`,
      error instanceof Error ? error.message : String(error)
    );
    return STATIC_FALLBACK_NAVIGATION;
  }
}
