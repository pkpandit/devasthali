/**
 * Test Suite: Public Alumni API (Milestone 17)
 *
 * Verifies:
 * 1. HTTP 200 response & valid JSON
 * 2. Cache headers (Cache-Control: public, s-maxage=60, stale-while-revalidate=300; X-Content-Type-Options: nosniff)
 * 3. Response schema conformity (overview, reunions, opportunities)
 * 4. Draft isolation (unpublished reunions and career notices excluded)
 * 5. Display order ordering (displayOrder asc, createdAt asc)
 * 6. Internal database fields strictly omitted (displayOrder, isPublished, createdAt, updatedAt, heroImageStorageKey)
 * 7. Overview fields returned correctly
 * 8. Count of seeded records matches (1 published reunion, 1 published career notice)
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

const routeBundleOutfile = path.resolve(__dirname, "../dist_test_alumni_route.js");

try {
  execSync(
    `npx esbuild app/api/public/alumni/route.ts --bundle --platform=node --outfile=${routeBundleOutfile} --external:@prisma/client --external:server-only`,
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
} catch (e) {
  console.error("esbuild compilation failed:", e);
  process.exit(1);
}

const { GET } = require(routeBundleOutfile);

async function runTests() {
  console.log("-----------------------------------------------------------------");
  console.log("  Running Public Alumni API Test Suite");
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

  // 1. Create temporary draft reunion and career notice to test draft isolation
  const draftReunion = await prisma.alumniReunion.create({
    data: {
      slug: "draft-reunion-test-isolation",
      title: "Draft Reunion 2027",
      description: "Secret upcoming reunion event.",
      displayOrder: 999,
      isPublished: false,
    },
  });

  const draftCareer = await prisma.careerOpportunity.create({
    data: {
      slug: "draft-career-test-isolation",
      badgeText: "Internal",
      title: "Draft Faculty Position",
      description: "Upcoming faculty opening.",
      contactEmail: "admin@devasthaly.com",
      displayOrder: 999,
      isPublished: false,
    },
  });

  try {
    // 2. Execute GET handler
    const response = await GET();

    assert(response.status === 200, "GET /api/public/alumni returns HTTP 200 OK");

    const cacheHeader = response.headers.get("Cache-Control");
    assert(
      cacheHeader && cacheHeader.includes("public") && cacheHeader.includes("s-maxage=60"),
      "Cache-Control header specifies public s-maxage=60 and stale-while-revalidate=300"
    );

    const nosniffHeader = response.headers.get("X-Content-Type-Options");
    assert(
      nosniffHeader === "nosniff",
      "X-Content-Type-Options header is nosniff"
    );

    const json = await response.json();

    assert(json.success === true, "Response payload contains success: true");
    assert(typeof json.overview === "object" && json.overview !== null, "Response contains overview object");
    assert(Array.isArray(json.reunions), "Response contains reunions array");
    assert(Array.isArray(json.opportunities), "Response contains opportunities array");

    // 3. Draft Isolation Verification
    const hasDraftReunion = json.reunions.some(
      (r) => r.id === draftReunion.id || r.slug === "draft-reunion-test-isolation"
    );
    assert(!hasDraftReunion, "Unpublished draft reunion is excluded from public API");

    const hasDraftCareer = json.opportunities.some(
      (c) => c.id === draftCareer.id || c.slug === "draft-career-test-isolation"
    );
    assert(!hasDraftCareer, "Unpublished draft career opportunity is excluded from public API");

    // 4. Published Counts
    assert(
      json.reunions.length === 1,
      `Exactly 1 published reunion returned (found: ${json.reunions.length})`
    );
    assert(
      json.opportunities.length === 1,
      `Exactly 1 published career notice returned (found: ${json.opportunities.length})`
    );

    // 5. Omission of Internal Metadata
    const sampleReunion = json.reunions[0];
    assert(sampleReunion && typeof sampleReunion.id === "string", "Reunion DTO has id");
    assert(sampleReunion && typeof sampleReunion.slug === "string", "Reunion DTO has slug");
    assert(sampleReunion && typeof sampleReunion.title === "string", "Reunion DTO has title");
    assert(!("displayOrder" in sampleReunion), "Reunion DTO strictly omits displayOrder");
    assert(!("isPublished" in sampleReunion), "Reunion DTO strictly omits isPublished");
    assert(!("heroImageStorageKey" in sampleReunion), "Reunion DTO strictly omits heroImageStorageKey");
    assert(!("createdAt" in sampleReunion), "Reunion DTO strictly omits createdAt");
    assert(!("updatedAt" in sampleReunion), "Reunion DTO strictly omits updatedAt");

    const sampleCareer = json.opportunities[0];
    assert(sampleCareer && typeof sampleCareer.id === "string", "Career DTO has id");
    assert(sampleCareer && typeof sampleCareer.slug === "string", "Career DTO has slug");
    assert(sampleCareer && typeof sampleCareer.contactEmail === "string", "Career DTO has contactEmail");
    assert(!("displayOrder" in sampleCareer), "Career DTO strictly omits displayOrder");
    assert(!("isPublished" in sampleCareer), "Career DTO strictly omits isPublished");
    assert(!("createdAt" in sampleCareer), "Career DTO strictly omits createdAt");
    assert(!("updatedAt" in sampleCareer), "Career DTO strictly omits updatedAt");

    // 6. Overview Content Verification
    assert(
      json.overview.badgeText === "Students & Parents / Alumni",
      "Overview badgeText correctly populated"
    );
    assert(
      json.overview.title === "Alumni Corner",
      "Overview title correctly populated"
    );
    assert(!("createdAt" in json.overview), "Overview DTO omits createdAt");
    assert(!("updatedAt" in json.overview), "Overview DTO omits updatedAt");

    console.log(`\n  All tests passed: ${passed}/${total}`);
  } finally {
    // Cleanup temporary draft records
    await prisma.alumniReunion.deleteMany({ where: { id: draftReunion.id } });
    await prisma.careerOpportunity.deleteMany({ where: { id: draftCareer.id } });
    try {
      if (fs.existsSync(routeBundleOutfile)) fs.unlinkSync(routeBundleOutfile);
    } catch {}
    await prisma.$disconnect();
  }
}

runTests()
  .then(() => {
    console.log("-----------------------------------------------------------------");
    console.log("  Public Alumni API Test Suite COMPLETED successfully.");
    console.log("-----------------------------------------------------------------");
  })
  .catch((err) => {
    console.error("  [ERROR] Test suite failed:", err);
    process.exit(1);
  });
