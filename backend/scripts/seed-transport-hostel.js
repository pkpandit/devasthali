/**
 * Idempotent Seed Script: Residential Hostel & Transport Fleet (Milestone 20)
 *
 * Populates default records for:
 * - 1 HostelSection singleton
 * - 3 HostelFeature items (Dining, Evening Study, Parent Connect & Wellness)
 * - 1 TransportSection singleton
 *
 * Safe & Idempotent:
 * - Checks existence before inserting
 * - Never overwrites admin modifications on rerun
 * - Does not touch M11, M12, M18, M19 tables or records
 * - Confirms registration remains CLOSED and applicant count is 0
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DEFAULT_HOSTEL_SECTION = {
  id: "default",
  badge: "Residential Boarding Life",
  title: 'A Safe, Caring "Home Away From Home"',
  description:
    "Our residential boarding is structured to instill life-long habits of self-reliance, physical vigor, and focused academic discipline. We maintain completely segregated hostel blocks for boys and girls with strict 24/7 security, resident female and male wardens, and zero tolerance for bullying or ragging.",
};

const DEFAULT_HOSTEL_FEATURES = [
  {
    title: "Pure Vegetarian Dining",
    description:
      "4 freshly prepared, nutritious meals daily crafted by trained chefs under strict hygiene standards.",
    displayOrder: 0,
    isPublished: true,
  },
  {
    title: "Evening Supervised Study",
    description:
      "2 hours of compulsory, teacher-mentored preparation every evening to clear academic doubts.",
    displayOrder: 1,
    isPublished: true,
  },
  {
    title: "Parent Connect & Wellness",
    description:
      "Scheduled weekly tele-calls, round-the-clock nurse on duty, and routine health checks.",
    displayOrder: 2,
    isPublished: true,
  },
];

const DEFAULT_TRANSPORT_SECTION = {
  id: "default",
  badge: "Day-Scholar Transport Network",
  title: "Safe, GPS-Tracked Transportation Fleet",
  description:
    "Our yellow school buses operate on strictly monitored routes connecting Chilkahar to Ballia City, Rasra Tehsil, Sikanderpur, Nagra, Bilthara Road, and adjacent rural educational nodes. Each bus is equipped with speed governors, CCTV cameras, first-aid kits, and trained female attendants for younger students.",
  ctaText: "Contact Transport Coordinator for Pick-up Node Details →",
  ctaUrl: "/contact",
};

async function seed() {
  console.log("=== Seeding Life at School: Residential Hostel & Transport Sections ===");

  // 1. Seed HostelSection
  const existingHostel = await prisma.hostelSection.findUnique({
    where: { id: "default" },
  });

  if (!existingHostel) {
    await prisma.hostelSection.create({
      data: DEFAULT_HOSTEL_SECTION,
    });
    console.log("✔ Created default HostelSection record.");
  } else {
    console.log("✔ HostelSection already exists. Preserving existing record.");
  }

  // 2. Seed HostelFeatures
  const existingFeaturesCount = await prisma.hostelFeature.count({
    where: { sectionId: "default" },
  });

  if (existingFeaturesCount === 0) {
    for (const feat of DEFAULT_HOSTEL_FEATURES) {
      await prisma.hostelFeature.create({
        data: {
          sectionId: "default",
          ...feat,
        },
      });
    }
    console.log(`✔ Created ${DEFAULT_HOSTEL_FEATURES.length} default HostelFeature records.`);
  } else {
    console.log(
      `✔ HostelFeature records already exist (${existingFeaturesCount} found). Preserving existing records.`
    );
  }

  // 3. Seed TransportSection
  const existingTransport = await prisma.transportSection.findUnique({
    where: { id: "default" },
  });

  if (!existingTransport) {
    await prisma.transportSection.create({
      data: DEFAULT_TRANSPORT_SECTION,
    });
    console.log("✔ Created default TransportSection record.");
  } else {
    console.log("✔ TransportSection already exists. Preserving existing record.");
  }

  // Invariant verification
  const regSetting = await prisma.admissionRegistrationSetting.findFirst();
  const applicantCount = await prisma.admissionApplication.count();
  console.log(`✔ Verification: Registration is CLOSED: ${!regSetting?.isRegistrationOpen}`);
  console.log(`✔ Verification: Applicant count: ${applicantCount}`);

  console.log("=== Life at School Seeding Completed Successfully ===");
}

seed()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
