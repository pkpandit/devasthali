/**
 * Integration Test: Public Homepage API with Testimonials (Milestone 22)
 *
 * Validates:
 * - GET /api/public/homepage returns HTTP 200 with all existing homepage sections
 * - Returns testimonials DTO with at least 2 seeded items in order
 * - Excludes unpublished testimonials from public API response (draft isolation)
 * - Excludes internal administrative timestamps/flags from public DTOs
 * - Ensures cache-control headers and invariants (registration CLOSED, applicants 0, announcement DISABLED)
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
  console.log("=== Running Public Homepage Testimonials API Route Tests ===");

  // 1. Fetch endpoint via HTTP
  console.log("1. Testing GET /api/public/homepage via HTTP...");
  const res = await fetch(`${BACKEND_URL}/api/public/homepage`);
  assert.strictEqual(res.status, 200, `Expected HTTP 200, got ${res.status}`);

  const cacheControl = res.headers.get("cache-control");
  assert.ok(
    cacheControl && cacheControl.includes("s-maxage=60"),
    `Expected cache-control with s-maxage=60, got ${cacheControl}`
  );

  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.ok(json.data, "Response data must exist");

  // 2. Verify backward compatibility of existing fields
  console.log("2. Verifying existing response fields...");
  assert.ok(json.data.hero !== undefined, "Hero must be present in response");
  assert.ok(json.data.principal !== undefined, "Principal must be present in response");
  assert.ok(json.data.principalMessage !== undefined, "PrincipalMessage must be present in response");
  assert.ok(Array.isArray(json.data.statistics), "Statistics must be an array");
  assert.ok(Array.isArray(json.data.highlights), "Highlights must be an array");
  assert.ok(json.data.announcement !== undefined, "Announcement must be present in response");
  assert.ok(Array.isArray(json.data.faqs), "FAQs must be an array");

  // 3. Verify Testimonials DTO
  console.log("3. Verifying Testimonials DTO structure and ordering...");
  assert.ok(
    Array.isArray(json.data.testimonials),
    "testimonials must be an array in public response"
  );
  assert.ok(
    json.data.testimonials.length >= 2,
    `Expected at least 2 testimonials, got ${json.data.testimonials.length}`
  );

  const t0 = json.data.testimonials[0];
  assert.ok(t0.id, "Testimonial must have id");
  assert.ok(t0.author, "Testimonial must have author");
  assert.ok(t0.relationship, "Testimonial must have relationship");
  assert.ok(t0.quote, "Testimonial must have quote");
  assert.strictEqual(typeof t0.rating, "number", "Testimonial must have rating");
  assert.ok(t0.rating >= 1 && t0.rating <= 5, "Rating must be between 1 and 5");
  assert.ok(t0.monogram, "Testimonial must have monogram");
  assert.strictEqual(typeof t0.displayOrder, "number", "Testimonial must have displayOrder");

  // Check that internal fields are NOT leaked
  assert.strictEqual(t0.isPublished, undefined, "isPublished must NOT be leaked");
  assert.strictEqual(t0.createdAt, undefined, "createdAt must NOT be leaked");
  assert.strictEqual(t0.updatedAt, undefined, "updatedAt must NOT be leaked");

  // Verify displayOrder ascending sort
  for (let i = 0; i < json.data.testimonials.length - 1; i++) {
    assert.ok(
      json.data.testimonials[i].displayOrder <=
        json.data.testimonials[i + 1].displayOrder,
      "Testimonials must be sorted by displayOrder asc"
    );
  }

  // 4. Verify Exclusion of Unpublished Testimonials (Draft Isolation)
  console.log("4. Verifying exclusion of unpublished testimonials...");
  const tempDraft = await prisma.homepageTestimonial.create({
    data: {
      author: "[TEST-DRAFT] Unpublished Parent",
      relationship: "Parent of Class X Scholar",
      subject: "Private Feedback",
      quote: "Should not appear in public homepage response.",
      rating: 5,
      monogram: "UP",
      displayOrder: 999,
      isPublished: false,
    },
  });

  try {
    const resDraft = await fetch(`${BACKEND_URL}/api/public/homepage`);
    const jsonDraft = await resDraft.json();
    const found = jsonDraft.data.testimonials.some((t) => t.id === tempDraft.id);
    assert.strictEqual(
      found,
      false,
      "Unpublished testimonial must NOT be returned by public API"
    );
  } finally {
    await prisma.homepageTestimonial.delete({ where: { id: tempDraft.id } });
  }

  // 5. Verify Database Invariants
  console.log("5. Verifying database invariants...");
  const settings = await prisma.admissionRegistrationSetting.findFirst();
  assert.strictEqual(
    settings.isRegistrationOpen,
    false,
    "Registration must remain CLOSED"
  );

  const applicantCount = await prisma.admissionApplication.count();
  assert.strictEqual(applicantCount, 0, "Applicant count must remain 0");

  const ann = await prisma.homepageAnnouncement.findUnique({
    where: { id: "default" },
  });
  assert.strictEqual(ann?.enabled, false, "Announcement must remain DISABLED");

  console.log("✔ All Public Homepage Testimonials API Route Tests Passed Successfully!");
}

runTests()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
