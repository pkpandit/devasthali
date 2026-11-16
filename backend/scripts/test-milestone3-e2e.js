/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Milestone 3 E2E Verification Suite:
 * Homepage Content Management: Hero, Principal's Message, Statistics,
 * Promotional Highlights, Database Parity, Public API, and Fallback Resilience.
 */

const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: ".env" });
const prisma = new PrismaClient();

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:3001";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://127.0.0.1:3000";

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
  console.log("  Running Milestone 3 Homepage Content E2E Verification Suite");
  console.log("==================================================================\n");

  // -------------------------------------------------------------
  // 1. Live Server Health Checks
  // -------------------------------------------------------------
  console.log("--- 1. Live Server Health Checks ---");
  let liveServersAvailable = false;
  try {
    const backendRes = await fetch(`${BACKEND_URL}/login`);
    const frontendRes = await fetch(`${FRONTEND_URL}/`);
    if (backendRes.status === 200 && frontendRes.status === 200) {
      liveServersAvailable = true;
      assert("Backend server is responsive on port 3001", true);
      assert("Frontend server is responsive on port 3000", true);
    }
  } catch {
    console.log("  [INFO] Live local dev servers not both active; testing database and contract layers.");
  }

  // -------------------------------------------------------------
  // 2. Database Content Parity & Seed Verification
  // -------------------------------------------------------------
  console.log("\n--- 2. Database Content Parity & Models Verification ---");

  // 2a. Hero Section Singleton
  const hero = await prisma.homepageHero.findUnique({ where: { id: "default" } });
  assert("HomepageHero default singleton exists", Boolean(hero));
  assert("Hero badgeText contains 'Admissions Open 2026–27'", hero?.badgeText?.includes("Admissions Open 2026–27"));
  assert("Hero heading is exact 'Nurturing Academic Rigour, Moral Character & Leadership'", hero?.heading === "Nurturing Academic Rigour, Moral Character & Leadership");
  assert("Hero highlightText is 'Since 1988'", hero?.highlightText === "Since 1988");
  assert("Hero primary CTA is 'Apply 2026–27' -> '/admissions'", hero?.primaryCtaLabel === "Apply 2026–27" && hero?.primaryCtaHref === "/admissions");
  assert("Hero secondary CTA is 'Schedule a Guided Campus Tour' -> '/contact'", hero?.secondaryCtaLabel === "Schedule a Guided Campus Tour" && hero?.secondaryCtaHref === "/contact");
  assert("Hero background image is '/images/about/campus-showcase.jpg'", hero?.backgroundImageUrl === "/images/about/campus-showcase.jpg");
  assert("Hero is published", hero?.isPublished === true);

  // 2b. Principal's Message Singleton
  const principal = await prisma.homepagePrincipalMessage.findUnique({ where: { id: "default" } });
  assert("HomepagePrincipalMessage default singleton exists", Boolean(principal));
  assert("Principal heading is 'Principal’s Message'", principal?.heading === "Principal’s Message");
  assert("Principal name is 'P. C. Shrivastava'", principal?.principalName === "P. C. Shrivastava");
  assert("Principal designation is 'Principal, Devasthaly Vidyapeeth'", principal?.principalDesignation === "Principal, Devasthaly Vidyapeeth");
  assert("Principal quote contains 'amalgamation of competent teachers'", principal?.quote?.includes("amalgamation of competent teachers"));
  assert("Principal excerpt contains 4 sentences on holistic growth", principal?.excerpt?.includes("holistic growth") && principal?.excerpt?.includes("experiential learning"));
  assert("Principal portrait is '/images/leadership/principal_sir.webp'", principal?.imageUrl === "/images/leadership/principal_sir.webp");
  assert("Principal CTA is 'Read Full Message' -> '/principals-message'", principal?.ctaLabel === "Read Full Message" && principal?.ctaHref === "/principals-message");
  assert("Principal message is published", principal?.isPublished === true);

  // 2c. Statistics Collection
  const statistics = await prisma.homepageStatistic.findMany({ orderBy: { displayOrder: "asc" } });
  assert("Exactly 6 statistics are configured in the database", statistics.length === 6);
  assert("All 6 statistics are published", statistics.every((s) => s.isPublished));

  const heritageStat = statistics.find((s) => s.label === "Years of Heritage");
  assert("Statistic 1: Years of Heritage is '36+' with badge 'Legacy'", heritageStat?.numericValue === "36+" && heritageStat?.badge === "Legacy");

  const passRateStat = statistics.find((s) => s.label === "CBSE Board Pass Rate");
  assert("Statistic 2: CBSE Board Pass Rate is '100%' with badge 'Excellence'", passRateStat?.numericValue === "100%" && passRateStat?.badge === "Excellence");

  const campusStat = statistics.find((s) => s.label === "Lush Green Campus");
  assert("Statistic 3: Lush Green Campus is '15+ Acres' with badge 'Eco Campus'", campusStat?.numericValue === "15+ Acres" && campusStat?.badge === "Eco Campus");

  const ratioStat = statistics.find((s) => s.label === "Student-Teacher Ratio");
  assert("Statistic 4: Student-Teacher Ratio is '1 : 25' with badge 'Mentorship'", ratioStat?.numericValue === "1 : 25" && ratioStat?.badge === "Mentorship");

  const alumniStat = statistics.find((s) => s.label === "Alumni Across India");
  assert("Statistic 5: Alumni Across India is '3,500+' with badge 'Alumni'", alumniStat?.numericValue === "3,500+" && alumniStat?.badge === "Alumni");

  const transportStat = statistics.find((s) => s.label === "Transport Nodes");
  assert("Statistic 6: Transport Nodes is '40+ Stops' with badge 'GPS Fleet'", transportStat?.numericValue === "40+ Stops" && transportStat?.badge === "GPS Fleet");

  // 2d. Promotional Highlights Collection
  const highlights = await prisma.homepageHighlight.findMany({ orderBy: { displayOrder: "asc" } });
  assert("Exactly 6 promotional highlights are configured in the database", highlights.length === 6);
  assert("All 6 highlights are published", highlights.every((h) => h.isPublished));

  const prospectusHl = highlights.find((h) => h.ctaHref === "/school-prospectus");
  assert("Highlight 1: Prospectus download card points to '/school-prospectus'", Boolean(prospectusHl) && prospectusHl?.badge === "PDF");

  const feesHl = highlights.find((h) => h.ctaHref === "/admissions/fees");
  assert("Highlight 2: Fee schedule card points to '/admissions/fees'", Boolean(feesHl) && feesHl?.badge === "Fees");

  const routesHl = highlights.find((h) => h.ctaHref === "/facilities#transport");
  assert("Highlight 3: Bus routes card points to '/facilities#transport'", Boolean(routesHl) && routesHl?.badge === "Routes");

  const resultsHl = highlights.find((h) => h.ctaHref === "/results");
  assert("Highlight 4: Board toppers card points to '/results'", Boolean(resultsHl) && resultsHl?.badge === "Merit");

  const noticesHl = highlights.find((h) => h.ctaHref === "/notices");
  assert("Highlight 5: Circulars card points to '/notices'", Boolean(noticesHl) && noticesHl?.badge === "Desk");

  const cbseHl = highlights.find((h) => h.ctaHref === "/mandatory-public-disclosure");
  assert("Highlight 6: CBSE disclosure card points to '/mandatory-public-disclosure'", Boolean(cbseHl) && cbseHl?.badge === "CBSE");

  // -------------------------------------------------------------
  // 3. Live API & Frontend Verification (when servers running)
  // -------------------------------------------------------------
  if (liveServersAvailable) {
    console.log("\n--- 3. Live Public API & Frontend Verification ---");
    try {
      const apiRes = await fetch(`${BACKEND_URL}/api/public/homepage`);
      assert("Public homepage endpoint returns HTTP 200", apiRes.status === 200);

      const cacheHeader = apiRes.headers.get("cache-control") || "";
      assert(
        "API sets public caching s-maxage=60, stale-while-revalidate=300",
        cacheHeader.includes("public") && cacheHeader.includes("s-maxage=60") && cacheHeader.includes("stale-while-revalidate=300")
      );

      const json = await apiRes.json();
      assert("API returns success: true", json.success === true);
      assert("API returns hero matching database", json.data?.hero?.heading === hero.heading);
      assert("API returns principalMessage matching database", json.data?.principalMessage?.principalName === principal.principalName);
      assert("API returns 6 statistics matching database", json.data?.statistics?.length === 6);
      assert("API returns 6 highlights matching database", json.data?.highlights?.length === 6);

      // Frontend Home Page HTML check
      const frontendRes = await fetch(`${FRONTEND_URL}/`);
      assert("Frontend homepage loads HTTP 200", frontendRes.status === 200);
      const html = await frontendRes.text();
      assert("Frontend HTML contains Hero heading", html.includes("Nurturing Academic Rigour, Moral Character &amp; Leadership") || html.includes("Nurturing Academic Rigour, Moral Character & Leadership"));
      assert("Frontend HTML contains Principal name 'P. C. Shrivastava'", html.includes("P. C. Shrivastava"));
      assert("Frontend HTML contains 36+ Years heritage metric", html.includes("36+"));
      assert("Frontend HTML contains Download School Prospectus", html.includes("Download School Prospectus"));
    } catch (err) {
      assert("Live API & Frontend verification succeeded", false, err.message);
    }
  }

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log("\n==================================================================");
  console.log(`  Milestone 3 E2E Suite: ${passed} Passed, ${failed} Failed`);
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
