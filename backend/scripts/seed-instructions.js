/**
 * Idempotent Seed Script: Student Code of Conduct & General Instructions
 * Milestone 16: Student Code of Conduct & Policy Guidelines
 *
 * Rules:
 * - Match records by deterministic slug or singleton id.
 * - If record exists, skip it.
 * - Do NOT use upsert.
 * - Do NOT overwrite, delete, reorder, or unpublish existing records.
 * - For singleton overview, populate only null or empty fields.
 * - Do NOT store localhost or 127.0.0.1 URLs.
 * - Set isPublished: true for newly seeded records.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const OVERVIEW_DEFAULT_DATA = {
  badgeText: "Students & Parents / Guidelines",
  title: "General Instructions",
  subtitle:
    "Institutional code of conduct, discipline guidelines, and rules for students and guardians.",
  cardTitle: "School Rules & Regulations",
  cardSubtitle: "Devasthaly Vidyapeeth, Chilkahar, Ballia (U.P.)",
};

const INSTRUCTIONS_DATA = [
  {
    slug: "attendance-prayer-pt",
    ruleText:
      "Attendance in prayer, physical training, social service assignments, sports and games, Yoga and Meditation classes and extension lecture of Saturday etc. is compulsory. Absence in any one of them would be treated as absent for the whole days and student fined accordingly.",
    category: "Attendance & Punctuality",
    isCritical: true,
    displayOrder: 1,
    isPublished: true,
  },
  {
    slug: "punctuality-late-arrival",
    ruleText: "Students coming late will not be allowed to attend classes.",
    category: "Attendance & Punctuality",
    isCritical: true,
    displayOrder: 2,
    isPublished: true,
  },
  {
    slug: "visitor-parent-meeting",
    ruleText:
      "Parents and servants also will not be allowed to meet a student during school hours. In special cases and emergencies they would be required to contact the Principal and seek permission.",
    category: "Parent & Visitor Guidelines",
    isCritical: true,
    displayOrder: 3,
    isPublished: true,
  },
  {
    slug: "vacation-reopening-presence",
    ruleText:
      "Every student must be present on the day the school reopens after each vacation.",
    category: "Attendance & Punctuality",
    isCritical: false,
    displayOrder: 4,
    isPublished: true,
  },
  {
    slug: "holiday-vacation-planning",
    ruleText:
      "Parents are advised to plan their holidays according to the vacation fixed by the school.",
    category: "Parent & Visitor Guidelines",
    isCritical: false,
    displayOrder: 5,
    isPublished: true,
  },
  {
    slug: "wedding-function-absence",
    ruleText:
      "It is also advisable that parents do not disturb their child to attend weddings and other functions during the academic period.",
    category: "Academic Commitment",
    isCritical: false,
    displayOrder: 6,
    isPublished: true,
  },
  {
    slug: "leave-school-premises",
    ruleText:
      "No student can leave school premises during school hours without the written permission of the Principal.",
    category: "Leave & Campus Security",
    isCritical: true,
    displayOrder: 7,
    isPublished: true,
  },
  {
    slug: "authority-suspension-conduct",
    ruleText:
      "The Principal has right to suspend any student if his / her conduct and / or progress is not satisfactory.",
    category: "Institutional Authority & Suspension",
    isCritical: true,
    displayOrder: 8,
    isPublished: true,
  },
  {
    slug: "complaints-suggestions-written",
    ruleText:
      "Suggestions / complaints, if any, should be lodged in writing and in confidence to the Principal.",
    category: "Complaints & Suggestions",
    isCritical: false,
    displayOrder: 9,
    isPublished: true,
  },
];

async function seedInstructions() {
  console.log("==================================================================");
  console.log("  Seeding Student Code of Conduct & General Instructions");
  console.log("==================================================================");

  // 1. Seed Singleton InstructionOverview
  let overview = await prisma.instructionOverview.findUnique({
    where: { id: "default" },
  });

  if (!overview) {
    overview = await prisma.instructionOverview.create({
      data: {
        id: "default",
        ...OVERVIEW_DEFAULT_DATA,
      },
    });
    console.log("  ✓ Created default InstructionOverview singleton");
  } else {
    // Populate only null or empty fields, never overwrite existing admin-entered values
    const patch = {};
    for (const [key, value] of Object.entries(OVERVIEW_DEFAULT_DATA)) {
      if (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        (overview[key] === null || overview[key] === undefined || overview[key] === "")
      ) {
        patch[key] = value;
      }
    }
    if (Object.keys(patch).length > 0) {
      overview = await prisma.instructionOverview.update({
        where: { id: "default" },
        data: patch,
      });
      console.log(`  ✓ Populated ${Object.keys(patch).length} missing fields in InstructionOverview`);
    } else {
      console.log("  - InstructionOverview already populated; skipped to preserve existing data");
    }
  }

  // 2. Seed GeneralInstructions (idempotent skip-if-exists)
  let instructionsCreated = 0;
  let instructionsSkipped = 0;
  for (const inst of INSTRUCTIONS_DATA) {
    const existing = await prisma.generalInstruction.findUnique({
      where: { slug: inst.slug },
    });
    if (existing) {
      instructionsSkipped++;
    } else {
      await prisma.generalInstruction.create({
        data: inst,
      });
      instructionsCreated++;
    }
  }
  console.log(`  ✓ General Instructions: ${instructionsCreated} created, ${instructionsSkipped} skipped`);

  console.log("==================================================================");
  console.log("  General Instructions Seeding COMPLETED successfully.");
  console.log("==================================================================");
}

seedInstructions()
  .catch((err) => {
    console.error("  [ERROR] Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
