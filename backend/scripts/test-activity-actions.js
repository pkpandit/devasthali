/**
 * Test Suite: Activity Server Actions, Validation, Storage & Media Pipeline (Milestone 15)
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

// Bundle TypeScript validation and storage for Node runtime
const validationOutfile = path.resolve(__dirname, "../dist_test_activity_validation.js");
const storageOutfile = path.resolve(__dirname, "../dist_test_activity_storage.js");

try {
  execSync(
    `npx esbuild lib/validation/activities.ts --bundle --platform=node --outfile=${validationOutfile} --external:@prisma/client --external:server-only`,
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
  execSync(
    `npx esbuild lib/server/storage.ts --bundle --platform=node --outfile=${storageOutfile} --external:@prisma/client --external:server-only`,
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
} catch (e) {
  console.error("esbuild compilation failed:", e);
  process.exit(1);
}

const {
  ALLOWED_ACTIVITY_ICONS,
  isValidRelativeOrHttpUrl,
  studentClubCreateSchema,
  studentClubUpdateSchema,
  studentClubDeleteSchema,
  toggleStudentClubStatusSchema,
  reorderStudentClubsSchema,
  activityOverviewUpdateSchema,
  computeActivityDiff,
} = require(validationOutfile);

const {
  isValidManagedActivityKey,
  generateManagedKey,
  MANAGED_ACTIVITY_KEY_REGEX,
} = require(storageOutfile);

async function runTests() {
  console.log("-----------------------------------------------------------------");
  console.log("  Running Activity Actions & Validation Test Suite");
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

  // 1. Icon Allow-list Tests
  const expectedIcons = [
    "Palette",
    "Sparkles",
    "Compass",
    "Music",
    "Activity",
    "Award",
    "Trophy",
    "Mic",
    "HeartHandshake",
    "BookOpen",
    "Dumbbell",
    "Smile",
  ];
  assert(
    expectedIcons.every((icon) => ALLOWED_ACTIVITY_ICONS.includes(icon)),
    "Allowed icon set contains all 12 canonical activity icons"
  );
  assert(
    ALLOWED_ACTIVITY_ICONS.length === 12,
    "Allowed icon set restricted strictly to 12 icons"
  );

  // 2. Safe URL Validation Tests
  assert(
    isValidRelativeOrHttpUrl("/co-curricular-activities"),
    "Valid internal root-relative path passes"
  );
  assert(
    isValidRelativeOrHttpUrl("https://example.com/activity"),
    "Valid secure HTTPS URL passes"
  );
  assert(
    !isValidRelativeOrHttpUrl("http://localhost:3000"),
    "Localhost URL is rejected"
  );
  assert(
    !isValidRelativeOrHttpUrl("http://127.0.0.1:3001"),
    "127.0.0.1 URL is rejected"
  );
  assert(
    !isValidRelativeOrHttpUrl("javascript:alert(1)"),
    "javascript: URI is rejected"
  );
  assert(
    !isValidRelativeOrHttpUrl(""),
    "Empty string URL is rejected"
  );

  // 3. Student Club Schema Validation
  const validClub = {
    name: "Science & Innovation Club",
    category: "Science & Technology",
    description: "Hands-on robotics, astronomy, and science fair projects.",
    iconName: "Sparkles",
    displayOrder: 1,
    isPublished: true,
  };
  const parsedClub = studentClubCreateSchema.safeParse(validClub);
  assert(parsedClub.success, "Valid student club passes validation");

  const invalidIconClub = {
    ...validClub,
    iconName: "AlienShip", // Not in allow-list
  };
  assert(
    !studentClubCreateSchema.safeParse(invalidIconClub).success,
    "Unauthorized icon 'AlienShip' is rejected"
  );

  const shortNameClub = {
    ...validClub,
    name: "A", // Min 2 chars
  };
  assert(
    !studentClubCreateSchema.safeParse(shortNameClub).success,
    "Club name shorter than 2 chars is rejected"
  );

  // 4. Student Club Update, Delete, Toggle, Reorder Schemas
  const validUpdate = {
    id: "club_123",
    name: "Updated Robotics Club",
    iconName: "Activity",
    displayOrder: 2,
  };
  assert(
    studentClubUpdateSchema.safeParse(validUpdate).success,
    "Valid student club update passes"
  );

  assert(
    studentClubDeleteSchema.safeParse({ id: "club_123" }).success,
    "Valid student club delete passes"
  );
  assert(
    !studentClubDeleteSchema.safeParse({ id: "" }).success,
    "Empty student club delete ID is rejected"
  );

  assert(
    toggleStudentClubStatusSchema.safeParse({ id: "club_123" }).success,
    "Valid toggle club status ID passes"
  );

  assert(
    reorderStudentClubsSchema.safeParse({ orderedIds: ["club_1", "club_2"] }).success,
    "Valid reorder IDs pass"
  );
  assert(
    !reorderStudentClubsSchema.safeParse({ orderedIds: [] }).success,
    "Empty reorder IDs list is rejected"
  );

  // 5. Activity Overview Schema & Alt-Text Enforcement
  const validOverviewWithImage = {
    badgeText: "Holistic Student Development",
    title: "Life at Devasthaly Vidyapeeth",
    subtitle: "Nurturing creative minds and athletic champions.",
    arenaSize: "12+ Acres of Sports & Cultural Infrastructure",
    cardTitle: "Vibrant Campus & Active Student Life",
    cardSubtitle: "Where intellectual growth meets passion and teamwork.",
    narrativeParagraph1: "Our co-curricular programs complement rigorous academics.",
    narrativeParagraph2: "Students participate in dynamic clubs and athletic arenas.",
    heroImage: "/images/activities/sports-complex.jpg",
    heroImageAlt: "Devasthaly Vidyapeeth sports arena with students engaged in basketball practice",
  };
  assert(
    activityOverviewUpdateSchema.safeParse(validOverviewWithImage).success,
    "Valid overview with hero image and alt text passes"
  );

  const missingAltTextOverview = {
    ...validOverviewWithImage,
    heroImageAlt: "pic", // Less than 5 chars
  };
  assert(
    !activityOverviewUpdateSchema.safeParse(missingAltTextOverview).success,
    "Showcase image with alt text < 5 chars is rejected"
  );

  const emptyImageWithoutAlt = {
    ...validOverviewWithImage,
    heroImage: "",
    heroImageAlt: "",
  };
  assert(
    activityOverviewUpdateSchema.safeParse(emptyImageWithoutAlt).success,
    "Overview without hero image does not require alt text"
  );

  // 6. Diff Computation Test
  const oldOverview = { cardTitle: "Old Title", heroImageAlt: "Same Alt" };
  const newOverview = { cardTitle: "New Title", heroImageAlt: "Same Alt" };
  const diff = computeActivityDiff(oldOverview, newOverview);
  assert(
    diff.cardTitle &&
      diff.cardTitle.from === "Old Title" &&
      diff.cardTitle.to === "New Title" &&
      !diff.heroImageAlt,
    "computeActivityDiff tracks modified fields and ignores identical fields"
  );

  // 7. Storage Key & Regex Validations
  const validKey = "activities/act_12345678-1234-1234-1234-123456789abc.webp";
  assert(
    isValidManagedActivityKey(validKey),
    "Valid activities storage key passes regex"
  );
  assert(
    !isValidManagedActivityKey("activities/top_12345678-1234-1234-1234-123456789abc.webp"),
    "Storage key with wrong prefix 'top' in activities folder is rejected"
  );
  assert(
    !isValidManagedActivityKey("gallery/act_12345678-1234-1234-1234-123456789abc.webp"),
    "Storage key with wrong folder for act prefix is rejected"
  );

  const generatedKey = generateManagedKey("activities");
  assert(
    MANAGED_ACTIVITY_KEY_REGEX.test(generatedKey),
    `generateManagedKey('activities') generates compliant key: ${generatedKey}`
  );

  // 8. Server Actions File Structure and Revalidation Tag Check
  const actionsFilePath = path.resolve(__dirname, "../lib/server/activity-actions.ts");
  const actionsContent = fs.readFileSync(actionsFilePath, "utf8");

  assert(
    actionsContent.includes('revalidateTag("activities", "max")'),
    "activity-actions.ts calls revalidateTag('activities', 'max')"
  );
  assert(
    actionsContent.includes('revalidatePath("/admin/life-at-school/activities")'),
    "activity-actions.ts calls revalidatePath('/admin/life-at-school/activities')"
  );
  assert(
    !actionsContent.includes('revalidatePath("/co-curricular-activities")'),
    "activity-actions.ts does NOT call non-existent backend route revalidatePath('/co-curricular-activities')"
  );

  // 9. Media Route File Check
  const mediaRoutePath = path.resolve(
    __dirname,
    "../app/api/public/media/activities/[filename]/route.ts"
  );
  assert(
    fs.existsSync(mediaRoutePath),
    "Media route backend/app/api/public/media/activities/[filename]/route.ts exists"
  );
  const mediaRouteContent = fs.readFileSync(mediaRoutePath, "utf8");
  assert(
    mediaRouteContent.includes("isValidManagedActivityKey"),
    "Media route imports and checks isValidManagedActivityKey"
  );
  assert(
    mediaRouteContent.includes("immutable"),
    "Media route applies immutable cache headers"
  );

  // 10. Database Seed Verification
  const clubCount = await prisma.studentClub.count();
  const overviewRecord = await prisma.activityOverview.findUnique({ where: { id: "default" } });

  assert(clubCount === 8, `Database contains exactly 8 student clubs (found: ${clubCount})`);
  assert(overviewRecord !== null, "Database contains default ActivityOverview record");
  assert(
    overviewRecord && overviewRecord.arenaSize === "22,000 sq ft",
    "ActivityOverview contains preserved arenaSize ('22,000 sq ft')"
  );
  assert(
    overviewRecord && overviewRecord.heroImage === null,
    "ActivityOverview heroImage is nullable and defaults to null unless uploaded"
  );

  console.log(`\n  All tests passed: ${passed}/${total}`);
}

runTests()
  .then(() => {
    console.log("-----------------------------------------------------------------");
    console.log("  Activity Actions & Validation Test Suite COMPLETED successfully.");
    console.log("-----------------------------------------------------------------");
  })
  .catch((err) => {
    console.error("  [ERROR] Test suite failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    try {
      if (fs.existsSync(validationOutfile)) fs.unlinkSync(validationOutfile);
      if (fs.existsSync(storageOutfile)) fs.unlinkSync(storageOutfile);
    } catch {}
    await prisma.$disconnect();
  });
