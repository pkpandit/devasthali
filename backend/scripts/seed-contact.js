/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Seed Script: Contact & Campus Information (Milestone 13)
 *
 * Responsibilities:
 * 1. Fetch the default SiteProfile singleton.
 * 2. Idempotently populate location, directions, and emergency fields only if currently null or empty.
 * 3. Never overwrite existing admin-configured values.
 * 4. Verify existing campus directory contacts remain intact.
 * 5. Strictly avoid localhost or 127.0.0.1 URLs.
 */

const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const SEED_VALUES = {
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14372.416823334255!2d84.0152431!3d25.8643212!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39925bf784a6c4f7%3A0xbcf0bf5377f0a9a1!2sChilkahar%2C%20Uttar%20Pradesh%20277123!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
  mapDirectionsUrl:
    "https://maps.google.com/?q=Devasthaly+Vidyapeeth+Chilkahar+Ballia",
  directionsOverview:
    "Located on the Ballia-Rasra State Highway near Chilkahar Railway Crossing. Approximately 8 km from Rasra Railway Station and 25 km from Ballia City Centre.",
  visitorGuidelines:
    "All visitors and parents must report to the Main Security Gate for visitor slip issuance. Visiting hours for Principal and academic coordinators: Monday to Saturday, 9:00 AM – 1:30 PM.",
  emergencyMedicalPhone: "9415805530",
  emergencySecurityPhone: "6307798158",
};

async function seedContact() {
  console.log("-----------------------------------------------------------------");
  console.log("  Seeding Contact & Campus Information (Milestone 13)");
  console.log("-----------------------------------------------------------------");

  let profile = await prisma.siteProfile.findUnique({
    where: { id: "default" },
  });

  if (!profile) {
    console.log("  Default SiteProfile not found. Creating initial record...");
    profile = await prisma.siteProfile.create({
      data: {
        id: "default",
        schoolName: "Devasthaly Vidyapeeth",
      },
    });
  }

  const updates = {};
  for (const [key, val] of Object.entries(SEED_VALUES)) {
    if (!profile[key] || profile[key].trim() === "") {
      updates[key] = val;
    }
  }

  const updateKeys = Object.keys(updates);
  if (updateKeys.length > 0) {
    console.log(`  Updating ${updateKeys.length} unconfigured field(s): ${updateKeys.join(", ")}`);
    profile = await prisma.siteProfile.update({
      where: { id: "default" },
      data: updates,
    });
    console.log("  [SUCCESS] SiteProfile updated with default contact/location values.");
  } else {
    console.log("  [SKIP] All contact and campus fields are already configured; preserving existing values.");
  }

  const directoryCount = await prisma.campusDirectoryEntry.count();
  console.log(`  Existing campus directory entries verified: ${directoryCount} entries present.`);

  console.log("-----------------------------------------------------------------");
  console.log("  Contact & Campus Information seeding complete.");
  console.log("-----------------------------------------------------------------");
}

seedContact()
  .catch((err) => {
    console.error("  [ERROR] Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
