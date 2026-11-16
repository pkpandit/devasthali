/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Frontend Homepage Integration, Schema Conformance,
 * Authoritative Empty Sections, and Static Fallback Resilience.
 */

const { z } = require("zod");

console.log("===============================================================");
console.log("  Running Frontend Homepage Integration & Fallback Tests");
console.log("===============================================================\n");

// Replicate schemas from frontend/lib/api/homepage.ts
const publicHomepageHeroSchema = z.object({
  badgeText: z.string().nullable().optional(),
  heading: z.string().min(1),
  highlightText: z.string().nullable().optional(),
  subheading: z.string().min(1),
  primaryCtaLabel: z.string().min(1),
  primaryCtaHref: z.string().min(1),
  secondaryCtaLabel: z.string().nullable().optional(),
  secondaryCtaHref: z.string().nullable().optional(),
  backgroundImageUrl: z.string().nullable().optional(),
});

const publicHomepagePrincipalSchema = z.object({
  heading: z.string().min(1),
  principalName: z.string().min(1),
  principalDesignation: z.string().min(1),
  quote: z.string().min(1),
  excerpt: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
  ctaLabel: z.string().nullable().optional(),
  ctaHref: z.string().nullable().optional(),
});

const publicHomepageStatisticSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  numericValue: z.string().min(1),
  suffix: z.string().nullable().optional(),
  subtext: z.string().nullable().optional(),
  badge: z.string().nullable().optional(),
  iconName: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  displayOrder: z.number().int(),
});

const publicHomepageHighlightSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  badge: z.string().nullable().optional(),
  iconName: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  ctaLabel: z.string().min(1),
  ctaHref: z.string().min(1),
  displayOrder: z.number().int(),
});

const publicHomepageResponseSchema = z.object({
  hero: publicHomepageHeroSchema.nullable().optional(),
  principalMessage: publicHomepagePrincipalSchema.nullable().optional(),
  statistics: z.array(publicHomepageStatisticSchema),
  highlights: z.array(publicHomepageHighlightSchema),
});

const results = [];
function check(name, condition, details = "") {
  results.push({ name, passed: Boolean(condition), details });
  if (!condition) {
    console.error(`  [FAIL] ${name}: ${details}`);
  } else {
    console.log(`  [PASS] ${name}`);
  }
}

// -------------------------------------------------------------
// 1. Zod Schema Conformance Tests
// -------------------------------------------------------------
console.log("--- 1. Homepage Zod Schema Validation ---");

const samplePayload = {
  hero: {
    badgeText: "Admissions Open 2026–27",
    heading: "Nurturing Academic Rigour, Moral Character & Leadership",
    highlightText: "Since 1988",
    subheading: "Welcome to Devasthaly Vidyapeeth...",
    primaryCtaLabel: "Apply 2026–27",
    primaryCtaHref: "/admissions",
    secondaryCtaLabel: "Campus Tour",
    secondaryCtaHref: "/contact",
    backgroundImageUrl: "/images/about/campus.jpg",
  },
  principalMessage: {
    heading: "Principal’s Message",
    principalName: "P. C. Shrivastava",
    principalDesignation: "Principal, Devasthaly Vidyapeeth",
    quote: "A quote here",
    excerpt: "An excerpt here",
    imageUrl: "/images/leadership/principal_sir.webp",
    ctaLabel: "Read More",
    ctaHref: "/principals-message",
  },
  statistics: [
    {
      id: "stat-1",
      label: "Years of Heritage",
      numericValue: "36+",
      suffix: null,
      subtext: "Since 1988",
      badge: "Legacy",
      iconName: "Award",
      imageUrl: null,
      displayOrder: 0,
    },
  ],
  highlights: [
    {
      id: "hl-1",
      title: "Download School Prospectus",
      description: "Admissions PDF Brochure",
      badge: "PDF",
      iconName: "Download",
      imageUrl: null,
      ctaLabel: "Download",
      ctaHref: "/school-prospectus",
      displayOrder: 0,
    },
  ],
};

check("Sample valid response passes Zod schema", publicHomepageResponseSchema.safeParse(samplePayload).success === true);

// -------------------------------------------------------------
// 2. Authoritative Empty Section vs Fallback Rule
// -------------------------------------------------------------
console.log("\n--- 2. Authoritative Empty Array Rule ---");

