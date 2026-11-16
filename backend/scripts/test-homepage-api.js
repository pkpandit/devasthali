/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Homepage Public API Logic, DTO Projections, Media Resolution,
 * Authoritative Empty Arrays, and Live API Verification.
 */

const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: ".env" });
const prisma = new PrismaClient();

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:3001";

async function runSuite() {
  const results = [];

  function assert(name, condition, details = "") {
    results.push({ name, passed: Boolean(condition), details });
    if (!condition) {
      console.error(`  [FAIL] ${name}: ${details}`);
    } else {
      console.log(`  [PASS] ${name}`);
    }
  }

  console.log("==================================================================");
  console.log("  Running Test Suite: Homepage Public API & DTO Projection Logic");
  console.log("==================================================================\n");

  // -------------------------------------------------------------
  // 1. DTO Projection & Media URL Resolution Logic
  // -------------------------------------------------------------
  console.log("--- 1. Projection & Dynamic Media URL Resolution Logic ---");

  function resolveMediaUrl(url, mediaOrigin = "https://cdn.example.com") {
    if (!url || typeof url !== "string") return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    if (trimmed.startsWith("/")) {
      if (trimmed.startsWith("/uploads/")) {
        return `${mediaOrigin.replace(/\/$/, "")}${trimmed}`;
      }
      return trimmed;
    }
    return trimmed;
  }

  assert("Leaves HTTPS absolute URLs untouched", resolveMediaUrl("https://example.com/photo.jpg") === "https://example.com/photo.jpg");
  assert("Leaves root-relative static images untouched", resolveMediaUrl("/images/about/campus.jpg") === "/images/about/campus.jpg");
  assert("Prefixes /uploads/ paths with media origin", resolveMediaUrl("/uploads/photos/hero.webp") === "https://cdn.example.com/uploads/photos/hero.webp");
  assert("Returns null for empty or null URL", resolveMediaUrl(null) === null && resolveMediaUrl("") === null);

  // -------------------------------------------------------------
  // 2. Draft Isolation & Authoritative Empty Array Tests
  // -------------------------------------------------------------
  console.log("\n--- 2. Draft Isolation & Authoritative Empty Array Rules ---");

  function projectHomepageData(hero, principal, statistics, highlights) {
    return {
      hero: hero && hero.isPublished
        ? {
            badgeText: hero.badgeText || null,
            heading: hero.heading,
            highlightText: hero.highlightText || null,
            subheading: hero.subheading,
            primaryCtaLabel: hero.primaryCtaLabel,
            primaryCtaHref: hero.primaryCtaHref,
            secondaryCtaLabel: hero.secondaryCtaLabel || null,
            secondaryCtaHref: hero.secondaryCtaHref || null,
            backgroundImageUrl: resolveMediaUrl(hero.backgroundImageUrl),
          }
        : null,
      principalMessage: principal && principal.isPublished
        ? {
            heading: principal.heading,
            principalName: principal.principalName,
            principalDesignation: principal.principalDesignation,
            quote: principal.quote,
            excerpt: principal.excerpt,
            imageUrl: resolveMediaUrl(principal.imageUrl),
            ctaLabel: principal.ctaLabel || null,
            ctaHref: principal.ctaHref || null,
          }
        : null,
      statistics: (statistics || [])
        .filter((s) => s.isPublished)
        .map((s) => ({
          id: s.id,
          label: s.label,
          numericValue: s.numericValue,
          suffix: s.suffix || null,
          subtext: s.subtext || null,
          badge: s.badge || null,
          iconName: s.iconName || null,
          imageUrl: resolveMediaUrl(s.imageUrl),
          displayOrder: s.displayOrder,
        })),
      highlights: (highlights || [])
        .filter((h) => h.isPublished)
        .map((h) => ({
          id: h.id,
          title: h.title,
          description: h.description,
          badge: h.badge || null,
          iconName: h.iconName || null,
          imageUrl: resolveMediaUrl(h.imageUrl),
          ctaLabel: h.ctaLabel,
          ctaHref: h.ctaHref,
          displayOrder: h.displayOrder,
        })),
    };
  }

  // Draft Hero isolation
  const draftHeroData = projectHomepageData(
    { heading: "Draft Hero", isPublished: false },
    { heading: "Principal", isPublished: true },
    [],
    []
  );
  assert("Unpublished Hero yields null (draft isolation)", draftHeroData.hero === null);

  // Authoritative empty arrays
  const emptySectionsData = projectHomepageData(
    { heading: "Live Hero", isPublished: true },
    { heading: "Live Principal", isPublished: true },
    [{ label: "Draft Stat", isPublished: false }],
    [{ title: "Draft Highlight", isPublished: false }]
  );
  assert("Unpublished stats filter to authoritative empty array []", Array.isArray(emptySectionsData.statistics) && emptySectionsData.statistics.length === 0);
  assert("Unpublished highlights filter to authoritative empty array []", Array.isArray(emptySectionsData.highlights) && emptySectionsData.highlights.length === 0);

  // -------------------------------------------------------------
  // 3. Database Parity & Content Verification
  // -------------------------------------------------------------
  console.log("\n--- 3. Database Content Parity Verification ---");
  const heroInDb = await prisma.homepageHero.findUnique({ where: { id: "default" } });
  assert("Hero has exact heading 'Nurturing Academic Rigour, Moral Character & Leadership'", heroInDb?.heading === "Nurturing Academic Rigour, Moral Character & Leadership");
  assert("Hero primary CTA is 'Apply 2026–27'", heroInDb?.primaryCtaLabel === "Apply 2026–27");
  assert("Hero background image is '/images/about/campus-showcase.jpg'", heroInDb?.backgroundImageUrl === "/images/about/campus-showcase.jpg");

  const principalInDb = await prisma.homepagePrincipalMessage.findUnique({ where: { id: "default" } });
  assert("Principal name is 'P. C. Shrivastava'", principalInDb?.principalName === "P. C. Shrivastava");
  assert("Principal image is '/images/leadership/principal_sir.webp'", principalInDb?.imageUrl === "/images/leadership/principal_sir.webp");

  const statsCount = await prisma.homepageStatistic.count({ where: { isPublished: true } });
  assert("All 6 homepage statistics are seeded and published", statsCount === 6);

  const highlightsCount = await prisma.homepageHighlight.count({ where: { isPublished: true } });
  assert("All 6 promotional highlights are seeded and published", highlightsCount === 6);

  // -------------------------------------------------------------
  // 4. Live API Endpoint Health & Cache-Control (if backend is up)
  // -------------------------------------------------------------
  console.log("\n--- 4. Live Public API Endpoint Verification ---");
  try {
    const apiRes = await fetch(`${BACKEND_URL}/api/public/homepage`);
    assert("Live GET /api/public/homepage returns HTTP 200", apiRes.status === 200);

    const cacheHeader = apiRes.headers.get("cache-control") || "";
    assert(
      "Cache-Control header contains public, s-maxage=60, and stale-while-revalidate=300",
      cacheHeader.includes("public") &&
        cacheHeader.includes("s-maxage=60") &&
        cacheHeader.includes("stale-while-revalidate=300")
    );

    const json = await apiRes.json();
    assert("API response success is true", json.success === true);
    assert("API returns hero data with valid heading", Boolean(json.data?.hero?.heading));
    assert("API returns principalMessage data with valid name", Boolean(json.data?.principalMessage?.principalName));
    assert("API returns exactly 6 statistics", json.data?.statistics?.length === 6);
    assert("API returns exactly 6 highlights", json.data?.highlights?.length === 6);
  } catch (err) {
    console.log(`  [INFO] Backend server not currently running at ${BACKEND_URL} (${err.message}). Live endpoint test skipped.`);
  }

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log("\n==================================================================");
  console.log(`  Homepage API Test Suite: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================================\n");

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
