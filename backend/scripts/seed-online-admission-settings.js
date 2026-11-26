/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const prisma = new PrismaClient();

async function seedOnlineAdmissionSettings() {
  console.log("=== Seeding Online Admission Registration Settings ===");

  // Check applicant count prior to running
  const applicantCountBefore = await prisma.admissionApplication.count();

  // Check whether setting already exists
  const existingSetting = await prisma.admissionRegistrationSetting.findUnique({
    where: { id: "default" },
  });

  let setting;
  let wasCreated = false;

  if (existingSetting) {
    console.log("✔ Registration settings singleton already exists. Preserving existing settings without modification.");
    setting = existingSetting;
  } else {
    console.log("✔ Registration settings singleton absent. Creating with fail-closed defaults.");
    setting = await prisma.admissionRegistrationSetting.create({
      data: {
        id: "default",
        isRegistrationOpen: false, // Default fail-closed
        sessionLabel: "2026-27",
        guidanceNotice:
          "Official student registration portal for Devasthaly Vidyapeeth, Chilkahar, Ballia. Registration for Session 2026–27.",
        closedMessage:
          "Online registration for Session 2026–27 is currently closed. For in-person registration or inquiries, please contact our campus admissions counter or call +91 9450371306.",
      },
    });
    wasCreated = true;
  }

  // Check applicant count after running
  const applicantCountAfter = await prisma.admissionApplication.count();

  console.log("--- Execution Summary ---");
  console.log(`1. Success: true`);
  console.log(`2. Settings status: ${existingSetting ? "already existed (preserved)" : "newly created"}`);
  console.log(`3. isRegistrationOpen: ${setting.isRegistrationOpen}`);
  console.log(`4. sessionLabel: ${setting.sessionLabel}`);
  console.log(`5. Applicant records created: ${applicantCountAfter - applicantCountBefore}`);
  console.log(`6. Total applicant records in database: ${applicantCountAfter}`);
  console.log("=== Seeding Completed Successfully ===");
}

seedOnlineAdmissionSettings()
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
