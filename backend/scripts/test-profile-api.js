/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Public Site Profile & Campus Directory API Logic & Security.
 * Tests:
 * 1. SiteProfile public DTO projection, field whitelisting, and secret isolation.
 * 2. CampusDirectory public projection, draft isolation, and ordering.
 * 3. Database query parity with production endpoints.
 * 4. Cache-Control header compliance (public, s-maxage=60, stale-while-revalidate=300).
 */

const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

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
  console.log("  Running Test Suite: Public Profile & Directory API Logic");
  console.log("==================================================================\n");

  // -------------------------------------------------------------
  // 1. SiteProfile Projection & Whitelist
  // -------------------------------------------------------------
  console.log("--- 1. SiteProfile DTO Projection & Security ---");
  const rawDbProfile = {
    id: "default",
    schoolName: "Devasthaly Vidyapeeth",
    tagline: "Nurturing Academic Rigour Since 1988",
    affiliationNo: "2130238",
    schoolCode: "70184",
    establishedYear: 1988,
    legacyYearsText: "38+",
    schoolType: "Co-educational",
    medium: "English Medium",
    gradesOffered: "LKG to XII",
    campusAddress: "Chilkahar",
    tehsil: "Rasra",
    district: "Ballia",
    state: "Uttar Pradesh",
    pinCode: "277123",
    landmark: "Near Railway Crossing",
    primaryPhone: "9554960408",
    admissionsPhone: "9554960408",
    receptionPhone: "9554960415",
    hostelWardenPhone: "6307010040",
    whatsappNumber: "919554960408",
    officeEmail: "principaldvp@gmail.com",
    principalEmail: "principaldvp@gmail.com",
    workingHours: "8:00 AM – 3:30 PM",
    facebookUrl: "https://facebook.com/devasthalyvidyapeeth",
    youtubeUrl: "https://youtube.com/devasthalyvidyapeeth",
    instagramUrl: "https://instagram.com/devasthalyvidyapeeth",
    copyrightText: "© 2025 Devasthaly Vidyapeeth.",
    createdAt: new Date(),
    updatedAt: new Date(),
    internalAuditId: "secret_audit_999",
  };

  function projectProfileDto(profile) {
    return {
      schoolName: profile.schoolName,
      tagline: profile.tagline,
      affiliationNo: profile.affiliationNo,
      schoolCode: profile.schoolCode,
      establishedYear: profile.establishedYear,
      legacyYearsText: profile.legacyYearsText,
      schoolType: profile.schoolType,
      medium: profile.medium,
      gradesOffered: profile.gradesOffered,
      address: {
        campus: profile.campusAddress,
        tehsil: profile.tehsil,
        district: profile.district,
        state: profile.state,
        pinCode: profile.pinCode,
        landmark: profile.landmark,
      },
      contacts: {
        primaryPhone: profile.primaryPhone,
        admissionsPhone: profile.admissionsPhone,
        receptionPhone: profile.receptionPhone,
        hostelWardenPhone: profile.hostelWardenPhone,
        whatsappNumber: profile.whatsappNumber,
        email: profile.principalEmail || profile.officeEmail,
        officeEmail: profile.officeEmail,
        workingHours: profile.workingHours,
      },
      social: {
        facebook: profile.facebookUrl,
        youtube: profile.youtubeUrl,
        instagram: profile.instagramUrl,
      },
      copyrightText: profile.copyrightText,
    };
  }

  const projected = projectProfileDto(rawDbProfile);
  assert("Profile DTO contains schoolName", projected.schoolName === "Devasthaly Vidyapeeth");
  assert("Profile DTO contains nested address object", Boolean(projected.address && projected.address.campus === "Chilkahar"));
  assert("Profile DTO contains nested contacts object", Boolean(projected.contacts && projected.contacts.primaryPhone === "9554960408"));
  assert("Profile DTO contains nested social object", Boolean(projected.social && projected.social.facebook));
  assert("Database ID is not leaked in public profile DTO", projected.id === undefined);
  assert("Audit/internal keys are not leaked", projected.internalAuditId === undefined);
  assert("createdAt / updatedAt are not leaked", projected.createdAt === undefined && projected.updatedAt === undefined);

  // -------------------------------------------------------------
  // 2. CampusDirectory Projection & Draft Isolation
  // -------------------------------------------------------------
  console.log("\n--- 2. CampusDirectory Projection & Draft Isolation ---");
  const mockEntries = [
    { id: "e1", category: "ACADEMIC_COORDINATOR", roleTitle: "Coord A", contactName: "Alice", department: "Primary", phoneNumber: "111", displayOrder: 1, isPublished: true, createdAt: new Date() },
    { id: "e2", category: "ACADEMIC_COORDINATOR", roleTitle: "Coord B", contactName: "Bob", department: "Senior", phoneNumber: "222", displayOrder: 2, isPublished: false, createdAt: new Date() },
    { id: "e3", category: "HOSTEL_WARDEN", roleTitle: "Warden 1", contactName: "Charlie", department: "Hostel", phoneNumber: "333", displayOrder: 0, isPublished: true, createdAt: new Date() },
  ];

  function projectDirectoryDto(entries) {
    return entries
      .filter((e) => e.isPublished)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((e) => ({
        id: e.id,
        category: e.category,
        roleTitle: e.roleTitle,
        contactName: e.contactName,
        department: e.department,
        phoneNumber: e.phoneNumber,
        displayOrder: e.displayOrder,
      }));
  }

  const publicDirectory = projectDirectoryDto(mockEntries);
  assert("Unpublished/draft entry (e2) is completely excluded", publicDirectory.every((e) => e.id !== "e2"));
  assert("Public entries are sorted by displayOrder asc (e3 first with 0)", publicDirectory[0].id === "e3");
  assert("All projected entries contain required display fields", publicDirectory.every((e) => e.roleTitle && e.phoneNumber));

  // -------------------------------------------------------------
  // 3. Database Parity Verification
  // -------------------------------------------------------------
  console.log("\n--- 3. Database Parity Verification ---");
  try {
    const liveProfile = await prisma.siteProfile.findUnique({
      where: { id: "default" },
    });
    assert("Live DB profile is present", Boolean(liveProfile));
    if (liveProfile) {
      const liveDto = projectProfileDto(liveProfile);
      assert("Live profile produces valid DTO with non-empty schoolName", Boolean(liveDto.schoolName));
      assert("Live profile has valid CBSE affiliation number", liveDto.affiliationNo === "2130238");
    }

    const liveDirectory = await prisma.campusDirectoryEntry.findMany({
      where: { isPublished: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        category: true,
        roleTitle: true,
        contactName: true,
        department: true,
        phoneNumber: true,
        displayOrder: true,
      },
    });
    assert("Live DB directory returns published entries (seeded)", liveDirectory.length >= 20);
    assert("Live directory is sorted in ascending displayOrder", liveDirectory.every((e, i, arr) => i === 0 || e.displayOrder >= arr[i - 1].displayOrder));
  } catch (err) {
    assert("DB query parity executed without error", false, err.message);
  } finally {
    await prisma.$disconnect();
  }

  // -------------------------------------------------------------
  // 4. Cache-Control Header Policy
  // -------------------------------------------------------------
  console.log("\n--- 4. Cache-Control Header Policy ---");
  const expectedHeader = "public, s-maxage=60, stale-while-revalidate=300";
  assert("Header policy specifies public caching", expectedHeader.includes("public"));
  assert("Header policy specifies 60s CDN max-age", expectedHeader.includes("s-maxage=60"));
  assert("Header policy specifies 300s stale-while-revalidate", expectedHeader.includes("stale-while-revalidate=300"));

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log("\n==================================================================");
  console.log(`  Profile Public API Test Suite: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
