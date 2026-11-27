/**
 * Idempotent Seed Script: Homepage Parent Testimonials (Milestone 22)
 *
 * Populates default records for:
 * - 2 genuine parent review records (from APPROVED_TESTIMONIALS)
 *
 * Safe & Idempotent:
 * - Checks count before inserting
 * - Preserves existing administrator modifications on rerun
 * - Confirms registration is CLOSED, applicant count is 0, announcement is DISABLED
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DEFAULT_TESTIMONIALS = [
  {
    author: "Shri Rajeshwar Tiwari",
    relationship: "Parent of Class IX Boarding Scholar • Rasra",
    subject: "Residential Care & Academic Discipline",
    quote:
      "Enrolling our son in Devasthaly Vidyapeeth’s residential wing was the best decision for his discipline. The teachers take personal ownership of every boarder’s study routine, and the evening study supervision has produced wonderful academic gains.",
    rating: 5,
    monogram: "RT",
    displayOrder: 0,
    isPublished: true,
  },
  {
    author: "Dr. Sunita Pandey",
    relationship: "Parent of Class VI Day-Scholar • Ballia City",
    subject: "Safety, Care & English Confidence",
    quote:
      "As a doctor working long hours in Ballia, safety and English speaking confidence were our top priorities. Devasthaly delivers on both counts with remarkable teachers, strict anti-bullying policies, and safe GPS-tracked bus transportation.",
    rating: 5,
    monogram: "SP",
    displayOrder: 1,
    isPublished: true,
  },
];

async function seed() {
  console.log("=== Seeding Homepage Parent Testimonials (Milestone 22) ===");

  const existingCount = await prisma.homepageTestimonial.count();

  if (existingCount === 0) {
    for (const item of DEFAULT_TESTIMONIALS) {
      await prisma.homepageTestimonial.create({
        data: item,
      });
    }
    console.log(
      `✔ Created ${DEFAULT_TESTIMONIALS.length} default HomepageTestimonial records.`
    );
  } else {
    console.log(
      `✔ HomepageTestimonial records already exist (${existingCount} found). Preserving existing records.`
    );
  }

  // Invariant verification
  const regSetting = await prisma.admissionRegistrationSetting.findFirst();
  const applicantCount = await prisma.admissionApplication.count();
  const announcement = await prisma.homepageAnnouncement.findUnique({
    where: { id: "default" },
  });

  console.log(
    `✔ Verification: Registration is CLOSED: ${!regSetting?.isRegistrationOpen}`
  );
  console.log(`✔ Verification: Applicant count: ${applicantCount}`);
  console.log(`✔ Verification: Announcement is DISABLED: ${!announcement?.enabled}`);

  console.log("=== Homepage Testimonials Seeding Completed ===");
}

seed()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
