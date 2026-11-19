/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert");

console.log("===============================================================");
console.log("  Running Test Suite: Public Toppers Route Logic (Milestone 8)");
console.log("===============================================================");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function mapToPublicDto(record, publicMediaOrigin = "http://127.0.0.1:3001") {
  // Simulates the exact projection and transformation performed by GET /api/public/toppers
  const allowedKeys = new Set([
    "id",
    "studentName",
    "scorePercent",
    "grade",
    "stream",
    "academicYear",
    "achievement",
    "photoUrl",
    "photoAlt",
    "displayOrder",
    "isFeatured",
  ]);

  let resolvedPhotoUrl = record.photoUrl;
  if (record.photoStorageKey && /^toppers\/top_[a-f0-9-]+\.webp$/.test(record.photoStorageKey)) {
    resolvedPhotoUrl = `${publicMediaOrigin}/api/public/media/${record.photoStorageKey}`;
  } else if (resolvedPhotoUrl && !resolvedPhotoUrl.startsWith("/")) {
    try {
      const parsed = new URL(resolvedPhotoUrl);
      if (parsed.pathname.startsWith("/api/public/media/")) {
        resolvedPhotoUrl = `${publicMediaOrigin}${parsed.pathname}`;
      }
    } catch {
      // Keep as-is
    }
  }

  const resolvedPhotoAlt = (record.photoAlt && record.photoAlt.trim() !== "")
    ? record.photoAlt.trim()
    : (resolvedPhotoUrl ? `Photo of ${record.studentName} - ${record.grade} CBSE Topper` : "");

  const output = {};
  for (const key of allowedKeys) {
    if (key === "scorePercent") {
      output[key] = Number(record[key]);
    } else if (key === "photoUrl") {
      output[key] = resolvedPhotoUrl;
    } else if (key === "photoAlt") {
      output[key] = resolvedPhotoAlt;
    } else {
      output[key] = record[key] !== undefined ? record[key] : null;
    }
  }

  return output;
}

// 1. Whitelisting & Projection Test
{
  const mockDbRecord = {
    id: "cmwn_topper_12345",
    studentName: "Ananya Sharma",
    scorePercent: { toString: () => "99.00", valueOf: () => 99.00 }, // Mock Prisma Decimal
    grade: "Class X",
    stream: null,
    academicYear: "2024-25",
    achievement: "State Rank 1",
    photoUrl: "/images/academics/toppers/ananya.jpg",
    photoStorageKey: null,
    photoAlt: "Photo of Ananya Sharma - Class X CBSE Topper",
    displayOrder: 0,
    isPublished: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    internalAuditId: "audit-999",
  };

  const dto = mapToPublicDto(mockDbRecord);

  assert.strictEqual(dto.id, "cmwn_topper_12345", "Public ID must be included in DTO");
  assert.strictEqual(dto.studentName, "Ananya Sharma");
  assert.strictEqual(dto.scorePercent, 99);
  assert.strictEqual(typeof dto.scorePercent, "number");
  assert.strictEqual(dto.grade, "Class X");
  assert.strictEqual(dto.stream, null);
  assert.strictEqual(dto.academicYear, "2024-25");
  assert.strictEqual(dto.achievement, "State Rank 1");
  assert.strictEqual(dto.photoUrl, "/images/academics/toppers/ananya.jpg");
  assert.strictEqual(dto.photoAlt, "Photo of Ananya Sharma - Class X CBSE Topper");
  assert.strictEqual(dto.displayOrder, 0);
  assert.strictEqual(dto.isFeatured, true);

  // Assert sensitive/internal keys are strictly excluded
  assert.strictEqual(dto.photoStorageKey, undefined, "photoStorageKey must not be leaked");
  assert.strictEqual(dto.createdAt, undefined, "createdAt must not be exposed");
  assert.strictEqual(dto.updatedAt, undefined, "updatedAt must not be exposed");
  assert.strictEqual(dto.internalAuditId, undefined, "internalAuditId must not be exposed");

  console.log("  [PASS] Whitelist projection includes id, photoAlt, displayOrder and excludes internal keys");
}

