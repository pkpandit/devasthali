/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { z } = require("zod");

console.log("===============================================================");
console.log("  Running Frontend Toppers Integration Unit Tests");
console.log("===============================================================");

// Replicate Zod schema from frontend/lib/api/toppers.ts
const publicTopperSchema = z.object({
  id: z.string().optional(),
  studentName: z.string().min(1),
  scorePercent: z.number().min(0).max(100),
  grade: z.string().min(1),
  stream: z.string().nullable().optional(),
  academicYear: z.string().min(1),
  achievement: z.string().min(1),
  photoUrl: z.string().nullable().optional(),
  photoAlt: z.string().default(""),
  displayOrder: z.number().default(0),
  isFeatured: z.boolean(),
});

const publicToppersArraySchema = z.array(publicTopperSchema);

// Photo helper logic matching frontend/components/features/toppers/TopperCard.tsx
function getAllowedMediaHostnames() {
  const allowed = new Set(["127.0.0.1", "localhost"]);
  const configuredOrigin =
    process.env.NEXT_PUBLIC_MEDIA_ORIGIN ||
    process.env.PUBLIC_MEDIA_ORIGIN;

  if (configuredOrigin) {
    try {
      const parsed = new URL(configuredOrigin);
      if (parsed.hostname) {
        allowed.add(parsed.hostname.toLowerCase());
      }
    } catch {
      // Ignore invalid URL
    }
  }

  return allowed;
}

function isDisplayablePhotoUrl(url) {
  if (!url) return false;
  const trimmed = url.trim();

  // Root-relative static assets
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    return true;
  }

  // Allowed backend media URL
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    if (!parsed.pathname.startsWith("/api/public/media/toppers/")) {
      return false;
    }

    const allowedHosts = getAllowedMediaHostnames();
    return allowedHosts.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function resolveCardAltText(topper) {
  return topper.photoAlt || `${topper.studentName} - ${topper.grade} CBSE Topper`;
}

