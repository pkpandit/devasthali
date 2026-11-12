/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Standalone synthetic validation suite for BoardResultTopper schemas.
 * Tests all boundary constraints without database access.
 */

const {
  TOPPER_POLICY,
  gradeEnum,
  scorePercentSchema,
  academicYearSchema,
  photoUrlSchema,
  topperInputSchema,
} = require("../lib/validation/toppers.ts");

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
  console.log("  Running BoardResultTopper Synthetic Test Suite");
  console.log("==================================================\n");

  // 1. Policy constants check
  assert(
    "Policy constants intact",
    TOPPER_POLICY.MIN_SCORE_PERCENT === 0.0 &&
      TOPPER_POLICY.MAX_SCORE_PERCENT === 100.0 &&
      TOPPER_POLICY.STUDENT_NAME_MIN_LENGTH === 2 &&
      TOPPER_POLICY.ACHIEVEMENT_MIN_LENGTH === 3
  );

  // 2. Score percentage boundary testing
  assert("0.00% accepted", scorePercentSchema.safeParse(0.0).success);
  assert("100.00% accepted", scorePercentSchema.safeParse(100.0).success);
  assert("98.40% accepted", scorePercentSchema.safeParse(98.4).success);
  assert("Negative percentage (-0.01%) rejected", !scorePercentSchema.safeParse(-0.01).success);
  assert("Over 100 percentage (100.01%) rejected", !scorePercentSchema.safeParse(100.01).success);
  assert("More than two decimals (95.555%) rejected", !scorePercentSchema.safeParse(95.555).success);
  assert("Two decimals (95.55%) accepted", scorePercentSchema.safeParse(95.55).success);
  assert("Non-number percentage rejected", !scorePercentSchema.safeParse("98.4").success);

  // 3. Grade restriction testing
  assert("Class X accepted", gradeEnum.safeParse("Class X").success);
  assert("Class XII accepted", gradeEnum.safeParse("Class XII").success);
  assert("Class IX rejected", !gradeEnum.safeParse("Class IX").success);
  assert("Class XI rejected", !gradeEnum.safeParse("Class XI").success);
  assert("Arbitrary grade rejected", !gradeEnum.safeParse("Grade 10").success);

  // 4. Academic year format testing (YYYY-YY)
  assert("2024-25 accepted", academicYearSchema.safeParse("2024-25").success);
  assert("2025-26 accepted", academicYearSchema.safeParse("2025-26").success);
  assert("2024-2025 rejected", !academicYearSchema.safeParse("2024-2025").success);
  assert("24-25 rejected", !academicYearSchema.safeParse("24-25").success);
  assert("Invalid text year rejected", !academicYearSchema.safeParse("current-year").success);
  assert("Trimmed year accepted", academicYearSchema.safeParse("  2024-25  ").success);

  // 5. Display order testing
  const validOrder = topperInputSchema.shape.displayOrder.safeParse(0);
  assert("Display order 0 accepted", validOrder.success);
  const positiveOrder = topperInputSchema.shape.displayOrder.safeParse(5);
  assert("Display order > 0 accepted", positiveOrder.success);
  const negativeOrder = topperInputSchema.shape.displayOrder.safeParse(-1);
  assert("Negative display order rejected", !negativeOrder.success);
  const floatOrder = topperInputSchema.shape.displayOrder.safeParse(1.5);
  assert("Non-integer display order rejected", !floatOrder.success);

  // 6. Photo URL testing
  assert("Null photo URL accepted", photoUrlSchema.safeParse(null).success);
  assert("Undefined photo URL accepted", photoUrlSchema.safeParse(undefined).success);
  assert("Empty string photo URL accepted", photoUrlSchema.safeParse("").success);
  assert("Root-relative photo URL accepted", photoUrlSchema.safeParse("/images/toppers/student.jpg").success);
  assert("Valid HTTPS photo URL accepted", photoUrlSchema.safeParse("https://cdn.example.com/photo.jpg").success);
  assert("Valid HTTP photo URL accepted", photoUrlSchema.safeParse("http://cdn.example.com/photo.jpg").success);
  assert("Dangerous javascript: URI rejected", !photoUrlSchema.safeParse("javascript:alert(1)").success);
  assert("Malformed URL string rejected", !photoUrlSchema.safeParse("invalid url string").success);

  // 7. Student Name and Achievement bounds & trimming
  const validEntry = topperInputSchema.safeParse({
    studentName: "  Ananya Sharma  ",
    scorePercent: 98.6,
    grade: "Class X",
    academicYear: "2024-25",
    achievement: "  District Rank 1 | School Topper  ",
    displayOrder: 1,
    isFeatured: true,
  });
  assert(
    "Full valid entry parsed and trimmed",
    validEntry.success &&
      validEntry.data.studentName === "Ananya Sharma" &&
      validEntry.data.achievement === "District Rank 1 | School Topper" &&
      validEntry.data.stream === null || validEntry.data?.stream === undefined
  );

  const shortName = topperInputSchema.safeParse({
    studentName: "A",
    scorePercent: 95.0,
    grade: "Class X",
    academicYear: "2024-25",
    achievement: "Topper",
  });
  assert("Short student name (<2 chars) rejected", !shortName.success);

  const whitespaceName = topperInputSchema.safeParse({
    studentName: "   ",
    scorePercent: 95.0,
    grade: "Class X",
    academicYear: "2024-25",
    achievement: "Topper",
  });
  assert("Whitespace-only student name rejected", !whitespaceName.success);

  const shortAchievement = topperInputSchema.safeParse({
    studentName: "Ananya Sharma",
    scorePercent: 95.0,
    grade: "Class X",
    academicYear: "2024-25",
    achievement: "ab",
  });
  assert("Short achievement (<3 chars) rejected", !shortAchievement.success);

  const longStream = topperInputSchema.safeParse({
    studentName: "Ananya Sharma",
    scorePercent: 95.0,
    grade: "Class XII",
    stream: "x".repeat(51),
    academicYear: "2024-25",
    achievement: "School Topper",
  });
  assert("Over-length stream (>50 chars) rejected", !longStream.success);

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
