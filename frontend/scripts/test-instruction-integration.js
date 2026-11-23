/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { z } = require("zod");

console.log("===============================================================");
console.log("  Running Frontend Instructions Integration Unit Tests");
console.log("===============================================================");

// 1. Replicate Zod schemas from frontend/lib/api/instructions.ts
const publicGeneralInstructionSchema = z.object({
  id: z.string().min(1),
  ruleText: z.string().min(1),
  category: z.string().default("General Discipline"),
  isCritical: z.boolean().default(false),
});

const publicInstructionOverviewSchema = z.object({
  badgeText: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
  cardTitle: z.string().nullable().optional(),
  cardSubtitle: z.string().nullable().optional(),
});

const publicInstructionsResponseSchema = z.object({
  success: z.boolean(),
  overview: publicInstructionOverviewSchema.nullable(),
  instructions: z.array(publicGeneralInstructionSchema),
});

// 2. Test Zod Schemas Validation with Sample Full Response
{
  const validResponse = {
    success: true,
    overview: {
      badgeText: "Students & Parents / Guidelines",
      title: "General Instructions",
      subtitle: "Institutional code of conduct, discipline guidelines, and rules for students and guardians.",
      cardTitle: "School Rules & Regulations",
      cardSubtitle: "Devasthaly Vidyapeeth, Chilkahar, Ballia (U.P.)",
    },
    instructions: [
      {
        id: "inst-1",
        ruleText: "Students coming late will not be allowed to attend classes.",
        category: "Attendance & Punctuality",
        isCritical: true,
      },
    ],
  };

  const parsed = publicInstructionsResponseSchema.safeParse(validResponse);
  assert.strictEqual(parsed.success, true, "Valid response should parse successfully");
  assert.strictEqual(parsed.data.instructions.length, 1);
  assert.strictEqual(parsed.data.overview.badgeText, "Students & Parents / Guidelines");
  assert.strictEqual(parsed.data.instructions[0].isCritical, true);
  console.log("  [PASS] Valid API payload parses successfully");
}

// 3. Test Authoritative Empty Collections (Preservation without triggering fallback)
{
  const emptyResponse = {
    success: true,
    overview: null,
    instructions: [],
  };

  const parsed = publicInstructionsResponseSchema.safeParse(emptyResponse);
  assert.strictEqual(parsed.success, true, "Empty response should parse successfully");
  assert.strictEqual(parsed.data.instructions.length, 0, "Instructions array length must be 0");
  assert.strictEqual(parsed.data.overview, null, "Overview can be null");
  console.log("  [PASS] Authoritative empty collections parse cleanly without fallback trigger");
}

// 4. Test Malformed Response Rejection
{
  const malformed = {
    success: true,
    instructions: [
      {
        id: "inst-no-rule-text",
        category: "General Discipline",
        // missing ruleText
      },
    ],
  };

  const parsed = publicInstructionsResponseSchema.safeParse(malformed);
  assert.strictEqual(parsed.success, false, "Malformed response missing ruleText must be rejected");
  console.log("  [PASS] Malformed API response rejected cleanly by Zod");
}

// 5. Test Instructions API Source: "use cache", 60s revalidate, "instructions" tag, dev no-store
{
  const apiSource = fs.readFileSync(
    path.join(__dirname, "../lib/api/instructions.ts"),
    "utf8"
  );

  const getPublicInstructionsMatch = apiSource.match(
    /export async function getPublicInstructions\s*\([^)]*\)\s*:[^{]*\{([^}]+)/
  );
  assert.ok(getPublicInstructionsMatch, "getPublicInstructions function body must exist");
  const funcBody = getPublicInstructionsMatch[1].trim();
  assert.ok(
    funcBody.startsWith('"use cache";') || funcBody.startsWith("'use cache';"),
    'First statement in getPublicInstructions must be "use cache";'
  );
  assert.ok(
    apiSource.includes('tags: ["instructions"]') || apiSource.includes("tags: ['instructions']"),
    "Production caching must tag 'instructions'"
  );
  assert.ok(
    apiSource.includes("revalidate: 60"),
    "Production caching must set revalidate: 60"
  );
  assert.ok(
    apiSource.includes('cache: "no-store"'),
    "Development caching must use cache: 'no-store'"
  );
  console.log("  [PASS] 'use cache' directive, 60s revalidation, 'instructions' tag, and dev no-store verified");
}

// 6. Test Security: Verify No Localhost / 127.0.0.1 in Static Fallback Data
{
  const apiSource = fs.readFileSync(
    path.join(__dirname, "../lib/api/instructions.ts"),
    "utf8"
  );
  const staticBlockMatch = apiSource.match(
    /STATIC_INSTRUCTIONS_DATA(?:\s*:\s*PublicInstructionsData)?\s*=\s*\{[\s\S]*?\};/
  );
  assert.ok(staticBlockMatch, "STATIC_INSTRUCTIONS_DATA must exist in instructions.ts");
  assert.strictEqual(
    staticBlockMatch[0].includes("localhost") || staticBlockMatch[0].includes("127.0.0.1"),
    false,
    "Zero localhost/127.0.0.1 in static instructions fallback"
  );
  console.log("  [PASS] Zero localhost/127.0.0.1 in static fallback constants");
}

// 7. Verify General Instructions page.tsx
{
  const pagePath = path.resolve(__dirname, "../app/general-instructions/page.tsx");
  const pageSource = fs.readFileSync(pagePath, "utf8");

  assert.ok(pageSource.includes("getPublicInstructions"), "page must call getPublicInstructions");
  assert.ok(pageSource.includes("instructions.length === 0"), "page must check instructions.length === 0");
  assert.ok(
    pageSource.includes("Official school rules and guidelines are currently being reviewed for the upcoming session."),
    "page must render dedicated empty state message for 0 instructions"
  );
  assert.strictEqual(
    pageSource.includes("dangerouslySetInnerHTML"),
    false,
    "Zero dangerouslySetInnerHTML allowed"
  );
  console.log("  [PASS] General instructions page source verified for dynamic data, empty state, and safe rendering");
}

// 8. Verify Legacy Alias Route Preserved
{
  const aliasPath = path.resolve(__dirname, "../app/general-insructions/page.tsx");
  assert.ok(fs.existsSync(aliasPath), "Legacy alias page.tsx must exist");
  const aliasSource = fs.readFileSync(aliasPath, "utf8");
  assert.ok(
    aliasSource.includes('export { default } from "../general-instructions/page"'),
    "Legacy alias must re-export general-instructions page"
  );
  console.log("  [PASS] Legacy alias route preserved and verified");
}

console.log("===============================================================");
console.log("  All Frontend Instructions Integration Tests PASSED");
console.log("===============================================================");
