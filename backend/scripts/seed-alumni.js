/**
 * Idempotent Seed Script: Alumni Network & Career Opportunities
 * Milestone 17: Alumni Network & Career Opportunities Management
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
  badgeText: "Students & Parents / Alumni",
  title: "Alumni Corner",
  subtitle:
    "Welcome to the Devasthaly Vidyapeeth Alumni Network. Celebrating memories, reunions, and enduring bonds.",
};

const REUNIONS_DATA = [
  {
    slug: "alumni-meet-reunion",
    title: "ALUMNI MEET & REUNION",
    description:
      "Reconnect with your alma mater, fellow batchmates, and teachers at Devasthaly Vidyapeeth, Chilkahar, Ballia.",
    heroImage: "/images/gallery/ALUMNI-REUNION.webp",
    heroImageAlt: "Devasthaly Vidyapeeth Alumni Reunion",
    heroImageStorageKey: null,
    eventDate: "Annual Gathering",
    displayOrder: 1,
    isPublished: true,
  },
];

const CAREER_OPPORTUNITIES_DATA = [
  {
    slug: "careers-alumni-faculty-association",
    badgeText: "Institutional Notice",
    title: "Careers & Alumni Faculty Association",
    description:
      "Devasthaly Vidyapeeth invites alumni scholars and experienced educators to join the academic mentoring team.",
    contactEmail: "principaldvp@gmail.com",
    emailSubject: "Alumni Association / Career Enquiry",
    ctaText: "Connect via Email",
    displayOrder: 1,
    isPublished: true,
  },
];

async function seedAlumni() {
  console.log("==================================================================");
  console.log("  Seeding Alumni Network & Career Opportunities");
  console.log("==================================================================");

  // 1. Seed Singleton AlumniOverview
  let overview = await prisma.alumniOverview.findUnique({
    where: { id: "default" },
  });

  if (!overview) {
    overview = await prisma.alumniOverview.create({
      data: {
        id: "default",
        ...OVERVIEW_DEFAULT_DATA,
      },
    });
    console.log("  ✓ Created default AlumniOverview singleton");
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
      overview = await prisma.alumniOverview.update({
        where: { id: "default" },
        data: patch,
      });
      console.log(`  ✓ Populated ${Object.keys(patch).length} missing fields in AlumniOverview`);
    } else {
      console.log("  - AlumniOverview already populated; skipped to preserve existing data");
    }
  }

  // 2. Seed AlumniReunions (idempotent skip-if-exists)
  let reunionsCreated = 0;
  let reunionsSkipped = 0;
  for (const reunion of REUNIONS_DATA) {
    const existing = await prisma.alumniReunion.findUnique({
      where: { slug: reunion.slug },
    });
    if (existing) {
      reunionsSkipped++;
    } else {
      await prisma.alumniReunion.create({
        data: reunion,
      });
      reunionsCreated++;
    }
  }
  console.log(`  ✓ Alumni Reunions: ${reunionsCreated} created, ${reunionsSkipped} skipped`);

  // 3. Seed CareerOpportunities (idempotent skip-if-exists)
  let careerCreated = 0;
  let careerSkipped = 0;
  for (const op of CAREER_OPPORTUNITIES_DATA) {
    const existing = await prisma.careerOpportunity.findUnique({
      where: { slug: op.slug },
    });
    if (existing) {
      careerSkipped++;
    } else {
      await prisma.careerOpportunity.create({
        data: op,
      });
      careerCreated++;
    }
  }
  console.log(`  ✓ Career Opportunities: ${careerCreated} created, ${careerSkipped} skipped`);

  console.log("==================================================================");
  console.log("  Alumni Seeding COMPLETED successfully.");
  console.log("==================================================================");
}

seedAlumni()
  .catch((err) => {
    console.error("  [ERROR] Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
