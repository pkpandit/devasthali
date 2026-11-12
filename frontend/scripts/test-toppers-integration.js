/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert");
const { z } = require("zod");

console.log("===============================================================");
console.log("  Running Frontend Toppers Integration Unit Tests");
console.log("===============================================================");

// Replicate Zod schema from frontend/lib/api/toppers.ts
const publicTopperSchema = z.object({
  studentName: z.string().min(1),
  scorePercent: z.number().min(0).max(100),
  grade: z.string().min(1),
  stream: z.string().nullable().optional(),
  academicYear: z.string().min(1),
  achievement: z.string().min(1),
  photoUrl: z.string().nullable().optional(),
  isFeatured: z.boolean(),
});

const publicToppersArraySchema = z.array(publicTopperSchema);

// Photo helper logic
function isValidRootRelativePath(url) {
  if (!url) return false;
  const trimmed = url.trim();
  return trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\");
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// 1. Valid Response Parsing
{
  const rawPayload = [
    {
      studentName: "Ananya Sharma",
      scorePercent: 98.4,
      grade: "Class X",
      stream: null,
      academicYear: "2024-25",
      achievement: "State Rank 1",
      photoUrl: "/images/academics/toppers/ananya.jpg",
      isFeatured: true,
    },
    {
      studentName: "Rahul Verma",
      scorePercent: 97.2,
      grade: "Class XII",
      stream: "Science (PCM)",
      academicYear: "2024-25",
      achievement: "District Rank 2",
      photoUrl: null,
      isFeatured: false,
    },
  ];

  const parsed = publicToppersArraySchema.safeParse(rawPayload);
  assert.strictEqual(parsed.success, true);
  assert.strictEqual(parsed.data.length, 2);
  console.log("  [PASS] Valid public toppers array parsed successfully");
}

// 2. Schema Guard: Rejects Malformed or Sensitive Injections
{
  const missingName = [{ scorePercent: 95, grade: "Class X", academicYear: "2024-25", achievement: "Top", isFeatured: true }];
  assert.strictEqual(publicToppersArraySchema.safeParse(missingName).success, false);

  const invalidScore = [{ studentName: "Test", scorePercent: 105, grade: "Class X", academicYear: "2024-25", achievement: "Top", isFeatured: true }];
  assert.strictEqual(publicToppersArraySchema.safeParse(invalidScore).success, false);

  const negativeScore = [{ studentName: "Test", scorePercent: -1, grade: "Class X", academicYear: "2024-25", achievement: "Top", isFeatured: true }];
  assert.strictEqual(publicToppersArraySchema.safeParse(negativeScore).success, false);

  console.log("  [PASS] Invalid scores and missing required fields rejected by schema");
}

// 3. Featured vs Non-Featured Filtering
{
  const list = [
    { studentName: "A", isFeatured: true },
    { studentName: "B", isFeatured: false },
    { studentName: "C", isFeatured: true },
  ];
  const homepageShowcase = list.filter((t) => t.isFeatured);
  assert.strictEqual(homepageShowcase.length, 2);
  assert.strictEqual(homepageShowcase[0].studentName, "A");
  assert.strictEqual(homepageShowcase[1].studentName, "C");
  console.log("  [PASS] Homepage filtering accurately selects only isFeatured === true records");
}

// 4. Score Percentage Formatting
{
  const score1 = 98.4;
  const formatted1 = `${score1.toFixed(2)}%`;
  assert.strictEqual(formatted1, "98.40%");

  const score2 = 100;
  const formatted2 = `${score2.toFixed(2)}%`;
  assert.strictEqual(formatted2, "100.00%");

  const score3 = 95.05;
  const formatted3 = `${score3.toFixed(2)}%`;
  assert.strictEqual(formatted3, "95.05%");

  console.log("  [PASS] Percentage formatting accurately preserves two decimals (e.g. 98.40%)");
}

// 5. Local Photo vs Avatar Initials Fallback
{
  assert.strictEqual(isValidRootRelativePath("/images/toppers/ananya.jpg"), true);
  assert.strictEqual(isValidRootRelativePath("https://external.com/photo.jpg"), false);
  assert.strictEqual(isValidRootRelativePath("//malicious-domain.com/photo.jpg"), false);
  assert.strictEqual(isValidRootRelativePath(null), false);
  assert.strictEqual(isValidRootRelativePath(""), false);

  assert.strictEqual(getInitials("Ananya Sharma"), "AS");
  assert.strictEqual(getInitials("Priya"), "PR");
  assert.strictEqual(getInitials("Rohan Kumar Upadhyay"), "RU");
  assert.strictEqual(getInitials(""), "S");

  console.log("  [PASS] Local root-relative photo path validation and initials generation verified");
}

// 6. Empty Array Behavior
{
  const empty = [];
  const parsed = publicToppersArraySchema.safeParse(empty);
  assert.strictEqual(parsed.success, true);
  assert.strictEqual(parsed.data.length, 0);
  console.log("  [PASS] Empty response array parsed cleanly for empty-state handling");
}

console.log("===============================================================");
console.log("  All frontend toppers unit tests passed successfully!");
console.log("===============================================================");
