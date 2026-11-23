/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { z } = require("zod");

console.log("===============================================================");
console.log("  Running Frontend Activities Integration Unit Tests");
console.log("===============================================================");

// 1. Replicate Zod schemas from frontend/lib/api/activities.ts
const publicStudentClubSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  category: z.string().default("Cultural & Creative"),
  description: z.string().nullable().optional(),
  iconName: z.string().default("Activity"),
  displayOrder: z.number().default(0),
});

const publicActivityOverviewSchema = z.object({
  badgeText: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
  arenaSize: z.string().nullable().optional(),
  cardTitle: z.string().nullable().optional(),
  cardSubtitle: z.string().nullable().optional(),
  narrativeParagraph1: z.string().nullable().optional(),
  narrativeParagraph2: z.string().nullable().optional(),
  heroImage: z.string().nullable().optional(),
  heroImageAlt: z.string().nullable().optional(),
});

const publicActivitiesResponseSchema = z.object({
  success: z.boolean(),
  overview: publicActivityOverviewSchema.nullable(),
  clubs: z.array(publicStudentClubSchema),
});

// 2. Test Zod Schemas Validation with Sample Full Response
{
  const validResponse = {
    success: true,
    overview: {
      badgeText: "Life at School / Activities",
      title: "Co-Curricular Activities",
      subtitle: "Enhancing personality, talent, and all-round development.",
      arenaSize: "22,000 sq ft",
      cardTitle: "Holistic Personality Enrichment",
      cardSubtitle: "Devasthaly Vidyapeeth, Chilkahar, Ballia (U.P.)",
      narrativeParagraph1: "Devasthaly Vidyapeeth provides a wide variety of activities.",
      narrativeParagraph2: "Students are exposed to dance, music and cultural events.",
      heroImage: "/images/campus/sports-complex.webp",
      heroImageAlt: "Devasthaly Vidyapeeth sports arena with students engaged in activity",
    },
    clubs: [
      {
        id: "club-1",
        slug: "fine-arts-painting",
        name: "Fine Arts & Painting",
        category: "Cultural & Creative",
        description: "Visual arts and sketching.",
        iconName: "Palette",
        displayOrder: 1,
      },
    ],
  };

  const parsed = publicActivitiesResponseSchema.safeParse(validResponse);
  assert.strictEqual(parsed.success, true, "Valid response should parse successfully");
  assert.strictEqual(parsed.data.clubs.length, 1);
  assert.strictEqual(parsed.data.overview.badgeText, "Life at School / Activities");
  assert.strictEqual(parsed.data.overview.arenaSize, "22,000 sq ft");
  console.log("  [PASS] Valid API payload parses successfully");
}

// 3. Test Authoritative Empty Collections
{
  const emptyResponse = {
    success: true,
    overview: null,
    clubs: [],
  };

  const parsed = publicActivitiesResponseSchema.safeParse(emptyResponse);
  assert.strictEqual(parsed.success, true, "Empty response should parse successfully");
  assert.strictEqual(parsed.data.clubs.length, 0, "Clubs array length must be 0");
  assert.strictEqual(parsed.data.overview, null, "Overview can be null");
  console.log("  [PASS] Authoritative empty collections parse cleanly without fallback trigger");
}

// 4. Test Malformed Response Rejection
{
  const malformed = {
    success: true,
    clubs: [
      {
        id: "club-no-name",
        slug: "invalid",
        // missing name
        displayOrder: 1,
      },
    ],
  };

  const parsed = publicActivitiesResponseSchema.safeParse(malformed);
  assert.strictEqual(parsed.success, false, "Malformed response missing club name must be rejected");
  console.log("  [PASS] Malformed API response rejected cleanly by Zod");
}

// 5. Test Activities API Source: "use cache", 60s revalidate, "activities" tag, dev no-store
{
  const apiSource = fs.readFileSync(
    path.join(__dirname, "../lib/api/activities.ts"),
    "utf8"
  );

  const getPublicActivitiesMatch = apiSource.match(
    /export async function getPublicActivities\s*\([^)]*\)\s*:[^{]*\{([^}]+)/
  );
  assert.ok(getPublicActivitiesMatch, "getPublicActivities function body must exist");
  const funcBody = getPublicActivitiesMatch[1].trim();
  assert.ok(
    funcBody.startsWith('"use cache";') || funcBody.startsWith("'use cache';"),
    'First statement in getPublicActivities must be "use cache";'
  );
  assert.ok(
    apiSource.includes('tags: ["activities"]') || apiSource.includes("tags: ['activities']"),
    "Production caching must tag 'activities'"
  );
  assert.ok(
    apiSource.includes("revalidate: 60"),
    "Production caching must set revalidate: 60"
  );
  assert.ok(
    apiSource.includes('cache: "no-store"'),
    "Development caching must use cache: 'no-store'"
  );
  console.log("  [PASS] 'use cache' directive, 60s revalidation, 'activities' tag, and dev no-store verified");
}

// 6. Test Security: Verify No Localhost / 127.0.0.1 in Static Fallback Data
{
  const apiSource = fs.readFileSync(
    path.join(__dirname, "../lib/api/activities.ts"),
    "utf8"
  );
  const staticBlockMatch = apiSource.match(
    /STATIC_ACTIVITIES_DATA(?:\s*:\s*PublicActivitiesData)?\s*=\s*\{[\s\S]*?\};/
  );
  assert.ok(staticBlockMatch, "STATIC_ACTIVITIES_DATA must exist in activities.ts");
  assert.strictEqual(
    staticBlockMatch[0].includes("localhost") || staticBlockMatch[0].includes("127.0.0.1"),
    false,
    "Zero localhost/127.0.0.1 in static activities fallback"
  );
  console.log("  [PASS] Zero localhost/127.0.0.1 in static fallback constants");
}

// 7. Verify Co-Curricular Activities page.tsx
{
  const pagePath = path.resolve(__dirname, "../app/co-curricular-activities/page.tsx");
  const pageSource = fs.readFileSync(pagePath, "utf8");

  assert.ok(pageSource.includes("getPublicActivities"), "page must call getPublicActivities");
  assert.ok(pageSource.includes("clubs.length > 0"), "page must check clubs.length > 0");
  assert.ok(
    pageSource.includes("Student clubs and cultural programs are currently being finalized"),
    "page must render dedicated empty state message for 0 clubs"
  );
  assert.strictEqual(
    pageSource.includes("dangerouslySetInnerHTML"),
    false,
    "Zero dangerouslySetInnerHTML allowed"
  );
  console.log("  [PASS] Co-curricular activities page source verified for dynamic data, empty state, and safe rendering");
}

console.log("===============================================================");
console.log("  All Frontend Activities Integration Tests PASSED");
console.log("===============================================================");
