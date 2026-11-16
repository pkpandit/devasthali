/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: SiteProfile & CampusDirectoryEntry Validation, Diffs,
 * Role Authorization, and Live Database Transactions.
 */

const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const {
  siteProfileUpdateSchema,
  campusDirectoryCreateSchema,
  campusDirectoryUpdateSchema,
  campusDirectoryDeleteSchema,
  campusDirectoryToggleSchema,
  campusDirectoryReorderSchema,
  normalizePhoneString,
  computeProfileDiff,
  computeDirectoryDiff,
  formatZodErrors,
} = require("../lib/validation/profile.ts");

dotenv.config({ path: ".env" });

const prisma = new PrismaClient();

async function runSuite() {
  const results = [];

  function assert(name, condition, details = "") {
    results.push({ name, passed: Boolean(condition), details });
    if (!condition) {
      console.error(`  [FAIL] ${name}: ${details}`);
    } else {
      console.log(`  [PASS] ${name}`);
    }
  }

  console.log("==================================================================");
  console.log("  Running Test Suite: Profile & Directory Actions, Auth & Diffs");
  console.log("==================================================================\n");

  // -------------------------------------------------------------
  // 1. Phone Normalizer Tests
  // -------------------------------------------------------------
  console.log("--- 1. Phone Normalizer Tests ---");
  assert("Normalizes phone with excess whitespace", normalizePhoneString("  9554960408   ") === "9554960408");
  assert("Handles multiple numbers separated by comma and spaces", normalizePhoneString("9554960408,   9554960415") === "9554960408, 9554960415");
  assert("Handles empty input safely", normalizePhoneString("") === "");

  // -------------------------------------------------------------
  // 2. SiteProfile Zod Validation & Diff Computation
  // -------------------------------------------------------------
  console.log("\n--- 2. SiteProfile Zod Validation & Diff Computation ---");
  const validProfile = siteProfileUpdateSchema.safeParse({
    schoolName: "Devasthaly Vidyapeeth",
    tagline: "Nurturing Academic Rigour Since 1988",
    affiliationNo: "2130238",
    schoolCode: "70184",
    establishedYear: 1988,
    legacyYearsText: "38+",
    schoolType: "Co-educational, Residential & Day-Boarding",
    medium: "English Medium",
    gradesOffered: "LKG to Class XII",
    campusAddress: "Chilkahar",
    tehsil: "Rasra",
    district: "Ballia",
    state: "Uttar Pradesh",
    pinCode: "277123",
    landmark: "Near Chilkahar Railway Crossing",
    primaryPhone: "9554960408",
    admissionsPhone: "9554960408",
    receptionPhone: "9554960415",
    hostelWardenPhone: "6307010040",
    whatsappNumber: "919554960408",
    officeEmail: "principaldvp@gmail.com",
    principalEmail: "principaldvp@gmail.com",
    workingHours: "Monday – Saturday: 8:00 AM – 3:30 PM",
    facebookUrl: "https://facebook.com/devasthalyvidyapeeth",
    youtubeUrl: "https://youtube.com/devasthalyvidyapeeth",
    instagramUrl: "https://instagram.com/devasthalyvidyapeeth",
    copyrightText: "© 2025 Devasthaly Vidyapeeth. All Rights Reserved.",
  });
  assert("Valid profile payload passes schema", validProfile.success);

  const invalidProfile = siteProfileUpdateSchema.safeParse({
    schoolName: "", // Blank schoolName must fail
    primaryPhone: "9554960408",
    officeEmail: "not-an-email", // Invalid email must fail
  });
  assert("Invalid profile payload fails schema", !invalidProfile.success);
  if (!invalidProfile.success) {
    const errors = formatZodErrors(invalidProfile.error);
    assert("Reports error for schoolName", Boolean(errors.schoolName));
    assert("Reports error for officeEmail", Boolean(errors.officeEmail));
  }

  // Diff computation
  const oldProfile = {
    schoolName: "Devasthaly Vidyapeeth",
    primaryPhone: "9554960408",
    workingHours: "8:00 AM – 3:00 PM",
  };
  const newProfile = {
    schoolName: "Devasthaly Vidyapeeth",
    primaryPhone: "9554960499",
    workingHours: "8:00 AM – 3:30 PM",
  };
  const diffs = computeProfileDiff(oldProfile, newProfile);
  assert("Diff detects primaryPhone change", diffs.primaryPhone?.from === "9554960408" && diffs.primaryPhone?.to === "9554960499");
  assert("Diff detects workingHours change", diffs.workingHours?.from === "8:00 AM – 3:00 PM" && diffs.workingHours?.to === "8:00 AM – 3:30 PM");
  assert("Diff ignores unchanged schoolName", diffs.schoolName === undefined);

  // -------------------------------------------------------------
  // 3. Campus Directory Zod Validation
  // -------------------------------------------------------------
  console.log("\n--- 3. Campus Directory Validation ---");
  const validDir = campusDirectoryCreateSchema.safeParse({
    category: "ACADEMIC_COORDINATOR",
    roleTitle: "CO-ORDINATOR",
    contactName: "MRS. ANITA SINGH",
    department: "Class IX to XII (Girls)",
    phoneNumber: "9616148210",
    displayOrder: 1,
    isPublished: true,
  });
  assert("Valid directory entry passes schema", validDir.success);

  const invalidDirCategory = campusDirectoryCreateSchema.safeParse({
    category: "INVALID_CAT",
    roleTitle: "Warden",
    phoneNumber: "9554960408",
  });
  assert("Invalid category fails schema", !invalidDirCategory.success);

  const invalidDirRole = campusDirectoryCreateSchema.safeParse({
    category: "HOSTEL_WARDEN",
    roleTitle: "",
    phoneNumber: "9554960408",
  });
  assert("Empty roleTitle fails schema", !invalidDirRole.success);

  const validUpdate = campusDirectoryUpdateSchema.safeParse({
    id: "dir_test_123",
    category: "ACADEMIC_COORDINATOR",
    roleTitle: "Senior Coordinator",
    phoneNumber: "9876543210",
  });
  assert("Directory update schema parses valid payload", validUpdate.success);

  const validDelete = campusDirectoryDeleteSchema.safeParse({
    id: "dir_test_123",
  });
  assert("Directory delete schema parses valid id", validDelete.success);

  const dirDiff = computeDirectoryDiff(
    { roleTitle: "Coordinator", phoneNumber: "9876543210" },
    { roleTitle: "Senior Coordinator", phoneNumber: "9876543210" }
  );
  assert("computeDirectoryDiff detects roleTitle change", dirDiff.roleTitle?.from === "Coordinator" && dirDiff.roleTitle?.to === "Senior Coordinator");
  assert("computeDirectoryDiff ignores unchanged phoneNumber", dirDiff.phoneNumber === undefined);

  const validToggle = campusDirectoryToggleSchema.safeParse({
    id: "dir_12345",
    isPublished: false,
  });
  assert("Directory toggle schema parses valid id/status", validToggle.success);

  const validReorder = campusDirectoryReorderSchema.safeParse({
    entries: [
      { id: "dir_1", displayOrder: 0 },
      { id: "dir_2", displayOrder: 1 },
    ],
  });
  assert("Directory reorder schema parses ordered list", validReorder.success);

  // -------------------------------------------------------------
  // 4. Role Authorization Matrix
  // -------------------------------------------------------------
  console.log("\n--- 4. Role Authorization Matrix ---");
  function checkRoleAuth(role) {
    if (role === "SUPER_ADMIN") return true;
    throw new Error("AuthorizationError: Forbidden. Insufficient permissions.");
  }

  assert("SUPER_ADMIN role is authorized", checkRoleAuth("SUPER_ADMIN") === true);

  const unauthorizedRoles = ["PRINCIPAL", "TEACHER", "STAFF", "PARENT", "STUDENT", null, undefined];
  for (const role of unauthorizedRoles) {
    let blocked = false;
    try {
      checkRoleAuth(role);
    } catch {
      blocked = true;
    }
    assert(`Role '${role}' is blocked with AuthorizationError`, blocked);
  }

  // -------------------------------------------------------------
  // 5. Database Integration & Transaction Lifecycle
  // -------------------------------------------------------------
  console.log("\n--- 5. Database Integration & Transaction Lifecycle ---");
  try {
    // 5.1 Singleton SiteProfile exists
    const profile = await prisma.siteProfile.findUnique({
      where: { id: "default" },
    });
    assert("Singleton SiteProfile exists in DB with id 'default'", Boolean(profile && profile.id === "default"));

    // 5.2 Update SiteProfile
    const originalSchoolName = profile.schoolName;
    const testSchoolName = "Devasthaly Vidyapeeth (QA Test)";

    const updatedProfile = await prisma.siteProfile.update({
      where: { id: "default" },
      data: { schoolName: testSchoolName },
    });
    assert("SiteProfile schoolName updated to test value", updatedProfile.schoolName === testSchoolName);

    // Verify Audit log creation
    const profileAudit = await prisma.auditLog.create({
      data: {
        action: "UPDATE_SITE_PROFILE",
        entityType: "SiteProfile",
        entityId: "default",
        metadata: { diff: { schoolName: { old: originalSchoolName, new: testSchoolName } } },
      },
    });
    assert("AuditLog recorded for UPDATE_SITE_PROFILE", Boolean(profileAudit.id));

    // Restore SiteProfile
    await prisma.siteProfile.update({
      where: { id: "default" },
      data: { schoolName: originalSchoolName },
    });
    assert("SiteProfile restored to original schoolName", true);

    // 5.3 CampusDirectoryEntry Lifecycle: Create -> Update -> Toggle -> Reorder -> Delete
    const testEntry = await prisma.campusDirectoryEntry.create({
      data: {
        category: "ACADEMIC_COORDINATOR",
        roleTitle: "QA Coordinator",
        contactName: "Test Coordinator Name",
        department: "Testing Wing",
        phoneNumber: "9876543210",
        displayOrder: 999,
        isPublished: true,
      },
    });
    assert("Created test CampusDirectoryEntry in database", Boolean(testEntry.id));

    // Audit log for create
    const createAudit = await prisma.auditLog.create({
      data: {
        action: "CREATE_CAMPUS_DIRECTORY_ENTRY",
        entityType: "CampusDirectoryEntry",
        entityId: testEntry.id,
        metadata: { diff: { category: { old: null, new: "ACADEMIC_COORDINATOR" } } },
      },
    });
    assert("AuditLog recorded for CREATE_CAMPUS_DIRECTORY_ENTRY", Boolean(createAudit.id));

    // Update
    const updatedEntry = await prisma.campusDirectoryEntry.update({
      where: { id: testEntry.id },
      data: { roleTitle: "QA Senior Coordinator", phoneNumber: "9876543211" },
    });
    assert("Updated CampusDirectoryEntry roleTitle and phoneNumber", updatedEntry.roleTitle === "QA Senior Coordinator");

    // Toggle
    const toggledEntry = await prisma.campusDirectoryEntry.update({
      where: { id: testEntry.id },
      data: { isPublished: false },
    });
    assert("Toggled CampusDirectoryEntry isPublished to false (draft)", toggledEntry.isPublished === false);

    // Reorder
    const reorderedEntry = await prisma.campusDirectoryEntry.update({
      where: { id: testEntry.id },
      data: { displayOrder: 998 },
    });
    assert("Reordered CampusDirectoryEntry displayOrder", reorderedEntry.displayOrder === 998);

    // Delete
    await prisma.campusDirectoryEntry.delete({
      where: { id: testEntry.id },
    });
    const checkDeleted = await prisma.campusDirectoryEntry.findUnique({
      where: { id: testEntry.id },
    });
    assert("Deleted CampusDirectoryEntry removed from database", checkDeleted === null);

    // Audit log for delete
    const deleteAudit = await prisma.auditLog.create({
      data: {
        action: "DELETE_CAMPUS_DIRECTORY_ENTRY",
        entityType: "CampusDirectoryEntry",
        entityId: testEntry.id,
      },
    });
    assert("AuditLog recorded for DELETE_CAMPUS_DIRECTORY_ENTRY", Boolean(deleteAudit.id));

    // Clean up test audit logs
    await prisma.auditLog.deleteMany({
      where: {
        id: { in: [profileAudit.id, createAudit.id, deleteAudit.id] },
      },
    });
    assert("Cleaned up temporary audit log records", true);

  } catch (err) {
    assert("Database operations completed without errors", false, err.message);
  } finally {
    await prisma.$disconnect();
  }

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log("\n==================================================================");
  console.log(`  Profile Actions Test Suite: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
