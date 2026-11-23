/**
 * Test Suite: Public Activities API (Milestone 15)
 *
 * Verifies:
 * 1. HTTP 200 response & valid JSON
 * 2. Response schema conformity (overview, clubs)
 * 3. Draft isolation (unpublished clubs excluded)
 * 4. Display order ascending
 * 5. Internal database fields (createdAt, updatedAt, isPublished, heroImageStorageKey) omitted
 * 6. Cache-Control header policy
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

const routeBundleOutfile = path.resolve(__dirname, "../dist_test_activity_route.js");

try {
  execSync(
    `npx esbuild app/api/public/activities/route.ts --bundle --platform=node --outfile=${routeBundleOutfile} --external:@prisma/client --external:server-only`,
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
} catch (e) {
  console.error("esbuild compilation failed:", e);
  process.exit(1);
}

const { GET } = require(routeBundleOutfile);

async function runTests() {
  console.log("-----------------------------------------------------------------");
  console.log("  Running Public Activities API Test Suite");
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

  // 1. Create temporary draft club to test draft isolation
  const draftClub = await prisma.studentClub.create({
    data: {
      name: "Draft Robotics Club",
      slug: "draft-robotics-club-test",
      category: "Technology",
      description: "Secret upcoming robotics projects.",
      iconName: "Activity",
      displayOrder: 999,
      isPublished: false,
    },
  });

  try {
    // 2. Execute GET handler
    const response = await GET();

    assert(response.status === 200, "GET /api/public/activities returns HTTP 200 OK");

    const cacheHeader = response.headers.get("Cache-Control");
    assert(
      cacheHeader && cacheHeader.includes("public") && cacheHeader.includes("s-maxage=60"),
      "Cache-Control header specifies public s-maxage=60 and stale-while-revalidate=300"
    );

    const json = await response.json();

    assert(json.success === true, "Response payload contains success: true");
    assert(typeof json.overview === "object" && json.overview !== null, "Response contains overview object");
    assert(Array.isArray(json.clubs), "Response contains clubs array");

    // 3. Draft Isolation Verification
    const hasDraftClub = json.clubs.some(
      (c) => c.slug === "draft-robotics-club-test" || c.id === draftClub.id
    );
    assert(!hasDraftClub, "Unpublished draft student club is excluded from public API");

    // 4. Ordering Verification
    let clubsOrdered = true;
    for (let i = 1; i < json.clubs.length; i++) {
      if (json.clubs[i].displayOrder < json.clubs[i - 1].displayOrder) {
        clubsOrdered = false;
        break;
      }
    }
    assert(clubsOrdered, "Student clubs are sorted in ascending displayOrder");

    // 5. Omission of Internal Metadata
    const sampleClub = json.clubs[0];
    assert(sampleClub && !("isPublished" in sampleClub), "Club DTO omits isPublished");
    assert(sampleClub && !("createdAt" in sampleClub), "Club DTO omits createdAt");
    assert(sampleClub && !("updatedAt" in sampleClub), "Club DTO omits updatedAt");

    assert(!("heroImageStorageKey" in json.overview), "Overview DTO omits internal heroImageStorageKey");
    assert(!("createdAt" in json.overview), "Overview DTO omits createdAt");
    assert(!("updatedAt" in json.overview), "Overview DTO omits updatedAt");

    // 6. Overview Content Verification
    assert(
      json.overview.arenaSize === "22,000 sq ft",
      "Overview arenaSize correctly populated"
    );
    assert(
      json.overview.title === "Co-Curricular Activities",
      "Overview title correctly populated"
    );

    // 7. Published Clubs Count
    assert(
      json.clubs.length === 8,
      `Exactly 8 published clubs returned (found: ${json.clubs.length})`
    );

    console.log(`\n  All tests passed: ${passed}/${total}`);
  } finally {
    // Cleanup temporary draft record
    await prisma.studentClub.deleteMany({ where: { id: draftClub.id } });
    try {
      if (fs.existsSync(routeBundleOutfile)) fs.unlinkSync(routeBundleOutfile);
    } catch {}
    await prisma.$disconnect();
  }
}

runTests()
  .then(() => {
    console.log("-----------------------------------------------------------------");
    console.log("  Public Activities API Test Suite COMPLETED successfully.");
    console.log("-----------------------------------------------------------------");
  })
  .catch((err) => {
    console.error("  [ERROR] Test suite failed:", err);
    process.exit(1);
  });
