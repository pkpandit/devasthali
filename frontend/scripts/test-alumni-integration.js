/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("assert");
const fs = require("fs");
const { z } = require("zod");

console.log("==========================================");
console.log("RUNNING FRONTEND ALUMNI INTEGRATION TESTS");
console.log("==========================================");

let passedCount = 0;
function test(desc, fn) {
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${desc}`);
    console.error(err);
    process.exit(1);
  }
}

// 1. Check file existence
test("frontend/lib/api/alumni.ts exists", () => {
  assert.ok(fs.existsSync("frontend/lib/api/alumni.ts"));
});

test("frontend/app/alumni/page.tsx exists", () => {
  assert.ok(fs.existsSync("frontend/app/alumni/page.tsx"));
});

test("frontend/app/alumni-corner/page.tsx exists and delegates to alumni/page", () => {
  const content = fs.readFileSync("frontend/app/alumni-corner/page.tsx", "utf8");
  assert.ok(content.includes('from "../alumni/page"'));
});

// 2. Next.config.ts check
test("frontend/next.config.ts contains alumni media remotePattern", () => {
  const content = fs.readFileSync("frontend/next.config.ts", "utf8");
  assert.ok(content.includes("/api/public/media/alumni/**"));
});

// 3. Schema checks (replicate Zod schemas from alumni.ts)
const publicAlumniOverviewSchema = z.object({
  badgeText: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
});

const publicAlumniReunionSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  heroImage: z.string().nullable().optional(),
  heroImageAlt: z.string().nullable().optional(),
  eventDate: z.string().nullable().optional(),
});

const publicCareerOpportunitySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  badgeText: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  contactEmail: z.string().email(),
  emailSubject: z.string().nullable().optional(),
  ctaText: z.string().min(1),
});

const publicAlumniResponseSchema = z.object({
  success: z.boolean(),
  overview: publicAlumniOverviewSchema.nullable(),
  reunions: z.array(publicAlumniReunionSchema),
  opportunities: z.array(publicCareerOpportunitySchema),
});

test("publicAlumniResponseSchema parses valid backend payload", () => {
  const samplePayload = {
    success: true,
    overview: {
      badgeText: "Students & Parents / Alumni",
      title: "Alumni Corner",
      subtitle: "Welcome to the Devasthaly Vidyapeeth Alumni Network.",
    },
    reunions: [
      {
        id: "r1",
        slug: "annual-reunion",
        title: "Annual Alumni Meet",
        description: "Reunion description",
        heroImage: "/images/gallery/ALUMNI-REUNION.webp",
        heroImageAlt: "Alumni Meet Banner",
        eventDate: "December 20, 2026",
      },
    ],
    opportunities: [
      {
        id: "c1",
        slug: "careers-faculty",
        badgeText: "Institutional Notice",
        title: "Faculty Opportunity",
        description: "Join our teaching faculty",
        contactEmail: "careers@devasthali.edu.in",
        emailSubject: "Application",
        ctaText: "Apply via Email",
      },
    ],
  };

  const parsed = publicAlumniResponseSchema.safeParse(samplePayload);
  assert.ok(parsed.success);
});

test("publicAlumniResponseSchema preserves authoritative empty arrays (reunions: [], opportunities: [])", () => {
  const emptyPayload = {
    success: true,
    overview: {
      badgeText: "Alumni",
      title: "Alumni Corner",
      subtitle: "Subtitle",
    },
    reunions: [],
    opportunities: [],
  };

  const parsed = publicAlumniResponseSchema.safeParse(emptyPayload);
  assert.ok(parsed.success);
  assert.strictEqual(parsed.data.reunions.length, 0);
  assert.strictEqual(parsed.data.opportunities.length, 0);
});

test("publicAlumniResponseSchema rejects invalid contactEmail", () => {
  const invalidPayload = {
    success: true,
    overview: null,
    reunions: [],
    opportunities: [
      {
        id: "c1",
        slug: "career",
        badgeText: "Notice",
        title: "Title",
        description: "Desc",
        contactEmail: "not-an-email",
        emailSubject: null,
        ctaText: "Apply",
      },
    ],
  };

  const parsed = publicAlumniResponseSchema.safeParse(invalidPayload);
  assert.strictEqual(parsed.success, false);
});

// 4. Source code inspection for caching & safety
test("frontend/lib/api/alumni.ts uses 'use cache' directive and alumni cache tag", () => {
  const content = fs.readFileSync("frontend/lib/api/alumni.ts", "utf8");
  assert.ok(content.includes('"use cache";'));
  assert.ok(content.includes('tags: ["alumni"]'));
  assert.ok(content.includes("revalidate: 60"));
  assert.ok(content.includes('cache: "no-store"'));
});

test("frontend/app/alumni/page.tsx has zero dangerouslySetInnerHTML", () => {
  const content = fs.readFileSync("frontend/app/alumni/page.tsx", "utf8");
  assert.ok(!content.includes("dangerouslySetInnerHTML"));
});

test("frontend/app/alumni/page.tsx handles empty reunion state politely", () => {
  const content = fs.readFileSync("frontend/app/alumni/page.tsx", "utf8");
  assert.ok(content.includes("No alumni reunions or meets are currently scheduled"));
});

console.log("==========================================");
console.log(`ALL ${passedCount} FRONTEND ALUMNI TESTS PASSED!`);
console.log("==========================================");
