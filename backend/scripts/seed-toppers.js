/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Idempotent Seed Script for Academic Board Result Toppers (Milestone 8)
 *
 * Requirements:
 * 1. Preserves all existing database topper records exactly.
 * 2. Checks by studentName (case-insensitive) first; skips if already present.
 * 3. Never deletes, overwrites, reorders, or unpublishes existing records.
 * 4. Seeds the canonical official static toppers from TOPPERS_DATA with:
 *    - Meaningful image alt text (photoAlt)
 *    - isPublished: true, isFeatured: true
 *    - Root-relative image paths (/images/academics/toppers/...)
 *    - No localhost or loopback URLs
 * 5. Fully idempotent across repeated runs.
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CANONICAL_TOPPERS = [
  {
    studentName: "Priya Singh",
    scorePercent: 98.40,
    grade: "Class XII",
    stream: "Science (PCM)",
    academicYear: "2023-24",
    achievement: "District Rank 1 | Currently pursuing B.Tech at IIT Roorkee",
    photoUrl: "/images/academics/toppers/topper-priya.jpg",
    photoAlt: "Photo of Priya Singh - Class XII CBSE Topper (District Rank 1)",
    displayOrder: 0,
    isPublished: true,
    isFeatured: true,
  },
  {
    studentName: "Aman Kumar Verma",
    scorePercent: 97.80,
    grade: "Class X",
    stream: null,
    academicYear: "2023-24",
    achievement: "School Topper & 100/100 in Mathematics & Science",
    photoUrl: "/images/academics/toppers/topper-aman.jpg",
    photoAlt: "Photo of Aman Kumar Verma - Class X CBSE Topper",
    displayOrder: 1,
    isPublished: true,
    isFeatured: true,
  },
  {
    studentName: "Shweta Tiwari",
    scorePercent: 97.20,
    grade: "Class XII",
    stream: "Commerce",
    academicYear: "2023-24",
    achievement: "Qualified CUET with 99.8th percentile | SRCC New Delhi",
    photoUrl: "/images/academics/toppers/topper-shweta.jpg",
    photoAlt: "Photo of Shweta Tiwari - Class XII CBSE Commerce Topper",
    displayOrder: 2,
    isPublished: true,
    isFeatured: true,
  },
  {
    studentName: "Rohan Upadhyay",
    scorePercent: 96.60,
    grade: "Class XII",
    stream: "Science (PCB)",
    academicYear: "2022-23",
    achievement: "Cleared NEET UG in First Attempt (AIR 1420)",
    photoUrl: "/images/academics/toppers/topper-rohan.jpg",
    photoAlt: "Photo of Rohan Upadhyay - Class XII CBSE Science Topper",
    displayOrder: 3,
    isPublished: true,
    isFeatured: true,
  },
];

async function seedToppers() {
  console.log("=== Starting Idempotent Academic Topper Seeding ===");

  let createdCount = 0;
  let skippedCount = 0;

  for (const topper of CANONICAL_TOPPERS) {
    const existing = await prisma.boardResultTopper.findFirst({
      where: {
        studentName: {
          equals: topper.studentName,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      console.log(
        `[SKIP] Topper "${topper.studentName}" already exists (id: ${existing.id}).`
      );
      skippedCount++;
      continue;
    }

    const created = await prisma.boardResultTopper.create({
      data: {
        studentName: topper.studentName,
        scorePercent: topper.scorePercent,
        grade: topper.grade,
        stream: topper.stream,
        academicYear: topper.academicYear,
        achievement: topper.achievement,
        photoUrl: topper.photoUrl,
        photoStorageKey: null,
        photoAlt: topper.photoAlt,
        displayOrder: topper.displayOrder,
        isPublished: topper.isPublished,
        isFeatured: topper.isFeatured,
      },
    });

    console.log(
      `[CREATED] Seeded topper "${created.studentName}" (${created.grade}, ${created.academicYear}, ${created.scorePercent}%) with id: ${created.id}`
    );
    createdCount++;
  }

  console.log(`=== Seeding Completed: ${createdCount} created, ${skippedCount} skipped ===`);
}

seedToppers()
  .catch((err) => {
    console.error("Error seeding academic toppers:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
