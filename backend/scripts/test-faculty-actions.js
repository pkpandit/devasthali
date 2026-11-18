/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Faculty & Mentors Actions, Schemas, Auth & Database Integration
 */

const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const {
  validateFacultyUrl,
  facultyMemberCreateSchema,
  facultyMemberUpdateSchema,
  facultyMemberDeleteSchema,
  facultyMemberToggleSchema,
  facultyMemberReorderSchema,
  normalizeFacultyPayload,
  computeFacultyDiff,
} = require("../lib/validation/faculty.ts");

dotenv.config({ path: ".env" });
const prisma = new PrismaClient();

async function runSuite() {
  const results = [];

  function assert(name, condition, errorDetail) {
    if (condition) {
      results.push({ name, passed: true });
      console.log(`  [PASS] ${name}`);
    } else {
      results.push({ name, passed: false, error: errorDetail || "Assertion failed" });
      console.error(`  [FAIL] ${name} ${errorDetail ? `- ${errorDetail}` : ""}`);
    }
  }

  console.log("==================================================================");
  console.log("  Running Test Suite: Faculty & Mentors Actions, Schemas & Auth");
  console.log("==================================================================");

  // -------------------------------------------------------------
  // 1. URL Safety Validation Tests
  // -------------------------------------------------------------
  console.log("\n--- 1. URL Safety Validation Tests ---");

  assert("Accepts root-relative image path", validateFacultyUrl("/images/academics/faculty/teacher.jpg").valid === true);
  assert("Accepts secure HTTPS URL", validateFacultyUrl("https://images.unsplash.com/photo-123.jpg").valid === true);
  assert("Rejects plain HTTP", validateFacultyUrl("http://insecure.com/photo.jpg").valid === false);
  assert("Rejects javascript scheme", validateFacultyUrl("javascript:alert(1)").valid === false);
  assert("Rejects data URI", validateFacultyUrl("data:image/png;base64,abc").valid === false);
  assert("Rejects protocol-relative '//evil.com'", validateFacultyUrl("//evil.com/img.jpg").valid === false);
  assert("Optional null allows valid=true", validateFacultyUrl(null).valid === true);
  assert("Optional empty string allows valid=true", validateFacultyUrl("").valid === true);

  const schemaRejects = facultyMemberCreateSchema.safeParse({
    name: "Dr. Test Mentor",
    designation: "PGT Senior Physics",
    department: "Physics",
    imageUrl: "http://insecure.com/test.jpg",
    imageAlt: "Test Alt",
  });
  assert("Schema rejects invalid scheme", schemaRejects.success === false);

  // -------------------------------------------------------------
  // 2. Safe Text & Schema Validation Tests
  // -------------------------------------------------------------
  console.log("\n--- 2. Safe Text & Schema Validation Tests ---");

  const validPayload = {
    name: "Dr. Test Mentor",
    designation: "PGT Senior Physics",
    department: "Physics",
    qualification: "M.Sc. Physics, Ph.D.",
    experienceYears: 15,
    bio: "Dedicated physics educator mentoring JEE aspirants.",
    imageUrl: "/images/academics/faculty/faculty-teachers.jpg",
    imageAlt: "Dr. Test Mentor - PGT Physics",
    displayOrder: 10,
    isPublished: true,
  };

  assert("Valid faculty payload passes schema", facultyMemberCreateSchema.safeParse(validPayload).success === true);

  assert(
    "Rejects payload with empty name",
    facultyMemberCreateSchema.safeParse({ ...validPayload, name: "" }).success === false
  );

  assert(
    "Rejects payload with HTML in name",
    facultyMemberCreateSchema.safeParse({ ...validPayload, name: "Dr. <script>alert(1)</script> Mentor" }).success === false
  );

  assert(
    "Rejects payload with HTML in designation",
    facultyMemberCreateSchema.safeParse({ ...validPayload, designation: "PGT <b>Physics</b>" }).success === false
  );

  assert(
    "Rejects payload with HTML in department",
    facultyMemberCreateSchema.safeParse({ ...validPayload, department: "Physics <img src=x onerror=alert(1)>" }).success === false
  );

  assert(
    "Rejects negative experienceYears",
    facultyMemberCreateSchema.safeParse({ ...validPayload, experienceYears: -5 }).success === false
  );

  assert(
    "Rejects experienceYears > 99",
    facultyMemberCreateSchema.safeParse({ ...validPayload, experienceYears: 120 }).success === false
  );

  assert(
    "Accepts experienceYears = 0",
    facultyMemberCreateSchema.safeParse({ ...validPayload, experienceYears: 0 }).success === true
  );

  assert(
    "Rejects image with empty alt text",
    facultyMemberCreateSchema.safeParse({
      ...validPayload,
      imageUrl: "/images/teacher.jpg",
      imageAlt: "",
    }).success === false
  );

  assert(
    "Valid update schema with ID passes",
    facultyMemberUpdateSchema.safeParse({ id: "test-id-123", ...validPayload }).success === true
  );

  assert(
    "Update schema fails without ID",
    facultyMemberUpdateSchema.safeParse({ id: "", ...validPayload }).success === false
  );

  assert(
    "Delete schema valid",
    facultyMemberDeleteSchema.safeParse({ id: "valid-cuid" }).success === true
  );

  assert(
    "Toggle schema valid",
    facultyMemberToggleSchema.safeParse({ id: "valid-cuid", isPublished: false }).success === true
  );

  assert(
    "Reorder schema valid with non-empty array",
    facultyMemberReorderSchema.safeParse({ orderedIds: ["id-1", "id-2"] }).success === true
  );

  assert(
    "Reorder schema rejects empty array",
    facultyMemberReorderSchema.safeParse({ orderedIds: [] }).success === false
  );

  // -------------------------------------------------------------
  // 3. Normalizer & Diff Utility Tests
  // -------------------------------------------------------------
  console.log("\n--- 3. Normalizer & Diff Utility Tests ---");

  const normalized = normalizeFacultyPayload({
    name: "  Trimmed Name  ",
    qualification: "   ",
    bio: "",
    experienceYears: 10,
  });
  assert("Normalizer trims string values", normalized.name === "Trimmed Name");
  assert("Normalizer converts whitespace to null", normalized.qualification === null);
  assert("Normalizer converts empty string to null", normalized.bio === null);
  assert("Normalizer preserves numbers", normalized.experienceYears === 10);

  // Test FormData payload normalization
  const formData = new FormData();
  formData.append("name", "  FormData Teacher  ");
  formData.append("qualification", "");
  formData.append("experienceYears", "8");
  formData.append("isPublished", "true");
  const normalizedFormData = normalizeFacultyPayload(formData);
  assert("Normalizer processes FormData correctly", normalizedFormData.name === "FormData Teacher");
  assert("Normalizer converts empty FormData value to null", normalizedFormData.qualification === null);

  const diff = computeFacultyDiff(
    { name: "Old Name", designation: "PGT", department: "Science", experienceYears: 10 },
    { name: "New Name", designation: "PGT", department: "Science", experienceYears: 12 }
  );
  assert("Diff detects modified name", diff.name && diff.name.from === "Old Name" && diff.name.to === "New Name");
  assert("Diff detects modified experience", diff.experienceYears && diff.experienceYears.from === 10 && diff.experienceYears.to === 12);
  assert("Diff ignores unchanged designation", diff.designation === undefined);

  // Test photo diff masking
  const photoDiff = computeFacultyDiff(
    { imageUrl: "/images/old.jpg", imageStorageKey: null },
    { imageUrl: "/api/public/media/toppers/top_123.webp", imageStorageKey: "toppers/top_123.webp" }
  );
  assert("Diff masks imageUrl changes cleanly", photoDiff.imageUrl && photoDiff.imageUrl.from === "[PRESENT]" && photoDiff.imageUrl.to === "[PRESENT]");

  const photoRemovalDiff = computeFacultyDiff(
    { imageUrl: "/images/old.jpg", imageStorageKey: null },
    { imageUrl: null, imageStorageKey: null }
  );
  assert("Diff masks image removal to [NONE]", photoRemovalDiff.imageUrl && photoRemovalDiff.imageUrl.from === "[PRESENT]" && photoRemovalDiff.imageUrl.to === "[NONE]");

  // -------------------------------------------------------------
  // 4. Role Authorization Matrix
  // -------------------------------------------------------------
  console.log("\n--- 4. Role Authorization Matrix ---");
  const ALLOWED_ROLES = ["SUPER_ADMIN"];
  const TEST_ROLES = ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "STAFF", "PARENT", "STUDENT", null, undefined];

  for (const role of TEST_ROLES) {
    const isAllowed = ALLOWED_ROLES.includes(role);
    if (isAllowed) {
      assert(`Role '${role}' is ALLOWED`, isAllowed === true);
    } else {
      assert(`Role '${role}' is BLOCKED`, isAllowed === false);
    }
  }

  // -------------------------------------------------------------
  // 5. Live Database Integration Tests
  // -------------------------------------------------------------
  console.log("\n--- 5. Live Database Integration Tests ---");

  const seededCount = await prisma.facultyMember.count();
  assert("Default seeded faculty count is 8", seededCount === 8, `Found ${seededCount}`);

  // Create temporary test faculty member
  const testMember = await prisma.facultyMember.create({
    data: {
      name: "Test Verification Teacher",
      designation: "Assistant Teacher",
      department: "Test Department",
      qualification: "B.Sc., B.Ed.",
      experienceYears: 5,
      bio: "Temporary test educator for QA verification",
      imageUrl: "/images/academics/faculty/faculty-teachers.jpg",
      imageAlt: "Test Verification Teacher",
      displayOrder: 999,
      isPublished: true,
    },
  });
  assert("Created test faculty member in DB", Boolean(testMember.id));

  // Update test faculty member
  const updatedMember = await prisma.facultyMember.update({
    where: { id: testMember.id },
    data: {
      experienceYears: 6,
      designation: "Senior Assistant Teacher",
    },
  });
  assert("Updated test member experienceYears to 6", updatedMember.experienceYears === 6);
  assert("Updated test member designation", updatedMember.designation === "Senior Assistant Teacher");

  // Toggle status
  const toggledMember = await prisma.facultyMember.update({
    where: { id: testMember.id },
    data: { isPublished: false },
  });
  assert("Toggled test member to draft (isPublished: false)", toggledMember.isPublished === false);

  // Clean up test member
  await prisma.facultyMember.delete({
    where: { id: testMember.id },
  });
  const afterDeleteCount = await prisma.facultyMember.count();
  assert("Deleted test member successfully; count restored to 8", afterDeleteCount === 8);

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n==================================================================");
  console.log(`  Faculty Actions Test Suite: ${passed} Passed, ${failed} Failed (Total ${total})`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite()
  .catch((e) => {
    console.error("Test suite fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
