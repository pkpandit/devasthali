/**
 * Test Suite: Admissions Publications Validation & Actions (Milestone 19)
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

const validationOutfile = path.resolve(
  __dirname,
  "../dist_test_admissions_publication_validation.js"
);

try {
  execSync(
    `npx esbuild lib/validation/admissions-publication.ts --bundle --platform=node --outfile="${validationOutfile}" --external:@prisma/client --external:server-only`,
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
} catch (e) {
  console.error("esbuild compilation failed:", e);
  process.exit(1);
}

const {
  isValidDocumentUrl,
  isValidImageUrl,
  admissionOverviewUpdateSchema,
  feeStructurePageCreateSchema,
  feeStructurePageUpdateSchema,
  feeStructurePageDeleteSchema,
  feeStructurePagesReorderSchema,
  feeStructurePageToggleSchema,
  admissionProcedureRuleCreateSchema,
  admissionProcedureRuleUpdateSchema,
  admissionProcedureRuleDeleteSchema,
  admissionProcedureRulesReorderSchema,
  admissionProcedureRuleToggleSchema,
  entranceExamSubjectCreateSchema,
  entranceExamSubjectUpdateSchema,
  entranceExamSubjectDeleteSchema,
  entranceExamSubjectsReorderSchema,
  entranceExamSubjectToggleSchema,
} = require(validationOutfile);

async function runTests() {
  console.log("-----------------------------------------------------------------");
  console.log("  Running Admissions Publications Validation & Actions Test Suite");
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

  // 1. Document URL Validation Tests
  console.log("\n1. Testing Document URL Validation...");
  assert(
    isValidDocumentUrl("/documents/original/prospectus-2.pdf") === true,
    "Valid original prospectus PDF URL accepted"
  );
  assert(
    isValidDocumentUrl("/documents/original/new-admission-chart-2026-27.pdf") === true,
    "Valid original admission chart PDF URL accepted"
  );
  assert(
    isValidDocumentUrl("/documents/sample.pdf") === true,
    "Valid direct documents PDF URL accepted"
  );
  assert(
    isValidDocumentUrl("/documents/../secret.pdf") === false,
    "Rejects path traversal in document URL"
  );
  assert(
    isValidDocumentUrl("/documents\\prospectus.pdf") === false,
    "Rejects backslashes in document URL"
  );
  assert(
    isValidDocumentUrl("https://malicious.com/fake.pdf") === false,
    "Rejects external HTTPS URLs in document path"
  );
  assert(
    isValidDocumentUrl("/documents/prospectus.exe") === false,
    "Rejects non-pdf extensions in document path"
  );
  assert(
    isValidDocumentUrl("/documents/prospectus.pdf\0") === false,
    "Rejects null-byte injection in document path"
  );

  // 2. Image URL Validation Tests
  console.log("\n2. Testing Image URL Validation...");
  assert(
    isValidImageUrl("/images/admissions/fees/Fee-Structure-26-27_page-0001.jpg") === true,
    "Valid JPG fee structure image URL accepted"
  );
  assert(
    isValidImageUrl("/images/admissions/fees/page-1.webp") === true,
    "Valid WebP image URL accepted"
  );
  assert(
    isValidImageUrl("/images/../etc/passwd.jpg") === false,
    "Rejects path traversal in image URL"
  );
  assert(
    isValidImageUrl("https://attacker.site/image.png") === false,
    "Rejects external HTTPS URLs in image path"
  );
  assert(
    isValidImageUrl("/images/fees/doc.pdf") === false,
    "Rejects PDF extension in image path"
  );

  // 3. Admission Overview Schema Tests
  console.log("\n3. Testing Admission Overview Schema...");
  const validOverview = {
    sessionLabel: "2026-27",
    feeStructureTitle: "Fee Structure (Session 2026–27)",
    feeStructureSubtitle: "Official statutory fee schedule and prospectus.",
    prospectusTitle: "Official Devasthaly Vidyapeeth Prospectus",
    prospectusDescription: "Complete publication containing vision and guidelines.",
    prospectusPdfUrl: "/documents/original/prospectus-2.pdf",
    prospectusDisplayLabel: "Prospectus PDF (5.6 MB)",
    admissionChartPdfUrl: "/documents/original/new-admission-chart-2026-27.pdf",
    admissionChartDisplayLabel: "Admission Chart (722 KB)",
  };
  assert(
    admissionOverviewUpdateSchema.safeParse(validOverview).success === true,
    "Valid admission overview payload passes validation"
  );

  const invalidOverviewPdf = {
    ...validOverview,
    prospectusPdfUrl: "http://evil.com/fake.pdf",
  };
  assert(
    admissionOverviewUpdateSchema.safeParse(invalidOverviewPdf).success === false,
    "Rejects invalid prospectus PDF URL in overview schema"
  );

  const emptySessionOverview = {
    ...validOverview,
    sessionLabel: "   ",
  };
  assert(
    admissionOverviewUpdateSchema.safeParse(emptySessionOverview).success === false,
    "Rejects empty session label in overview schema"
  );

  // 4. Fee Structure Page Schema Tests
  console.log("\n4. Testing Fee Structure Page Schema...");
  const validPage = {
    pageNumber: 1,
    title: "Fee Structure 2026–27 - Page 1",
    imageUrl: "/images/admissions/fees/Fee-Structure-26-27_page-0001.jpg",
    displayOrder: 0,
    isPublished: true,
  };
  assert(
    feeStructurePageCreateSchema.safeParse(validPage).success === true,
    "Valid fee structure page creation payload passes"
  );

  const invalidPageNumber = {
    ...validPage,
    pageNumber: 0,
  };
  assert(
    feeStructurePageCreateSchema.safeParse(invalidPageNumber).success === false,
    "Rejects pageNumber < 1 in fee structure page schema"
  );

  const invalidPageImage = {
    ...validPage,
    imageUrl: "/uploads/secret.php",
  };
  assert(
    feeStructurePageCreateSchema.safeParse(invalidPageImage).success === false,
    "Rejects unapproved image URL in fee page schema"
  );

  // 5. Admission Procedure Rule Schema Tests
  console.log("\n5. Testing Admission Procedure Rule Schema...");
  const validRule = {
    ruleText: "Formal admission is completed after perusal of application form by Principal.",
    displayOrder: 0,
    isPublished: true,
  };
  assert(
    admissionProcedureRuleCreateSchema.safeParse(validRule).success === true,
    "Valid admission procedure rule passes"
  );
  assert(
    admissionProcedureRuleCreateSchema.safeParse({ ruleText: "ab" }).success === false,
    "Rejects ruleText shorter than 3 characters"
  );

  // 6. Entrance Exam Subject Schema Tests
  console.log("\n6. Testing Entrance Exam Subject Schema...");
  const validSubject = {
    classGrade: "VI to IX",
    subjects: "English, Maths, Science",
    displayOrder: 2,
    isPublished: true,
  };
  assert(
    entranceExamSubjectCreateSchema.safeParse(validSubject).success === true,
    "Valid entrance exam subject passes"
  );
  assert(
    entranceExamSubjectCreateSchema.safeParse({ classGrade: "", subjects: "Maths" }).success === false,
    "Rejects empty classGrade in entrance exam subject schema"
  );
  assert(
    entranceExamSubjectCreateSchema.safeParse({ classGrade: "VI", subjects: "" }).success === false,
    "Rejects empty subjects in entrance exam subject schema"
  );

  // 7. Reorder Schemas Tests
  console.log("\n7. Testing Reorder Schemas...");
  assert(
    feeStructurePagesReorderSchema.safeParse({
      items: [
        { id: "p1", displayOrder: 0 },
        { id: "p2", displayOrder: 1 },
      ],
    }).success === true,
    "Valid reorder payload passes"
  );
  assert(
    feeStructurePagesReorderSchema.safeParse({ items: [] }).success === false,
    "Rejects empty reorder items array"
  );
  assert(
    feeStructurePagesReorderSchema.safeParse({
      items: [{ id: "p1", displayOrder: -1 }],
    }).success === false,
    "Rejects negative display order in reorder schema"
  );

  // 8. Database Verification & CRUD Integrity
  console.log("\n8. Testing Database Integrity & CRUD Actions...");

  // Baseline data checks
  const overviewRecord = await prisma.admissionOverview.findUnique({
    where: { id: "default" },
  });
  assert(overviewRecord !== null, "AdmissionOverview default record exists in database");
  assert(
    overviewRecord && overviewRecord.sessionLabel === "2026-27",
    "AdmissionOverview sessionLabel is '2026-27'"
  );

  const feePagesCount = await prisma.feeStructurePage.count();
  assert(
    feePagesCount >= 5,
    `Database contains at least 5 fee structure pages (found: ${feePagesCount})`
  );

  const rulesCount = await prisma.admissionProcedureRule.count();
  assert(
    rulesCount >= 6,
    `Database contains at least 6 admission procedure rules (found: ${rulesCount})`
  );

  const subjectsCount = await prisma.entranceExamSubject.count();
  assert(
    subjectsCount >= 6,
    `Database contains at least 6 entrance exam subjects (found: ${subjectsCount})`
  );

  // Test Fee Structure Page CRUD Lifecycle
  console.log("   Testing FeeStructurePage CRUD lifecycle...");
  const tempPage = await prisma.feeStructurePage.create({
    data: {
      pageNumber: 99,
      title: "Test Temporary Fee Page",
      imageUrl: "/images/admissions/fees/Fee-Structure-26-27_page-0001.jpg",
      displayOrder: 99,
      isPublished: true,
    },
  });
  assert(tempPage.id !== undefined, "Temporary fee page created");

  const toggledPage = await prisma.feeStructurePage.update({
    where: { id: tempPage.id },
    data: { isPublished: false },
  });
  assert(toggledPage.isPublished === false, "Temporary fee page unpublished");

  await prisma.feeStructurePage.delete({
    where: { id: tempPage.id },
  });
  const deletedPageCheck = await prisma.feeStructurePage.findUnique({
    where: { id: tempPage.id },
  });
  assert(deletedPageCheck === null, "Temporary fee page deleted cleanly");

  // Test Procedure Rule CRUD Lifecycle
  console.log("   Testing AdmissionProcedureRule CRUD lifecycle...");
  const tempRule = await prisma.admissionProcedureRule.create({
    data: {
      ruleText: "Temporary test rule for validation and action testing.",
      displayOrder: 99,
      isPublished: true,
    },
  });
  assert(tempRule.id !== undefined, "Temporary procedure rule created");

  await prisma.admissionProcedureRule.delete({
    where: { id: tempRule.id },
  });
  const deletedRuleCheck = await prisma.admissionProcedureRule.findUnique({
    where: { id: tempRule.id },
  });
  assert(deletedRuleCheck === null, "Temporary procedure rule deleted cleanly");

  // Test Entrance Subject CRUD Lifecycle
  console.log("   Testing EntranceExamSubject CRUD lifecycle...");
  const tempSubject = await prisma.entranceExamSubject.create({
    data: {
      classGrade: "TEST CLASS",
      subjects: "Testing Subjects",
      displayOrder: 99,
      isPublished: true,
    },
  });
  assert(tempSubject.id !== undefined, "Temporary entrance exam subject created");

  await prisma.entranceExamSubject.delete({
    where: { id: tempSubject.id },
  });
  const deletedSubjectCheck = await prisma.entranceExamSubject.findUnique({
    where: { id: tempSubject.id },
  });
  assert(deletedSubjectCheck === null, "Temporary entrance exam subject deleted cleanly");

  // Verify registration remains CLOSED and applicants remain 0
  const regSetting = await prisma.admissionRegistrationSetting.findFirst();
  assert(
    regSetting && regSetting.isRegistrationOpen === false,
    "Online registration remains strictly CLOSED"
  );
  const applicantCount = await prisma.admissionApplication.count();
  assert(
    applicantCount === 0,
    `Applicant records remain zero (found: ${applicantCount})`
  );

  console.log(`\n  All tests passed: ${passed}/${total}`);
}

runTests()
  .then(() => {
    console.log("-----------------------------------------------------------------");
    console.log("  Admissions Publications Validation & Actions Tests PASSED!");
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
