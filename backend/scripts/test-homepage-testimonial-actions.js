/**
 * Test Suite: Homepage Testimonials Validation & Actions (Milestone 22)
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
  "../dist_test_homepage_testimonial_validation.js"
);

try {
  execSync(
    `npx esbuild lib/validation/homepage-testimonial.ts --bundle --platform=node --outfile="${validationOutfile}" --external:@prisma/client --external:server-only`,
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
} catch (e) {
  console.error("esbuild compilation failed:", e);
  process.exit(1);
}

const {
  isValidTestimonialAvatarUrl,
  homepageTestimonialCreateSchema,
  homepageTestimonialUpdateSchema,
  homepageTestimonialDeleteSchema,
  homepageTestimonialsReorderSchema,
  homepageTestimonialToggleSchema,
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
  console.log("  Running Homepage Testimonials Validation & Actions Test Suite");
  console.log("-----------------------------------------------------------------\n");

  // 1. Avatar URL Security
  console.log("1. Testing Testimonial Avatar URL Validation & Security...");
  it("Valid static avatar webp/jpg image path accepted", () => {
    assert.strictEqual(
      isValidTestimonialAvatarUrl("/images/about/campus-showcase.jpg"),
      true
    );
    assert.strictEqual(
      isValidTestimonialAvatarUrl("/images/testimonials/parent-rajesh.webp"),
      true
    );
  });

  it("Rejects traversal in avatar path", () => {
    assert.strictEqual(
      isValidTestimonialAvatarUrl("/images/testimonials/../uploads/photo.jpg"),
      false
    );
  });

  it("Rejects backslash in avatar path", () => {
    assert.strictEqual(
      isValidTestimonialAvatarUrl("/images/testimonials\\photo.webp"),
      false
    );
  });

  it("Rejects external HTTPS URLs in avatar path", () => {
    assert.strictEqual(
      isValidTestimonialAvatarUrl("https://evil.com/avatar.jpg"),
      false
    );
  });

  it("Rejects non-images directory", () => {
    assert.strictEqual(
      isValidTestimonialAvatarUrl("/uploads/avatars/user.jpg"),
      false
    );
  });

  it("Rejects dangerous file extensions", () => {
    assert.strictEqual(
      isValidTestimonialAvatarUrl("/images/testimonials/script.svg"),
      false
    );
    assert.strictEqual(
      isValidTestimonialAvatarUrl("/images/testimonials/payload.html"),
      false
    );
  });

  it("Rejects null-byte injection in avatar path", () => {
    assert.strictEqual(
      isValidTestimonialAvatarUrl("/images/testimonials/photo.webp\0"),
      false
    );
    assert.strictEqual(
      isValidTestimonialAvatarUrl("/images/testimonials/photo.webp%00"),
      false
    );
  });

  // 2. Homepage Testimonial Create Schema
  console.log("\n2. Testing Homepage Testimonial Create Schema...");
  it("Valid testimonial payload passes validation", () => {
    const res = homepageTestimonialCreateSchema.safeParse({
      author: "Shri Rajeshwar Tiwari",
      relationship: "Parent of Class IX Boarding Scholar • Rasra",
      subject: "Residential Care & Academic Discipline",
      quote: "Enrolling our son in Devasthaly was the best decision for his discipline.",
      rating: 5,
      monogram: "RT",
      displayOrder: 0,
      isPublished: true,
    });
    assert.strictEqual(res.success, true);
  });

  it("Rejects empty author or relationship", () => {
    const res1 = homepageTestimonialCreateSchema.safeParse({
      author: "   ",
      relationship: "Parent",
      quote: "Valid quote",
    });
    assert.strictEqual(res1.success, false);

    const res2 = homepageTestimonialCreateSchema.safeParse({
      author: "Valid Author",
      relationship: "   ",
      quote: "Valid quote",
    });
    assert.strictEqual(res2.success, false);
  });

  it("Rejects empty quote", () => {
    const res = homepageTestimonialCreateSchema.safeParse({
      author: "Author",
      relationship: "Relationship",
      quote: "   ",
    });
    assert.strictEqual(res.success, false);
  });

  it("Rejects rating less than 1 or greater than 5", () => {
    const res0 = homepageTestimonialCreateSchema.safeParse({
      author: "Author",
      relationship: "Parent",
      quote: "Quote",
      rating: 0,
    });
    assert.strictEqual(res0.success, false);

    const res6 = homepageTestimonialCreateSchema.safeParse({
      author: "Author",
      relationship: "Parent",
      quote: "Quote",
      rating: 6,
    });
    assert.strictEqual(res6.success, false);

    const resNonInt = homepageTestimonialCreateSchema.safeParse({
      author: "Author",
      relationship: "Parent",
      quote: "Quote",
      rating: 4.5,
    });
    assert.strictEqual(resNonInt.success, false);
  });

  it("Rejects author > 150 chars or quote > 3000 chars", () => {
    const resAuthor = homepageTestimonialCreateSchema.safeParse({
      author: "A".repeat(151),
      relationship: "Parent",
      quote: "Quote",
    });
    assert.strictEqual(resAuthor.success, false);

    const resQuote = homepageTestimonialCreateSchema.safeParse({
      author: "Author",
      relationship: "Parent",
      quote: "Q".repeat(3001),
    });
    assert.strictEqual(resQuote.success, false);
  });

  // 3. Homepage Testimonial Update Schema
  console.log("\n3. Testing Homepage Testimonial Update Schema...");
  it("Valid testimonial update passes", () => {
    const res = homepageTestimonialUpdateSchema.safeParse({
      id: "test-123",
      author: "Dr. Sunita Pandey",
      relationship: "Parent of Class VI Day-Scholar",
      quote: "Updated quote content.",
      rating: 5,
      monogram: "SP",
      displayOrder: 1,
      isPublished: true,
    });
    assert.strictEqual(res.success, true);
  });

  it("Rejects empty id in update schema", () => {
    const res = homepageTestimonialUpdateSchema.safeParse({
      id: "   ",
      author: "Author",
      relationship: "Parent",
      quote: "Quote",
    });
    assert.strictEqual(res.success, false);
  });

  // 4. Delete, Toggle and Reorder Schemas
  console.log("\n4. Testing Delete, Toggle & Reorder Schemas...");
  it("Valid delete and toggle schemas pass", () => {
    assert.strictEqual(
      homepageTestimonialDeleteSchema.safeParse({ id: "t-1" }).success,
      true
    );
    assert.strictEqual(
      homepageTestimonialToggleSchema.safeParse({ id: "t-1" }).success,
      true
    );
  });

  it("Reorder schema rejects empty list and duplicate IDs", () => {
    assert.strictEqual(
      homepageTestimonialsReorderSchema.safeParse({ items: [] }).success,
      false
    );
    assert.strictEqual(
      homepageTestimonialsReorderSchema.safeParse({
        items: [
          { id: "t-1", displayOrder: 0 },
          { id: "t-1", displayOrder: 1 },
        ],
      }).success,
      false
    );
  });

  // 5. Database Integrity & CRUD Actions
  console.log("\n5. Testing Database Integrity & CRUD Lifecycle...");
  await itAsync("Database contains at least 2 seeded testimonials", async () => {
    const count = await prisma.homepageTestimonial.count();
    assert.ok(count >= 2, `Expected at least 2 testimonials, found ${count}`);
  });

  console.log("   Testing HomepageTestimonial CRUD lifecycle...");
  let tempId = null;

  await itAsync("Temporary testimonial created cleanly", async () => {
    const created = await prisma.homepageTestimonial.create({
      data: {
        author: "[TEST] Alok Verma",
        relationship: "Parent of Class VIII Scholar",
        subject: "Holistic Development",
        quote: "Wonderful attention to students.",
        rating: 5,
        monogram: "AV",
        displayOrder: 99,
        isPublished: true,
      },
    });
    assert.ok(created.id);
    tempId = created.id;
  });

  await itAsync("Temporary testimonial updated", async () => {
    const updated = await prisma.homepageTestimonial.update({
      where: { id: tempId },
      data: {
        quote: "Updated wonderful attention to students.",
      },
    });
    assert.strictEqual(updated.quote, "Updated wonderful attention to students.");
  });

  await itAsync("Temporary testimonial toggled / unpublished", async () => {
    const updated = await prisma.homepageTestimonial.update({
      where: { id: tempId },
      data: { isPublished: false },
    });
    assert.strictEqual(updated.isPublished, false);
  });

  await itAsync("Temporary testimonial deleted cleanly", async () => {
    await prisma.homepageTestimonial.delete({
      where: { id: tempId },
    });
    const check = await prisma.homepageTestimonial.findUnique({
      where: { id: tempId },
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

  await itAsync("Homepage announcement remains disabled", async () => {
    const ann = await prisma.homepageAnnouncement.findUnique({
      where: { id: "default" },
    });
    assert.strictEqual(ann?.enabled, false);
  });

  console.log(`\n  All tests passed: ${passed}/${total}`);
}

runTests()
  .then(() => {
    console.log("-----------------------------------------------------------------");
    console.log("  Homepage Testimonials Validation & Actions Tests PASSED!");
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
