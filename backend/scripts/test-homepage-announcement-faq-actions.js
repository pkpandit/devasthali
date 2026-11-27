/**
 * Test Suite: Homepage Announcement & FAQs Validation & Actions (Milestone 21)
 */

/* eslint-disable @typescript-eslint/no-require-imports */
require.cache[require.resolve("server-only")] = { exports: {} };

const path = require("path");
const fs = require("fs");
const assert = require("assert");
const { execSync } = require("child_process");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const validationOutfile = path.resolve(
  __dirname,
  "../dist_test_homepage_announcement_faq_validation.js"
);

try {
  execSync(
    `npx esbuild lib/validation/homepage-announcement-faq.ts --bundle --platform=node --outfile="${validationOutfile}" --external:@prisma/client --external:server-only`,
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
} catch (e) {
  console.error("esbuild compilation failed:", e);
  process.exit(1);
}

const {
  isValidAnnouncementImageUrl,
  isValidAnnouncementCtaUrl,
  homepageAnnouncementUpdateSchema,
  homepageFaqCreateSchema,
  homepageFaqUpdateSchema,
  homepageFaqDeleteSchema,
  homepageFaqsReorderSchema,
  homepageFaqToggleSchema,
} = require(validationOutfile);

let total = 0;
let passed = 0;

function it(desc, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  [PASS] ${desc}`);
  } catch (err) {
    console.error(`  [FAIL] ${desc}`);
    console.error(err);
    process.exit(1);
  }
}

async function itAsync(desc, fn) {
  total++;
  try {
    await fn();
    passed++;
    console.log(`  [PASS] ${desc}`);
  } catch (err) {
    console.error(`  [FAIL] ${desc}`);
    console.error(err);
    process.exit(1);
  }
}

async function runTests() {
  console.log("-----------------------------------------------------------------");
  console.log("  Running Homepage Announcement & FAQs Validation & Actions Suite");
  console.log("-----------------------------------------------------------------\n");

  // 1. Static Image Path Validation
  console.log("1. Testing Announcement Image Path Validation & Security...");
  it("Valid static announcement webp image path accepted", () => {
    assert.strictEqual(
      isValidAnnouncementImageUrl("/images/announcements/alumni-meet-2026.webp"),
      true
    );
  });

  it("Valid static announcement jpg/png image path accepted", () => {
    assert.strictEqual(
      isValidAnnouncementImageUrl("/images/announcements/poster.jpg"),
      true
    );
    assert.strictEqual(
      isValidAnnouncementImageUrl("/images/announcements/event-banner.png"),
      true
    );
  });

  it("Rejects traversal in image path", () => {
    assert.strictEqual(
      isValidAnnouncementImageUrl("/images/announcements/../uploads/photo.jpg"),
      false
    );
  });

  it("Rejects backslash in image path", () => {
    assert.strictEqual(
      isValidAnnouncementImageUrl("/images/announcements\\photo.webp"),
      false
    );
  });

  it("Rejects protocol-relative or external URL in image path", () => {
    assert.strictEqual(
      isValidAnnouncementImageUrl("https://evil.com/image.png"),
      false
    );
    assert.strictEqual(
      isValidAnnouncementImageUrl("//evil.com/images/announcements/photo.webp"),
      false
    );
  });

  it("Rejects non-announcements directory", () => {
    assert.strictEqual(
      isValidAnnouncementImageUrl("/images/faculty/teacher.jpg"),
      false
    );
  });

  it("Rejects dangerous file extensions", () => {
    assert.strictEqual(
      isValidAnnouncementImageUrl("/images/announcements/script.svg"),
      false
    );
    assert.strictEqual(
      isValidAnnouncementImageUrl("/images/announcements/payload.html"),
      false
    );
  });

  it("Rejects null-byte injection in image path", () => {
    assert.strictEqual(
      isValidAnnouncementImageUrl("/images/announcements/alumni-meet-2026.webp\0"),
      false
    );
    assert.strictEqual(
      isValidAnnouncementImageUrl("/images/announcements/alumni-meet-2026.webp%00"),
      false
    );
  });

  // 2. Announcement CTA URL Validation
  console.log("\n2. Testing Announcement CTA Target Security & Allowlist...");
  it("Approved internal path /alumni accepted", () => {
    assert.strictEqual(isValidAnnouncementCtaUrl("/alumni"), true);
  });

  it("Approved internal path /admissions accepted", () => {
    assert.strictEqual(isValidAnnouncementCtaUrl("/admissions"), true);
  });

  it("Approved internal path /contact accepted", () => {
    assert.strictEqual(isValidAnnouncementCtaUrl("/contact"), true);
  });

  it("Approved internal path /notices accepted", () => {
    assert.strictEqual(isValidAnnouncementCtaUrl("/notices"), true);
  });

  it("Approved internal path /facilities accepted", () => {
    assert.strictEqual(isValidAnnouncementCtaUrl("/facilities"), true);
  });

  it("Rejects path traversal in CTA target", () => {
    assert.strictEqual(isValidAnnouncementCtaUrl("/alumni/../admin"), false);
  });

  it("Rejects backslashes in CTA target", () => {
    assert.strictEqual(isValidAnnouncementCtaUrl("/alumni\\secret"), false);
  });

  it("Rejects javascript: scheme in CTA target", () => {
    assert.strictEqual(isValidAnnouncementCtaUrl("javascript:alert(1)"), false);
  });

  it("Rejects external URLs in CTA target", () => {
    assert.strictEqual(isValidAnnouncementCtaUrl("https://external.com"), false);
  });

  it("Rejects unapproved internal paths", () => {
    assert.strictEqual(isValidAnnouncementCtaUrl("/dashboard"), false);
    assert.strictEqual(isValidAnnouncementCtaUrl("/admin/homepage"), false);
  });

  // 3. Homepage Announcement Update Schema
  console.log("\n3. Testing Homepage Announcement Update Schema...");
  it("Valid announcement payload passes validation", () => {
    const res = homepageAnnouncementUpdateSchema.safeParse({
      enabled: false,
      title: "Alumni Meet 2026",
      badge: "Special Event",
      subtitle: "Reconnect, Relive, Rejoice",
      imageUrl: "/images/announcements/alumni-meet-2026.webp",
      imageAlt: "Devasthaly Vidyapeeth Alumni Meet 2026 Official Poster",
      linkHref: "/alumni",
      linkLabel: "Join the Meet",
      delayMs: 3000,
      dismissalKey: "dvp_announcement_dismissed_alumni_meet_2026",
    });
    assert.strictEqual(res.success, true);
  });

  it("Rejects empty title in announcement", () => {
    const res = homepageAnnouncementUpdateSchema.safeParse({
      enabled: true,
      title: "   ",
      imageUrl: "/images/announcements/alumni-meet-2026.webp",
      imageAlt: "Alt",
      linkHref: "/alumni",
      linkLabel: "Join",
      delayMs: 3000,
      dismissalKey: "test_key",
    });
    assert.strictEqual(res.success, false);
  });

  it("Rejects negative delayMs or delayMs > 30000", () => {
    const resNegative = homepageAnnouncementUpdateSchema.safeParse({
      enabled: true,
      title: "Title",
      imageUrl: "/images/announcements/alumni-meet-2026.webp",
      imageAlt: "Alt",
      linkHref: "/alumni",
      linkLabel: "Join",
      delayMs: -100,
      dismissalKey: "test_key",
    });
    assert.strictEqual(resNegative.success, false);

    const resTooLarge = homepageAnnouncementUpdateSchema.safeParse({
      enabled: true,
      title: "Title",
      imageUrl: "/images/announcements/alumni-meet-2026.webp",
      imageAlt: "Alt",
      linkHref: "/alumni",
      linkLabel: "Join",
      delayMs: 35000,
      dismissalKey: "test_key",
    });
    assert.strictEqual(resTooLarge.success, false);
  });

  it("Rejects invalid dismissalKey characters", () => {
    const res = homepageAnnouncementUpdateSchema.safeParse({
      enabled: true,
      title: "Title",
      imageUrl: "/images/announcements/alumni-meet-2026.webp",
      imageAlt: "Alt",
      linkHref: "/alumni",
      linkLabel: "Join",
      delayMs: 3000,
      dismissalKey: "invalid key with spaces!",
    });
    assert.strictEqual(res.success, false);
  });

  // 4. Homepage FAQ Schemas
  console.log("\n4. Testing Homepage FAQ Schemas...");
  it("Valid FAQ creation payload passes", () => {
    const res = homepageFaqCreateSchema.safeParse({
      question: "What is the procedure for admission?",
      answer: "Submit an online enquiry or visit the school office.",
      displayOrder: 1,
      isPublished: true,
    });
    assert.strictEqual(res.success, true);
  });

  it("Rejects empty question or answer", () => {
    const res = homepageFaqCreateSchema.safeParse({
      question: "   ",
      answer: "Valid answer",
    });
    assert.strictEqual(res.success, false);

    const res2 = homepageFaqCreateSchema.safeParse({
      question: "Valid question",
      answer: "   ",
    });
    assert.strictEqual(res2.success, false);
  });

  it("Rejects question longer than 300 characters", () => {
    const res = homepageFaqCreateSchema.safeParse({
      question: "Q".repeat(301),
      answer: "Valid answer",
    });
    assert.strictEqual(res.success, false);
  });

  it("Valid FAQ update passes", () => {
    const res = homepageFaqUpdateSchema.safeParse({
      id: "faq-123",
      question: "Updated question?",
      answer: "Updated answer.",
      displayOrder: 2,
      isPublished: false,
    });
    assert.strictEqual(res.success, true);
  });

  it("Valid FAQ delete and toggle schemas pass", () => {
    assert.strictEqual(homepageFaqDeleteSchema.safeParse({ id: "faq-1" }).success, true);
    assert.strictEqual(homepageFaqToggleSchema.safeParse({ id: "faq-1" }).success, true);
  });

  it("Reorder schema rejects duplicate IDs in input list", () => {
    const res = homepageFaqsReorderSchema.safeParse({
      items: [
        { id: "faq-1", displayOrder: 0 },
        { id: "faq-1", displayOrder: 1 },
      ],
    });
    assert.strictEqual(res.success, false);
  });

  // 5. Database Integrity & CRUD Actions
  console.log("\n5. Testing Database Integrity & CRUD Lifecycle...");
  await itAsync("HomepageAnnouncement default record exists and enabled is false", async () => {
    const ann = await prisma.homepageAnnouncement.findUnique({
      where: { id: "default" },
    });
    assert.ok(ann, "HomepageAnnouncement record should exist");
    assert.strictEqual(ann.id, "default");
    assert.strictEqual(ann.enabled, false);
    assert.strictEqual(ann.title, "Alumni Meet 2026");
    assert.strictEqual(ann.imageUrl, "/images/announcements/alumni-meet-2026.webp");
  });

  await itAsync("Database contains at least 6 homepage FAQs", async () => {
    const count = await prisma.homepageFaq.count();
    assert.ok(count >= 6, `Expected at least 6 FAQs, found ${count}`);
  });

  console.log("   Testing HomepageFaq CRUD lifecycle...");
  let tempFaqId = null;

  await itAsync("Temporary FAQ created cleanly", async () => {
    const created = await prisma.homepageFaq.create({
      data: {
        question: "[TEST] Are school uniforms provided?",
        answer: "[TEST] Uniform sets are distributed at orientation.",
        displayOrder: 99,
        isPublished: true,
      },
    });
    assert.ok(created.id);
    tempFaqId = created.id;
  });

  await itAsync("Temporary FAQ updated", async () => {
    const updated = await prisma.homepageFaq.update({
      where: { id: tempFaqId },
      data: {
        answer: "[TEST] Uniform sets are distributed at orientation and counter.",
      },
    });
    assert.strictEqual(
      updated.answer,
      "[TEST] Uniform sets are distributed at orientation and counter."
    );
  });

  await itAsync("Temporary FAQ toggled / unpublished", async () => {
    const updated = await prisma.homepageFaq.update({
      where: { id: tempFaqId },
      data: { isPublished: false },
    });
    assert.strictEqual(updated.isPublished, false);
  });

  await itAsync("Temporary FAQ deleted cleanly", async () => {
    await prisma.homepageFaq.delete({
      where: { id: tempFaqId },
    });
    const check = await prisma.homepageFaq.findUnique({
      where: { id: tempFaqId },
    });
    assert.strictEqual(check, null);
  });

  await itAsync("Online registration remains strictly CLOSED", async () => {
    const settings = await prisma.admissionRegistrationSetting.findFirst();
    assert.strictEqual(settings.isRegistrationOpen, false);
  });

  await itAsync("Applicant records remain zero", async () => {
    const count = await prisma.admissionApplication.count();
    assert.strictEqual(count, 0, `Expected 0 applicants, found ${count}`);
  });

  console.log(`\n  All tests passed: ${passed}/${total}`);
}

runTests()
  .then(() => {
    console.log("-----------------------------------------------------------------");
    console.log("  Homepage Announcement & FAQs Validation & Actions Tests PASSED!");
    console.log("-----------------------------------------------------------------");
  })
  .catch((err) => {
    console.error("  [ERROR] Test suite failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    try {
      if (fs.existsSync(validationOutfile)) fs.unlinkSync(validationOutfile);
    } catch {}
    await prisma.$disconnect();
  });
