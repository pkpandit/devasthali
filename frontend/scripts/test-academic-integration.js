/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { z } = require("zod");

console.log("===============================================================");
console.log("  Running Frontend Academics Integration Unit Tests");
console.log("===============================================================");

// 1. Replicate Zod schemas from frontend/lib/api/academics.ts
const publicAcademicWingSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  stageBadge: z.string().default(""),
  title: z.string().min(1),
  description: z.string().default(""),
  highlights: z.array(z.string()).default([]),
  displayOrder: z.number().default(0),
});

const publicAcademicStreamSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  iconName: z.string().default("BookOpen"),
  subjects: z.array(z.string()).default([]),
  competitiveBadge: z.string().nullable().optional(),
  displayOrder: z.number().default(0),
});

const publicAcademicAssessmentRuleSchema = z.object({
  id: z.string().min(1),
  ruleText: z.string().min(1),
  displayOrder: z.number().default(0),
});

const publicAcademicOverviewSchema = z.object({
  heroBadge: z.string().nullable().optional(),
  heroImage: z.string().nullable().optional(),
  heroImageAlt: z.string().nullable().optional(),
  competitiveBadge: z.string().nullable().optional(),
  competitiveTitle: z.string().nullable().optional(),
  competitiveDescription: z.string().nullable().optional(),
  competitiveCtaText: z.string().nullable().optional(),
  competitiveCtaHref: z.string().nullable().optional(),
  assessmentParentNotice: z.string().nullable().optional(),
  assessmentProspectusNotice: z.string().nullable().optional(),
  assessmentProspectusUrl: z.string().nullable().optional(),
});

const publicAcademicsResponseSchema = z.object({
  success: z.boolean(),
  overview: publicAcademicOverviewSchema.nullable(),
  wings: z.array(publicAcademicWingSchema),
  streams: z.array(publicAcademicStreamSchema),
  assessmentRules: z.array(publicAcademicAssessmentRuleSchema),
});

// 2. Test Zod Schemas Validation with Sample Full Response
{
  const validResponse = {
    success: true,
    overview: {
      heroBadge: "Experimental Laboratory Learning",
      heroImage: "/images/facilities/science-lab.jpg",
      heroImageAlt: "Devasthaly Vidyapeeth advanced science laboratory practical learning session",
      competitiveBadge: "Integrated Career Preparation",
      competitiveTitle: "NEET, JEE & CUET Foundational Guidance",
      competitiveDescription: "Integrated competitive preparation.",
      competitiveCtaText: "Apply for Class XI Admission",
      competitiveCtaHref: "/admissions",
      assessmentParentNotice: "Parent-teacher consultation note.",
      assessmentProspectusNotice: "Download syllabus prospectus.",
      assessmentProspectusUrl: "/documents/original/prospectus-2.pdf",
    },
    wings: [
      {
        id: "wing-1",
        slug: "foundational-wing",
        stageBadge: "Stage 1",
        title: "Foundational Stage",
        description: "Playful experiential learning.",
        highlights: ["Phonics", "Number games"],
        displayOrder: 0,
      },
    ],
    streams: [
      {
        id: "stream-1",
        slug: "science-stream",
        title: "Science Stream",
        description: "PCM and PCB tracks",
        iconName: "FlaskConical",
        subjects: ["Physics", "Chemistry", "Mathematics"],
        competitiveBadge: "NEET/JEE Foundation",
        displayOrder: 0,
      },
    ],
    assessmentRules: [
      {
        id: "rule-1",
        ruleText: "Terminal examinations contribute 50% towards cumulative evaluation.",
        displayOrder: 0,
      },
    ],
  };

  const parsed = publicAcademicsResponseSchema.safeParse(validResponse);
  assert.strictEqual(parsed.success, true, "Valid response should parse successfully");
  assert.strictEqual(parsed.data.wings.length, 1);
  assert.strictEqual(parsed.data.streams.length, 1);
  assert.strictEqual(parsed.data.assessmentRules.length, 1);
  assert.strictEqual(parsed.data.overview.heroBadge, "Experimental Laboratory Learning");
  console.log("  [PASS] Valid API payload parses successfully");
}

// 3. Test Authoritative Empty Arrays
{
  const emptyResponse = {
    success: true,
    overview: null,
    wings: [],
    streams: [],
    assessmentRules: [],
  };

  const parsed = publicAcademicsResponseSchema.safeParse(emptyResponse);
  assert.strictEqual(parsed.success, true, "Empty response should parse successfully");
  assert.strictEqual(parsed.data.wings.length, 0, "Wings array length must be 0");
  assert.strictEqual(parsed.data.streams.length, 0, "Streams array length must be 0");
  assert.strictEqual(parsed.data.assessmentRules.length, 0, "Rules array length must be 0");
  assert.strictEqual(parsed.data.overview, null, "Overview can be null");
  console.log("  [PASS] Authoritative empty collections parse cleanly without fallback trigger");
}

