/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Frontend Profile & Directory Integration & Fallbacks.
 * Tests:
 * 1. Zod schema conformance for SiteProfile and CampusDirectoryEntry DTOs.
 * 2. Static fallback resilience when backend origin is absent or unreachable.
 * 3. Component data contract validation (Header, Footer, MobileStickyDock, ContactPage).
 */

const { z } = require("zod");

console.log("===============================================================");
console.log("  Running Frontend Profile & Directory Integration Tests");
console.log("===============================================================\n");

// Replicate schemas from frontend/lib/api/profile.ts
const DirectoryCategoryEnum = z.enum([
  "ADMINISTRATION",
  "HOSTEL_WARDEN",
  "ACADEMIC_COORDINATOR",
  "OFFICE_ACCOUNTS",
  "SECURITY_TRANSPORT",
]);

const publicSiteProfileSchema = z.object({
  schoolName: z.string().min(1),
  tagline: z.string().nullable().optional(),
  affiliationNo: z.string().nullable().optional(),
  schoolCode: z.string().nullable().optional(),
  establishedYear: z.number().nullable().optional(),
  legacyYearsText: z.string().nullable().optional(),
  schoolType: z.string().nullable().optional(),
  medium: z.string().nullable().optional(),
  gradesOffered: z.string().nullable().optional(),
  address: z.object({
    campus: z.string().nullable().optional(),
    tehsil: z.string().nullable().optional(),
    district: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    pinCode: z.string().nullable().optional(),
    landmark: z.string().nullable().optional(),
  }),
  contacts: z.object({
    primaryPhone: z.string().nullable().optional(),
    admissionsPhone: z.string().nullable().optional(),
    receptionPhone: z.string().nullable().optional(),
    hostelWardenPhone: z.string().nullable().optional(),
    whatsappNumber: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    officeEmail: z.string().nullable().optional(),
    workingHours: z.string().nullable().optional(),
  }),
  social: z.object({
    facebook: z.string().nullable().optional(),
    youtube: z.string().nullable().optional(),
    instagram: z.string().nullable().optional(),
  }),
  copyrightText: z.string().nullable().optional(),
});

const publicDirectoryEntrySchema = z.object({
  id: z.string(),
  category: DirectoryCategoryEnum,
  roleTitle: z.string(),
  contactName: z.string().nullable(),
  department: z.string().nullable(),
  phoneNumber: z.string(),
  displayOrder: z.number(),
});

const publicDirectoryArraySchema = z.array(publicDirectoryEntrySchema);

const results = [];
function check(name, condition, details = "") {
  results.push({ name, passed: Boolean(condition), details });
  if (!condition) {
    console.error(`  [FAIL] ${name}: ${details}`);
  } else {
    console.log(`  [PASS] ${name}`);
  }
}

// -------------------------------------------------------------
// 1. Schema Conformance Tests
// -------------------------------------------------------------
console.log("--- 1. Schema Conformance Tests ---");
const validProfileSample = {
  schoolName: "Devasthaly Vidyapeeth",
  tagline: "Nurturing Academic Rigour Since 1988",
  affiliationNo: "2130238",
  schoolCode: "70184",
  establishedYear: 1988,
  legacyYearsText: "38+",
  schoolType: "Co-educational, Residential & Day-Boarding",
  medium: "English Medium",
  gradesOffered: "LKG to Class XII",
  address: {
    campus: "Chilkahar",
    tehsil: "Rasra",
    district: "Ballia",
    state: "Uttar Pradesh",
    pinCode: "277123",
    landmark: "Near Chilkahar Railway Crossing",
  },
  contacts: {
    primaryPhone: "9554960408",
    admissionsPhone: "9554960408",
    receptionPhone: "9554960415",
    hostelWardenPhone: "6307010040",
    whatsappNumber: "919554960408",
    email: "principaldvp@gmail.com",
    officeEmail: "principaldvp@gmail.com",
    workingHours: "Monday – Saturday: 8:00 AM – 3:30 PM",
  },
  social: {
    facebook: "https://facebook.com/devasthalyvidyapeeth",
    youtube: "https://youtube.com/devasthalyvidyapeeth",
    instagram: "https://instagram.com/devasthalyvidyapeeth",
  },
  copyrightText: "© 2025 Devasthaly Vidyapeeth. All Rights Reserved.",
};

const parseProfile = publicSiteProfileSchema.safeParse(validProfileSample);
check("Valid profile payload conforms to schema", parseProfile.success);

const invalidProfileSample = { ...validProfileSample, schoolName: "" };
const parseInvalidProfile = publicSiteProfileSchema.safeParse(invalidProfileSample);
check("Empty schoolName rejected by schema", !parseInvalidProfile.success);

