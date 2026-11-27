import { z } from "zod";
import type {
  PublicHomepageData,
  HomepageHeroData,
  HomepagePrincipalData,
  HomepageStatisticData,
  HomepageHighlightData,
  HomepageAnnouncementData,
  HomepageFaqData,
} from "@/types/homepage";
import { HOME_FAQ_DATA } from "@/lib/content/home";

export const publicHeroSchema = z
  .object({
    badgeText: z.string().nullable().optional(),
    heading: z.string().min(1),
    highlightText: z.string().nullable().optional(),
    subheading: z.string().min(1),
    primaryCta: z.object({
      label: z.string().min(1),
      href: z.string().min(1),
    }),
    secondaryCta: z
      .object({
        label: z.string().min(1),
        href: z.string().min(1),
      })
      .nullable()
      .optional(),
    backgroundImageUrl: z.string().nullable().optional(),
  })
  .nullable();

export const publicPrincipalSchema = z
  .object({
    heading: z.string().min(1),
    principalName: z.string().min(1),
    principalDesignation: z.string().min(1),
    quote: z.string().min(1),
    excerpt: z.string().min(1),
    imageUrl: z.string().nullable().optional(),
    cta: z
      .object({
        label: z.string().min(1),
        href: z.string().min(1),
      })
      .nullable()
      .optional(),
  })
  .nullable();

export const publicStatisticSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  numericValue: z.string().min(1),
  suffix: z.string().nullable().optional(),
  subtext: z.string().nullable().optional(),
  badge: z.string().nullable().optional(),
  iconName: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  displayOrder: z.number(),
});

export const publicHighlightSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  badge: z.string().nullable().optional(),
  iconName: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  ctaLabel: z.string().min(1),
  ctaHref: z.string().min(1),
  displayOrder: z.number(),
});

export const publicAnnouncementSchema = z
  .object({
    enabled: z.boolean(),
    title: z.string().min(1),
    badge: z.string().nullable().optional(),
    subtitle: z.string().nullable().optional(),
    imageUrl: z.string().min(1),
    imageAlt: z.string().min(1),
    linkHref: z.string().min(1),
    linkLabel: z.string().min(1),
    delayMs: z.number().int().min(0),
    dismissalKey: z.string().min(1),
  })
  .nullable();

export const publicFaqSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  displayOrder: z.number(),
});

export const publicHomepageResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    hero: publicHeroSchema,
    principal: publicPrincipalSchema,
    statistics: z.array(publicStatisticSchema),
    highlights: z.array(publicHighlightSchema),
    announcement: publicAnnouncementSchema.default(null),
    faqs: z.array(publicFaqSchema).default([]),
  }),
});

export const STATIC_FALLBACK_HERO: HomepageHeroData = {
  badgeText: "Admissions Open 2026–27 • LKG to Class XI",
  heading: "Nurturing Academic Rigour, Moral Character & Leadership",
  highlightText: "Since 1988",
  subheading:
    "Welcome to Devasthaly Vidyapeeth, Chilkahar, Ballia. A premier CBSE-affiliated co-educational residential and day-boarding institution where timeless Indian values converge with state-of-the-art modern education.",
  primaryCta: {
    label: "Apply 2026–27",
    href: "/admissions",
  },
  secondaryCta: {
    label: "Schedule a Guided Campus Tour",
    href: "/contact",
  },
  backgroundImageUrl: "/images/about/campus-showcase.jpg",
};

export const STATIC_FALLBACK_PRINCIPAL: HomepagePrincipalData = {
  heading: "Principal’s Message",
  principalName: "P. C. Shrivastava",
  principalDesignation: "Principal, Devasthaly Vidyapeeth",
  quote:
    "Devasthaly Vidyapeeth is an amalgamation of competent teachers, state-of-the-art infrastructure, an idyllic setting and an experienced administration, creating a safe and supportive environment for student growth.",
  excerpt:
    "Devasthaly Vidyapeeth aims at holistic growth and development of its students. The school's genuine concern ensures student's emotional growth along with intellectual excellence. This empowers them to develop their self esteem, self-awareness and self-confidence. Sharing ideas, analysing situations and expressing them confidently are essential skills which are honed here, through experiential learning.",
  imageUrl: "/images/leadership/principal_sir.webp",
  cta: {
    label: "Read Full Message",
    href: "/principals-message",
  },
};

export const STATIC_FALLBACK_STATISTICS: HomepageStatisticData[] = [
  {
    id: "stat-1",
    label: "Years of Heritage",
    numericValue: "36+",
    suffix: null,
    subtext: "Established in 1988",
    badge: "Legacy",
    iconName: "Award",
    imageUrl: "/images/about/campus-showcase.jpg",
    displayOrder: 0,
  },
  {
    id: "stat-2",
    label: "CBSE Board Pass Rate",
    numericValue: "100%",
    suffix: null,
    subtext: "Consistent Merit Ranks",
    badge: "Excellence",
    iconName: "Trophy",
    imageUrl: "/images/home/hero/hero-students.jpg",
    displayOrder: 1,
  },
  {
    id: "stat-3",
    label: "Lush Green Campus",
    numericValue: "15+ Acres",
    suffix: null,
    subtext: "Eco-Friendly & Safe",
    badge: "Eco Campus",
    iconName: "Building",
    imageUrl: "/images/facilities/campus-grounds.jpg",
    displayOrder: 2,
  },
  {
    id: "stat-4",
    label: "Student-Teacher Ratio",
    numericValue: "1 : 25",
    suffix: null,
    subtext: "Personal Mentorship",
    badge: "Mentorship",
    iconName: "GraduationCap",
    imageUrl: "/images/leadership/principal-mentor.jpg",
    displayOrder: 3,
  },
  {
    id: "stat-5",
    label: "Alumni Across India",
    numericValue: "3,500+",
    suffix: null,
    subtext: "IITs, AIIMS, Armed Forces",
    badge: "Alumni",
    iconName: "Sparkles",
    imageUrl: "/images/alumni/alumni-graduates.jpg",
    displayOrder: 4,
  },
  {
    id: "stat-6",
    label: "Transport Nodes",
    numericValue: "40+ Stops",
    suffix: null,
    subtext: "Ballia & Rasra Network",
    badge: "GPS Fleet",
    iconName: "Bus",
    imageUrl: "/images/facilities/school-bus-fleet.jpg",
    displayOrder: 5,
  },
];

