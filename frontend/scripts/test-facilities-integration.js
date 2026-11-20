/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { z } = require("zod");

console.log("===============================================================");
console.log("  Running Frontend Facilities Integration Unit Tests");
console.log("===============================================================");

// 1. Replicate Zod schemas from frontend/lib/api/facilities.ts
const publicFacilityItemSchema = z.object({
  id: z.string().min(1),
  slug: z.string().optional(),
  title: z.string().min(1),
  description: z.string().default(""),
  image: z.string().default(""),
  imageAlt: z.string().default(""),
  iconName: z.string().default("BookOpen"),
  highlights: z.array(z.string()).default([]),
  displayOrder: z.number().default(0),
});

const publicFacilityCategorySchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  displayOrder: z.number().default(0),
  items: z.array(publicFacilityItemSchema).default([]),
});

const publicFacilitiesResponseSchema = z.object({
  success: z.boolean(),
  categories: z.array(publicFacilityCategorySchema),
});

// 2. Test Zod Schemas Validation
{
  const validResponse = {
    success: true,
    categories: [
      {
        id: "cat_academic",
        slug: "academic",
        title: "Academic",
        description: "Cutting-edge classrooms and research laboratories.",
        displayOrder: 0,
        items: [
          {
            id: "fac_smart_class",
            slug: "smart-classrooms",
            title: "Interactive Smart Classrooms",
            description: "Equipped with interactive digital smart-boards.",
            image: "/images/facilities/science-lab.jpg",
            imageAlt: "Students using interactive smart board in smart classroom",
            iconName: "MonitorPlay",
            highlights: ["Interactive Touch Panels", "NCERT 3D Digital Content"],
            displayOrder: 0,
          },
          {
            id: "fac_comp_lab",
            slug: "computer-lab",
            title: "Advanced Computer Lab",
            description: "High-speed computing lab.",
            image: "/images/facilities/campus-grounds.jpg",
            imageAlt: "Students learning coding in modern computer lab",
            iconName: "Cpu",
            highlights: ["1:1 Ratio", "Gigabit Internet"],
            displayOrder: 1,
          },
        ],
      },
    ],
  };

  const parsed = publicFacilitiesResponseSchema.safeParse(validResponse);
  assert.strictEqual(parsed.success, true, "Valid response should parse successfully");
  assert.strictEqual(parsed.data.categories.length, 1);
  assert.strictEqual(parsed.data.categories[0].items.length, 2);
  console.log("  [PASS] Valid API payload parses successfully");
}

// 3. Test Authoritative Empty Array
{
  const emptyResponse = {
    success: true,
    categories: [],
  };

  const parsed = publicFacilitiesResponseSchema.safeParse(emptyResponse);
  assert.strictEqual(parsed.success, true, "Empty categories should parse successfully");
  assert.strictEqual(parsed.data.categories.length, 0, "Empty categories length must be 0");
  console.log("  [PASS] Authoritative empty categories response parses cleanly without error");
}

// 4. Test Malformed Response Rejection
{
  const malformed = {
    success: true,
    categories: [
      {
        id: "cat_invalid",
        // missing category title
        items: [],
      },
    ],
  };

  const parsed = publicFacilitiesResponseSchema.safeParse(malformed);
  assert.strictEqual(parsed.success, false, "Malformed response missing category title must be rejected");
  console.log("  [PASS] Malformed API response rejected cleanly by Zod");
}

// 5. Test Facilities API Source: "use cache", 60s revalidate, "facilities" tag
{
  const apiSource = fs.readFileSync(
    path.join(__dirname, "../lib/api/facilities.ts"),
    "utf8"
  );

  const getPublicFacilitiesMatch = apiSource.match(
    /export async function getPublicFacilities\s*\([^)]*\)\s*:[^{]*\{([^}]+)/
  );
  assert.ok(getPublicFacilitiesMatch, "getPublicFacilities function body must exist");
  const funcBody = getPublicFacilitiesMatch[1].trim();
  assert.ok(
    funcBody.startsWith('"use cache";') || funcBody.startsWith("'use cache';"),
    'First statement in getPublicFacilities must be "use cache";'
  );
  assert.ok(
    apiSource.includes('tags: ["facilities"]') || apiSource.includes("tags: ['facilities']"),
    "Production caching must tag 'facilities'"
  );
  assert.ok(
    apiSource.includes("revalidate: 60"),
    "Production caching must set revalidate: 60"
  );
  assert.ok(
    apiSource.includes('cache: "no-store"'),
    "Development caching must use cache: 'no-store'"
  );
  console.log("  [PASS] 'use cache' directive, 60s revalidation, 'facilities' tag, and dev no-store verified");
}

// 6. Test Security: Verify No Dangerous URLs in Static Content
{
  const contentSource = fs.readFileSync(
    path.join(__dirname, "../lib/content/facilities.ts"),
    "utf8"
  );
  assert.strictEqual(contentSource.includes("localhost"), false, "No localhost URLs in facilities.ts");
  assert.strictEqual(contentSource.includes("127.0.0.1"), false, "No 127.0.0.1 URLs in facilities.ts");
  console.log("  [PASS] Zero localhost/127.0.0.1 URLs in static fallback data");
}

// 7. Verify facilities page.tsx exports and metadata
{
  const pagePath = path.resolve(__dirname, "../app/facilities/page.tsx");
  const pageSource = fs.readFileSync(pagePath, "utf8");

  assert.ok(pageSource.includes("getPublicFacilityItems"), "facilities page must call getPublicFacilityItems");
  assert.ok(pageSource.includes("No Facilities Published Yet"), "facilities page must contain authoritative empty state");
  assert.ok(pageSource.includes('id="hostel"'), "facilities page must preserve hostel narrative anchor");
  assert.ok(pageSource.includes('id="transport"'), "facilities page must preserve transport narrative anchor");
  assert.strictEqual(pageSource.includes("dangerouslySetInnerHTML"), false, "Zero dangerouslySetInnerHTML allowed");
  console.log("  [PASS] Page source contains required anchors and empty-state handling");
}

console.log("===============================================================");
console.log("  All Frontend Facilities Integration Tests PASSED");
console.log("===============================================================");