const emptySectionsPayload = {
  hero: samplePayload.hero,
  principalMessage: samplePayload.principalMessage,
  statistics: [],
  highlights: [],
};

const parsedEmpty = publicHomepageResponseSchema.safeParse(emptySectionsPayload);
check("Empty statistics and highlights pass validation", parsedEmpty.success === true);
check("Parsed statistics preserves empty array []", Array.isArray(parsedEmpty.data?.statistics) && parsedEmpty.data?.statistics.length === 0);
check("Parsed highlights preserves empty array []", Array.isArray(parsedEmpty.data?.highlights) && parsedEmpty.data?.highlights.length === 0);

// Ensure that an empty array from API does NOT trigger fallback
function resolveHomepageData(apiResponse, fallback) {
  if (!apiResponse || !apiResponse.success) {
    return fallback;
  }
  const parsed = publicHomepageResponseSchema.safeParse(apiResponse.data);
  if (!parsed.success) {
    return fallback;
  }
  return {
    hero: parsed.data.hero ?? fallback.hero,
    principalMessage: parsed.data.principalMessage ?? fallback.principalMessage,
    statistics: parsed.data.statistics, // Authoritative: preserves []
    highlights: parsed.data.highlights, // Authoritative: preserves []
  };
}

const fallbackDummy = {
  hero: samplePayload.hero,
  principalMessage: samplePayload.principalMessage,
  statistics: samplePayload.statistics,
  highlights: samplePayload.highlights,
};

const resolvedEmpty = resolveHomepageData({ success: true, data: emptySectionsPayload }, fallbackDummy);
check("resolveHomepageData keeps empty statistics [] when API returns empty", resolvedEmpty.statistics.length === 0);
check("resolveHomepageData keeps empty highlights [] when API returns empty", resolvedEmpty.highlights.length === 0);

const resolvedFailed = resolveHomepageData({ success: false }, fallbackDummy);
check("resolveHomepageData uses fallback statistics on API failure", resolvedFailed.statistics.length === 1);
check("resolveHomepageData uses fallback highlights on API failure", resolvedFailed.highlights.length === 1);

// -------------------------------------------------------------
// 3. Exact Fallback Content Verification
// -------------------------------------------------------------
console.log("\n--- 3. Static Fallback Content Integrity ---");
const {
  STATIC_FALLBACK_HERO,
  STATIC_FALLBACK_PRINCIPAL,
  STATIC_FALLBACK_STATISTICS,
  STATIC_FALLBACK_HIGHLIGHTS,
} = require("../lib/api/homepage.ts");

check("Fallback Hero heading matches exact live content", STATIC_FALLBACK_HERO.heading === "Nurturing Academic Rigour, Moral Character & Leadership");
check("Fallback Hero primary CTA is '/admissions'", STATIC_FALLBACK_HERO.primaryCta.href === "/admissions");
check("Fallback Principal name is 'P. C. Shrivastava'", STATIC_FALLBACK_PRINCIPAL.principalName === "P. C. Shrivastava");
check("Fallback Statistics contains exactly 6 metrics", STATIC_FALLBACK_STATISTICS.length === 6);
check("Fallback Statistics contains 36+ heritage metric", STATIC_FALLBACK_STATISTICS.some((s) => s.numericValue === "36+"));
check("Fallback Statistics contains 100% board pass rate", STATIC_FALLBACK_STATISTICS.some((s) => s.numericValue === "100%"));
check("Fallback Highlights contains exactly 6 quick actions", STATIC_FALLBACK_HIGHLIGHTS.length === 6);
check("Fallback Highlights includes '/school-prospectus'", STATIC_FALLBACK_HIGHLIGHTS.some((h) => h.ctaHref === "/school-prospectus"));
check("Fallback Highlights includes '/mandatory-public-disclosure'", STATIC_FALLBACK_HIGHLIGHTS.some((h) => h.ctaHref === "/mandatory-public-disclosure"));

// Summary
const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;
console.log("\n===============================================================");
console.log(`  Frontend Homepage Integration Tests: ${passed} Passed, ${failed} Failed`);
console.log("===============================================================\n");

if (failed > 0) {
  process.exit(1);
}
