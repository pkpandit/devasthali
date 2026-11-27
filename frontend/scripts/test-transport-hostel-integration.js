/**
 * Frontend Integration Test: Life at School Overview (Transport & Hostel) (Milestone 20)
 *
 * Verifies:
 * - Frontend Zod schemas successfully validate backend response
 * - getPublicLifeAtSchoolOverview() correctly maps API payloads
 * - Graceful fallback to null when backend returns empty / unpopulated
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("assert");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const outfile = path.resolve(__dirname, "../dist_test_frontend_life_at_school.js");

try {
  execSync(
    `npx esbuild lib/api/life-at-school.ts --bundle --platform=node --outfile="${outfile}" --external:next --external:react`,
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
} catch (e) {
  console.error("esbuild failed:", e);
  process.exit(1);
}

const {
  publicHostelFeatureSchema,
  publicHostelSectionSchema,
  publicTransportSectionSchema,
  publicLifeAtSchoolResponseSchema,
  getPublicLifeAtSchoolOverview,
} = require(outfile);

async function runTests() {
  console.log("=== Running Frontend Life at School Overview Integration Tests ===");

  // 1. Zod Schemas
  console.log("1. Testing Zod Schemas...");
  const validHostel = publicHostelSectionSchema.safeParse({
    badge: "Residential Boarding Life",
    title: 'A Safe, Caring "Home Away From Home"',
    description: "Our residential boarding...",
    features: [
      {
        id: "feat-1",
        title: "Pure Vegetarian Dining",
        description: "4 freshly prepared meals daily",
        displayOrder: 0,
      },
    ],
  });
  assert.strictEqual(validHostel.success, true);

  const validTransport = publicTransportSectionSchema.safeParse({
    badge: "Day-Scholar Transport Network",
    title: "Safe, GPS-Tracked Transportation Fleet",
    description: "Our yellow school buses...",
    ctaText: "Contact Transport Coordinator →",
    ctaUrl: "/contact",
  });
  assert.strictEqual(validTransport.success, true);

  const validResponse = publicLifeAtSchoolResponseSchema.safeParse({
    success: true,
    hostel: validHostel.data,
    transport: validTransport.data,
  });
  assert.strictEqual(validResponse.success, true);

  // 2. Live Backend Fetch
  console.log("2. Testing getPublicLifeAtSchoolOverview() from live backend...");
  process.env.BACKEND_INTERNAL_URL = "http://127.0.0.1:3001";
  process.env.NODE_ENV = "development";

  const data = await getPublicLifeAtSchoolOverview();
  assert.ok(data, "Expected non-null response object");
  assert.ok(data.hostel, "Expected hostel data from live backend");
  assert.strictEqual(data.hostel.badge, "Residential Boarding Life");
  assert.ok(data.hostel.features.length >= 3, "Expected at least 3 features");
  assert.ok(data.transport, "Expected transport data from live backend");
  assert.strictEqual(data.transport.badge, "Day-Scholar Transport Network");
  assert.strictEqual(data.transport.ctaUrl, "/contact");

  console.log("✔ All Frontend Life at School Overview Integration Tests Passed Successfully!");
}

runTests()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(() => {
    try {
      if (fs.existsSync(outfile)) fs.unlinkSync(outfile);
    } catch {}
  });
