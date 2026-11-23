/**
 * Test Suite: General Instruction Actions & Validation (Milestone 16)
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

// Bundle TypeScript validation for Node runtime
const validationOutfile = path.resolve(__dirname, "../dist_test_instruction_validation.js");

try {
  execSync(
    `npx esbuild lib/validation/instructions.ts --bundle --platform=node --outfile=${validationOutfile} --external:@prisma/client --external:server-only`,
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
} catch (e) {
  console.error("esbuild compilation failed:", e);
  process.exit(1);
}

const {
  ALLOWED_INSTRUCTION_CATEGORIES,
  generalInstructionCreateSchema,
  generalInstructionUpdateSchema,
  generalInstructionDeleteSchema,
  toggleGeneralInstructionStatusSchema,
  reorderGeneralInstructionsSchema,
  instructionOverviewUpdateSchema,
  computeInstructionDiff,
} = require(validationOutfile);

async function runTests() {
  console.log("-----------------------------------------------------------------");
  console.log("  Running Instruction Actions & Validation Test Suite");
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

  // 1. Category Allow-list Tests
  const expectedCategories = [
    "General Discipline",
    "Attendance & Punctuality",
    "Parent & Visitor Guidelines",
    "Leave & Campus Security",
    "Institutional Authority & Suspension",
    "Complaints & Suggestions",
    "Academic Commitment",
    "Dress Code & Uniform",
  ];
  assert(
    expectedCategories.every((cat) => ALLOWED_INSTRUCTION_CATEGORIES.includes(cat)),
    "Allowed categories contain all 8 approved categories"
  );
  assert(
    ALLOWED_INSTRUCTION_CATEGORIES.length === 8,
    "Allowed category set restricted strictly to 8 categories"
  );

  // 2. Create Schema Validation
  const validInstruction = {
    ruleText: "Students coming late will not be allowed to attend classes.",
    category: "Attendance & Punctuality",
    isCritical: true,
    displayOrder: 2,
    isPublished: true,
  };
  const parsedCreate = generalInstructionCreateSchema.safeParse(validInstruction);
  assert(parsedCreate.success, "Valid general instruction passes validation");

  const invalidCategory = {
    ...validInstruction,
    category: "Unauthorized Custom Category",
  };
  assert(
    !generalInstructionCreateSchema.safeParse(invalidCategory).success,
    "Unauthorized category is rejected by schema"
  );

  const shortText = {
    ...validInstruction,
    ruleText: "Late", // Less than 5 chars
  };
  assert(
    !generalInstructionCreateSchema.safeParse(shortText).success,
    "Rule text shorter than 5 chars is rejected"
  );

  // 3. Update, Delete, Toggle, Reorder Schemas
  const validUpdate = {
    id: "inst_123",
    ruleText: "Updated rule text regarding attendance compliance.",
    category: "General Discipline",
    isCritical: false,
    displayOrder: 5,
  };
  assert(
    generalInstructionUpdateSchema.safeParse(validUpdate).success,
    "Valid instruction update passes"
  );

  assert(
    generalInstructionDeleteSchema.safeParse({ id: "inst_123" }).success,
    "Valid instruction delete passes"
  );
  assert(
    !generalInstructionDeleteSchema.safeParse({ id: "" }).success,
    "Empty instruction delete ID is rejected"
  );

  assert(
    toggleGeneralInstructionStatusSchema.safeParse({ id: "inst_123" }).success,
    "Valid toggle status ID passes"
  );

  assert(
    reorderGeneralInstructionsSchema.safeParse({ orderedIds: ["id_1", "id_2"] }).success,
    "Valid reorder IDs pass"
  );
  assert(
    !reorderGeneralInstructionsSchema.safeParse({ orderedIds: [] }).success,
    "Empty reorder IDs list is rejected"
  );

  // 4. Instruction Overview Schema
  const validOverview = {
    badgeText: "Students & Parents / Guidelines",
    title: "General Instructions",
    subtitle: "Institutional code of conduct, discipline guidelines, and rules.",
    cardTitle: "School Rules & Regulations",
    cardSubtitle: "Devasthaly Vidyapeeth, Chilkahar, Ballia (U.P.)",
  };
  assert(
    instructionOverviewUpdateSchema.safeParse(validOverview).success,
    "Valid overview input passes"
  );

  const longTitle = {
    ...validOverview,
    title: "A".repeat(151), // Max 150
  };
  assert(
    !instructionOverviewUpdateSchema.safeParse(longTitle).success,
    "Overview title exceeding 150 chars is rejected"
  );

  // 5. Diff Computation Test
  const oldInst = { category: "General Discipline", isCritical: false };
  const newInst = { category: "Attendance & Punctuality", isCritical: false };
  const diff = computeInstructionDiff(oldInst, newInst);
  assert(
    diff.category &&
      diff.category.from === "General Discipline" &&
      diff.category.to === "Attendance & Punctuality" &&
      !diff.isCritical,
    "computeInstructionDiff tracks modified fields and ignores unchanged fields"
  );

  // 6. Server Actions File Structure and Revalidation Tag Check
  const actionsFilePath = path.resolve(__dirname, "../lib/server/instruction-actions.ts");
  const actionsContent = fs.readFileSync(actionsFilePath, "utf8");

  assert(
    actionsContent.includes('revalidateTag("instructions", "max")'),
    "instruction-actions.ts calls revalidateTag('instructions', 'max')"
  );
  assert(
    actionsContent.includes('revalidatePath("/admin/students-parents/instructions")'),
    "instruction-actions.ts calls revalidatePath('/admin/students-parents/instructions')"
  );
  assert(
    !actionsContent.includes('revalidatePath("/general-instructions")'),
    "instruction-actions.ts does NOT call non-existent backend route revalidatePath('/general-instructions')"
  );

  // 7. Database Seed Verification
  const instructionCount = await prisma.generalInstruction.count();
  const overviewRecord = await prisma.instructionOverview.findUnique({ where: { id: "default" } });

  assert(
    instructionCount === 9,
    `Database contains exactly 9 general instructions (found: ${instructionCount})`
  );
  assert(overviewRecord !== null, "Database contains default InstructionOverview record");
  assert(
    overviewRecord && overviewRecord.title === "General Instructions",
    "InstructionOverview contains preserved title"
  );
  assert(
    overviewRecord && overviewRecord.cardTitle === "School Rules & Regulations",
    "InstructionOverview contains preserved cardTitle"
  );

  const criticalCount = await prisma.generalInstruction.count({ where: { isCritical: true } });
  assert(criticalCount === 5, `Database contains exactly 5 critical rules (found: ${criticalCount})`);

  console.log(`\n  All tests passed: ${passed}/${total}`);
}

runTests()
  .then(() => {
    console.log("-----------------------------------------------------------------");
    console.log("  Instruction Actions & Validation Test Suite COMPLETED successfully.");
    console.log("-----------------------------------------------------------------");
  })
  .catch((err) => {
    console.error("  [ERROR] Test suite failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    try {
      if (fs.existsSync(validationOutfile)) fs.unlinkSync(validationOutfile);
    } catch {}
    await prisma.$disconnect();
  });
