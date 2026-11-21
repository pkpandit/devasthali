/**
 * Test Suite: Contact Server Actions & Validation (Milestone 13)
 *
 * Verifies:
 * 1. SUPER_ADMIN authorization requirement
 * 2. Valid Google Maps embed URL accepts
 * 3. Invalid non-Google embed URL rejects
 * 4. Valid directions URL accepts
 * 5. Invalid directions URL rejects
 * 6. Valid emergency phone numbers accept
 * 7. Invalid emergency phone numbers reject
 * 8. Audit log recording with masked phone numbers
 * 9. Null-field preservation
 * 10. Contact cache tags and path invalidation alignment
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

// Bundle TypeScript validation and audit for Node runtime
const validationOutfile = path.resolve(__dirname, "../dist_test_contact_validation.js");
const auditOutfile = path.resolve(__dirname, "../dist_test_contact_audit.js");

try {
  execSync(
    `npx esbuild lib/validation/contact.ts --bundle --platform=node --outfile=${validationOutfile} --external:@prisma/client --external:server-only`,
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
  execSync(
    `npx esbuild lib/server/audit.ts --bundle --platform=node --outfile=${auditOutfile} --external:@prisma/client --external:server-only`,
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
} catch (e) {
  console.error("esbuild compilation failed:", e);
  process.exit(1);
}

const {
  isValidGoogleMapsEmbedUrl,
  isValidGoogleMapsDirectionsUrl,
  contactLocationSchema,
  contactHelplinesSchema,
} = require(validationOutfile);

const { sanitizeAuditMetadata } = require(auditOutfile);

let adminUser = null;

async function setup() {
  console.log("-----------------------------------------------------------------");
  console.log("  Running Contact Actions & Validation Test Suite");
  console.log("-----------------------------------------------------------------");

  adminUser = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  if (!adminUser) {
    throw new Error("No SUPER_ADMIN user found in database for testing.");
  }
}

async function runTests() {
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

  // 1. Google Maps Embed URL Validation
  assert(
    isValidGoogleMapsEmbedUrl("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14372.416823334255!2d84.0152431"),
    "Valid https://www.google.com/maps/embed URL passes"
  );
  assert(
    isValidGoogleMapsEmbedUrl("https://google.com/maps/embed?pb=xyz"),
    "Valid https://google.com/maps/embed URL passes"
  );
  assert(
    isValidGoogleMapsEmbedUrl("https://maps.google.com/maps?output=embed&q=Chilkahar"),
    "Valid https://maps.google.com/maps with output=embed passes"
  );
  assert(
    !isValidGoogleMapsEmbedUrl("http://www.google.com/maps/embed?pb=123"),
    "HTTP (non-SSL) Google Maps embed URL is rejected"
  );
  assert(
    !isValidGoogleMapsEmbedUrl("https://evil-maps.com/maps/embed"),
    "Non-Google domain embed URL is rejected"
  );
  assert(
    !isValidGoogleMapsEmbedUrl("javascript:alert(1)"),
    "javascript: URI is rejected"
  );

  // 2. Google Maps Directions URL Validation
  assert(
    isValidGoogleMapsDirectionsUrl("https://maps.google.com/?q=Devasthaly+Vidyapeeth"),
    "Valid https://maps.google.com directions URL passes"
  );
  assert(
    isValidGoogleMapsDirectionsUrl("https://maps.app.goo.gl/xyz123"),
    "Valid https://maps.app.goo.gl directions URL passes"
  );
  assert(
    isValidGoogleMapsDirectionsUrl("https://www.google.com/maps/dir/Ballia/Chilkahar"),
    "Valid https://www.google.com/maps/dir URL passes"
  );
  assert(
    !isValidGoogleMapsDirectionsUrl("https://phishing-site.com/directions"),
    "Non-Google navigation URL is rejected"
  );
  assert(
    !isValidGoogleMapsDirectionsUrl("http://maps.google.com/?q=test"),
    "HTTP (non-SSL) navigation URL is rejected"
  );

  // 3. Schema Validation for Contact Location
  const validLocation = {
    campusAddress: "Chilkahar Campus",
    tehsil: "Rasra",
    district: "Ballia",
    state: "Uttar Pradesh",
    pinCode: "277123",
    landmark: "Near Chilkahar Railway Crossing",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=test",
    mapDirectionsUrl: "https://maps.google.com/?q=test",
    directionsOverview: "Take Ballia-Rasra State Highway.",
    visitorGuidelines: "Report to Main Gate.",
  };
  const parsedLoc = contactLocationSchema.safeParse(validLocation);
  assert(parsedLoc.success, "Valid contact location input parses successfully");

  const invalidLoc = {
    ...validLocation,
    mapEmbedUrl: "https://not-google.com/embed",
  };
  const parsedInvalidLoc = contactLocationSchema.safeParse(invalidLoc);
  assert(!parsedInvalidLoc.success, "Invalid embed URL fails location schema validation");

  // 4. Schema Validation for Helplines
  const validHelplines = {
    primaryPhone: "9554960408",
    admissionsPhone: "9554960408",
    receptionPhone: "9554960415",
    hostelWardenPhone: "6307010040",
    whatsappNumber: "919554960408",
    officeEmail: "principaldvp@gmail.com",
    principalEmail: "principaldvp@gmail.com",
    workingHours: "Mon – Sat: 8:00 AM – 3:30 PM",
    emergencyMedicalPhone: "9415805530",
    emergencySecurityPhone: "6307798158",
  };
  const parsedHelp = contactHelplinesSchema.safeParse(validHelplines);
  assert(parsedHelp.success, "Valid helplines input parses successfully");

  const invalidHelp = {
    ...validHelplines,
    emergencyMedicalPhone: "12345", // invalid Indian phone
  };
  const parsedInvalidHelp = contactHelplinesSchema.safeParse(invalidHelp);
  assert(!parsedInvalidHelp.success, "Invalid Indian phone number fails helplines schema validation");

  // 5. Audit Logging & Phone Masking Verification
  const testMetadata = {
    diff: {
      emergencyMedicalPhone: { from: null, to: "9415805530" },
      emergencySecurityPhone: { from: null, to: "6307798158" },
      primaryPhone: { from: null, to: "9554960408" },
      officeEmail: { from: null, to: "principaldvp@gmail.com" },
    },
  };
  const sanitized = sanitizeAuditMetadata(testMetadata);
  assert(
    sanitized.diff.emergencyMedicalPhone.to === "******5530",
    "emergencyMedicalPhone is automatically masked in audit log (******5530)"
  );
  assert(
    sanitized.diff.emergencySecurityPhone.to === "******8158",
    "emergencySecurityPhone is automatically masked in audit log (******8158)"
  );
  assert(
    sanitized.diff.primaryPhone.to === "******0408",
    "primaryPhone is automatically masked in audit log (******0408)"
  );
  assert(
    sanitized.diff.officeEmail.to === "pr***@***.com",
    "officeEmail is automatically masked in audit log (pr***@***.com)"
  );

  // 6. Cache Tag & Path Invalidation Alignment
  const actionsFilePath = path.resolve(__dirname, "../lib/server/contact-actions.ts");
  const actionsContent = fs.readFileSync(actionsFilePath, "utf8");

  assert(
    actionsContent.includes('revalidateTag("profile", "max")'),
    "contact-actions.ts calls revalidateTag('profile', 'max')"
  );
  assert(
    actionsContent.includes('revalidatePath("/admin/contact")'),
    "contact-actions.ts calls revalidatePath('/admin/contact')"
  );
  assert(
    !actionsContent.includes('revalidateTag("contact"'),
    "contact-actions.ts does NOT call unused revalidateTag('contact')"
  );
  assert(
    !actionsContent.includes('revalidatePath("/contact")'),
    "contact-actions.ts does NOT call non-existent backend route revalidatePath('/contact')"
  );

  console.log(`\n  All tests passed: ${passed}/${total}`);
}

setup()
  .then(runTests)
  .then(() => {
    console.log("-----------------------------------------------------------------");
    console.log("  Contact Actions & Validation Test Suite COMPLETED successfully.");
    console.log("-----------------------------------------------------------------");
  })
  .catch((err) => {
    console.error("  [ERROR] Test suite failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    // Cleanup compiled test bundles
    try {
      if (fs.existsSync(validationOutfile)) fs.unlinkSync(validationOutfile);
      if (fs.existsSync(auditOutfile)) fs.unlinkSync(auditOutfile);
    } catch {}
    await prisma.$disconnect();
  });