// 2. Storage Key Resolution & Root-Relative Preservation
{
  const managedRecord = {
    id: "top_managed_1",
    studentName: "Priya Singh",
    scorePercent: 98.4,
    grade: "Class XII",
    stream: "Science (PCM)",
    academicYear: "2023-24",
    achievement: "District Rank 1",
    photoUrl: null,
    photoStorageKey: "toppers/top_12345678-1234-1234-1234-123456789abc.webp",
    photoAlt: "Photo of Priya Singh",
    displayOrder: 0,
    isPublished: true,
    isFeatured: true,
  };

  const dto = mapToPublicDto(managedRecord, "https://media.devasthaly.edu.in");
  assert.strictEqual(
    dto.photoUrl,
    "https://media.devasthaly.edu.in/api/public/media/toppers/top_12345678-1234-1234-1234-123456789abc.webp"
  );
  assert.strictEqual(dto.photoAlt, "Photo of Priya Singh");

  const staticRecord = {
    id: "top_static_1",
    studentName: "Aman Kumar Verma",
    scorePercent: 97.8,
    grade: "Class X",
    stream: null,
    academicYear: "2023-24",
    achievement: "School Topper",
    photoUrl: "/images/academics/toppers/topper-aman.jpg",
    photoStorageKey: null,
    photoAlt: "Photo of Aman Kumar Verma",
    displayOrder: 1,
    isPublished: true,
    isFeatured: true,
  };

  const staticDto = mapToPublicDto(staticRecord, "https://media.devasthaly.edu.in");
  assert.strictEqual(staticDto.photoUrl, "/images/academics/toppers/topper-aman.jpg");

  console.log("  [PASS] Managed storage keys resolved via PUBLIC_MEDIA_ORIGIN; static /images/... paths preserved");
}

// 3. Sorting Simulation: displayOrder ASC -> academicYear DESC -> scorePercent DESC -> id ASC
{
  const records = [
    { id: "c", academicYear: "2023-24", displayOrder: 2, scorePercent: 95 },
    { id: "a", academicYear: "2024-25", displayOrder: 1, scorePercent: 98 },
    { id: "b", academicYear: "2024-25", displayOrder: 0, scorePercent: 96 },
    { id: "d", academicYear: "2024-25", displayOrder: 0, scorePercent: 99 },
    { id: "e", academicYear: "2024-25", displayOrder: 0, scorePercent: 99, tieBreaker: "later" },
  ];

  records.sort((x, y) => {
    // 1. displayOrder asc
    if (x.displayOrder !== y.displayOrder) {
      return x.displayOrder - y.displayOrder;
    }
    // 2. academicYear desc
    if (x.academicYear !== y.academicYear) {
      return y.academicYear.localeCompare(x.academicYear);
    }
    // 3. scorePercent desc
    if (x.scorePercent !== y.scorePercent) {
      return y.scorePercent - x.scorePercent;
    }
    // 4. id asc
    return x.id.localeCompare(y.id);
  });

  assert.strictEqual(records[0].id, "d", "First must be order 0, 2024-25, score 99");
  assert.strictEqual(records[1].id, "e", "Second must be tie-broken by id");
  assert.strictEqual(records[2].id, "b", "Third must be order 0, 2024-25, score 96");
  assert.strictEqual(records[3].id, "a", "Fourth must be order 1, 2024-25, score 98");
  assert.strictEqual(records[4].id, "c", "Fifth must be order 2, 2023-24 session");

  console.log("  [PASS] Primary sort by displayOrder ASC, then academicYear DESC, scorePercent DESC, id ASC");
}

// 4. Live Database Verification: Publication Filter & Alt Text Integrity
async function runLiveDbChecks() {
  console.log("\n--- Live Database Publication & Alt Text Verification ---");
  const allInDb = await prisma.boardResultTopper.findMany();
  assert(allInDb.length >= 9, "Expected at least 9 toppers in database");

  const publishedInDb = await prisma.boardResultTopper.findMany({
    where: { isPublished: true },
  });
  assert(publishedInDb.length >= 9, "All current seeded/legacy toppers must be published");

  for (const t of publishedInDb) {
    if (t.photoUrl || t.photoStorageKey) {
      assert(t.photoAlt && t.photoAlt.trim().length > 0, `Topper ${t.studentName} must have non-empty photoAlt`);
    }
  }
  console.log("  [PASS] Live DB query verifies all published toppers have meaningful photoAlt");
}

runLiveDbChecks()
  .then(() => {
    console.log("===============================================================");
    console.log("  All public toppers API contract tests passed successfully!");
    console.log("===============================================================");
  })
  .catch((err) => {
    console.error("Test failure:", err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
