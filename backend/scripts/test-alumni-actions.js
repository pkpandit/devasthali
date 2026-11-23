/**
 * Test Suite: Alumni Actions, Storage Integration & Validation (Milestone 17)
 *
 * Verifies:
 * 1. Zod schemas for AlumniOverview, AlumniReunion, and CareerOpportunity
 * 2. Meaningful alt text refinement on heroImage
 * 3. Email validation on CareerOpportunity
 * 4. Reorder and status toggle schemas
 * 5. computeAlumniDiff helper
 * 6. Cache revalidation calls in alumni-actions.ts
 * 7. Storage regex & key validation
 * 8. Seeded database state in PostgreSQL
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

const validationBundleOutfile = path.resolve(__dirname, "../dist_test_alumni_validation.js");
const storageBundleOutfile = path.resolve(__dirname, "../dist_test_alumni_storage.js");

try {
  execSync(
    `npx esbuild lib/validation/alumni.ts --bundle --platform=node --outfile=${validationBundleOutfile} --external:server-only`,
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
  execSync(
    `npx esbuild lib/server/storage.ts --bundle --platform=node --outfile=${storageBundleOutfile} --external:@prisma/client --external:server-only`,
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
} catch (e) {
  console.error("esbuild compilation failed:", e);
  process.exit(1);
}

const {
  alumniOverviewUpdateSchema,
  alumniReunionCreateSchema,
  alumniReunionUpdateSchema,
  alumniReunionDeleteSchema,
  toggleAlumniReunionStatusSchema,
  reorderAlumniReunionsSchema,
  careerOpportunityCreateSchema,
  careerOpportunityUpdateSchema,
  careerOpportunityDeleteSchema,
  toggleCareerOpportunityStatusSchema,
  reorderCareerOpportunitiesSchema,
  computeAlumniDiff,
} = require(validationBundleOutfile);

const { MANAGED_ALUMNI_KEY_REGEX, isValidManagedAlumniKey } = require(storageBundleOutfile);

async function runTests() {
  console.log("-----------------------------------------------------------------");
  console.log("  Running Alumni Actions & Validation Test Suite");
  console.log("-----------------------------------------------------------------");

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

  // 1. Overview Schema Validation
  const validOverview = alumniOverviewUpdateSchema.safeParse({
    badgeText: "Students & Parents / Alumni",
    title: "Alumni Corner",
    subtitle: "Welcome to the Alumni Network.",
  });
  assert(validOverview.success === true, "Valid overview passes schema");

  const oversizedOverview = alumniOverviewUpdateSchema.safeParse({
    title: "A".repeat(121),
  });
  assert(oversizedOverview.success === false, "Overview title exceeding 120 chars fails validation");

  // 2. Reunion Schema & Alt Text Refinement
  const validReunion = alumniReunionCreateSchema.safeParse({
    title: "Annual Alumni Reunion 2026",
    description: "Join us for an evening of nostalgic memories and networking.",
    heroImage: "/images/gallery/ALUMNI-REUNION.webp",
    heroImageAlt: "Alumni gathering photograph",
    eventDate: "December 20, 2026",
    displayOrder: 1,
    isPublished: true,
  });
  assert(validReunion.success === true, "Valid reunion with image and alt text passes schema");

  const missingAltReunion = alumniReunionCreateSchema.safeParse({
    title: "Annual Alumni Reunion 2026",
    description: "Join us for an evening of nostalgic memories and networking.",
    heroImage: "/images/gallery/ALUMNI-REUNION.webp",
    heroImageAlt: "", // Empty alt text with image should fail
  });
  assert(
    missingAltReunion.success === false,
    "Reunion with heroImage but empty alt text is rejected"
  );

  const shortTitleReunion = alumniReunionCreateSchema.safeParse({
    title: "Hi",
    description: "Join us for an evening of nostalgic memories and networking.",
  });
  assert(shortTitleReunion.success === false, "Reunion title shorter than 3 chars is rejected");

  // 3. Career Opportunity Schema & Email Validation
  const validCareer = careerOpportunityCreateSchema.safeParse({
    badgeText: "Institutional Notice",
    title: "Careers & Alumni Faculty Association",
    description: "Inviting alumni scholars and experienced educators to join the academic mentoring team.",
    contactEmail: "principaldvp@gmail.com",
    emailSubject: "Alumni Association / Career Enquiry",
    ctaText: "Connect via Email",
    displayOrder: 1,
    isPublished: true,
  });
  assert(validCareer.success === true, "Valid career opportunity passes schema");

  const invalidEmailCareer = careerOpportunityCreateSchema.safeParse({
    title: "Careers & Alumni Faculty Association",
    description: "Inviting alumni scholars and experienced educators to join the academic mentoring team.",
    contactEmail: "not-an-email-address",
  });
  assert(invalidEmailCareer.success === false, "Career opportunity with invalid email fails validation");

  // 4. Update & Delete Schemas
  const validReunionUpdate = alumniReunionUpdateSchema.safeParse({
    id: "reunion-123",
    title: "Updated Reunion Title",
  });
  assert(validReunionUpdate.success === true, "Valid reunion update passes");

  const emptyDeleteReunion = alumniReunionDeleteSchema.safeParse({ id: "" });
  assert(emptyDeleteReunion.success === false, "Empty reunion delete ID is rejected");

  const validCareerUpdate = careerOpportunityUpdateSchema.safeParse({
    id: "career-123",
    ctaText: "Apply Now",
  });
  assert(validCareerUpdate.success === true, "Valid career update passes");

  const emptyDeleteCareer = careerOpportunityDeleteSchema.safeParse({ id: "" });
  assert(emptyDeleteCareer.success === false, "Empty career delete ID is rejected");

  // 5. Status Toggle & Reorder Schemas
  const validToggleReunion = toggleAlumniReunionStatusSchema.safeParse({
    id: "reunion-123",
    isPublished: false,
  });
  assert(validToggleReunion.success === true, "Valid reunion toggle schema passes");

  const validToggleCareer = toggleCareerOpportunityStatusSchema.safeParse({
    id: "career-123",
    isPublished: true,
  });
  assert(validToggleCareer.success === true, "Valid career toggle schema passes");

  const validReorder = reorderAlumniReunionsSchema.safeParse({
    items: [
      { id: "r1", displayOrder: 1 },
      { id: "r2", displayOrder: 2 },
    ],
  });
  assert(validReorder.success === true, "Valid reorder schema passes");

  const emptyReorder = reorderCareerOpportunitiesSchema.safeParse({
    items: [],
  });
  assert(emptyReorder.success === false, "Empty reorder items list is rejected");

  // 6. Diff Computation Helper
  const diff = computeAlumniDiff(
    { title: "Old Title", description: "Same Description" },
    { title: "New Title", description: "Same Description" }
  );
  assert(
    "title" in diff && diff.title.before === "Old Title" && diff.title.after === "New Title",
    "computeAlumniDiff tracks modified fields"
  );
  assert(!("description" in diff), "computeAlumniDiff ignores unmodified fields");

  // 7. Cache Revalidation Assertions
  const actionSource = fs.readFileSync(
    path.resolve(__dirname, "../lib/server/alumni-actions.ts"),
    "utf8"
  );
  assert(
    actionSource.includes('revalidateTag("alumni", "max")'),
    "alumni-actions.ts calls revalidateTag('alumni', 'max')"
  );
  assert(
    actionSource.includes('revalidatePath("/admin/students-parents/alumni")'),
    "alumni-actions.ts calls revalidatePath('/admin/students-parents/alumni')"
  );
  assert(
    !actionSource.includes('revalidatePath("/alumni")'),
    "alumni-actions.ts does NOT call non-existent backend route revalidatePath('/alumni')"
  );

  // 8. Storage Regex Verification
  const sampleStorageKey = "alumni/alu_12345678-1234-1234-1234-123456789abc.webp";
  assert(
    MANAGED_ALUMNI_KEY_REGEX.test(sampleStorageKey),
    "MANAGED_ALUMNI_KEY_REGEX matches valid alumni storage key"
  );
  assert(
    isValidManagedAlumniKey(sampleStorageKey),
    "isValidManagedAlumniKey returns true for valid key"
  );
  assert(
    !isValidManagedAlumniKey("activities/act_12345678-1234-1234-1234-123456789abc.webp"),
    "isValidManagedAlumniKey returns false for non-alumni key"
  );

  // 9. Database State Verification
  const overviewRecord = await prisma.alumniOverview.findUnique({
    where: { id: "default" },
  });
  assert(overviewRecord !== null, "Database contains default AlumniOverview record");
  assert(overviewRecord.title === "Alumni Corner", "AlumniOverview title preserved");

  const reunions = await prisma.alumniReunion.findMany();
  assert(reunions.length === 1, `Database contains exactly 1 reunion record (found: ${reunions.length})`);
  assert(reunions[0].slug === "alumni-meet-reunion", "Reunion slug matches 'alumni-meet-reunion'");
  assert(
    reunions[0].heroImage === "/images/gallery/ALUMNI-REUNION.webp",
    "Reunion heroImage matches '/images/gallery/ALUMNI-REUNION.webp'"
  );

  const careers = await prisma.careerOpportunity.findMany();
  assert(careers.length === 1, `Database contains exactly 1 career opportunity (found: ${careers.length})`);
  assert(
    careers[0].slug === "careers-alumni-faculty-association",
    "Career slug matches 'careers-alumni-faculty-association'"
  );
  assert(
    careers[0].contactEmail === "principaldvp@gmail.com",
    "Career contactEmail matches 'principaldvp@gmail.com'"
  );

  console.log(`\n  All tests passed: ${passed}/${total}`);
}

runTests()
  .then(() => {
    console.log("-----------------------------------------------------------------");
    console.log("  Alumni Actions & Validation Test Suite COMPLETED successfully.");
    console.log("-----------------------------------------------------------------");
  })
  .catch((err) => {
    console.error("  [ERROR] Test suite failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    try {
      if (fs.existsSync(validationBundleOutfile)) fs.unlinkSync(validationBundleOutfile);
      if (fs.existsSync(storageBundleOutfile)) fs.unlinkSync(storageBundleOutfile);
    } catch {}
    await prisma.$disconnect();
  });
