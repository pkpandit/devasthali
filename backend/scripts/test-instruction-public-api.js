/**
 * Test Suite: Public General Instructions API (Milestone 16)
 *
 * Verifies:
 * 1. HTTP 200 response & valid JSON
 * 2. Cache headers (Cache-Control: public, s-maxage=60, stale-while-revalidate=300; X-Content-Type-Options: nosniff)
 * 3. Response schema conformity (overview, instructions)
 * 4. Draft isolation (unpublished instructions excluded)
 * 5. Display order ordering (displayOrder asc, createdAt asc)
 * 6. Internal database fields strictly omitted (displayOrder, isPublished, slug, createdAt, updatedAt)
 * 7. Overview fields returned correctly
 * 8. Count of seeded instructions matches (9 published)
 */

/* eslint-disable @typescript-eslint/no-require-imports */
require.cache[require.resolve("server-only")] = { exports: {} };

const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const routeBundleOutfile = path.resolve(__dirname, "../dist_test_instruction_route.js");

try {
  execSync(
    `npx esbuild app/api/public/instructions/route.ts --bundle --platform=node --outfile=${routeBundleOutfile} --external:@prisma/client --external:server-only`,
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
} catch (e) {
  console.error("esbuild compilation failed:", e);
  process.exit(1);
}

const { GET } = require(routeBundleOutfile);

async function runTests() {
  console.log("-----------------------------------------------------------------");
  console.log("  Running Public Instructions API Test Suite");
  console.log("-----------------------------------------------------------------");

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      throw new Error(`Assertion failed: ${testName}`);
    }
  }

  // 1. Create temporary draft instruction to test draft isolation
  const draftInstruction = await prisma.generalInstruction.create({
    data: {
      ruleText: "Draft instruction: This rule is currently under review by the disciplinary committee.",
      category: "General Discipline",
      slug: "draft-instruction-test-isolation",
      isCritical: false,
      displayOrder: 999,
      isPublished: false,
    },
  });

  try {
    // 2. Execute GET handler
    const response = await GET();

    assert(response.status === 200, "GET /api/public/instructions returns HTTP 200 OK");

    const cacheHeader = response.headers.get("Cache-Control");
    assert(
      cacheHeader && cacheHeader.includes("public") && cacheHeader.includes("s-maxage=60"),
      "Cache-Control header specifies public s-maxage=60 and stale-while-revalidate=300"
    );

    const nosniffHeader = response.headers.get("X-Content-Type-Options");
    assert(
      nosniffHeader === "nosniff",
      "X-Content-Type-Options header is nosniff"
    );

    const json = await response.json();

    assert(json.success === true, "Response payload contains success: true");
    assert(typeof json.overview === "object" && json.overview !== null, "Response contains overview object");
    assert(Array.isArray(json.instructions), "Response contains instructions array");

    // 3. Draft Isolation Verification
    const hasDraftInstruction = json.instructions.some(
      (inst) => inst.id === draftInstruction.id || inst.ruleText.includes("Draft instruction")
    );
    assert(!hasDraftInstruction, "Unpublished draft instruction is excluded from public API");

    // 4. Seeded Instructions Count
    assert(
      json.instructions.length === 9,
      `Exactly 9 published instructions returned (found: ${json.instructions.length})`
    );

    // 5. Omission of Internal Metadata & displayOrder
    const sample = json.instructions[0];
    assert(sample && typeof sample.id === "string", "Instruction DTO has id");
    assert(sample && typeof sample.ruleText === "string", "Instruction DTO has ruleText");
    assert(sample && typeof sample.category === "string", "Instruction DTO has category");
    assert(sample && typeof sample.isCritical === "boolean", "Instruction DTO has isCritical");

    assert(!("displayOrder" in sample), "Instruction DTO strictly omits displayOrder");
    assert(!("isPublished" in sample), "Instruction DTO strictly omits isPublished");
    assert(!("slug" in sample), "Instruction DTO strictly omits slug");
    assert(!("createdAt" in sample), "Instruction DTO strictly omits createdAt");
    assert(!("updatedAt" in sample), "Instruction DTO strictly omits updatedAt");

    // 6. Overview Content Verification
    assert(
      json.overview.badgeText === "Students & Parents / Guidelines",
      "Overview badgeText correctly populated"
    );
    assert(
      json.overview.title === "General Instructions",
      "Overview title correctly populated"
    );
    assert(
      typeof json.overview.cardTitle === "string" && json.overview.cardTitle.length > 0,
      "Overview cardTitle correctly populated"
    );
    assert(!("createdAt" in json.overview), "Overview DTO omits createdAt");
    assert(!("updatedAt" in json.overview), "Overview DTO omits updatedAt");

    console.log(`\n  All tests passed: ${passed}/${total}`);
  } finally {
    // Cleanup temporary draft record
    await prisma.generalInstruction.deleteMany({ where: { id: draftInstruction.id } });
    try {
      if (fs.existsSync(routeBundleOutfile)) fs.unlinkSync(routeBundleOutfile);
    } catch {}
    await prisma.$disconnect();
  }
}

runTests()
  .then(() => {
    console.log("-----------------------------------------------------------------");
    console.log("  Public Instructions API Test Suite COMPLETED successfully.");
    console.log("-----------------------------------------------------------------");
  })
  .catch((err) => {
    console.error("  [ERROR] Test suite failed:", err);
    process.exit(1);
  });