export const STATIC_FALLBACK_HIGHLIGHTS: HomepageHighlightData[] = [
  {
    id: "hl-1",
    title: "Download School Prospectus",
    description: "Admissions PDF Brochure",
    badge: "PDF",
    iconName: "Download",
    imageUrl: "/images/admissions/prospectus-brochure.jpg",
    ctaLabel: "Download",
    ctaHref: "/school-prospectus",
    displayOrder: 0,
  },
  {
    id: "hl-2",
    title: "Fee Schedule & Guidelines",
    description: "Class-wise Fee Structure",
    badge: "Fees",
    iconName: "FileText",
    imageUrl: "/images/admissions/fee-guidelines.jpg",
    ctaLabel: "View Details",
    ctaHref: "/admissions/fees",
    displayOrder: 1,
  },
  {
    id: "hl-3",
    title: "Bus Routes & Transport",
    description: "40+ Stops GPS Network",
    badge: "Routes",
    iconName: "Bus",
    imageUrl: "/images/facilities/school-bus-fleet.jpg",
    ctaLabel: "Explore",
    ctaHref: "/facilities#transport",
    displayOrder: 2,
  },
  {
    id: "hl-4",
    title: "Board Toppers & Results",
    description: "100% CBSE Pass Records",
    badge: "Merit",
    iconName: "Award",
    imageUrl: "/images/academics/toppers/board-toppers-trophy.jpg",
    ctaLabel: "View Results",
    ctaHref: "/results",
    displayOrder: 3,
  },
  {
    id: "hl-5",
    title: "Official Circulars & Desk",
    description: "Latest School Circulars",
    badge: "Desk",
    iconName: "Calendar",
    imageUrl: "/images/notices/school-notices-circulars.jpg",
    ctaLabel: "Open Desk",
    ctaHref: "/notices",
    displayOrder: 4,
  },
  {
    id: "hl-6",
    title: "CBSE Mandatory Disclosure",
    description: "Statutory Compliance Docs",
    badge: "CBSE",
    iconName: "ShieldCheck",
    imageUrl: "/images/about/cbse-affiliation-cert.jpg",
    ctaLabel: "Disclosures",
    ctaHref: "/mandatory-public-disclosure",
    displayOrder: 5,
  },
];

export const STATIC_FALLBACK_ANNOUNCEMENT: HomepageAnnouncementData | null = null;

export const STATIC_FALLBACK_FAQS: HomepageFaqData[] = HOME_FAQ_DATA.map((faq, idx) => ({
  id: `static-faq-${idx + 1}`,
  question: faq.question,
  answer: faq.answer,
  displayOrder: idx,
}));

export const STATIC_FALLBACK_HOMEPAGE: PublicHomepageData = {
  hero: STATIC_FALLBACK_HERO,
  principal: STATIC_FALLBACK_PRINCIPAL,
  statistics: STATIC_FALLBACK_STATISTICS,
  highlights: STATIC_FALLBACK_HIGHLIGHTS,
  announcement: STATIC_FALLBACK_ANNOUNCEMENT,
  faqs: STATIC_FALLBACK_FAQS,
};

function getBackendOrigin(): string | null {
  if (process.env.BACKEND_INTERNAL_URL) {
    return process.env.BACKEND_INTERNAL_URL.replace(/\/+$/, "");
  }

  if (process.env.NEXT_PUBLIC_API_ORIGIN) {
    return process.env.NEXT_PUBLIC_API_ORIGIN.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:3001";
  }

  return null;
}

/**
 * Fetches public homepage content from the backend API.
 * Uses a measurable freshness policy (60s revalidation with Next.js cache).
 *
 * CRITICAL FALLBACK INTEGRITY:
 * - If the API returns an authoritative empty array (e.g. statistics: []),
 *   that authoritative state is respected and returned as-is (NOT replaced by fallback).
 * - Fallback is triggered ONLY when the backend is unreachable (network error), returns a non-200
 *   HTTP status code, or delivers an invalid payload failing Zod validation.
 */
export async function getPublicHomepage(): Promise<PublicHomepageData> {
  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) {
    return STATIC_FALLBACK_HOMEPAGE;
  }

  const endpoint = `${backendOrigin}/api/public/homepage`;

  try {
    const res = await fetch(endpoint, {
      next: { revalidate: 60, tags: ["homepage"] },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(
        `[Homepage] API returned HTTP ${res.status} from ${endpoint}. Using static fallback.`
      );
      return STATIC_FALLBACK_HOMEPAGE;
    }

    const json = await res.json();
    const parsed = publicHomepageResponseSchema.safeParse(json);

    if (!parsed.success) {
      console.warn(
        "[Homepage] Payload validation failed. Using static fallback.",
        parsed.error.issues
      );
      return STATIC_FALLBACK_HOMEPAGE;
    }

    return parsed.data.data;
  } catch (error) {
    console.warn(
      `[Homepage] Failed to fetch homepage content from ${endpoint}. Using static fallback:`,
      error instanceof Error ? error.message : String(error)
    );
    return STATIC_FALLBACK_HOMEPAGE;
  }
}
