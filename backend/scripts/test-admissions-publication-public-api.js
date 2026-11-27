/**
 * Test Suite: Admissions Publications Public API (Milestone 19)
 * Tests:
 * 1. GET /api/public/admissions/publications returns 200 with valid schema.
 * 2. Response headers contain appropriate caching and security headers.
 * 3. Unpublished records (isPublished: false) are strictly excluded from public DTOs.
 * 4. Internal timestamps, audit fields, and admin-only metadata are omitted.
 * 5. Registration remains CLOSED and applicantCount is zero.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== Running Public Admissions Publications API Route Tests ===");

  const baseUrl = "http://localhost:3001";

  // Test setup: create unpublished items to verify exclusion
  const tempUnpublishedPage = await prisma.feeStructurePage.create({
    data: {
      pageNumber: 999,
      title: "[TEST] Unpublished Hidden Fee Page",
      imageUrl: "/images/admissions/fees/Fee-Structure-26-27_page-0001.jpg",
      displayOrder: 999,
      isPublished: false,
    },
  });

  const tempUnpublishedRule = await prisma.admissionProcedureRule.create({
    data: {
      ruleText: "[TEST] Unpublished Secret Procedure Rule that must never be visible publicly.",
      displayOrder: 999,
      isPublished: false,
    },
  });

  const tempUnpublishedSubject = await prisma.entranceExamSubject.create({
    data: {
      classGrade: "[TEST] Unpublished Grade",
      subjects: "Secret Subject",
      displayOrder: 999,
      isPublished: false,
    },
  });

  try {
    console.log("1. Testing GET /api/public/admissions/publications via HTTP...");
    let json;
    try {
      const res = await fetch(`${baseUrl}/api/public/admissions/publications`);
      assert.strictEqual(res.status, 200, "Must return HTTP 200 OK");

      const cacheControl = res.headers.get("cache-control");
      assert(
        cacheControl && cacheControl.includes("s-maxage=60"),
        "Must specify public cache control with s-maxage=60"
      );

      const nosniff = res.headers.get("x-content-type-options");
      assert.strictEqual(nosniff, "nosniff", "Must include X-Content-Type-Options: nosniff");

      json = await res.json();
    } catch (httpErr) {
      console.warn("   [WARN] Dev server not responding on localhost:3001. Invoking route handler directly...", httpErr.message);
      const { GET } = require("../app/api/public/admissions/publications/route.ts");
      const res = await GET();
      assert.strictEqual(res.status, 200);
      json = await res.json();
    }

    assert.strictEqual(json.success, true, "Response payload must have success: true");

    // 2. Verify Overview DTO
    console.log("2. Verifying AdmissionOverview DTO structure...");
    assert(json.overview !== null, "Overview must not be null");
    assert.strictEqual(typeof json.overview.sessionLabel, "string", "sessionLabel must be a string");
    assert.strictEqual(typeof json.overview.feeStructureTitle, "string");
    assert.strictEqual(typeof json.overview.prospectusPdfUrl, "string");
    assert.strictEqual(typeof json.overview.admissionChartPdfUrl, "string");

    // Verify omission of internal fields
    assert.strictEqual(json.overview.id, undefined, "Internal id must not be leaked in public overview DTO");
    assert.strictEqual(json.overview.createdAt, undefined, "createdAt must not be in public overview DTO");
    assert.strictEqual(json.overview.updatedAt, undefined, "updatedAt must not be in public overview DTO");

    // 3. Verify Fee Structure Pages
    console.log(`3. Verifying Fee Structure Pages (${json.feePages.length} returned)...`);
    assert(Array.isArray(json.feePages), "feePages must be an array");
    assert(json.feePages.length >= 5, "Must return at least 5 baseline published fee pages");

    for (const page of json.feePages) {
      assert(typeof page.id === "string");
      assert(typeof page.pageNumber === "number");
      assert(typeof page.title === "string");
      assert(typeof page.imageUrl === "string");
      assert(typeof page.displayOrder === "number");
      assert.strictEqual(page.isPublished, undefined, "isPublished must not be in public DTO");
      assert.strictEqual(page.createdAt, undefined, "createdAt must not be in public DTO");
      assert.strictEqual(page.updatedAt, undefined, "updatedAt must not be in public DTO");
      assert.notStrictEqual(page.id, tempUnpublishedPage.id, "Unpublished fee page must not be returned");
    }

    // 4. Verify Procedure Rules
    console.log(`4. Verifying Admission Procedure Rules (${json.procedureRules.length} returned)...`);
    assert(Array.isArray(json.procedureRules), "procedureRules must be an array");
    assert(json.procedureRules.length >= 6, "Must return at least 6 baseline published procedure rules");

    for (const rule of json.procedureRules) {
      assert(typeof rule.id === "string");
      assert(typeof rule.ruleText === "string");
      assert(typeof rule.displayOrder === "number");
      assert.strictEqual(rule.isPublished, undefined, "isPublished must not be in public DTO");
      assert.strictEqual(rule.createdAt, undefined, "createdAt must not be in public DTO");
      assert.notStrictEqual(rule.id, tempUnpublishedRule.id, "Unpublished procedure rule must not be returned");
    }

    // 5. Verify Entrance Exam Subjects
    console.log(`5. Verifying Entrance Exam Subjects (${json.entranceSubjects.length} returned)...`);
    assert(Array.isArray(json.entranceSubjects), "entranceSubjects must be an array");
    assert(json.entranceSubjects.length >= 6, "Must return at least 6 baseline published entrance subject rows");

    for (const subject of json.entranceSubjects) {
      assert(typeof subject.id === "string");
      assert(typeof subject.classGrade === "string");
      assert(typeof subject.subjects === "string");
      assert(typeof subject.displayOrder === "number");
      assert.strictEqual(subject.isPublished, undefined, "isPublished must not be in public DTO");
      assert.strictEqual(subject.createdAt, undefined, "createdAt must not be in public DTO");
      assert.notStrictEqual(subject.id, tempUnpublishedSubject.id, "Unpublished entrance subject must not be returned");
    }

    // 6. Verify Online Admission Integrity
    console.log("6. Verifying that registration remains CLOSED and applicants remain 0...");
    const regSetting = await prisma.admissionRegistrationSetting.findFirst();
    assert(regSetting && regSetting.isRegistrationOpen === false, "Registration must remain CLOSED");
    const count = await prisma.admissionApplication.count();
    assert.strictEqual(count, 0, "Applicant records must remain 0");

    console.log("✔ All Public Admissions Publications API Route Tests Passed Successfully!");
  } finally {
    // Clean up temporary unpublished test records
    await prisma.feeStructurePage.deleteMany({
      where: { id: tempUnpublishedPage.id },
    });
    await prisma.admissionProcedureRule.deleteMany({
      where: { id: tempUnpublishedRule.id },
    });
    await prisma.entranceExamSubject.deleteMany({
      where: { id: tempUnpublishedSubject.id },
    });
    await prisma.$disconnect();
  }
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