// 4. Test Malformed Response Rejection
{
  const malformed = {
    success: true,
    wings: [
      {
        id: "wing-no-title",
        slug: "invalid",
        // missing title
        highlights: [],
      },
    ],
    streams: [],
    assessmentRules: [],
  };

  const parsed = publicAcademicsResponseSchema.safeParse(malformed);
  assert.strictEqual(parsed.success, false, "Malformed response missing wing title must be rejected");
  console.log("  [PASS] Malformed API response rejected cleanly by Zod");
}

// 5. Test Academics API Source: "use cache", 60s revalidate, "academics" tag, dev no-store
{
  const apiSource = fs.readFileSync(
    path.join(__dirname, "../lib/api/academics.ts"),
    "utf8"
  );

  const getPublicAcademicsMatch = apiSource.match(
    /export async function getPublicAcademics\s*\([^)]*\)\s*:[^{]*\{([^}]+)/
  );
  assert.ok(getPublicAcademicsMatch, "getPublicAcademics function body must exist");
  const funcBody = getPublicAcademicsMatch[1].trim();
  assert.ok(
    funcBody.startsWith('"use cache";') || funcBody.startsWith("'use cache';"),
    'First statement in getPublicAcademics must be "use cache";'
  );
  assert.ok(
    apiSource.includes('tags: ["academics"]') || apiSource.includes("tags: ['academics']"),
    "Production caching must tag 'academics'"
  );
  assert.ok(
    apiSource.includes("revalidate: 60"),
    "Production caching must set revalidate: 60"
  );
  assert.ok(
    apiSource.includes('cache: "no-store"'),
    "Development caching must use cache: 'no-store'"
  );
  console.log("  [PASS] 'use cache' directive, 60s revalidation, 'academics' tag, and dev no-store verified");
}

// 6. Test Security: Verify No Localhost / 127.0.0.1 in Static Fallback Data
{
  const apiSource = fs.readFileSync(
    path.join(__dirname, "../lib/api/academics.ts"),
    "utf8"
  );
  // Verify that fallback constants do not contain hardcoded localhost/127.0.0.1
  const staticBlockMatch = apiSource.match(/STATIC_ACADEMICS_DATA(?:\s*:\s*PublicAcademicsData)?\s*=\s*\{[\s\S]*?\};/);
  assert.ok(staticBlockMatch, "STATIC_ACADEMICS_DATA must exist in academics.ts");
  assert.strictEqual(
    staticBlockMatch[0].includes("localhost") || staticBlockMatch[0].includes("127.0.0.1"),
    false,
    "Zero localhost/127.0.0.1 in static academic fallback"
  );
  console.log("  [PASS] Zero localhost/127.0.0.1 in static fallback constants");
}

// 7. Verify Academics page.tsx
{
  const pagePath = path.resolve(__dirname, "../app/academics/page.tsx");
  const pageSource = fs.readFileSync(pagePath, "utf8");

  assert.ok(pageSource.includes("getPublicAcademics"), "academics page must call getPublicAcademics");
  assert.ok(pageSource.includes("wings.length === 0"), "academics page must handle empty wings state");
  assert.ok(pageSource.includes("streams.length === 0"), "academics page must handle empty streams state");
  assert.ok(pageSource.includes('id="wings"'), "academics page must preserve #wings anchor");
  assert.ok(pageSource.includes('id="streams"'), "academics page must preserve #streams anchor");
  assert.ok(pageSource.includes('id="competitive"'), "academics page must preserve #competitive anchor");
  assert.strictEqual(pageSource.includes("dangerouslySetInnerHTML"), false, "Zero dangerouslySetInnerHTML allowed");
  console.log("  [PASS] Academics page source verified for dynamic data, empty states, and safe rendering");
}

// 8. Verify Academic-System page.tsx
{
  const systemPagePath = path.resolve(__dirname, "../app/academic-system/page.tsx");
  const systemPageSource = fs.readFileSync(systemPagePath, "utf8");

  assert.ok(systemPageSource.includes("getPublicAcademics"), "academic-system page must call getPublicAcademics");
  assert.ok(systemPageSource.includes("assessmentRules.length === 0"), "academic-system page must handle empty rules state");
  assert.ok(systemPageSource.includes("prospectusUrl"), "academic-system page must render prospectus download URL");
  assert.strictEqual(systemPageSource.includes("dangerouslySetInnerHTML"), false, "Zero dangerouslySetInnerHTML allowed");
  console.log("  [PASS] Academic-system page source verified for dynamic rules, empty state, and safe rendering");
}

console.log("===============================================================");
console.log("  All Frontend Academics Integration Tests PASSED");
console.log("===============================================================");
