/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: About & Leadership Actions, Validation, Diffs, Role Authorization,
 * and Live Database Transactions.
 */

const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const {
  validateAboutLeadershipUrl,
  requiredAboutUrlSchema,
  aboutPageSettingSchema,
  aboutCredentialCreateSchema,
  aboutCredentialUpdateSchema,
  aboutCredentialToggleSchema,
  aboutCredentialReorderSchema,
  aboutNarrativeSectionCreateSchema,
  aboutNarrativeSectionUpdateSchema,
  aboutNarrativeSectionToggleSchema,
  aboutNarrativeSectionReorderSchema,
  visionMissionSettingSchema,
  institutionalCoreValueCreateSchema,
  institutionalCoreValueUpdateSchema,
  institutionalCoreValueToggleSchema,
  institutionalCoreValueReorderSchema,
  leadershipMemberUpdateSchema,
  leadershipMemberToggleSchema,
  leadershipMemberReorderSchema,
  leadershipSlugs,
  normalizeAboutPayload,
  computeAboutLeadershipDiff,
} = require("../lib/validation/about-leadership.ts");

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
  console.log("  Running Test Suite: About & Leadership Actions, Validation & Diffs");
  console.log("==================================================================");

  // -------------------------------------------------------------
  // 1. URL Safety Validation Tests
  // -------------------------------------------------------------
  console.log("\n--- 1. URL Safety Validation Tests ---");
  assert("Accepts root path '/'", validateAboutLeadershipUrl("/").valid === true);
  assert("Accepts internal subpath '/academics'", validateAboutLeadershipUrl("/academics").valid === true);
  assert("Accepts anchor with path '/facilities#transport'", validateAboutLeadershipUrl("/facilities#transport").valid === true);
  assert("Accepts fragment '#contact'", validateAboutLeadershipUrl("#contact").valid === true);
  assert("Accepts secure HTTPS URL 'https://cbse.gov.in'", validateAboutLeadershipUrl("https://cbse.gov.in").valid === true);
  assert("Rejects plain HTTP 'http://example.com'", validateAboutLeadershipUrl("http://example.com").valid === false);
  assert("Rejects javascript scheme 'javascript:alert(1)'", validateAboutLeadershipUrl("javascript:alert(1)").valid === false);
  assert("Rejects data URI 'data:text/html,<script>'", validateAboutLeadershipUrl("data:text/html,<script>").valid === false);
  assert("Rejects protocol-relative '//evil.com'", validateAboutLeadershipUrl("//evil.com").valid === false);
  assert("Optional empty string allows valid=true", validateAboutLeadershipUrl("").valid === true);
  assert("Required URL schema rejects empty string", requiredAboutUrlSchema.safeParse("").success === false);

  // -------------------------------------------------------------
  // 2. Schema Validation Tests
  // -------------------------------------------------------------
  console.log("\n--- 2. Zod Schema Validation Tests ---");

  // AboutPageSetting Schema
  assert(
    "AboutPageSetting valid payload",
    aboutPageSettingSchema.safeParse({
      breadcrumb: "Home / About School",
      heading: "About School",
      subheading: "Imparting comprehensive modern education since 1988.",
      showcaseImageUrl: "/images/gallery/image-1-1.webp",
      showcaseImageAlt: "Devasthaly Campus",
      showcaseBadge: "Estd. 1988",
      isPublished: true,
    }).success === true
  );

  assert(
    "AboutPageSetting rejects empty heading",
    aboutPageSettingSchema.safeParse({
      breadcrumb: "Home / About School",
      heading: "",
      subheading: "Valid subheading",
      isPublished: true,
    }).success === false
  );

  // AboutCredential Schemas
  assert(
    "AboutCredential valid create payload",
    aboutCredentialCreateSchema.safeParse({
      category: "Affiliation",
      title: "CBSE No. 2133848",
      subtext: "School Code: 71922",
      iconName: "ShieldCheck",
      displayOrder: 0,
      isPublished: true,
    }).success === true
  );

  assert(
    "AboutCredential valid update payload",
    aboutCredentialUpdateSchema.safeParse({
      id: "cred-1",
      category: "Affiliation",
      title: "CBSE No. 2133848",
      subtext: "School Code: 71922",
      displayOrder: 0,
      isPublished: true,
    }).success === true
  );

  assert(
    "AboutCredential valid toggle payload",
    aboutCredentialToggleSchema.safeParse({
      id: "cred-1",
      isPublished: false,
    }).success === true
  );

  assert(
    "AboutCredential valid reorder payload",
    aboutCredentialReorderSchema.safeParse({
      credentials: [{ id: "cred-1", displayOrder: 0 }],
    }).success === true
  );

  // AboutNarrativeSection Schemas
  assert(
    "AboutNarrativeSection valid create payload",
    aboutNarrativeSectionCreateSchema.safeParse({
      heading: "Founding Legacy",
      body: "Devasthaly Vidyapeeth was founded on the 2nd October 1988...",
      displayOrder: 0,
      isPublished: true,
    }).success === true
  );

  assert(
    "AboutNarrativeSection valid update payload",
    aboutNarrativeSectionUpdateSchema.safeParse({
      id: "narr-1",
      body: "Updated narrative body text...",
      displayOrder: 0,
      isPublished: true,
    }).success === true
  );

  assert(
    "AboutNarrativeSection valid toggle payload",
    aboutNarrativeSectionToggleSchema.safeParse({
      id: "narr-1",
      isPublished: true,
    }).success === true
  );

  assert(
    "AboutNarrativeSection valid reorder payload",
    aboutNarrativeSectionReorderSchema.safeParse({
      sections: [{ id: "narr-1", displayOrder: 0 }],
    }).success === true
  );

  // VisionMissionSetting Schema
  assert(
    "VisionMissionSetting valid payload",
    visionMissionSettingSchema.safeParse({
      breadcrumb: "About School / Vision & Mission",
      heading: "Vision and Mission",
      subheading: "Guiding educational philosophy...",
      visionTitle: "Our Vision",
      visionBody: "To meet a long-felt need...",
      visionIcon: "Compass",
      missionTitle: "Our Mission",
      missionBody: "The school aims at all round development...",
      missionIcon: "Target",
      isPublished: true,
    }).success === true
  );

  // InstitutionalCoreValue Schemas
  assert(
    "InstitutionalCoreValue valid create payload",
    institutionalCoreValueCreateSchema.safeParse({
      title: "Holistic Development",
      description: "Nurturing intellectual and moral growth.",
      iconName: "Compass",
      displayOrder: 0,
      isPublished: true,
    }).success === true
  );

  assert(
    "InstitutionalCoreValue valid update payload",
    institutionalCoreValueUpdateSchema.safeParse({
      id: "cv-1",
      title: "Holistic Development",
      description: "Updated description",
      displayOrder: 0,
      isPublished: true,
    }).success === true
  );

  assert(
    "InstitutionalCoreValue valid toggle payload",
    institutionalCoreValueToggleSchema.safeParse({
      id: "cv-1",
      isPublished: false,
    }).success === true
  );

  assert(
    "InstitutionalCoreValue valid reorder payload",
    institutionalCoreValueReorderSchema.safeParse({
      values: [{ id: "cv-1", displayOrder: 0 }],
    }).success === true
  );

  // LeadershipMember Schemas
  assert(
    "LeadershipMember valid update payload",
    leadershipMemberUpdateSchema.safeParse({
      id: "cm1234567890",
      role: "FOUNDER",
      pageTitle: "Founder’s Message",
      breadcrumb: "About School / Leadership",
      badgeText: "Founder",
      name: "Shri Chandra Shekhar",
      designation: "Founder of Devasthaly Vidyapeeth",
      termOrAffiliation: "8th Prime Minister of India (1990–1991)",
      location: "Devasthaly Vidyapeeth, Chilkahar, Ballia (U.P.)",
      shortIntro: "Shri Chandra Shekhar — Founder of Devasthaly Vidyapeeth.",
      quote: "Devasthaly Vidyapeeth was established under the vision of our founder...",
      messageBody: "Shri Chandra Shekhar was born on April 17, 1927...",
      imageUrl: "/images/leadership/chadrashekherji.webp",
      imageAlt: "Shri Chandra Shekhar",
      isPublished: true,
    }).success === true
  );

  assert(
    "LeadershipMember valid toggle payload",
    leadershipMemberToggleSchema.safeParse({
      id: "cm1234567890",
      isPublished: false,
    }).success === true
  );

  assert(
    "LeadershipMember valid reorder payload",
    leadershipMemberReorderSchema.safeParse({
      members: [{ id: "cm1234567890", displayOrder: 0 }],
    }).success === true
  );

  // Normalizer test
  const normalized = normalizeAboutPayload({ heading: "  Trimmed Heading  ", emptyVal: "   ", num: 10 });
  assert("Normalizer trims string values", normalized.heading === "Trimmed Heading");
  assert("Normalizer converts empty string to null", normalized.emptyVal === null);
  assert("Normalizer preserves numbers", normalized.num === 10);

  // Fixed Slugs Check
  assert("Fixed slug for FOUNDER", leadershipSlugs.FOUNDER === "founders-message");
  assert("Fixed slug for PATRON", leadershipSlugs.PATRON === "patrons-message");
  assert("Fixed slug for PRESIDENT", leadershipSlugs.PRESIDENT === "presidents-message");
  assert("Fixed slug for MANAGER", leadershipSlugs.MANAGER === "managers-message");
  assert("Fixed slug for PRINCIPAL", leadershipSlugs.PRINCIPAL === "principals-message");

  // -------------------------------------------------------------
  // 3. Diff Utility Tests
  // -------------------------------------------------------------
  console.log("\n--- 3. Diff Utility Tests ---");
  const diff = computeAboutLeadershipDiff(
    { heading: "Old Heading", isPublished: true, count: 5 },
    { heading: "New Heading", isPublished: false, count: 5 }
  );
  assert("Diff detects modified heading", diff.heading.from === "Old Heading" && diff.heading.to === "New Heading");
  assert("Diff detects modified isPublished", diff.isPublished.from === true && diff.isPublished.to === false);
  assert("Diff ignores identical count", diff.count === undefined);

  // -------------------------------------------------------------
  // 4. Live Database Tests
  // -------------------------------------------------------------
  console.log("\n--- 4. Live Database Tests ---");

  // Verify seed records exist
  const aboutSetting = await prisma.aboutPageSetting.findUnique({ where: { id: "default" } });
  assert("AboutPageSetting default singleton exists in DB", Boolean(aboutSetting));

  const vmSetting = await prisma.visionMissionSetting.findUnique({ where: { id: "default" } });
  assert("VisionMissionSetting default singleton exists in DB", Boolean(vmSetting));

  const credentialsCount = await prisma.aboutCredential.count();
  assert("AboutCredential records exist in DB", credentialsCount >= 4, `Found: ${credentialsCount}`);

  const narrativesCount = await prisma.aboutNarrativeSection.count();
  assert("AboutNarrativeSection records exist in DB", narrativesCount >= 3, `Found: ${narrativesCount}`);

  const leadershipCount = await prisma.leadershipMember.count();
  assert("LeadershipMember has exactly 5 roles in DB", leadershipCount === 5, `Found: ${leadershipCount}`);

  // Test temporary CRUD for Credential
  const testCred = await prisma.aboutCredential.create({
    data: {
      category: "Test Category",
      title: "Test Credential Title",
      subtext: "Test Subtext",
      iconName: "Award",
      displayOrder: 99,
      isPublished: false,
    },
  });
  assert("Created test credential", Boolean(testCred.id));

  const updatedCred = await prisma.aboutCredential.update({
    where: { id: testCred.id },
    data: { title: "Updated Test Title" },
  });
  assert("Updated test credential", updatedCred.title === "Updated Test Title");

  await prisma.aboutCredential.delete({ where: { id: testCred.id } });
  const deletedCred = await prisma.aboutCredential.findUnique({ where: { id: testCred.id } });
  assert("Deleted test credential successfully", deletedCred === null);

  // Summary
  console.log("\n==================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`  Tests Passed: ${passed} / ${total}`);
  if (failed > 0) {
    console.error(`  Tests Failed: ${failed}`);
    process.exit(1);
  } else {
    console.log("  ALL ABOUT & LEADERSHIP ACTION TESTS PASSED!");
  }
  console.log("==================================================================");
}

runSuite()
  .catch((e) => {
    console.error("Test runner failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
