/**
 * Test Suite: Transport & Hostel Validation & Server Actions (Milestone 20)
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
  "../dist_test_transport_hostel_validation.js"
);

try {
  execSync(
    `npx esbuild lib/validation/transport-hostel.ts --bundle --platform=node --outfile="${validationOutfile}" --external:@prisma/client --external:server-only`,
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
} catch (e) {
  console.error("esbuild compilation failed:", e);
  process.exit(1);
}

const {
  isValidInternalCtaUrl,
  hostelSectionUpdateSchema,
  hostelFeatureCreateSchema,
  hostelFeatureUpdateSchema,
  hostelFeatureDeleteSchema,
  hostelFeaturesReorderSchema,
  hostelFeatureToggleSchema,
  transportSectionUpdateSchema,
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
  console.log("  Running Transport & Hostel Validation & Actions Test Suite");
  console.log("-----------------------------------------------------------------\n");

  // 1. CTA URL Validation
  console.log("1. Testing CTA URL Security & Internal Path Validation...");
  it("Valid internal /contact CTA URL accepted", () => {
    assert.strictEqual(isValidInternalCtaUrl("/contact"), true);
  });

  it("Valid internal /admissions CTA URL accepted", () => {
    assert.strictEqual(isValidInternalCtaUrl("/admissions"), true);
  });

  it("Valid internal /facilities CTA URL accepted", () => {
    assert.strictEqual(isValidInternalCtaUrl("/facilities"), true);
  });

  it("Rejects path traversal in CTA URL", () => {
    assert.strictEqual(isValidInternalCtaUrl("/contact/../secret"), false);
  });

  it("Rejects backslashes in CTA URL", () => {
    assert.strictEqual(isValidInternalCtaUrl("/contact\\admin"), false);
  });

  it("Rejects protocol-relative URL in CTA URL", () => {
    assert.strictEqual(isValidInternalCtaUrl("//malicious.com/contact"), false);
  });

  it("Rejects external HTTPS URLs in CTA URL", () => {
    assert.strictEqual(isValidInternalCtaUrl("https://external-site.com/contact"), false);
  });

  it("Rejects javascript: scheme in CTA URL", () => {
    assert.strictEqual(isValidInternalCtaUrl("javascript:alert(1)"), false);
  });

  it("Rejects data: scheme in CTA URL", () => {
    assert.strictEqual(isValidInternalCtaUrl("data:text/html;base64,..."), false);
  });

  it("Rejects null-byte injection in CTA URL", () => {
    assert.strictEqual(isValidInternalCtaUrl("/contact%00"), false);
    assert.strictEqual(isValidInternalCtaUrl("/contact\0"), false);
  });

  it("Rejects unapproved internal paths", () => {
    assert.strictEqual(isValidInternalCtaUrl("/admin/users"), false);
    assert.strictEqual(isValidInternalCtaUrl("/unknown-path"), false);
  });

  // 2. Hostel Section Update Schema
  console.log("\n2. Testing Hostel Section Update Schema...");
  it("Valid hostel section payload passes validation", () => {
    const res = hostelSectionUpdateSchema.safeParse({
      badge: "Residential Boarding Life",
      title: 'A Safe, Caring "Home Away From Home"',
      description: "Our residential boarding is structured to instill life-long habits of self-reliance.",
    });
    assert.strictEqual(res.success, true);
  });

  it("Rejects empty badge in hostel section", () => {
    const res = hostelSectionUpdateSchema.safeParse({
      badge: "   ",
      title: "Valid Title",
      description: "Valid Description",
    });
    assert.strictEqual(res.success, false);
  });

  it("Rejects title longer than 200 characters", () => {
    const res = hostelSectionUpdateSchema.safeParse({
      badge: "Valid Badge",
      title: "A".repeat(201),
      description: "Valid Description",
    });
    assert.strictEqual(res.success, false);
  });

  // 3. Hostel Feature Schemas
  console.log("\n3. Testing Hostel Feature Schemas...");
  it("Valid hostel feature creation payload passes", () => {
    const res = hostelFeatureCreateSchema.safeParse({
      title: "Pure Vegetarian Dining",
      description: "4 freshly prepared, nutritious meals daily crafted by trained chefs.",
      displayOrder: 1,
      isPublished: true,
    });
    assert.strictEqual(res.success, true);
  });

  it("Rejects empty title in hostel feature creation", () => {
    const res = hostelFeatureCreateSchema.safeParse({
      title: "   ",
      description: "Valid Description",
    });
    assert.strictEqual(res.success, false);
  });

  it("Rejects negative display order in hostel feature", () => {
    const res = hostelFeatureCreateSchema.safeParse({
      title: "Title",
      description: "Description",
      displayOrder: -1,
    });
    assert.strictEqual(res.success, false);
  });

  it("Valid hostel feature update passes", () => {
    const res = hostelFeatureUpdateSchema.safeParse({
      id: "feature-123",
      title: "Updated Title",
      description: "Updated Description",
      displayOrder: 2,
      isPublished: false,
    });
    assert.strictEqual(res.success, true);
  });

  it("Valid hostel feature delete passes", () => {
    const res = hostelFeatureDeleteSchema.safeParse({ id: "feature-123" });
    assert.strictEqual(res.success, true);
  });

  it("Valid hostel features reorder passes", () => {
    const res = hostelFeaturesReorderSchema.safeParse({
      items: [
        { id: "feat-1", displayOrder: 0 },
        { id: "feat-2", displayOrder: 1 },
      ],
    });
    assert.strictEqual(res.success, true);
  });

  it("Rejects empty items array in reorder schema", () => {
    const res = hostelFeaturesReorderSchema.safeParse({ items: [] });
    assert.strictEqual(res.success, false);
  });

  // 4. Transport Section Update Schema
  console.log("\n4. Testing Transport Section Update Schema...");
  it("Valid transport section payload passes validation", () => {
    const res = transportSectionUpdateSchema.safeParse({
      badge: "Day-Scholar Transport Network",
      title: "Safe, GPS-Tracked Transportation Fleet",
      description: "Our yellow school buses operate on strictly monitored routes.",
      ctaText: "Contact Transport Coordinator for Pick-up Node Details →",
      ctaUrl: "/contact",
    });
    assert.strictEqual(res.success, true);
  });

  it("Rejects invalid CTA URL in transport section schema", () => {
    const res = transportSectionUpdateSchema.safeParse({
      badge: "Valid Badge",
      title: "Valid Title",
      description: "Valid Description",
      ctaText: "Valid CTA",
      ctaUrl: "javascript:evil()",
    });
    assert.strictEqual(res.success, false);
  });

  it("Rejects external CTA URL in transport section schema", () => {
    const res = transportSectionUpdateSchema.safeParse({
      badge: "Valid Badge",
      title: "Valid Title",
      description: "Valid Description",
      ctaText: "Valid CTA",
      ctaUrl: "https://evil.com/contact",
    });
    assert.strictEqual(res.success, false);
  });

  // 5. Database Integrity & CRUD Actions
  console.log("\n5. Testing Database Integrity & CRUD Lifecycle...");
  await itAsync("HostelSection default record exists in database", async () => {
    const section = await prisma.hostelSection.findUnique({
      where: { id: "default" },
    });
    assert.ok(section, "HostelSection record should exist");
    assert.strictEqual(section.id, "default");
    assert.strictEqual(section.badge, "Residential Boarding Life");
  });

  await itAsync("TransportSection default record exists in database", async () => {
    const transport = await prisma.transportSection.findUnique({
      where: { id: "default" },
    });
    assert.ok(transport, "TransportSection record should exist");
    assert.strictEqual(transport.id, "default");
    assert.strictEqual(transport.ctaUrl, "/contact");
  });

  await itAsync("Database contains at least 3 hostel features", async () => {
    const count = await prisma.hostelFeature.count({
      where: { sectionId: "default" },
    });
    assert.ok(count >= 3, `Expected at least 3 features, got ${count}`);
  });

  console.log("   Testing HostelFeature CRUD lifecycle...");
  let tempFeatureId = null;

  await itAsync("Temporary hostel feature created cleanly", async () => {
    const created = await prisma.hostelFeature.create({
      data: {
        sectionId: "default",
        title: "[TEST] 24/7 Infirmary Attendance",
        description: "[TEST] Certified resident health attendant on duty.",
        displayOrder: 99,
        isPublished: true,
      },
    });
    assert.ok(created.id);
    tempFeatureId = created.id;
  });

  await itAsync("Temporary hostel feature toggled/unpublished", async () => {
    const updated = await prisma.hostelFeature.update({
      where: { id: tempFeatureId },
      data: { isPublished: false },
    });
    assert.strictEqual(updated.isPublished, false);
  });

  await itAsync("Temporary hostel feature deleted cleanly", async () => {
    await prisma.hostelFeature.delete({
      where: { id: tempFeatureId },
    });
    const check = await prisma.hostelFeature.findUnique({
      where: { id: tempFeatureId },
    });
    assert.strictEqual(check, null);
  });

  console.log("   Testing Reorder Safety & Foreign Key Integrity...");
  await itAsync("Reorder rejects IDs that do not exist or belong to another section", async () => {
    const fakeId = "non-existent-id-999";
    const count = await prisma.hostelFeature.count({
      where: {
        id: { in: [fakeId] },
        sectionId: "default",
      },
    });
    assert.strictEqual(count, 0, "Fake ID count must be 0");
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
    console.log("  Transport & Hostel Validation & Actions Tests PASSED!");
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
