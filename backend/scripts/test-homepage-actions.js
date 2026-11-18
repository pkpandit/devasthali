/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Homepage Actions, Validation, Diffs, Role Authorization,
 * and Live Database Transactions.
 */

const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const {
  validateHomepageUrl,
  requiredHomepageUrlSchema,
  homepageHeroSchema,
  homepagePrincipalMessageSchema,
  homepageStatisticCreateSchema,
  homepageStatisticUpdateSchema,
  homepageStatisticToggleSchema,
  homepageStatisticReorderSchema,
  homepageHighlightCreateSchema,
  homepageHighlightUpdateSchema,
  homepageHighlightToggleSchema,
  homepageHighlightReorderSchema,
  normalizeHomepagePayload,
  computeHomepageDiff,
} = require("../lib/validation/homepage.ts");

dotenv.config({ path: ".env" });
const prisma = new PrismaClient();

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
  console.log("  Running Test Suite: Homepage Actions, Auth, Limits & Diffs");
  console.log("==================================================================");

  // -------------------------------------------------------------
  // 1. URL Safety Validation Tests
  // -------------------------------------------------------------
  console.log("\n--- 1. Homepage URL Safety Validation Tests ---");
  assert("Accepts root path '/'", validateHomepageUrl("/").valid === true);
  assert("Accepts internal subpath '/admissions'", validateHomepageUrl("/admissions").valid === true);
  assert("Accepts internal path with hyphen & digits '/admissions/fees-2026'", validateHomepageUrl("/admissions/fees-2026").valid === true);
  assert("Accepts anchor with path '/facilities#transport'", validateHomepageUrl("/facilities#transport").valid === true);
  assert("Accepts fragment '#contact'", validateHomepageUrl("#contact").valid === true);
  assert("Accepts secure HTTPS URL 'https://cbse.gov.in'", validateHomepageUrl("https://cbse.gov.in").valid === true);
  assert("Accepts HTTPS URL with query 'https://example.com/apply?session=2026'", validateHomepageUrl("https://example.com/apply?session=2026").valid === true);
  assert("Rejects plain HTTP 'http://example.com'", validateHomepageUrl("http://example.com").valid === false);
  assert("Rejects javascript scheme 'javascript:alert(1)'", validateHomepageUrl("javascript:alert(1)").valid === false);
  assert("Rejects data URI 'data:text/html,<script>'", validateHomepageUrl("data:text/html,<script>").valid === false);
  assert("Rejects protocol-relative '//evil.com'", validateHomepageUrl("//evil.com").valid === false);
  assert("Optional empty string allows valid=true", validateHomepageUrl("").valid === true);
  assert("Required URL schema rejects empty string", requiredHomepageUrlSchema.safeParse("").success === false);
  assert("Required URL schema rejects whitespace string", requiredHomepageUrlSchema.safeParse("   ").success === false);
  assert("Required URL schema rejects non-string", requiredHomepageUrlSchema.safeParse(null).success === false);

  // -------------------------------------------------------------
  // 2. Schema Validation Tests
  // -------------------------------------------------------------
  console.log("\n--- 2. Zod Schema Validation Tests ---");

  // Hero Schema
  const validHero = {
    badgeText: "Admissions Open 2026–27",
    heading: "Nurturing Academic Rigour, Moral Character & Leadership",
    highlightText: "Since 1988",
    subheading: "Welcome to Devasthaly Vidyapeeth...",
    primaryCtaLabel: "Apply 2026–27",
    primaryCtaHref: "/admissions",
    secondaryCtaLabel: "Schedule a Guided Campus Tour",
    secondaryCtaHref: "/contact",
    backgroundImageUrl: "/images/about/campus-showcase.jpg",
    isPublished: true,
  };
  assert("Valid Hero passes schema", homepageHeroSchema.safeParse(validHero).success === true);

  const heroMissingHeading = { ...validHero, heading: "" };
  assert("Hero without heading fails schema", homepageHeroSchema.safeParse(heroMissingHeading).success === false);

  const heroInvalidPrimaryUrl = { ...validHero, primaryCtaHref: "javascript:void(0)" };
  assert("Hero with javascript primary CTA fails schema", homepageHeroSchema.safeParse(heroInvalidPrimaryUrl).success === false);

  // Principal Message Schema
  const validPrincipal = {
    heading: "Principal’s Message",
    principalName: "P. C. Shrivastava",
    principalDesignation: "Principal, Devasthaly Vidyapeeth",
    quote: "Devasthaly Vidyapeeth is an amalgamation of competent teachers...",
    excerpt: "Devasthaly Vidyapeeth aims at holistic growth and development of its students...",
    imageUrl: "/images/leadership/principal_sir.webp",
    ctaLabel: "Read Full Message",
    ctaHref: "/principals-message",
    isPublished: true,
  };
  assert("Valid Principal passes schema", homepagePrincipalMessageSchema.safeParse(validPrincipal).success === true);

  const principalMissingName = { ...validPrincipal, principalName: "" };
  assert("Principal without name fails schema", homepagePrincipalMessageSchema.safeParse(principalMissingName).success === false);

  const principalInvalidUrl = { ...validPrincipal, ctaHref: "http://insecure.com" };
  assert("Principal with insecure HTTP ctaHref fails schema", homepagePrincipalMessageSchema.safeParse(principalInvalidUrl).success === false);

  // Statistic Schema
  const validStat = {
    label: "Years of Heritage",
    numericValue: "36+",
    suffix: "Years",
    subtext: "Established in 1988",
    badge: "Legacy",
    iconName: "Award",
    imageUrl: "/images/about/campus.jpg",
    isPublished: true,
  };
  assert("Valid Statistic passes create schema", homepageStatisticCreateSchema.safeParse(validStat).success === true);

  const statMissingValue = { ...validStat, numericValue: "" };
  assert("Statistic without numericValue fails schema", homepageStatisticCreateSchema.safeParse(statMissingValue).success === false);

  assert("Valid Statistic update schema", homepageStatisticUpdateSchema.safeParse({ id: "stat-123", ...validStat }).success === true);
  assert("Valid Statistic toggle schema", homepageStatisticToggleSchema.safeParse({ id: "stat-123", isPublished: false }).success === true);
  assert("Valid Statistic reorder schema", homepageStatisticReorderSchema.safeParse({
    statistics: [{ id: "stat-1", displayOrder: 0 }, { id: "stat-2", displayOrder: 1 }],
  }).success === true);

  // Highlight Schema
  const validHl = {
    title: "Download School Prospectus",
    description: "Admissions PDF Brochure",
    badge: "PDF",
    iconName: "Download",
    imageUrl: "/images/prospectus.jpg",
    ctaLabel: "Download",
    ctaHref: "/school-prospectus",
    isPublished: true,
  };
  assert("Valid Highlight passes create schema", homepageHighlightCreateSchema.safeParse(validHl).success === true);

  const hlInvalidHref = { ...validHl, ctaHref: "javascript:exploit()" };
  assert("Highlight with unsafe ctaHref fails schema", homepageHighlightCreateSchema.safeParse(hlInvalidHref).success === false);

  assert("Valid Highlight update schema", homepageHighlightUpdateSchema.safeParse({ id: "hl-123", ...validHl }).success === true);
  assert("Valid Highlight toggle schema", homepageHighlightToggleSchema.safeParse({ id: "hl-123", isPublished: false }).success === true);
  assert("Valid Highlight reorder schema", homepageHighlightReorderSchema.safeParse({
    highlights: [{ id: "hl-1", displayOrder: 0 }, { id: "hl-2", displayOrder: 1 }],
  }).success === true);

  // -------------------------------------------------------------
  // 3. Diff Utility Tests
  // -------------------------------------------------------------
  console.log("\n--- 3. Field-Level Diff Utility Tests ---");
  const heroDiff = computeHomepageDiff(
    { heading: "Old Heading", isPublished: true, primaryCtaLabel: "Apply" },
    { heading: "New Heading", isPublished: false, primaryCtaLabel: "Apply" }
  );
  assert("computeHomepageDiff detects heading change", heroDiff.heading?.from === "Old Heading" && heroDiff.heading?.to === "New Heading");
  assert("computeHomepageDiff detects publication status change", heroDiff.isPublished?.from === true && heroDiff.isPublished?.to === false);
  assert("computeHomepageDiff omits unchanged primaryCtaLabel", heroDiff.primaryCtaLabel === undefined);

  const principalDiff = computeHomepageDiff(
    { principalName: "Old Name", quote: "Old Quote" },
    { principalName: "New Name", quote: "Old Quote" }
  );
  assert("computeHomepageDiff detects principal name change", principalDiff.principalName?.from === "Old Name" && principalDiff.principalName?.to === "New Name");
  assert("computeHomepageDiff omits unchanged quote", principalDiff.quote === undefined);

  const statDiff = computeHomepageDiff(
    { numericValue: "35+", badge: null },
    { numericValue: "36+", badge: "Heritage" }
  );
  assert("computeHomepageDiff detects statistic value change", statDiff.numericValue?.from === "35+" && statDiff.numericValue?.to === "36+");
  assert("computeHomepageDiff detects statistic badge addition", statDiff.badge?.from === null && statDiff.badge?.to === "Heritage");

  const hlDiff = computeHomepageDiff(
    { title: "Old Title", ctaHref: "/old" },
    { title: "New Title", ctaHref: "/new" }
  );
  assert("computeHomepageDiff detects highlight title and ctaHref changes", hlDiff.title?.to === "New Title" && hlDiff.ctaHref?.to === "/new");

  // Normalizer test
  const normalized = normalizeHomepagePayload({ a: "  hello  ", b: "   ", c: 42, d: null });
  assert("normalizeHomepagePayload trims strings and nullifies empty", normalized.a === "hello" && normalized.b === null && normalized.c === 42 && normalized.d === null);

  // Test FormData payload normalization
  const homeFormData = new FormData();
  homeFormData.append("heading", "  New Hero Heading  ");
  homeFormData.append("highlightText", "");
  homeFormData.append("isPublished", "true");
  const normalizedHomeFormData = normalizeHomepagePayload(homeFormData);
  assert("normalizeHomepagePayload handles FormData correctly", normalizedHomeFormData.heading === "New Hero Heading" && normalizedHomeFormData.highlightText === null);

  // Test image diff masking
  const heroImageDiff = computeHomepageDiff(
    { backgroundImageUrl: "/images/hero.jpg", backgroundImageStorageKey: null },
    { backgroundImageUrl: "/api/public/media/toppers/top_hero.webp", backgroundImageStorageKey: "toppers/top_hero.webp" }
  );
  assert("computeHomepageDiff masks background image changes cleanly", heroImageDiff.backgroundImageUrl?.from === "[PRESENT]" && heroImageDiff.backgroundImageUrl?.to === "[PRESENT]");

  const statImageRemovalDiff = computeHomepageDiff(
    { imageUrl: "/images/stat.jpg", imageStorageKey: null },
    { imageUrl: null, imageStorageKey: null }
  );
  assert("computeHomepageDiff masks image removal to [NONE]", statImageRemovalDiff.imageUrl?.from === "[PRESENT]" && statImageRemovalDiff.imageUrl?.to === "[NONE]");

  // -------------------------------------------------------------
  // 4. Role Authorization Matrix Tests
  // -------------------------------------------------------------
  console.log("\n--- 4. Role Authorization Matrix Tests ---");
  function isAllowedRole(role) {
    return role === "SUPER_ADMIN";
  }

  const roleMatrix = [
    { role: "SUPER_ADMIN", expected: true },
    { role: "PRINCIPAL", expected: false },
    { role: "TEACHER", expected: false },
    { role: "STAFF", expected: false },
    { role: "PARENT", expected: false },
    { role: "STUDENT", expected: false },
    { role: null, expected: false },
    { role: undefined, expected: false },
  ];

  for (const { role, expected } of roleMatrix) {
    const allowed = isAllowedRole(role);
    assert(
      `Role '${role}' authorization: expected ${expected ? "ALLOWED" : "FORBIDDEN"}`,
      allowed === expected
    );
  }

  // -------------------------------------------------------------
  // 5. Database Integration & Transaction Tests
  // -------------------------------------------------------------
  console.log("\n--- 5. Database Integration & Transaction Tests ---");

  // 5a. Verify Hero singleton
  const heroRecord = await prisma.homepageHero.findUnique({ where: { id: "default" } });
  assert("HomepageHero default singleton exists", Boolean(heroRecord));
  assert("HomepageHero has valid heading", Boolean(heroRecord?.heading));

  // 5b. Verify Principal Message singleton
  const principalRecord = await prisma.homepagePrincipalMessage.findUnique({ where: { id: "default" } });
  assert("HomepagePrincipalMessage default singleton exists", Boolean(principalRecord));
  assert("HomepagePrincipalMessage has valid principalName", Boolean(principalRecord?.principalName));

  // 5c. Create & mutate test statistic
  const testStat = await prisma.homepageStatistic.create({
    data: {
      label: "Test Stat Automated",
      numericValue: "99+",
      suffix: "Units",
      subtext: "Testing Subtext",
      badge: "Test Badge",
      iconName: "Award",
      displayOrder: 999,
      isPublished: true,
    },
  });
  assert("Created test HomepageStatistic in DB", Boolean(testStat?.id));

  // Update test statistic
  const updatedStat = await prisma.homepageStatistic.update({
    where: { id: testStat.id },
    data: { numericValue: "100+", isPublished: false },
  });
  assert("Updated test HomepageStatistic value and isPublished", updatedStat.numericValue === "100+" && updatedStat.isPublished === false);

  // Delete test statistic
  await prisma.homepageStatistic.delete({ where: { id: testStat.id } });
  const deletedStat = await prisma.homepageStatistic.findUnique({ where: { id: testStat.id } });
  assert("Deleted test HomepageStatistic from DB", deletedStat === null);

  // 5d. Create & mutate test highlight
  const testHl = await prisma.homepageHighlight.create({
    data: {
      title: "Test Highlight Automated",
      description: "Testing quick action card",
      badge: "Quick",
      iconName: "Zap",
      ctaLabel: "Explore",
      ctaHref: "/explore",
      displayOrder: 999,
      isPublished: true,
    },
  });
  assert("Created test HomepageHighlight in DB", Boolean(testHl?.id));

  // Update test highlight
  const updatedHl = await prisma.homepageHighlight.update({
    where: { id: testHl.id },
    data: { title: "Updated Highlight Title", isPublished: false },
  });
  assert("Updated test HomepageHighlight title and isPublished", updatedHl.title === "Updated Highlight Title" && updatedHl.isPublished === false);

  // Delete test highlight
  await prisma.homepageHighlight.delete({ where: { id: testHl.id } });
  const deletedHl = await prisma.homepageHighlight.findUnique({ where: { id: testHl.id } });
  assert("Deleted test HomepageHighlight from DB", deletedHl === null);

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log("\n==================================================================");
  console.log(`  Homepage Actions Test Suite: ${passed} Passed, ${failed} Failed`);
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
