/**
 * Test Suite: Frontend Admissions Publications Integration (Milestone 19)
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert");
const path = require("node:path");
const fs = require("node:fs");
const { execSync } = require("node:child_process");

const distFile = path.resolve(__dirname, "../dist_test_frontend_admissions_publications.js");

try {
  execSync(
    `npx esbuild lib/api/admissions-publications.ts --bundle --platform=node --outfile="${distFile}"`,
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
} catch (e) {
  console.error("esbuild compilation failed:", e);
  process.exit(1);
}

async function runTests() {
  console.log("=== Running Frontend Admissions Publications Integration Tests ===");

  const {
    publicAdmissionOverviewSchema,
    publicFeeStructurePageSchema,
    publicAdmissionProcedureRuleSchema,
    publicEntranceExamSubjectSchema,
    publicAdmissionsPublicationsResponseSchema,
    getPublicAdmissionsPublications,
  } = require(distFile);

  // 1. Test Schema Parsing
  console.log("1. Testing Zod Schemas...");
  const validOverview = {
    sessionLabel: "2026-27",
    feeStructureTitle: "Fee Structure (Session 2026–27)",
    feeStructureSubtitle: "Official statutory fee schedule.",
    prospectusTitle: "Official Devasthaly Vidyapeeth Prospectus",
    prospectusDescription: "Complete publication.",
    prospectusPdfUrl: "/documents/original/prospectus-2.pdf",
    prospectusDisplayLabel: "Prospectus PDF (5.6 MB)",
    admissionChartPdfUrl: "/documents/original/new-admission-chart-2026-27.pdf",
    admissionChartDisplayLabel: "Admission Chart (722 KB)",
  };
  const parsedOverview = publicAdmissionOverviewSchema.safeParse(validOverview);
  assert.strictEqual(parsedOverview.success, true, "Overview schema validates successfully");

  const validFeePage = {
    id: "page-1",
    pageNumber: 1,
    title: "Fee Structure Page 1",
    imageUrl: "/images/admissions/fees/Fee-Structure-26-27_page-0001.jpg",
    displayOrder: 0,
  };
  assert.strictEqual(publicFeeStructurePageSchema.safeParse(validFeePage).success, true);

  const validRule = {
    id: "rule-1",
    ruleText: "Formal admission is completed after perusal of application.",
    displayOrder: 0,
  };
  assert.strictEqual(publicAdmissionProcedureRuleSchema.safeParse(validRule).success, true);

  const validSubject = {
    id: "subj-1",
    classGrade: "VI to IX",
    subjects: "English, Maths, Science",
    displayOrder: 2,
  };
  assert.strictEqual(publicEntranceExamSubjectSchema.safeParse(validSubject).success, true);

  const fullPayload = {
    success: true,
    overview: validOverview,
    feePages: [validFeePage],
    procedureRules: [validRule],
    entranceSubjects: [validSubject],
  };
  const parsedFull = publicAdmissionsPublicationsResponseSchema.safeParse(fullPayload);
  assert.strictEqual(parsedFull.success, true, "Full API response schema parses correctly");

  // 2. Test Live Fetching from backend
  console.log("2. Testing getPublicAdmissionsPublications() from live backend...");
  const data = await getPublicAdmissionsPublications();
  assert(data.overview !== null, "Overview should not be null when backend is live");
  assert.strictEqual(data.overview.sessionLabel, "2026-27");
  assert(data.feePages.length >= 5, `Expected at least 5 fee pages, got ${data.feePages.length}`);
  assert(data.procedureRules.length >= 6, `Expected at least 6 procedure rules, got ${data.procedureRules.length}`);
  assert(data.entranceSubjects.length >= 6, `Expected at least 6 entrance subjects, got ${data.entranceSubjects.length}`);

  console.log("✔ All Frontend Admissions Publications Integration Tests Passed Successfully!");
}

runTests()
  .catch((err) => {
    console.error("❌ Integration test failed:", err);
    process.exit(1);
  })
  .finally(() => {
    try {
      if (fs.existsSync(distFile)) fs.unlinkSync(distFile);
    } catch {}
  });
