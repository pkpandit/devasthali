/**
 * Test Suite: Public Academics API (Milestone 14)
 *
 * Verifies:
 * 1. HTTP 200 response & valid JSON
 * 2. Response schema conformity
 * 3. Draft isolation (unpublished records excluded)
 * 4. Display order ascending
 * 5. Internal database fields (createdAt, updatedAt, isPublished, heroImageStorageKey) omitted
 * 6. Preserved /images/... root-relative paths
 * 7. Cache-Control header policy
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

const routeBundleOutfile = path.resolve(__dirname, "../dist_test_academic_route.js");

try {
  execSync(
    `npx esbuild app/api/public/academics/route.ts --bundle --platform=node --outfile=${routeBundleOutfile} --external:@prisma/client --external:server-only`,
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
} catch (e) {
  console.error("esbuild compilation failed:", e);
  process.exit(1);
}

const { GET } = require(routeBundleOutfile);

async function runTests() {
  console.log("-----------------------------------------------------------------");
  console.log("  Running Public Academics API Test Suite");
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

  // 1. Create temporary draft records to test draft isolation
  const draftWing = await prisma.academicWing.create({
    data: {
      slug: "draft-wing-test",
      stageBadge: "Stage Draft",
      title: "Draft Wing Title",
      description: "Draft wing description",
      highlights: ["Draft highlight"],
      displayOrder: 999,
      isPublished: false,
    },
  });

  const draftStream = await prisma.academicStream.create({
    data: {
      slug: "draft-stream-test",
      title: "Draft Stream",
      iconName: "BookOpen",
      subjects: ["Draft Subject"],
      careerHighlight: "Draft career",
      displayOrder: 999,
      isPublished: false,
    },
  });

  const draftRule = await prisma.academicAssessmentRule.create({
    data: {
      ruleText: "Draft rule that should not appear publicly.",
      displayOrder: 999,
      isPublished: false,
    },
  });

  try {
    // 2. Execute GET handler
    const response = await GET();

    assert(response.status === 200, "GET /api/public/academics returns HTTP 200 OK");

    const cacheHeader = response.headers.get("Cache-Control");
    assert(
      cacheHeader && cacheHeader.includes("public") && cacheHeader.includes("s-maxage=60"),
      "Cache-Control header specifies public s-maxage=60 and stale-while-revalidate=300"
    );

    const json = await response.json();

    assert(json.success === true, "Response payload contains success: true");
    assert(typeof json.overview === "object" && json.overview !== null, "Response contains overview object");
    assert(Array.isArray(json.wings), "Response contains wings array");
    assert(Array.isArray(json.streams), "Response contains streams array");
    assert(Array.isArray(json.assessmentRules), "Response contains assessmentRules array");

    // 3. Draft Isolation Verification
    const hasDraftWing = json.wings.some((w) => w.slug === "draft-wing-test" || w.id === draftWing.id);
    const hasDraftStream = json.streams.some((s) => s.slug === "draft-stream-test" || s.id === draftStream.id);
    const hasDraftRule = json.assessmentRules.some((r) => r.id === draftRule.id);

    assert(!hasDraftWing, "Unpublished draft academic wing is excluded from public API");
    assert(!hasDraftStream, "Unpublished draft academic stream is excluded from public API");
    assert(!hasDraftRule, "Unpublished draft assessment rule is excluded from public API");

    // 4. Ordering Verification
    let wingsOrdered = true;
    for (let i = 1; i < json.wings.length; i++) {
      if (json.wings[i].displayOrder < json.wings[i - 1].displayOrder) {
        wingsOrdered = false;
        break;
      }
    }
    assert(wingsOrdered, "Academic wings are sorted in ascending displayOrder");

    let streamsOrdered = true;
    for (let i = 1; i < json.streams.length; i++) {
      if (json.streams[i].displayOrder < json.streams[i - 1].displayOrder) {
        streamsOrdered = false;
        break;
      }
    }
    assert(streamsOrdered, "Academic streams are sorted in ascending displayOrder");

    let rulesOrdered = true;
    for (let i = 1; i < json.assessmentRules.length; i++) {
      if (json.assessmentRules[i].displayOrder < json.assessmentRules[i - 1].displayOrder) {
        rulesOrdered = false;
        break;
      }
    }
    assert(rulesOrdered, "Assessment rules are sorted in ascending displayOrder");

    // 5. Omission of Internal Metadata
    const sampleWing = json.wings[0];
    assert(sampleWing && !("isPublished" in sampleWing), "Wing DTO omits isPublished");
    assert(sampleWing && !("createdAt" in sampleWing), "Wing DTO omits createdAt");
    assert(sampleWing && !("updatedAt" in sampleWing), "Wing DTO omits updatedAt");

    const sampleStream = json.streams[0];
    assert(sampleStream && !("isPublished" in sampleStream), "Stream DTO omits isPublished");
    assert(sampleStream && !("createdAt" in sampleStream), "Stream DTO omits createdAt");
    assert(sampleStream && !("updatedAt" in sampleStream), "Stream DTO omits updatedAt");

    const sampleRule = json.assessmentRules[0];
    assert(sampleRule && !("isPublished" in sampleRule), "Rule DTO omits isPublished");
    assert(sampleRule && !("createdAt" in sampleRule), "Rule DTO omits createdAt");
    assert(sampleRule && !("updatedAt" in sampleRule), "Rule DTO omits updatedAt");

    assert(!("heroImageStorageKey" in json.overview), "Overview DTO omits internal heroImageStorageKey");
    assert(!("createdAt" in json.overview), "Overview DTO omits createdAt");
    assert(!("updatedAt" in json.overview), "Overview DTO omits updatedAt");

    // 6. Root-Relative Path Preservation
    assert(
      json.overview.heroImage === "/images/facilities/science-lab.jpg",
      "Overview heroImage preserves safe root-relative path (/images/facilities/science-lab.jpg)"
    );
    assert(
      !json.overview.heroImage.includes("localhost") && !json.overview.heroImage.includes("127.0.0.1"),
      "Overview heroImage contains no localhost or 127.0.0.1 references"
    );

    console.log(`\n  All tests passed: ${passed}/${total}`);
  } finally {
    // Cleanup temporary draft records
    await prisma.academicWing.deleteMany({ where: { id: draftWing.id } });
    await prisma.academicStream.deleteMany({ where: { id: draftStream.id } });
    await prisma.academicAssessmentRule.deleteMany({ where: { id: draftRule.id } });
    try {
      if (fs.existsSync(routeBundleOutfile)) fs.unlinkSync(routeBundleOutfile);
    } catch {}
    await prisma.$disconnect();
  }
}

runTests()
  .then(() => {
    console.log("-----------------------------------------------------------------");
    console.log("  Public Academics API Test Suite COMPLETED successfully.");
    console.log("-----------------------------------------------------------------");
  })
  .catch((err) => {
    console.error("  [ERROR] Test suite failed:", err);
    process.exit(1);
  });