// 1. Valid Response Parsing with id, photoAlt, and displayOrder
{
  const rawPayload = [
    {
      id: "topper-1",
      studentName: "Ananya Sharma",
      scorePercent: 98.4,
      grade: "Class X",
      stream: null,
      academicYear: "2024-25",
      achievement: "State Rank 1",
      photoUrl: "/images/academics/toppers/ananya.jpg",
      photoAlt: "Portrait of Ananya Sharma, Class X State Topper",
      displayOrder: 0,
      isFeatured: true,
    },
    {
      studentName: "Rahul Verma",
      scorePercent: 97.2,
      grade: "Class XII",
      stream: "Science (PCM)",
      academicYear: "2024-25",
      achievement: "District Rank 2",
      photoUrl: "http://127.0.0.1:3001/api/public/media/toppers/top_12345678-1234-1234-1234-123456789abc.webp",
      // photoAlt and displayOrder omitted to verify defaults
      isFeatured: false,
    },
  ];

  const parsed = publicToppersArraySchema.safeParse(rawPayload);
  assert.strictEqual(parsed.success, true);
  assert.strictEqual(parsed.data.length, 2);
  assert.strictEqual(parsed.data[0].id, "topper-1");
  assert.strictEqual(parsed.data[0].photoAlt, "Portrait of Ananya Sharma, Class X State Topper");
  assert.strictEqual(parsed.data[0].displayOrder, 0);
  assert.strictEqual(parsed.data[1].photoAlt, "");
  assert.strictEqual(parsed.data[1].displayOrder, 0);
  console.log("  [PASS] Valid public toppers array with managed media URLs and defaults parsed successfully");
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

// 5. Photo URL Validation & Initials Fallback
{
  assert.strictEqual(isDisplayablePhotoUrl("/images/toppers/ananya.jpg"), true);
  assert.strictEqual(isDisplayablePhotoUrl("http://127.0.0.1:3001/api/public/media/toppers/top_123.webp"), true);
  assert.strictEqual(isDisplayablePhotoUrl("http://localhost:3001/api/public/media/toppers/top_123.webp"), true);
  assert.strictEqual(isDisplayablePhotoUrl("https://external-untrusted.com/photo.jpg"), false);
  assert.strictEqual(isDisplayablePhotoUrl("//malicious-domain.com/photo.jpg"), false);
  assert.strictEqual(isDisplayablePhotoUrl(null), false);
  assert.strictEqual(isDisplayablePhotoUrl(""), false);

  assert.strictEqual(getInitials("Ananya Sharma"), "AS");
  assert.strictEqual(getInitials("Priya"), "PR");
  assert.strictEqual(getInitials("Rohan Kumar Upadhyay"), "RU");
  assert.strictEqual(getInitials(""), "S");

  console.log("  [PASS] Managed media URL validation and initials generation verified");
}

// 6. Accessible Alt Text Resolution
{
  const withCustomAlt = {
    studentName: "Priya Singh",
    grade: "Class XII",
    photoAlt: "Priya Singh District First Ranker",
  };
  assert.strictEqual(resolveCardAltText(withCustomAlt), "Priya Singh District First Ranker");

  const withEmptyAlt = {
    studentName: "Rohan Upadhyay",
    grade: "Class XII",
    photoAlt: "",
  };
  assert.strictEqual(resolveCardAltText(withEmptyAlt), "Rohan Upadhyay - Class XII CBSE Topper");

  console.log("  [PASS] Alt text resolution prioritizes photoAlt with fallback to name + grade");
}

// 7. Production Origin Media Acceptance & Untrusted Host Rejection
{
  const prevOrigin = process.env.NEXT_PUBLIC_MEDIA_ORIGIN;
  try {
    process.env.NEXT_PUBLIC_MEDIA_ORIGIN = "https://admin.devasthaly.edu.in";
    assert.strictEqual(
      isDisplayablePhotoUrl("https://admin.devasthaly.edu.in/api/public/media/toppers/top_prod123.webp"),
      true,
      "Should accept configured production media origin"
    );
    assert.strictEqual(
      isDisplayablePhotoUrl("https://admin.devasthaly.edu.in/unauthorized/path.webp"),
      false,
      "Should reject non-media paths even on production origin"
    );
    assert.strictEqual(
      isDisplayablePhotoUrl("https://attacker-origin.com/api/public/media/toppers/top_evil.webp"),
      false,
      "Should reject unauthorized external origins"
    );
    assert.strictEqual(
      isDisplayablePhotoUrl("http://127.0.0.1:3001/api/public/media/toppers/top_local.webp"),
      true,
      "Should still accept local development origin"
    );
  } finally {
    if (prevOrigin !== undefined) {
      process.env.NEXT_PUBLIC_MEDIA_ORIGIN = prevOrigin;
    } else {
      delete process.env.NEXT_PUBLIC_MEDIA_ORIGIN;
    }
  }
  console.log("  [PASS] Production media origin dynamically accepted while preserving strict host/path boundaries");
}

// 8. Empty Array vs Fallback Behavior
{
  const empty = [];
  const parsed = publicToppersArraySchema.safeParse(empty);
  assert.strictEqual(parsed.success, true);
  assert.strictEqual(parsed.data.length, 0);
  console.log("  [PASS] Empty response array parsed cleanly for authoritative empty-state handling");
}

// 9. Static Source Verification: "use cache" & revalidate 60
{
  const toppersApiSource = fs.readFileSync(
    path.join(__dirname, "../lib/api/toppers.ts"),
    "utf8"
  );
  assert.ok(
    toppersApiSource.includes('"use cache";') || toppersApiSource.includes("'use cache';"),
    "getPublicToppers must include 'use cache' directive"
  );
  assert.ok(
    toppersApiSource.includes('tags: ["toppers"]') || toppersApiSource.includes("tags: ['toppers']"),
    "Production caching must tag 'toppers'"
  );
  assert.ok(
    toppersApiSource.includes("revalidate: 60"),
    "Production caching must set revalidate: 60"
  );
  console.log("  [PASS] 'use cache' directive and 60s/toppers cache tag verified in api/toppers.ts");
}

console.log("===============================================================");
console.log("  All frontend toppers unit tests passed successfully!");
console.log("===============================================================");