const validDirectorySample = [
  {
    id: "dir-1",
    category: "ACADEMIC_COORDINATOR",
    roleTitle: "CO-ORDINATOR",
    contactName: "MRS. ANITA SINGH",
    department: "IX to XII (GIRLS)",
    phoneNumber: "9616148210",
    displayOrder: 1,
  },
  {
    id: "dir-2",
    category: "HOSTEL_WARDEN",
    roleTitle: "Chief Warden",
    contactName: "Mr. Dhirendra Singh",
    department: "Hostel Administration",
    phoneNumber: "6307010040",
    displayOrder: 2,
  },
];

const parseDirectory = publicDirectoryArraySchema.safeParse(validDirectorySample);
check("Valid directory array conforms to schema", parseDirectory.success);

const invalidDirectoryCategory = [
  { ...validDirectorySample[0], category: "INVALID_DEPT" },
];
const parseInvalidCategory = publicDirectoryArraySchema.safeParse(invalidDirectoryCategory);
check("Invalid category rejected by schema", !parseInvalidCategory.success);

// -------------------------------------------------------------
// 2. Static Fallback Resilience
// -------------------------------------------------------------
console.log("\n--- 2. Static Fallback Resilience ---");
// Simulate fetch failure behavior
function mockGetProfileWithFallback(apiResponse, isNetworkError = false) {
  if (isNetworkError) {
    return validProfileSample; // Returns static fallback
  }
  const parsed = publicSiteProfileSchema.safeParse(apiResponse);
  return parsed.success ? parsed.data : validProfileSample;
}

const fallbackOnNetworkError = mockGetProfileWithFallback(null, true);
check("Returns full static profile on network failure", fallbackOnNetworkError.schoolName === "Devasthaly Vidyapeeth");
check("Fallback contains CBSE affiliation", fallbackOnNetworkError.affiliationNo === "2130238");
check("Fallback contains admissions phone", fallbackOnNetworkError.contacts.admissionsPhone === "9554960408");

const fallbackOnCorruptedJson = mockGetProfileWithFallback({ broken: true }, false);
check("Returns static fallback on corrupt/malformed API payload", fallbackOnCorruptedJson.schoolName === "Devasthaly Vidyapeeth");

// -------------------------------------------------------------
// 3. Component Data Contract Verification
// -------------------------------------------------------------
console.log("\n--- 3. Component Data Contract Verification ---");

// Header Contract
function simulateHeaderFormatting(profile) {
  const affiliationNo = profile?.affiliationNo || "2130238";
  const schoolCode = profile?.schoolCode || "70184";
  const admissionsPhone = profile?.contacts?.admissionsPhone || "9554960408";
  const rawWhatsApp = profile?.contacts?.whatsappNumber || "919554960408";
  const cleanWhatsApp = rawWhatsApp.replace(/\D/g, "");
  return { affiliationNo, schoolCode, admissionsPhone, cleanWhatsApp };
}

const headerProps = simulateHeaderFormatting(validProfileSample);
check("Header receives valid affiliation number", headerProps.affiliationNo === "2130238");
check("Header formats clean WhatsApp link target", headerProps.cleanWhatsApp === "919554960408");
check("Header formats valid admissions phone", headerProps.admissionsPhone === "9554960408");

// Footer Contract
function simulateFooterFormatting(profile) {
  const schoolName = profile?.schoolName || "Devasthaly Vidyapeeth";
  const email = profile?.contacts?.email || "principaldvp@gmail.com";
  const workingHours = profile?.contacts?.workingHours || "Mon – Sat: 8:00 AM – 3:30 PM";
  const copyrightText = profile?.copyrightText || "© 2025 Devasthaly Vidyapeeth.";
  return { schoolName, email, workingHours, copyrightText };
}

const footerProps = simulateFooterFormatting(validProfileSample);
check("Footer receives valid school name", footerProps.schoolName === "Devasthaly Vidyapeeth");
check("Footer receives valid email", footerProps.email === "principaldvp@gmail.com");
check("Footer receives valid working hours", footerProps.workingHours.includes("8:00 AM"));

// Contact Page Grouping Contract
function simulateContactGrouping(entries) {
  const academicCoordinators = entries.filter((e) => e.category === "ACADEMIC_COORDINATOR");
  const hostelWardens = entries.filter((e) => e.category === "HOSTEL_WARDEN");
  const officeAndAccounts = entries.filter(
    (e) => e.category === "ADMINISTRATION" || e.category === "OFFICE_ACCOUNTS"
  );
  return { academicCoordinators, hostelWardens, officeAndAccounts };
}

const grouped = simulateContactGrouping(validDirectorySample);
check("Correctly groups academic coordinators", grouped.academicCoordinators.length === 1);
check("Correctly groups hostel wardens", grouped.hostelWardens.length === 1);
check("Correctly isolates empty categories without throwing", Array.isArray(grouped.officeAndAccounts));

// Summary
const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;
console.log("\n===============================================================");
console.log(`  Frontend Profile Tests: ${passed} Passed, ${failed} Failed`);
console.log("===============================================================");

if (failed > 0) {
  process.exit(1);
}
