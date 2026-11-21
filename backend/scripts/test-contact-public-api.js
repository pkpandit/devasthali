/**
 * Test Suite: Contact Public Profile API Extension (Milestone 13)
 *
 * Verifies:
 * 1. GET /api/public/profile returns HTTP 200
 * 2. Extended location fields exist in response DTO
 * 3. Extended emergency contacts exist in response DTO
 * 4. Internal fields (id, updatedAt) are strictly omitted
 * 5. Cache-Control header is properly configured
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runTests() {
  console.log("-----------------------------------------------------------------");
  console.log("  Running Contact Public Profile API Test Suite");
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

  // Fetch the default site profile directly to compare
  const dbProfile = await prisma.siteProfile.findUnique({
    where: { id: "default" },
  });

  assert(Boolean(dbProfile), "Default SiteProfile exists in database");

  // Call the live HTTP endpoint
  const endpoint = "http://127.0.0.1:3001/api/public/profile";
  const res = await fetch(endpoint);
  assert(res.status === 200, `GET ${endpoint} returns HTTP 200 OK`);

  const data = await res.json();

  // Verify core compatibility
  assert(typeof data.schoolName === "string" && data.schoolName.length > 0, "schoolName is returned");
  assert(typeof data.address === "object" && data.address !== null, "address object is returned");
  assert(typeof data.contacts === "object" && data.contacts !== null, "contacts object is returned");

  // Verify Milestone 13 location extension
  assert(typeof data.location === "object" && data.location !== null, "location object is returned");
  assert(
    data.location.mapEmbedUrl === dbProfile.mapEmbedUrl,
    "location.mapEmbedUrl matches database value"
  );
  assert(
    data.location.mapDirectionsUrl === dbProfile.mapDirectionsUrl,
    "location.mapDirectionsUrl matches database value"
  );
  assert(
    data.location.directionsOverview === dbProfile.directionsOverview,
    "location.directionsOverview matches database value"
  );
  assert(
    data.location.visitorGuidelines === dbProfile.visitorGuidelines,
    "location.visitorGuidelines matches database value"
  );

  // Top-level location accessors
  assert(
    data.mapEmbedUrl === dbProfile.mapEmbedUrl,
    "top-level mapEmbedUrl matches database value"
  );
  assert(
    data.mapDirectionsUrl === dbProfile.mapDirectionsUrl,
    "top-level mapDirectionsUrl matches database value"
  );

  // Verify Milestone 13 emergency contacts extension
  assert(
    data.contacts.emergencyMedicalPhone === dbProfile.emergencyMedicalPhone,
    "contacts.emergencyMedicalPhone matches database value"
  );
  assert(
    data.contacts.emergencySecurityPhone === dbProfile.emergencySecurityPhone,
    "contacts.emergencySecurityPhone matches database value"
  );

  // Verify internal field containment (privacy & DTO hygiene)
  assert(data.id === undefined, "Internal database primary key 'id' is NOT exposed");
  assert(data.updatedAt === undefined, "Internal timestamp 'updatedAt' is NOT exposed");

  // Verify Cache-Control header
  const cacheControl = res.headers.get("Cache-Control");
  assert(Boolean(cacheControl), `Cache-Control header is present: ${cacheControl}`);

  console.log(`\n  All tests passed: ${passed}/${total}`);
  console.log("-----------------------------------------------------------------");
  console.log("  Contact Public Profile API Test Suite COMPLETED successfully.");
  console.log("-----------------------------------------------------------------");
}

runTests()
  .catch((err) => {
    console.error("  [ERROR] Public API test suite failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
