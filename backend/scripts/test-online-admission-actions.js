/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
require.cache[require.resolve("server-only")] = { exports: {} };

const assert = require("node:assert");
const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");
const { execSync } = require("node:child_process");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Bundle TypeScript validation for Node runtime
try {
  execSync(
    "npx esbuild lib/validation/online-admissions.ts --bundle --platform=node --outfile=dist_test_online_admissions_validation.js --external:@prisma/client --external:server-only",
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
} catch (e) {
  console.error("esbuild compilation failed:", e);
  process.exit(1);
}

async function runTests() {
  console.log("=== Running Online Admissions Validation & Action Tests ===");

  const {
    onlineAdmissionApplicationSchema,
    applicationStatusUpdateSchema,
    registrationSettingsUpdateSchema,
    isValidNonFutureCalendarDate,
    computeSubmissionFingerprint,
    deriveSessionCode,
    isValidSessionLabel,
    generateRandomCode,
    formatApplicationNumber,
    ALLOWED_STATUS_TRANSITIONS,
  } = require("../dist_test_online_admissions_validation");

  // 1. Date of Birth Validation
  console.log("1. Testing Date of Birth validation...");
  assert.strictEqual(isValidNonFutureCalendarDate("2018-05-15"), true, "Valid past date should pass");
  assert.strictEqual(isValidNonFutureCalendarDate("2020-02-29"), true, "Valid leap year date should pass");
  assert.strictEqual(isValidNonFutureCalendarDate("2021-02-29"), false, "Invalid leap year date should fail");
  assert.strictEqual(isValidNonFutureCalendarDate("2026-11-26"), true, "Today date should pass");
  assert.strictEqual(isValidNonFutureCalendarDate("2099-01-01"), false, "Future date should fail");
  assert.strictEqual(isValidNonFutureCalendarDate("not-a-date"), false, "Malformed string should fail");
  assert.strictEqual(isValidNonFutureCalendarDate("2020-13-01"), false, "Month 13 should fail");
  assert.strictEqual(isValidNonFutureCalendarDate("2020-04-31"), false, "April 31 should fail");

  // 2. Reference Number & Session Helpers
  console.log("2. Testing Reference number and Session helpers...");
  assert.strictEqual(deriveSessionCode("2026-27"), "2627");
  assert.strictEqual(deriveSessionCode("2025-26"), "2526");
  assert.strictEqual(isValidSessionLabel("2026-27"), true);
  assert.strictEqual(isValidSessionLabel("2026-2027"), false);
  assert.strictEqual(isValidSessionLabel("invalid"), false);

  const randomCode = generateRandomCode(6);
  assert.strictEqual(randomCode.length, 6);
  assert(/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(randomCode), "Random code should use unambiguous alphabet");

  const appNum = formatApplicationNumber("2627", randomCode);
  assert.strictEqual(appNum, `DVP-2627-${randomCode}`);

  // 3. Application Schema Validation
  console.log("3. Testing Application schema validation...");
  const validPayload = {
    idempotencyKey: "test-idemp-uuid-12345",
    appliedClass: "I",
    studentName: "Aditya Kumar Sharma",
    dob: "2018-06-15",
    gender: "Male",
    nationality: "Indian",
    religion: "",
    category: "",
    mobile: "9876543210",
    email: "parent@example.com",
    address: "Village Chilkahar, Post Chilkahar",
    city: "Ballia",
    fatherName: "Rajesh Sharma",
    fatherMobile: "9876543211",
    fatherOccupation: "Teacher",
    motherName: "Sunita Sharma",
    motherMobile: "",
    motherOccupation: "Homemaker",
    lastAttendedClass: "UKG",
    previousSchoolName: "Tiny Tots Public School",
    previousSchoolBoard: "CBSE",
    declarationAgreed: true,
  };

  const parsedValid = onlineAdmissionApplicationSchema.safeParse(validPayload);
  assert.strictEqual(parsedValid.success, true);
  assert.strictEqual(parsedValid.data.religion, null, "Blank religion should transform to null");
  assert.strictEqual(parsedValid.data.category, null, "Blank category should transform to null");
  assert.strictEqual(parsedValid.data.declarationAgreed, true);

  // Missing declaration agreed
  const missingDeclaration = onlineAdmissionApplicationSchema.safeParse({
    ...validPayload,
    declarationAgreed: false,
  });
  assert.strictEqual(missingDeclaration.success, false, "False declarationAgreed must fail");

  // Invalid class
  const invalidClass = onlineAdmissionApplicationSchema.safeParse({
    ...validPayload,
    appliedClass: "CLASS_XII_SUPER",
  });
  assert.strictEqual(invalidClass.success, false, "Invalid class should fail");

  // Missing mandatory fields
  const missingName = onlineAdmissionApplicationSchema.safeParse({
    ...validPayload,
    studentName: "",
  });
  assert.strictEqual(missingName.success, false);

  // 4. Fingerprint computation
  console.log("4. Testing Fingerprint computation...");
  const fp1 = computeSubmissionFingerprint(validPayload);
  const fp2 = computeSubmissionFingerprint({
    ...validPayload,
    email: "another-email@example.com", // non-fingerprinted field
  });
  assert.strictEqual(fp1, fp2, "Fingerprint should match across non-critical field changes");

  const fp3 = computeSubmissionFingerprint({
    ...validPayload,
    studentName: "Different Name",
  });
  assert.notStrictEqual(fp1, fp3, "Fingerprint should change when critical field changes");

  // 5. Allowed Status Transitions
  console.log("5. Testing Allowed status transitions...");
  assert.deepStrictEqual(ALLOWED_STATUS_TRANSITIONS.SUBMITTED, ["UNDER_REVIEW", "WITHDRAWN", "REJECTED"]);
  assert.deepStrictEqual(ALLOWED_STATUS_TRANSITIONS.UNDER_REVIEW, ["VERIFIED", "WITHDRAWN", "REJECTED"]);
  assert.deepStrictEqual(ALLOWED_STATUS_TRANSITIONS.VERIFIED, ["ARCHIVED", "WITHDRAWN"]);
  assert.deepStrictEqual(ALLOWED_STATUS_TRANSITIONS.ARCHIVED, []);

  // 6. Registration Settings Schema
  console.log("6. Testing Registration settings schema...");
  const validSettings = registrationSettingsUpdateSchema.safeParse({
    isRegistrationOpen: true,
    sessionLabel: "2026-27",
    guidanceNotice: "Admissions are currently active for Session 2026-27",
    closedMessage: "Registration is closed.",
  });
  assert.strictEqual(validSettings.success, true);

  const invalidSessionSettings = registrationSettingsUpdateSchema.safeParse({
    isRegistrationOpen: true,
    sessionLabel: "2026/2027",
  });
  assert.strictEqual(invalidSessionSettings.success, false);

  console.log("✔ All Online Admission Validation & Action Unit Tests Passed Successfully!");
}

runTests()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(() => {
    try {
      fs.unlinkSync("dist_test_online_admissions_validation.js");
    } catch (_) {}
  });
