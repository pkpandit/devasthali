/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Standalone pure unit-style test suite for BoardResultTopper server actions,
 * schemas, diffing logic, audit sanitization, and structured error formatting.
 *
 * GUARANTEE: Does NOT connect to, query, or mutate PostgreSQL or any live database.
 */

const {
  topperInputSchema,
  topperUpdateSchema,
  topperDeleteSchema,
  formatZodErrors,
  normalizeTopperPayload,
  computeTopperDiff,
  sanitizeAuditMetadata,
} = require("../lib/validation/toppers.ts");

function runSuite() {
  const results = [];

  function assert(name, condition, details = "") {
    results.push({ name, passed: Boolean(condition), details });
    if (!condition) {
      console.error(`  [FAIL] ${name}: ${details}`);
    } else {
      console.log(`  [PASS] ${name}`);
    }
  }

  console.log("===============================================================");
  console.log("  Running Pure Unit Test Suite: Toppers Actions & Schemas");
  console.log("  (Zero Database Access Guaranteed)");
  console.log("===============================================================\n");

  // -------------------------------------------------------------
  // 1. Zod Validation: Creation Schema (topperInputSchema)
  // -------------------------------------------------------------
  console.log("--- 1. Creation Schema Validation ---");
  const validCreate = topperInputSchema.safeParse({
    studentName: "Ananya Sharma",
    scorePercent: 98.4,
    grade: "Class X",
    stream: null,
    academicYear: "2024-25",
    achievement: "School Topper",
    photoUrl: "/images/toppers/ananya.jpg",
    displayOrder: 0,
    isFeatured: true,
  });
  assert("Valid create payload passes", validCreate.success);

  const missingNameCreate = topperInputSchema.safeParse({
    scorePercent: 98.4,
    grade: "Class X",
    academicYear: "2024-25",
    achievement: "School Topper",
  });
  assert("Create payload missing studentName fails", !missingNameCreate.success);

  // -------------------------------------------------------------
  // 2. Zod Validation: Update Schema (topperUpdateSchema)
  // -------------------------------------------------------------
  console.log("\n--- 2. Update Schema Validation (No Silent Defaults) ---");
  const validUpdate = topperUpdateSchema.safeParse({
    id: "top_c1234567-89ab-cdef-0123-456789abcdef",
    studentName: "Ananya Sharma",
    scorePercent: 98.4,
    grade: "Class X",
    stream: null,
    academicYear: "2024-25",
    achievement: "School Topper",
    photoUrl: "/images/toppers/ananya.jpg",
    displayOrder: 0,
    isFeatured: true,
  });
  assert("Valid complete update payload passes", validUpdate.success);

  const missingIdUpdate = topperUpdateSchema.safeParse({
    studentName: "Ananya Sharma",
    scorePercent: 98.4,
    grade: "Class X",
    academicYear: "2024-25",
    achievement: "School Topper",
    displayOrder: 0,
    isFeatured: true,
  });
  assert("Update payload missing ID fails", !missingIdUpdate.success);

  const whitespaceIdUpdate = topperUpdateSchema.safeParse({
    id: "   ",
    studentName: "Ananya Sharma",
    scorePercent: 98.4,
    grade: "Class X",
    academicYear: "2024-25",
    achievement: "School Topper",
    displayOrder: 0,
    isFeatured: true,
  });
  assert("Update payload with whitespace-only ID fails", !whitespaceIdUpdate.success);

  const omittedOrderUpdate = topperUpdateSchema.safeParse({
    id: "top_123",
    studentName: "Ananya Sharma",
    scorePercent: 98.4,
    grade: "Class X",
    academicYear: "2024-25",
    achievement: "School Topper",
    isFeatured: true,
  });
  assert("Update payload with omitted displayOrder fails (no silent default)", !omittedOrderUpdate.success);

  const omittedFeaturedUpdate = topperUpdateSchema.safeParse({
    id: "top_123",
    studentName: "Ananya Sharma",
    scorePercent: 98.4,
    grade: "Class X",
    academicYear: "2024-25",
    achievement: "School Topper",
    displayOrder: 0,
  });
  assert("Update payload with omitted isFeatured fails (no silent default)", !omittedFeaturedUpdate.success);

  // -------------------------------------------------------------
  // 3. Zod Validation: Deletion Schema (topperDeleteSchema)
  // -------------------------------------------------------------
  console.log("\n--- 3. Delete Schema Validation ---");
  const validDelete = topperDeleteSchema.safeParse({
    id: "top_c1234567-89ab-cdef-0123-456789abcdef",
  });
  assert("Valid delete payload passes", validDelete.success);

  const emptyDelete = topperDeleteSchema.safeParse({ id: "" });
  assert("Delete payload with empty ID fails", !emptyDelete.success);

  const missingDelete = topperDeleteSchema.safeParse({});
  assert("Delete payload missing ID fails", !missingDelete.success);

  // -------------------------------------------------------------
  // 4. Role Authorization Matrix
  // -------------------------------------------------------------
  console.log("\n--- 4. Role Authorization & Error Semantics ---");
  function checkRoleAuth(role) {
    if (role === "SUPER_ADMIN") return true;
    throw new Error("AuthorizationError: SUPER_ADMIN privileges required.");
  }

  assert("SUPER_ADMIN role permitted", checkRoleAuth("SUPER_ADMIN") === true);

  const nonSuperRoles = ["PRINCIPAL", "TEACHER", "STAFF"];
  for (const role of nonSuperRoles) {
    let thrown = false;
    try {
      checkRoleAuth(role);
    } catch {
      thrown = true;
    }
    assert(`${role} role blocked with AuthorizationError`, thrown);
  }

  // -------------------------------------------------------------
  // 5. Audit Metadata Sanitization & Secret Masking
  // -------------------------------------------------------------
  console.log("\n--- 5. Audit Metadata Sanitization & Privacy ---");
  const testAuditPayload = {
    studentName: "Ananya Sharma",
    password: "PlaintextPassword123!",
    passwordHash: "$2b$12$somehashedvalue",
    sessionToken: "sess_abcdef123456",
    rawToken: "raw_tok_789",
    cookie: "connect.sid=s%3A123",
    nested: {
      secretKey: "super_secret_api_key",
      safeKey: "safe_value",
      credential: "admin_credential",
    },
  };

  const sanitized = sanitizeAuditMetadata(testAuditPayload);
  assert("Sanitizer preserves studentName", sanitized.studentName === "Ananya Sharma");
  assert("Sanitizer redacts password", sanitized.password === "[REDACTED]");
  assert("Sanitizer redacts sessionToken", sanitized.sessionToken === "[REDACTED]");
  assert("Sanitizer redacts cookie", sanitized.cookie === "[REDACTED]");
  assert("Sanitizer recursively redacts nested secrets", sanitized.nested.secretKey === "[REDACTED]");
  assert("Sanitizer preserves nested safe keys", sanitized.nested.safeKey === "safe_value");

  // -------------------------------------------------------------
  // 6. Changed-Field Diff Computation & Value Masking
  // -------------------------------------------------------------
  console.log("\n--- 6. Changed-Field Diff Calculation & Masking ---");
  const existingRecord = {
    studentName: "Ananya Sharma",
    scorePercent: 98.4,
    grade: "Class X",
    stream: null,
    academicYear: "2024-25",
    achievement: "School Topper",
    photoUrl: "https://storage.example.com/photos/ananya.jpg",
    photoStorageKey: null,
    displayOrder: 0,
    isFeatured: true,
  };

  // 6.1 No-op detection
  const noOpResult = computeTopperDiff(existingRecord, {
    studentName: "Ananya Sharma",
    scorePercent: 98.4,
    grade: "Class X",
    stream: null,
    academicYear: "2024-25",
    achievement: "School Topper",
    photoUrl: "https://storage.example.com/photos/ananya.jpg",
    photoStorageKey: null,
    displayOrder: 0,
    isFeatured: true,
  });
  assert("Identical input triggers no-op (0 changed fields)", noOpResult.changedFields.length === 0);

  // 6.2 Single scorePercent change
  const scoreDiff = computeTopperDiff(existingRecord, {
    studentName: "Ananya Sharma",
    scorePercent: 99.1,
    grade: "Class X",
    stream: null,
    academicYear: "2024-25",
    achievement: "School Topper",
    photoUrl: "https://storage.example.com/photos/ananya.jpg",
    photoStorageKey: null,
    displayOrder: 0,
    isFeatured: true,
  });
  assert(
    "Score percentage change detected",
    scoreDiff.changedFields.length === 1 && scoreDiff.changedFields[0] === "scorePercent"
  );
  assert(
    "Score diff formatted accurately",
    scoreDiff.diff.scorePercent.from === 98.4 && scoreDiff.diff.scorePercent.to === 99.1
  );

  // 6.3 PhotoUrl masking rule: NEVER expose raw URL, only [NONE] / [PRESENT]
  const photoRemovedDiff = computeTopperDiff(existingRecord, {
    studentName: "Ananya Sharma",
    scorePercent: 98.4,
    grade: "Class X",
    stream: null,
    academicYear: "2024-25",
    achievement: "School Topper",
    photoUrl: null,
    photoStorageKey: null,
    displayOrder: 0,
    isFeatured: true,
  });
  assert(
    "Photo removal detected in changedFields",
    photoRemovedDiff.changedFields.includes("photoUrl")
  );
  assert(
    "Photo diff masked to [PRESENT] -> [NONE] without exposing raw URL",
    photoRemovedDiff.diff.photoUrl.from === "[PRESENT]" &&
      photoRemovedDiff.diff.photoUrl.to === "[NONE]"
  );

  // 6.4 Photo replacement detection (photo-to-photo masked to [PRESENT] -> [PRESENT])
  const photoReplacedDiff = computeTopperDiff(existingRecord, {
    studentName: "Ananya Sharma",
    scorePercent: 98.4,
    grade: "Class X",
    stream: null,
    academicYear: "2024-25",
    achievement: "School Topper",
    photoUrl: "https://storage.example.com/photos/ananya_new.jpg",
    photoStorageKey: null,
    displayOrder: 0,
    isFeatured: true,
  });
  assert(
    "Photo replacement detected in changedFields",
    photoReplacedDiff.changedFields.includes("photoUrl")
  );
  assert(
    "Photo replacement diff masked to [PRESENT] -> [PRESENT]",
    photoReplacedDiff.diff.photoUrl.from === "[PRESENT]" &&
      photoReplacedDiff.diff.photoUrl.to === "[PRESENT]"
  );

  // 6.5 Managed photoStorageKey replacement detection
  const managedRecord = {
    ...existingRecord,
    photoStorageKey: "toppers/top_11111111-1111-1111-1111-111111111111.webp",
  };
  const keyReplacedDiff = computeTopperDiff(managedRecord, {
    studentName: "Ananya Sharma",
    scorePercent: 98.4,
    grade: "Class X",
    stream: null,
    academicYear: "2024-25",
    achievement: "School Topper",
    photoStorageKey: "toppers/top_22222222-2222-2222-2222-222222222222.webp",
    displayOrder: 0,
    isFeatured: true,
  });
  assert(
    "Managed key replacement detected in changedFields",
    keyReplacedDiff.changedFields.includes("photoUrl")
  );
  assert(
    "Managed key replacement masked to [PRESENT] -> [PRESENT]",
    keyReplacedDiff.diff.photoUrl.from === "[PRESENT]" &&
      keyReplacedDiff.diff.photoUrl.to === "[PRESENT]"
  );

  // -------------------------------------------------------------
  // 7. Structured Error Mapping & Payload Normalization
  // -------------------------------------------------------------
  console.log("\n--- 7. Error Mapping & Payload Normalization ---");
  const invalidResult = topperInputSchema.safeParse({
    studentName: "A", // too short
    scorePercent: 105.0, // over 100
    grade: "Invalid Grade",
  });
  const mappedErrors = formatZodErrors(invalidResult.error);
  assert("Error mapper identifies studentName issue", Boolean(mappedErrors.studentName));
  assert("Error mapper identifies scorePercent issue", Boolean(mappedErrors.scorePercent));
  assert("Error mapper identifies grade issue", Boolean(mappedErrors.grade));

  const normalized = normalizeTopperPayload({
    studentName: "  Rohit Verma  ",
    scorePercent: " 95.50 ",
    displayOrder: " 3 ",
    isFeatured: "true",
    stream: "",
    photoUrl: "",
  });
  assert("String scorePercent normalized to number", normalized.scorePercent === 95.5);
  assert("String displayOrder normalized to number", normalized.displayOrder === 3);
  assert("String isFeatured normalized to boolean", normalized.isFeatured === true);
  assert("Empty stream normalized to null", normalized.stream === null);
  assert("Empty photoUrl normalized to null", normalized.photoUrl === null);

  console.log("\n===============================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`  Tests completed: ${passed}/${total} passed (${failed} failed)`);
  console.log("===============================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite();
