/**
 * Integration Test: Public Homepage API with Announcements & FAQs (Milestone 21)
 *
 * Validates:
 * - GET /api/public/homepage returns HTTP 200 with all existing M3/M10 sections
 * - Returns announcement DTO with enabled: false default
 * - Returns faqs DTO with 6 published items in order
 * - Excludes unpublished FAQs from public API response
 * - Excludes internal administrative timestamps/flags from public DTOs
 * - Ensures cache-control headers and invariants (registration CLOSED, applicants 0)
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
  console.log("=== Running Public Homepage Announcements & FAQs API Route Tests ===");

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

  // 2. Verify backward compatibility of M3/M10 fields
  console.log("2. Verifying existing M3/M10 response fields...");
  assert.ok(json.data.hero !== undefined, "Hero must be present in response");
  assert.ok(json.data.principal !== undefined, "Principal must be present in response");
  assert.ok(Array.isArray(json.data.statistics), "Statistics must be an array");
  assert.ok(Array.isArray(json.data.highlights), "Highlights must be an array");

  // 3. Verify Announcement DTO
  console.log("3. Verifying Announcement DTO structure and default state...");
  assert.ok(json.data.announcement, "Announcement DTO should be present");
  assert.strictEqual(
    json.data.announcement.enabled,
    false,
    "Announcement must be default disabled"
  );
  assert.strictEqual(json.data.announcement.title, "Alumni Meet 2026");
  assert.strictEqual(json.data.announcement.badge, "Special Event");
  assert.strictEqual(json.data.announcement.subtitle, "Reconnect, Relive, Rejoice");
  assert.strictEqual(
    json.data.announcement.imageUrl,
    "/images/announcements/alumni-meet-2026.webp"
  );
  assert.strictEqual(json.data.announcement.linkHref, "/alumni");
  assert.strictEqual(json.data.announcement.linkLabel, "Join the Meet");
  assert.strictEqual(json.data.announcement.delayMs, 3000);
  assert.strictEqual(
    json.data.announcement.dismissalKey,
    "dvp_announcement_dismissed_alumni_meet_2026"
  );
  assert.strictEqual(
    json.data.announcement.createdAt,
    undefined,
    "createdAt must NOT be leaked"
  );
  assert.strictEqual(
    json.data.announcement.updatedAt,
    undefined,
    "updatedAt must NOT be leaked"
  );

  // 4. Verify FAQs DTO
  console.log("4. Verifying FAQs DTO structure and ordering...");
  assert.ok(Array.isArray(json.data.faqs), "faqs must be an array");
  assert.ok(json.data.faqs.length >= 6, `Expected at least 6 FAQs, got ${json.data.faqs.length}`);

  const faq0 = json.data.faqs[0];
  assert.ok(faq0.id, "FAQ must have id");
  assert.ok(faq0.question, "FAQ must have question");
  assert.ok(faq0.answer, "FAQ must have answer");
  assert.strictEqual(typeof faq0.displayOrder, "number", "FAQ must have displayOrder");
  assert.strictEqual(faq0.isPublished, undefined, "isPublished must NOT be leaked");
  assert.strictEqual(faq0.createdAt, undefined, "createdAt must NOT be leaked");
  assert.strictEqual(faq0.updatedAt, undefined, "updatedAt must NOT be leaked");

  // Verify displayOrder ascending sort
  for (let i = 0; i < json.data.faqs.length - 1; i++) {
    assert.ok(
      json.data.faqs[i].displayOrder <= json.data.faqs[i + 1].displayOrder,
      "FAQs must be sorted by displayOrder asc"
    );
  }

  // 5. Verify Exclusion of Unpublished FAQs
  console.log("5. Verifying exclusion of unpublished FAQs...");
  const tempDraftFaq = await prisma.homepageFaq.create({
    data: {
      question: "[TEST-DRAFT] Unpublished FAQ Question?",
      answer: "Should not appear in public homepage response.",
      displayOrder: 999,
      isPublished: false,
    },
  });

  try {
    const resDraft = await fetch(`${BACKEND_URL}/api/public/homepage`);
    const jsonDraft = await resDraft.json();
    const found = jsonDraft.data.faqs.some((f) => f.id === tempDraftFaq.id);
    assert.strictEqual(found, false, "Unpublished FAQ must NOT be returned by public API");
  } finally {
    await prisma.homepageFaq.delete({ where: { id: tempDraftFaq.id } });
  }

  // 6. Verify Database Invariants
  console.log("6. Verifying database invariants...");
  const settings = await prisma.admissionRegistrationSetting.findFirst();
  assert.strictEqual(settings.isRegistrationOpen, false, "Registration must remain CLOSED");

  const applicantCount = await prisma.admissionApplication.count();
  assert.strictEqual(applicantCount, 0, "Applicant count must remain 0");

  console.log("✔ All Public Homepage Announcements & FAQs API Route Tests Passed Successfully!");
}

runTests()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
