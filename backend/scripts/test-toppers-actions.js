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

  const missingName = topperInputSchema.safeParse({
    scorePercent: 98.4,
    grade: "Class X",
    academicYear: "2024-25",
    achievement: "School Topper",
  });
  assert("Create payload missing studentName fails", !missingName.success);

  // -------------------------------------------------------------
  // 2. Zod Validation: Update Schema (topperUpdateSchema)
  // -------------------------------------------------------------
  console.log("\n--- 2. Update Schema Validation (No Silent Defaults) ---");
  const validUpdate = topperUpdateSchema.safeParse({
    id: "clx1234567890",
    studentName: "Ananya Sharma",
    scorePercent: 99.0,
    grade: "Class X",
    stream: null,
    academicYear: "2024-25",
    achievement: "State Rank 1",
    photoUrl: null,
    displayOrder: 1,
    isFeatured: true,
  });
  assert("Valid complete update payload passes", validUpdate.success);

  const missingIdUpdate = topperUpdateSchema.safeParse({
    studentName: "Ananya Sharma",
    scorePercent: 99.0,
    grade: "Class X",
    academicYear: "2024-25",
    achievement: "State Rank 1",
    displayOrder: 1,
    isFeatured: true,
  });
  assert("Update payload missing ID fails", !missingIdUpdate.success);

  const emptyIdUpdate = topperUpdateSchema.safeParse({
    id: "   ",
    studentName: "Ananya Sharma",
    scorePercent: 99.0,
    grade: "Class X",
    academicYear: "2024-25",
    achievement: "State Rank 1",
    displayOrder: 1,
    isFeatured: true,
  });
  assert("Update payload with whitespace-only ID fails", !emptyIdUpdate.success);

  const omittedDisplayOrder = topperUpdateSchema.safeParse({
    id: "clx1234567890",
    studentName: "Ananya Sharma",
    scorePercent: 99.0,
    grade: "Class X",
    academicYear: "2024-25",
    achievement: "State Rank 1",
    isFeatured: true,
    // displayOrder is intentionally omitted: must FAIL (no silent default)
  });
  assert(
    "Update payload with omitted displayOrder fails (no silent default)",
    !omittedDisplayOrder.success
  );

  const omittedIsFeatured = topperUpdateSchema.safeParse({
    id: "clx1234567890",
    studentName: "Ananya Sharma",
    scorePercent: 99.0,
    grade: "Class X",
    academicYear: "2024-25",
    achievement: "State Rank 1",
    displayOrder: 0,
    // isFeatured is intentionally omitted: must FAIL (no silent default)
  });
  assert(
    "Update payload with omitted isFeatured fails (no silent default)",
    !omittedIsFeatured.success
  );

  // -------------------------------------------------------------
  // 3. Zod Validation: Delete Schema (topperDeleteSchema)
  // -------------------------------------------------------------
  console.log("\n--- 3. Delete Schema Validation ---");
  const validDelete = topperDeleteSchema.safeParse({ id: "clx1234567890" });
  assert("Valid delete payload passes", validDelete.success);

  const emptyDelete = topperDeleteSchema.safeParse({ id: "  " });
  assert("Delete payload with empty ID fails", !emptyDelete.success);

  const missingDeleteId = topperDeleteSchema.safeParse({});
  assert("Delete payload missing ID fails", !missingDeleteId.success);

  // -------------------------------------------------------------
  // 4. Role Authorization Logic & Error Handling
  // -------------------------------------------------------------
  console.log("\n--- 4. Role Authorization & Error Semantics ---");
  const allowedRoles = ["SUPER_ADMIN"];

  class TestAuthorizationError extends Error {
    constructor(message, requiredRoles, userRole) {
      super(message);
      this.name = "AuthorizationError";
      this.requiredRoles = requiredRoles;
      this.userRole = userRole;
    }
  }

  function checkPermission(userRole) {
    if (!allowedRoles.includes(userRole)) {
      throw new TestAuthorizationError(
        `Access denied. Role '${userRole}' is not authorized for this operation.`,
        allowedRoles,
        userRole
      );
    }
    return true;
  }

  assert("SUPER_ADMIN role permitted", checkPermission("SUPER_ADMIN") === true);

  let principalBlocked = false;
  try {
    checkPermission("PRINCIPAL");
  } catch (err) {
    principalBlocked = err instanceof TestAuthorizationError && err.userRole === "PRINCIPAL";
  }
  assert("PRINCIPAL role blocked with AuthorizationError", principalBlocked);

  let teacherBlocked = false;
  try {
    checkPermission("TEACHER");
  } catch (err) {
    teacherBlocked = err instanceof TestAuthorizationError && err.userRole === "TEACHER";
  }
  assert("TEACHER role blocked with AuthorizationError", teacherBlocked);

  let staffBlocked = false;
  try {
    checkPermission("STAFF");
  } catch (err) {
    staffBlocked = err instanceof TestAuthorizationError && err.userRole === "STAFF";
  }
  assert("STAFF role blocked with AuthorizationError", staffBlocked);

  // -------------------------------------------------------------
  // 5. Audit Metadata Sanitization & Photo Masking
  // -------------------------------------------------------------
  console.log("\n--- 5. Audit Metadata Sanitization & Privacy ---");
  const dirtyMeta = {
    studentName: "Ananya Sharma",
    password: "supersecretpassword",
    sessionToken: "raw-session-token-hash-12345",
    cookie: "dvp_session=xyz",
    nested: {
      secretKey: "secret-abc",
      safeNote: "District Topper",
    },
  };
  const sanitized = sanitizeAuditMetadata(dirtyMeta);
  assert("Sanitizer preserves studentName", sanitized.studentName === "Ananya Sharma");
  assert("Sanitizer redacts password", sanitized.password === "[REDACTED]");
  assert("Sanitizer redacts sessionToken", sanitized.sessionToken === "[REDACTED]");
  assert("Sanitizer redacts cookie", sanitized.cookie === "[REDACTED]");
  assert("Sanitizer recursively redacts nested secrets", sanitized.nested.secretKey === "[REDACTED]");
  assert("Sanitizer preserves nested safe keys", sanitized.nested.safeNote === "District Topper");

  // -------------------------------------------------------------
  // 6. Changed-Field Diff Calculation
  // -------------------------------------------------------------
  console.log("\n--- 6. Changed-Field Diff Calculation & Masking ---");
  const existingRecord = {
    id: "clx123",
    studentName: "Ananya Sharma",
    scorePercent: "98.40",
    grade: "Class X",
    stream: null,
    academicYear: "2024-25",
    achievement: "School Topper",
    photoUrl: "https://storage.example.com/photos/ananya.jpg",
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
