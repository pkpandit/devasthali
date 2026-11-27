/**
 * Idempotent Seed Script: Homepage Announcements & FAQs (Milestone 21)
 *
 * Populates default records for:
 * - 1 HomepageAnnouncement singleton (enabled: false)
 * - 6 HomepageFaq items (from existing static HOME_FAQ_DATA)
 *
 * Safe & Idempotent:
 * - Checks existence before inserting
 * - Preserves existing administrator modifications on rerun
 * - Maintains registration CLOSED and 0 applicant count invariants
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DEFAULT_ANNOUNCEMENT = {
  id: "default",
  enabled: false,
  title: "Alumni Meet 2026",
  badge: "Special Event",
  subtitle: "Reconnect, Relive, Rejoice",
  imageUrl: "/images/announcements/alumni-meet-2026.webp",
  imageAlt:
    "Devasthaly Vidyapeeth Alumni Meet 2026 Official Poster - Reconnect, Relive, Rejoice",
  linkHref: "/alumni",
  linkLabel: "Join the Meet",
  delayMs: 3000,
  dismissalKey: "dvp_announcement_dismissed_alumni_meet_2026",
};

const DEFAULT_FAQS = [
  {
    question:
      "What is the procedure for admission to Devasthaly Vidyapeeth for 2025–26?",
    answer:
      "Admissions begin with submitting an online enquiry or collecting the registration prospectus from the school counter. For Foundational grades (LKG to Class 1), an informal parent-child interaction is conducted. For Classes 2 through 9 and 11, students undergo a written diagnostic assessment in English, Mathematics, and Science followed by document verification.",
    displayOrder: 0,
    isPublished: true,
  },
  {
    question: "Is Devasthaly Vidyapeeth affiliated with CBSE New Delhi?",
    answer:
      "Yes. Devasthaly Vidyapeeth is proudly affiliated with the Central Board of Secondary Education (CBSE), New Delhi, under Affiliation Number 2130238. We follow the NCERT curriculum strictly in accordance with NEP 2020 guidelines.",
    displayOrder: 1,
    isPublished: true,
  },
  {
    question:
      "What are the boarding and hostel facilities provided for residential students?",
    answer:
      "We offer separate, secure, air-cooled hostel residences for boys and girls. Facilities include 24/7 warden supervision, CCTV surveillance, 4 balanced pure vegetarian meals daily, mandatory evening supervised self-study with school teachers, sports coaching, and a 24/7 medical infirmary.",
    displayOrder: 2,
    isPublished: true,
  },
  {
    question: "Which bus routes does the school transport cover?",
    answer:
      "Our GPS-enabled bus network spans over 40 pick-up locations across Ballia City, Rasra Tehsil, Chilkahar, Sikanderpur, Nagra, and adjacent rural nodes. All buses are fitted with speed governors, CCTV cameras, and accompanied by trained attendants.",
    displayOrder: 3,
    isPublished: true,
  },
  {
    question: "Which subject streams are offered in Class XI and XII?",
    answer:
      "We offer three primary streams: Science (Physics, Chemistry, Mathematics / Biology with Computer Science or Physical Education), Commerce (Accountancy, Business Studies, Economics, Mathematics / Applied Math), and Humanities (History, Political Science, Geography, Economics, Hindi/English Core).",
    displayOrder: 4,
    isPublished: true,
  },
  {
    question: "Can parents pay school fees in installments?",
    answer:
      "Yes, school fees can be paid in four convenient quarterly installments (April, July, October, and January). We also support instant online payment through our Parent Portal via UPI, Debit/Credit Card, and Net Banking.",
    displayOrder: 5,
    isPublished: true,
  },
];

async function seed() {
  console.log("=== Seeding Homepage Announcements & FAQs (Milestone 21) ===");

  // 1. Seed HomepageAnnouncement
  const existingAnnouncement = await prisma.homepageAnnouncement.findUnique({
    where: { id: "default" },
  });

  if (!existingAnnouncement) {
    await prisma.homepageAnnouncement.create({
      data: DEFAULT_ANNOUNCEMENT,
    });
    console.log("✔ Created default HomepageAnnouncement record (enabled: false).");
  } else {
    console.log(
      "✔ HomepageAnnouncement already exists. Preserving existing record."
    );
  }

  // 2. Seed HomepageFaqs
  const existingFaqsCount = await prisma.homepageFaq.count();

  if (existingFaqsCount === 0) {
    for (const faq of DEFAULT_FAQS) {
      await prisma.homepageFaq.create({
        data: faq,
      });
    }
    console.log(
      `✔ Created ${DEFAULT_FAQS.length} default HomepageFaq records.`
    );
  } else {
    console.log(
      `✔ HomepageFaq records already exist (${existingFaqsCount} found). Preserving existing records.`
    );
  }

  // Invariant verification
  const regSetting = await prisma.admissionRegistrationSetting.findFirst();
  const applicantCount = await prisma.admissionApplication.count();
  console.log(
    `✔ Verification: Registration is CLOSED: ${!regSetting?.isRegistrationOpen}`
  );
  console.log(`✔ Verification: Applicant count: ${applicantCount}`);

  console.log("=== Homepage Announcements & FAQs Seeding Completed ===");
}

seed()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
