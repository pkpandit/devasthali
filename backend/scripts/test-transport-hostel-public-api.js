/**
 * Integration Test: Public Life at School Overview API Route (Milestone 20)
 *
 * Validates:
 * - GET /api/public/life-at-school/overview returns HTTP 200 with public DTOs
 * - Excludes unpublished hostel features
 * - Excludes internal IDs and administrative metadata
 * - Ensures registration remains CLOSED and applicants remain 0
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("assert");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:3001";

async function runTests() {
  console.log("=== Running Public Life at School Overview API Route Tests ===");

  // 1. Fetch endpoint via HTTP
  console.log("1. Testing GET /api/public/life-at-school/overview via HTTP...");
  const res = await fetch(`${BACKEND_URL}/api/public/life-at-school/overview`);
  assert.strictEqual(res.status, 200, `Expected HTTP 200, got ${res.status}`);

  const nosniff = res.headers.get("x-content-type-options");
  assert.strictEqual(nosniff, "nosniff", "Expected X-Content-Type-Options: nosniff");

  const json = await res.json();
  assert.strictEqual(json.success, true);

  // 2. Verify Hostel DTO
  console.log("2. Verifying Hostel Section DTO structure...");
  assert.ok(json.hostel, "Hostel DTO should be present");
  assert.strictEqual(json.hostel.badge, "Residential Boarding Life");
  assert.strictEqual(json.hostel.title, 'A Safe, Caring "Home Away From Home"');
  assert.ok(json.hostel.description.length > 50);
  assert.ok(Array.isArray(json.hostel.features), "features should be an array");
  assert.strictEqual(json.hostel.features.length, 3, "Expected 3 default hostel features");

  const f0 = json.hostel.features[0];
  assert.ok(f0.id, "Feature must have id");
  assert.ok(f0.title, "Feature must have title");
  assert.ok(f0.description, "Feature must have description");
  assert.strictEqual(typeof f0.displayOrder, "number", "Feature must have displayOrder");
  assert.strictEqual(f0.isPublished, undefined, "isPublished must NOT be leaked");
  assert.strictEqual(f0.createdAt, undefined, "createdAt must NOT be leaked");

  // 3. Verify Transport DTO
  console.log("3. Verifying Transport Section DTO structure...");
  assert.ok(json.transport, "Transport DTO should be present");
  assert.strictEqual(json.transport.badge, "Day-Scholar Transport Network");
  assert.strictEqual(json.transport.title, "Safe, GPS-Tracked Transportation Fleet");
  assert.strictEqual(json.transport.ctaUrl, "/contact");
  assert.ok(json.transport.ctaText.includes("Transport Coordinator"));
  assert.strictEqual(json.transport.createdAt, undefined, "createdAt must NOT be leaked");

  // 4. Verify Exclusion of Unpublished Features
  console.log("4. Verifying exclusion of unpublished features...");
  const tempDraft = await prisma.hostelFeature.create({
    data: {
      sectionId: "default",
      title: "[TEST-DRAFT] Unpublished Feature",
      description: "Should not appear in public API response.",
      displayOrder: 999,
      isPublished: false,
    },
  });

  try {
    const resDraft = await fetch(`${BACKEND_URL}/api/public/life-at-school/overview`);
    const jsonDraft = await resDraft.json();
    const found = jsonDraft.hostel.features.some((f) => f.id === tempDraft.id);
    assert.strictEqual(found, false, "Unpublished feature must NOT be returned by public API");
  } finally {
    await prisma.hostelFeature.delete({ where: { id: tempDraft.id } });
  }

  // 5. Verify Invariants
  console.log("5. Verifying database invariants...");
  const settings = await prisma.admissionRegistrationSetting.findFirst();
  assert.strictEqual(settings.isRegistrationOpen, false, "Registration must remain CLOSED");

  const applicantCount = await prisma.admissionApplication.count();
  assert.strictEqual(applicantCount, 0, "Applicant count must remain 0");

  console.log("✔ All Public Life at School Overview API Route Tests Passed Successfully!");
}

runTests()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
