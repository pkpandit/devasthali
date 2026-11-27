/**
 * Idempotent Seed Script: Admission Publications (Milestone 19)
 * - Annual Fee Structure Scanned Pages
 * - School Prospectus & Admission Chart Publications
 * - Admission Procedure Rules & Entrance Exam Subjects
 *
 * Rules:
 * - Match overview by singleton id "default". If exists, skip (do not overwrite).
 * - Seed 5 fee-chart pages, 6 procedure rules, and 6 entrance-exam subject rows only if absent.
 * - Do NOT overwrite, delete, reorder, or unpublish existing records on rerun.
 * - Do NOT create fake applicant or enquiry records.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const OVERVIEW_DATA = {
  id: "default",
  sessionLabel: "2026-27",
  feeStructureTitle: "Fee Structure (Session 2026–27)",
  feeStructureSubtitle:
    "Official statutory fee schedule and prospectus for Devasthaly Vidyapeeth, Chilkahar, Ballia.",
  prospectusTitle: "Official Devasthaly Vidyapeeth Prospectus",
  prospectusDescription:
    "Complete publication containing the vision of Founder Shri Chandra Shekhar, admission eligibility, code of conduct, academic syllabus, examination assessment rules, and hostel guidelines.",
  prospectusPdfUrl: "/documents/original/prospectus-2.pdf",
  prospectusDisplayLabel: "Prospectus PDF (5.6 MB)",
  admissionChartPdfUrl: "/documents/original/new-admission-chart-2026-27.pdf",
  admissionChartDisplayLabel: "Admission Chart (722 KB)",
};

const FEE_PAGES_DATA = [
  {
    pageNumber: 1,
    title: "Fee Structure 2026–27 - Page 1",
    imageUrl: "/images/admissions/fees/Fee-Structure-26-27_page-0001.jpg",
    displayOrder: 0,
    isPublished: true,
  },
  {
    pageNumber: 2,
    title: "Fee Structure 2026–27 - Page 2",
    imageUrl: "/images/admissions/fees/Fee-Structure-26-27_page-0002.jpg",
    displayOrder: 1,
    isPublished: true,
  },
  {
    pageNumber: 3,
    title: "Fee Structure 2026–27 - Page 3",
    imageUrl: "/images/admissions/fees/Fee-Structure-26-27_page-0003.jpg",
    displayOrder: 2,
    isPublished: true,
  },
  {
    pageNumber: 4,
    title: "Fee Structure 2026–27 - Page 4",
    imageUrl: "/images/admissions/fees/Fee-Structure-26-27_page-0004.jpg",
    displayOrder: 3,
    isPublished: true,
  },
  {
    pageNumber: 5,
    title: "Fee Structure 2026–27 - Page 5",
    imageUrl: "/images/admissions/fees/Fee-Structure-26-27_page-0005.jpg",
    displayOrder: 4,
    isPublished: true,
  },
];

const PROCEDURE_RULES_DATA = [
  {
    ruleText:
      'Before admission child’s name has to be registered (16th January to 20th of March) in advance. A sum of Rs.1000/- is charged as registration fee for boarder and day scholar. The said payment is to done in form of Demand Draft (DD) in favour of "Principal Devasthaly, Devasthaly Ballia", Payable at Ballia, Along with application form.',
    displayOrder: 0,
    isPublished: true,
  },
  {
    ruleText:
      "No admission will be granted to the student unless a transfer certificate from the previous institution is produced along with application form",
    displayOrder: 1,
    isPublished: true,
  },
  {
    ruleText:
      "Formal admission is completed after the perusal of the application form by the principal and the parents are informed of his decision after a test and an interview",
    displayOrder: 2,
    isPublished: true,
  },
  {
    ruleText:
      "Every student will have to produce a birth certificate from from the Hospital, Nursing home, The Municipality or the Gram Panchayat",
    displayOrder: 3,
    isPublished: true,
  },
  {
    ruleText:
      "The child must have attained the age of four years at the time of admission in L.K.G.",
    displayOrder: 4,
    isPublished: true,
  },
  {
    ruleText:
      "If the child fails for two successive years he/ she will not allowed to continue his/her education in this institute",
    displayOrder: 5,
    isPublished: true,
  },
];

const ENTRANCE_EXAM_SUBJECTS_DATA = [
  {
    classGrade: "L.K.G.",
    subjects: "Oral Test",
    displayOrder: 0,
    isPublished: true,
  },
  {
    classGrade: "U.K.G. To V",
    subjects: "English, Hindi, Maths",
    displayOrder: 1,
    isPublished: true,
  },
  {
    classGrade: "VI to IX",
    subjects: "English, Maths, Science",
    displayOrder: 2,
    isPublished: true,
  },
  {
    classGrade: "XI (Maths & Bio Group)",
    subjects: "English, Maths, Science",
    displayOrder: 3,
    isPublished: true,
  },
  {
    classGrade: "XI (Commerce Group)",
    subjects: "English, Social Science & Maths",
    displayOrder: 4,
    isPublished: true,
  },
  {
    classGrade: "XI (Humanity Group)",
    subjects: "English, Hindi & Social Science",
    displayOrder: 5,
    isPublished: true,
  },
];

async function seed() {
  console.log("=== Starting Idempotent Seed: Admission Publications (Milestone 19) ===");

  // 1. Admission Publication Overview
  const existingOverview = await prisma.admissionOverview.findUnique({
    where: { id: "default" },
  });

  if (!existingOverview) {
    await prisma.admissionOverview.create({ data: OVERVIEW_DATA });
    console.log("✔ Created default AdmissionOverview record.");
  } else {
    console.log("ℹ AdmissionOverview record already exists. Skipped to preserve modifications.");
  }

  // 2. Fee Structure Pages
  let seededPages = 0;
  for (const page of FEE_PAGES_DATA) {
    const existing = await prisma.feeStructurePage.findFirst({
      where: { pageNumber: page.pageNumber },
    });
    if (!existing) {
      await prisma.feeStructurePage.create({ data: page });
      seededPages++;
    }
  }
  console.log(`✔ Fee Structure Pages: seeded ${seededPages} new records (${FEE_PAGES_DATA.length - seededPages} already existed).`);

  // 3. Admission Procedure Rules
  let seededRules = 0;
  for (const rule of PROCEDURE_RULES_DATA) {
    const existing = await prisma.admissionProcedureRule.findFirst({
      where: { ruleText: rule.ruleText },
    });
    if (!existing) {
      await prisma.admissionProcedureRule.create({ data: rule });
      seededRules++;
    }
  }
  console.log(`✔ Admission Procedure Rules: seeded ${seededRules} new records (${PROCEDURE_RULES_DATA.length - seededRules} already existed).`);

  // 4. Entrance Exam Subjects
  let seededSubjects = 0;
  for (const subject of ENTRANCE_EXAM_SUBJECTS_DATA) {
    const existing = await prisma.entranceExamSubject.findFirst({
      where: { classGrade: subject.classGrade },
    });
    if (!existing) {
      await prisma.entranceExamSubject.create({ data: subject });
      seededSubjects++;
    }
  }
  console.log(`✔ Entrance Exam Subjects: seeded ${seededSubjects} new records (${ENTRANCE_EXAM_SUBJECTS_DATA.length - seededSubjects} already existed).`);

  console.log("=== Admission Publications Seed Completed Successfully! ===");
}

seed()
  .catch((err) => {
    console.error("❌ Seeding failed with error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
