/**
 * Test Suite: Academic Server Actions, Validation & Media Pipeline (Milestone 14)
 */

/* eslint-disable @typescript-eslint/no-require-imports */
require.cache[require.resolve("server-only")] = { exports: {} };

const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Bundle TypeScript validation and audit for Node runtime
const validationOutfile = path.resolve(__dirname, "../dist_test_academic_validation.js");

try {
  execSync(
    `npx esbuild lib/validation/academics.ts --bundle --platform=node --outfile=${validationOutfile} --external:@prisma/client --external:server-only`,
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
} catch (e) {
  console.error("esbuild compilation failed:", e);
  process.exit(1);
}

const {
  ALLOWED_ACADEMIC_STREAM_ICONS,
  parseMultilineList,
  isValidInternalPathOrHttpsUrl,
  academicWingCreateSchema,
  academicStreamCreateSchema,
  academicAssessmentRuleCreateSchema,
  academicOverviewUpdateSchema,
  computeAcademicDiff,
} = require(validationOutfile);

async function runTests() {
  console.log("-----------------------------------------------------------------");
  console.log("  Running Academic Actions & Validation Test Suite");
  console.log("-----------------------------------------------------------------");

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      throw new Error(`Assertion failed: ${testName}`);
    }
  }

  // 1. Icon Allow-list Tests
  assert(
    ALLOWED_ACADEMIC_STREAM_ICONS.includes("FlaskConical") &&
      ALLOWED_ACADEMIC_STREAM_ICONS.includes("Award") &&
      ALLOWED_ACADEMIC_STREAM_ICONS.includes("BookOpen"),
    "Allowed icon set contains exact three canonical icons"
  );
  assert(
    ALLOWED_ACADEMIC_STREAM_ICONS.length === 3,
    "Allowed icon set restricted strictly to 3 icons"
  );

  // 2. Multiline List Parsing Tests
  const multilineInput = "  Line One  \n\n  Line Two\r\n   \nLine Three  ";
  const parsedLines = parseMultilineList(multilineInput);
  assert(
    parsedLines.length === 3 &&
      parsedLines[0] === "Line One" &&
      parsedLines[1] === "Line Two" &&
      parsedLines[2] === "Line Three",
    "parseMultilineList trims lines, eliminates empty lines and handles CRLF"
  );

  const arrayInput = [" Highlight A ", "", "  Highlight B  ", null, undefined];
  const parsedArray = parseMultilineList(arrayInput);
  assert(
    parsedArray.length === 2 &&
      parsedArray[0] === "Highlight A" &&
      parsedArray[1] === "Highlight B",
    "parseMultilineList handles array input with nulls and whitespace safely"
  );

  // 3. Safe URL Validation Tests
  assert(
    isValidInternalPathOrHttpsUrl("/admissions"),
    "Valid internal root-relative path passes"
  );
  assert(
    isValidInternalPathOrHttpsUrl("/documents/original/prospectus-2.pdf"),
    "Valid internal document path passes"
  );
  assert(
    isValidInternalPathOrHttpsUrl("https://maps.google.com/?q=test"),
    "Valid secure HTTPS URL passes"
  );
  assert(
    !isValidInternalPathOrHttpsUrl("http://insecure-site.com"),
    "Insecure HTTP URL is rejected"
  );
  assert(
    !isValidInternalPathOrHttpsUrl("//protocol-relative.com"),
    "Protocol-relative // path is rejected"
  );
  assert(
    !isValidInternalPathOrHttpsUrl("javascript:alert(1)"),
    "javascript: URI is rejected"
  );
  assert(
    !isValidInternalPathOrHttpsUrl(""),
    "Empty string URL is rejected"
  );

  // 4. Academic Wing Schema Validation
  const validWing = {
    stageBadge: "Stage 1: Foundational Wing",
    title: "Foundational Stage (LKG, UKG, Classes I & II)",
    description: "Focuses on playful, experiential learning.",
    highlights: ["Phonics & vocabulary", "Number games"],
    displayOrder: 0,
    isPublished: true,
  };
  const parsedWing = academicWingCreateSchema.safeParse(validWing);
  assert(parsedWing.success, "Valid academic wing passes validation");

  const invalidWing = {
    ...validWing,
    stageBadge: "A", // too short
  };
  assert(!academicWingCreateSchema.safeParse(invalidWing).success, "Short stage badge is rejected");

  // 5. Academic Stream Schema & Icon Allow-list Enforcement
  const validStream = {
    title: "Science Stream",
    iconName: "FlaskConical",
    subjects: ["Physics", "Chemistry", "Mathematics"],
    careerHighlight: "Includes NEET/JEE Foundation",
    displayOrder: 0,
    isPublished: true,
  };
  assert(academicStreamCreateSchema.safeParse(validStream).success, "Valid stream with FlaskConical icon passes");

  const invalidStreamIcon = {
    ...validStream,
    iconName: "ShieldAlert", // Not in allow-list
  };
  const streamRes = academicStreamCreateSchema.safeParse(invalidStreamIcon);
  assert(!streamRes.success, "Unauthorized icon 'ShieldAlert' is rejected by schema");

  // 6. Assessment Rule Schema Validation
  const validRule = {
    ruleText: "Promotions will be decided on the average marks obtained in examinations.",
    displayOrder: 0,
    isPublished: true,
  };
  assert(academicAssessmentRuleCreateSchema.safeParse(validRule).success, "Valid assessment rule passes");

  const shortRule = { ruleText: "Fail" };
  assert(!academicAssessmentRuleCreateSchema.safeParse(shortRule).success, "Rule text shorter than 5 chars is rejected");

  // 7. Academic Overview Schema & Alt-Text Enforcement
  const validOverviewWithImage = {
    heroBadge: "Experimental Laboratory Learning",
    heroImage: "/images/facilities/science-lab.jpg",
    heroImageAlt: "Devasthaly Vidyapeeth advanced science laboratory practical learning session",
    competitiveBadge: "Integrated Career Preparation",
    competitiveTitle: "NEET, JEE & CUET Foundational Guidance",
    competitiveDescription: "We eliminate the stress of outstation coaching.",
    competitiveCtaText: "Apply for Class XI Admission",
    competitiveCtaHref: "/admissions",
    assessmentParentNotice: "Parents are free to come and meet teachers.",
    assessmentProspectusNotice: "Download the official school prospectus.",
    assessmentProspectusUrl: "/documents/original/prospectus-2.pdf",
  };
  assert(
    academicOverviewUpdateSchema.safeParse(validOverviewWithImage).success,
    "Valid overview with hero image and alt text passes"
  );

  const missingAltText = {
    ...validOverviewWithImage,
    heroImageAlt: "lab", // Less than 5 chars
  };
  const altRes = academicOverviewUpdateSchema.safeParse(missingAltText);
  assert(!altRes.success, "Hero image with meaningless (<5 chars) alt text is rejected");

  const emptyImageValidWithoutAlt = {
    ...validOverviewWithImage,
    heroImage: "",
    heroImageAlt: "",
  };
  assert(
    academicOverviewUpdateSchema.safeParse(emptyImageValidWithoutAlt).success,
    "Overview without hero image does not require alt text"
  );

  // 8. Diff Computation Test
  const oldOverview = { heroBadge: "Old Badge", heroImageAlt: "Old Alt" };
  const newOverview = { heroBadge: "New Badge", heroImageAlt: "Old Alt" };
  const diff = computeAcademicDiff(oldOverview, newOverview);
  assert(
    diff.heroBadge && diff.heroBadge.from === "Old Badge" && diff.heroBadge.to === "New Badge" && !diff.heroImageAlt,
    "computeAcademicDiff tracks modified fields and ignores identical fields"
  );

  // 9. Server Actions File Structure and Revalidation Tag Check
  const actionsFilePath = path.resolve(__dirname, "../lib/server/academic-actions.ts");
  const actionsContent = fs.readFileSync(actionsFilePath, "utf8");

  assert(
    actionsContent.includes('revalidateTag("academics", "max")'),
    "academic-actions.ts calls revalidateTag('academics', 'max')"
  );
  assert(
    actionsContent.includes('revalidatePath("/admin/academics/academic-system")'),
    "academic-actions.ts calls revalidatePath('/admin/academics/academic-system')"
  );
  assert(
    actionsContent.includes('revalidatePath("/admin/academics")'),
    "academic-actions.ts calls revalidatePath('/admin/academics')"
  );
  assert(
    !actionsContent.includes('revalidatePath("/academics")'),
    "academic-actions.ts does NOT call non-existent backend route revalidatePath('/academics')"
  );

  // 10. Database Seed Verification
  const wingCount = await prisma.academicWing.count();
  const streamCount = await prisma.academicStream.count();
  const ruleCount = await prisma.academicAssessmentRule.count();
  const overviewRecord = await prisma.academicOverview.findUnique({ where: { id: "default" } });

  assert(wingCount === 3, "Database contains exactly 3 academic wings");
  assert(streamCount === 3, "Database contains exactly 3 senior secondary streams");
  assert(ruleCount === 3, "Database contains exactly 3 assessment rules");
  assert(overviewRecord !== null, "Database contains default AcademicOverview record");
  assert(
    overviewRecord && overviewRecord.heroImage === "/images/facilities/science-lab.jpg",
    "AcademicOverview contains preserved heroImage"
  );

  console.log(`\n  All tests passed: ${passed}/${total}`);
}

runTests()
  .then(() => {
    console.log("-----------------------------------------------------------------");
    console.log("  Academic Actions & Validation Test Suite COMPLETED successfully.");
    console.log("-----------------------------------------------------------------");
  })
  .catch((err) => {
    console.error("  [ERROR] Test suite failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    try {
      if (fs.existsSync(validationOutfile)) fs.unlinkSync(validationOutfile);
    } catch {}
    await prisma.$disconnect();
  });
