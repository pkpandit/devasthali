/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Standalone synthetic validation suite.
 * Tests all canonical Zod schemas imported directly from lib/validation/auth.ts
 * without database access, without logging passwords, and without network requests.
 */

const {
  AUTH_POLICY,
  emailSchema,
  loginPasswordSchema,
  loginInputSchema,
  provisioningNameSchema: nameSchema,
  provisioningPasswordSchema: provPasswordSchema,
  provisioningInputSchema,
} = require("../lib/validation/auth.ts");

function runTests() {
  const results = [];

  function assert(name, condition, details = "") {
    results.push({ name, passed: Boolean(condition), details });
    if (!condition) {
      console.error(`[FAIL] ${name}: ${details}`);
    } else {
      console.log(`[PASS] ${name}`);
    }
  }

  console.log("==================================================");
  console.log("  Running Canonical Zod Validation Test Suite");
  console.log("==================================================\n");

  // 0. Policy invariants
  assert(
    "Policy constants intact",
    AUTH_POLICY.PASSWORD_MAX_BYTES === 256 &&
      AUTH_POLICY.PASSWORD_PROVISION_MIN_LENGTH === 12 &&
      AUTH_POLICY.PASSWORD_LOGIN_MIN_LENGTH === 1 &&
      AUTH_POLICY.NAME_MIN_LENGTH === 2
  );

  // 1. Email validation & normalization
  const validEmail = emailSchema.safeParse("admin@devasthali.edu.in");
  assert("Valid email accepted", validEmail.success);

  const normalizedEmail = emailSchema.safeParse("  Admin.Staff@Devasthaly.EDU.in  ");
  assert(
    "Email with surrounding whitespace normalized (trimmed & lowercased)",
    normalizedEmail.success && normalizedEmail.data === "admin.staff@devasthaly.edu.in",
    `Got: ${normalizedEmail.data}`
  );

  const invalidEmail = emailSchema.safeParse("invalid-email-string");
  assert("Invalid email rejected", !invalidEmail.success);

  const emptyEmail = emailSchema.safeParse("");
  assert("Empty email rejected", !emptyEmail.success);

  const longEmail = emailSchema.safeParse("a".repeat(250) + "@school.edu");
  assert("Email > 255 chars rejected", !longEmail.success);

  // 2. Non-string values
  const nonStringEmail = emailSchema.safeParse(12345);
  assert("Non-string email rejected", !nonStringEmail.success);

  const nonStringPassword = loginPasswordSchema.safeParse(null);
  assert("Null password rejected", !nonStringPassword.success);

  const undefinedPassword = loginPasswordSchema.safeParse(undefined);
  assert("Undefined password rejected", !undefinedPassword.success);

  // 3. Login password rules & whitespace preservation
  const emptyLoginPassword = loginPasswordSchema.safeParse("");
  assert("Empty login password rejected", !emptyLoginPassword.success);

  const validLoginPassword = loginPasswordSchema.safeParse("any-password");
  assert("Non-empty login password accepted", validLoginPassword.success);

  const whitespacePassword = loginPasswordSchema.safeParse("  leading-and-trailing  ");
  assert(
    "Login password whitespace preserved exactly (never trimmed)",
    whitespacePassword.success && whitespacePassword.data === "  leading-and-trailing  "
  );

  // 4. Provisioning password rules & whitespace preservation
  const shortProvPassword = provPasswordSchema.safeParse("short123"); // 8 chars
  assert("Provisioning password < 12 chars rejected", !shortProvPassword.success);

  const validProvPassword = provPasswordSchema.safeParse("validlength12"); // 13 chars
  assert("Provisioning password >= 12 chars accepted", validProvPassword.success);

  const provWhitespacePassword = provPasswordSchema.safeParse("  spaces 12 chars  ");
  assert(
    "Provisioning password whitespace preserved (untrimmed)",
    provWhitespacePassword.success && provWhitespacePassword.data === "  spaces 12 chars  "
  );

  // 5. UTF-8 Byte limit enforcement (256 bytes)
  const maxBytePassword = "x".repeat(256);
  assert(
    "Password exactly 256 bytes accepted",
    provPasswordSchema.safeParse(maxBytePassword).success
  );

  const overMaxBytePassword = "x".repeat(257);
  assert(
    "Password exceeding 256 bytes rejected",
    !provPasswordSchema.safeParse(overMaxBytePassword).success
  );

  // 6. Multibyte Unicode characters
  const multibyteChar = "नमस्ते"; // 6 chars, 18 UTF-8 bytes
  const multibyteByteLen = new TextEncoder().encode(multibyteChar).length;
  assert(
    "Multibyte UTF-8 byte calculation verified",
    multibyteByteLen === 18,
    `Expected 18 bytes, got ${multibyteByteLen}`
  );

  const safeMultibytePassword = "नमस्तेदुनिया2026!secure"; // >= 12 chars, < 256 bytes
  assert(
    "Valid multibyte password accepted",
    provPasswordSchema.safeParse(safeMultibytePassword).success
  );

  const oversizedMultibyte = "नमस्ते".repeat(20); // 360 bytes
  assert(
    "Oversized multibyte password (>256 bytes) rejected",
    !provPasswordSchema.safeParse(oversizedMultibyte).success
  );

  // 7. Provisioning name rules (trimming and min/max length)
  const emptyName = nameSchema.safeParse("");
  assert("Empty name rejected", !emptyName.success);

  const whitespaceOnlyName = nameSchema.safeParse("     ");
  assert(
    "Whitespace-only name rejected",
    !whitespaceOnlyName.success
  );

  const singleCharNameWithSpaces = nameSchema.safeParse("   A   ");
  assert(
    "Min name length evaluated after trimming ('   A   ' -> 1 char, rejected)",
    !singleCharNameWithSpaces.success
  );

  const twoCharNameWithSpaces = nameSchema.safeParse("   AB   ");
  assert(
    "Min name length passes after trimming ('   AB   ' -> 'AB', accepted)",
    twoCharNameWithSpaces.success && twoCharNameWithSpaces.data === "AB"
  );

  const validName = nameSchema.safeParse("  Dr. Sharma  ");
  assert(
    "Valid name trimmed and accepted",
    validName.success && validName.data === "Dr. Sharma"
  );

  // 8. Password confirmation matching (exact match requirement)
  const matchingConfirm = provisioningInputSchema.safeParse({
    name: "Administrator Name",
    email: "admin@devasthaly.edu.in",
    password: "securepassword123",
    confirmPassword: "securepassword123",
  });
  assert("Confirmation requires exact match: identical passwords accepted", matchingConfirm.success);

  const trailingSpaceConfirm = provisioningInputSchema.safeParse({
    name: "Administrator Name",
    email: "admin@devasthaly.edu.in",
    password: "securepassword123",
    confirmPassword: "securepassword123 ",
  });
  assert(
    "Confirmation requires exact match: trailing whitespace in confirmation rejected",
    !trailingSpaceConfirm.success &&
      trailingSpaceConfirm.error.issues.some((i) => i.message.includes("Passwords do not match"))
  );

  const mismatchConfirm = provisioningInputSchema.safeParse({
    name: "Administrator Name",
    email: "admin@devasthaly.edu.in",
    password: "securepassword123",
    confirmPassword: "differentpassword123",
  });
  assert(
    "Confirmation requires exact match: completely different confirmation rejected",
    !mismatchConfirm.success &&
      mismatchConfirm.error.issues.some((i) => i.message.includes("Passwords do not match"))
  );

  // 9. Full login input schema parsing
  const fullLogin = loginInputSchema.safeParse({
    email: "  ADMIN@Devasthaly.edu.in ",
    password: "anypassword",
    returnUrl: "/admin/academics/results",
  });
  assert(
    "Full login schema successfully parses and normalizes",
    fullLogin.success &&
      fullLogin.data.email === "admin@devasthaly.edu.in" &&
      fullLogin.data.password === "anypassword" &&
      fullLogin.data.returnUrl === "/admin/academics/results"
  );

  // 10. FormData boundary extraction in isolation (mirroring loginAction boundary)
  function extractFormData(formData) {
    const emailEntry = formData.get("email");
    const passwordEntry = formData.get("password");
    const returnUrlEntry = formData.get("returnUrl");

    return {
      email: typeof emailEntry === "string" ? emailEntry : "",
      password: typeof passwordEntry === "string" ? passwordEntry : "",
      returnUrl: typeof returnUrlEntry === "string" ? returnUrlEntry : undefined,
    };
  }

  // 10a. FormData with File objects instead of strings
  const fdWithFiles = new FormData();
  fdWithFiles.append("email", new File(["admin@example.com"], "avatar.png", { type: "image/png" }));
  fdWithFiles.append("password", new File(["secret123456"], "upload.bin", { type: "application/octet-stream" }));
  const extractedFileBoundary = extractFormData(fdWithFiles);
  const parsedFileBoundary = loginInputSchema.safeParse(extractedFileBoundary);
  assert(
    "FormData boundary: File objects sanitized to empty strings and rejected by schema",
    !parsedFileBoundary.success &&
      extractedFileBoundary.email === "" &&
      extractedFileBoundary.password === ""
  );

  // 10b. FormData with missing entries
  const fdEmpty = new FormData();
  const extractedEmptyBoundary = extractFormData(fdEmpty);
  const parsedEmptyBoundary = loginInputSchema.safeParse(extractedEmptyBoundary);
  assert(
    "FormData boundary: Missing entries sanitized to empty strings and rejected by schema",
    !parsedEmptyBoundary.success &&
      extractedEmptyBoundary.email === "" &&
      extractedEmptyBoundary.password === "" &&
      extractedEmptyBoundary.returnUrl === undefined
  );

  // 10c. FormData with valid strings
  const fdValid = new FormData();
  fdValid.append("email", "  admin@devasthaly.edu.in  ");
  fdValid.append("password", "  preserved-password  ");
  fdValid.append("returnUrl", "/admin/academics/results");
  const extractedValidBoundary = extractFormData(fdValid);
  const parsedValidBoundary = loginInputSchema.safeParse(extractedValidBoundary);
  assert(
    "FormData boundary: Valid string entries parsed, email normalized, password whitespace preserved",
    parsedValidBoundary.success &&
      parsedValidBoundary.data.email === "admin@devasthaly.edu.in" &&
      parsedValidBoundary.data.password === "  preserved-password  " &&
      parsedValidBoundary.data.returnUrl === "/admin/academics/results"
  );

  console.log("\n==================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`  Tests completed: ${passed}/${total} passed (${failed} failed)`);
  console.log("==================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
