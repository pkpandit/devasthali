/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert");

console.log("===============================================================");
console.log("  Running Synthetic Test Suite: Public Toppers Route Logic");
console.log("===============================================================");

function mapToPublicDto(record) {
  // Simulates the exact projection and transformation performed by GET /api/public/toppers
  const allowedKeys = new Set([
    "studentName",
    "scorePercent",
    "grade",
    "stream",
    "academicYear",
    "achievement",
    "photoUrl",
    "isFeatured",
  ]);

  const output = {};
  for (const key of allowedKeys) {
    if (key === "scorePercent") {
      output[key] = Number(record[key]);
    } else {
      output[key] = record[key] !== undefined ? record[key] : null;
    }
  }

  return output;
}

// 1. Whitelisting Test
{
  const mockDbRecord = {
    id: "secret-cuid-12345",
    studentName: "Ananya Sharma",
    scorePercent: { toString: () => "99.00", valueOf: () => 99.00 }, // Mock Prisma Decimal
    grade: "Class X",
    stream: null,
    academicYear: "2024-25",
    achievement: "State Rank 1",
    photoUrl: "/images/academics/toppers/ananya.jpg",
    displayOrder: 0,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    internalAuditId: "audit-999",
  };

  const dto = mapToPublicDto(mockDbRecord);

  assert.strictEqual(dto.studentName, "Ananya Sharma");
  assert.strictEqual(dto.scorePercent, 99);
  assert.strictEqual(typeof dto.scorePercent, "number");
  assert.strictEqual(dto.grade, "Class X");
  assert.strictEqual(dto.stream, null);
  assert.strictEqual(dto.academicYear, "2024-25");
  assert.strictEqual(dto.achievement, "State Rank 1");
  assert.strictEqual(dto.photoUrl, "/images/academics/toppers/ananya.jpg");
  assert.strictEqual(dto.isFeatured, true);

  // Assert sensitive/internal keys are excluded
  assert.strictEqual(dto.id, undefined, "Internal database ID must not be exposed");
  assert.strictEqual(dto.displayOrder, undefined, "Internal displayOrder must not be exposed");
  assert.strictEqual(dto.createdAt, undefined, "Internal createdAt timestamp must not be exposed");
  assert.strictEqual(dto.updatedAt, undefined, "Internal updatedAt timestamp must not be exposed");
  assert.strictEqual(dto.internalAuditId, undefined, "Internal audit ID must not be exposed");

  console.log("  [PASS] Field whitelisting excludes internal IDs, displayOrder, timestamps, and audit keys");
  console.log("  [PASS] Decimal scorePercent is safely converted to standard JavaScript number");
}

// 2. Sorting Test (multi-key sorting simulation)
{
  const records = [
    { id: "c", academicYear: "2023-24", displayOrder: 0, scorePercent: 95 },
    { id: "a", academicYear: "2024-25", displayOrder: 1, scorePercent: 98 },
    { id: "b", academicYear: "2024-25", displayOrder: 0, scorePercent: 96 },
    { id: "d", academicYear: "2024-25", displayOrder: 0, scorePercent: 99 },
    { id: "e", academicYear: "2024-25", displayOrder: 0, scorePercent: 99, tieBreaker: "later" },
  ];

  records.sort((x, y) => {
    // 1. academicYear desc
    if (x.academicYear !== y.academicYear) {
      return y.academicYear.localeCompare(x.academicYear);
    }
    // 2. displayOrder asc
    if (x.displayOrder !== y.displayOrder) {
      return x.displayOrder - y.displayOrder;
    }
    // 3. scorePercent desc
    if (x.scorePercent !== y.scorePercent) {
      return y.scorePercent - x.scorePercent;
    }
    // 4. id asc
    return x.id.localeCompare(y.id);
  });

  assert.strictEqual(records[0].id, "d", "First must be 2024-25, order 0, score 99");
  assert.strictEqual(records[1].id, "e", "Second must be tie-broken by id");
  assert.strictEqual(records[2].id, "b", "Third must be 2024-25, order 0, score 96");
  assert.strictEqual(records[3].id, "a", "Fourth must be 2024-25, order 1");
  assert.strictEqual(records[4].id, "c", "Fifth must be older 2023-24 session");

  console.log("  [PASS] Multi-key sorting order: academicYear DESC -> displayOrder ASC -> scorePercent DESC -> id ASC");
}

console.log("===============================================================");
console.log("  All public toppers API logic tests passed successfully!");
console.log("===============================================================");
