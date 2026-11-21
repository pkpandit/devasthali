/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert");
const path = require("node:path");
const { execSync } = require("node:child_process");

// Bundle TypeScript validation and API helper for Node runtime
try {
  execSync(
    'npx esbuild lib/api/admissions.ts --bundle --platform=node --outfile=dist_test_frontend_admissions.js --external:@prisma/client',
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
} catch (e) {
  console.error("esbuild compilation failed:", e);
  process.exit(1);
}

async function runTests() {
  console.log("=== Running Frontend Admissions Integration Tests ===");

  const {
    publicAdmissionStepSchema,
    publicAdmissionEligibilitySchema,
    publicAdmissionDocumentSchema,
    publicAdmissionFaqSchema,
    publicAdmissionsResponseSchema,
    getStaticFallbackAdmissions,
    getPublicAdmissions,
  } = require("../dist_test_frontend_admissions");

  // 1. Test Static Fallback
  console.log("1. Testing Static Fallback...");
  const fallback = getStaticFallbackAdmissions();
  assert(fallback.steps.length >= 4, "Fallback should have 4 steps");
  assert(fallback.eligibilityCriteria.length >= 6, "Fallback should have 6 eligibility rows");
  assert(fallback.documentRequirements.length >= 7, "Fallback should have 7 documents");
  assert(fallback.faqs.length >= 6, "Fallback should have 6 FAQs");

  // 2. Test Zod Schemas on valid backend response
  console.log("2. Testing Public Admissions Zod Schemas...");
  const sampleApiResponse = {
    success: true,
    steps: [
      {
        id: "step-1",
        stepNumber: "01",
        title: "Registration",
        description: "Visit campus or register online.",
        displayOrder: 0,
      },
    ],
    eligibilityCriteria: [
      {
        id: "elig-1",
        classGrade: "Class I",
        ageRequirement: "6+ Years",
        evaluationMode: "Oral & Written",
        displayOrder: 0,
      },
    ],
    documentRequirements: [
      {
        id: "doc-1",
        title: "Birth Certificate",
        description: "Official municipal copy.",
        displayOrder: 0,
      },
    ],
    faqs: [
      {
        id: "faq-1",
        question: "Is school affiliated with CBSE?",
        answer: "Yes, affiliated with CBSE.",
        displayOrder: 0,
      },
    ],
  };

  const parsed = publicAdmissionsResponseSchema.safeParse(sampleApiResponse);
  assert.strictEqual(parsed.success, true, "Valid response should parse cleanly");

  // 3. Test Authoritative Empty Array Handling
  console.log("3. Testing Authoritative Empty Array Handling...");
  const emptyApiResponse = {
    success: true,
    steps: [],
    eligibilityCriteria: [],
    documentRequirements: [],
    faqs: [],
  };

  const parsedEmpty = publicAdmissionsResponseSchema.safeParse(emptyApiResponse);
  assert.strictEqual(parsedEmpty.success, true);
  assert.strictEqual(parsedEmpty.data.steps.length, 0);
  assert.strictEqual(parsedEmpty.data.eligibilityCriteria.length, 0);

  // 4. Test Live getPublicAdmissions() against Backend
  console.log("4. Testing Live getPublicAdmissions() against dev server...");
  const liveData = await getPublicAdmissions();
  assert(liveData.steps.length >= 4, "Should fetch live steps from backend");
  assert(liveData.eligibilityCriteria.length >= 6, "Should fetch live eligibility criteria");
  assert(liveData.documentRequirements.length >= 7, "Should fetch live document requirements");
  assert(liveData.faqs.length >= 6, "Should fetch live FAQs");

  console.log(`   Live Steps: ${liveData.steps.length}`);
  console.log(`   Live Eligibility Rows: ${liveData.eligibilityCriteria.length}`);
  console.log(`   Live Document Requirements: ${liveData.documentRequirements.length}`);
  console.log(`   Live FAQs: ${liveData.faqs.length}`);

  console.log("=== All Frontend Admissions Integration Tests Passed! ===");
}

runTests()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(() => {
    try {
      const fs = require("node:fs");
      fs.unlinkSync(path.resolve(__dirname, "../dist_test_frontend_admissions.js"));
    } catch (_) {}
  });
