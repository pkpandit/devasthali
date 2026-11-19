/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { z } = require("zod");

console.log("===============================================================");
console.log("  Running Frontend Downloads Integration Unit Tests");
console.log("===============================================================");

// 1. Replicate Zod schemas from frontend/lib/api/downloads.ts
const publicDownloadDocumentSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  file: z.string().min(1),
  size: z.string().default("PDF Document"),
  fileType: z.string().default("application/pdf"),
  displayOrder: z.number().default(0),
});

const publicDownloadCategorySchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  category: z.string().min(1),
  description: z.string().nullable().optional(),
  displayOrder: z.number().default(0),
  docs: z.array(publicDownloadDocumentSchema).default([]),
});

const publicDownloadsResponseSchema = z.object({
  success: z.boolean(),
  categories: z.array(publicDownloadCategorySchema),
});

// 2. Test Zod Schemas Validation
{
  const validResponse = {
    success: true,
    categories: [
      {
        id: "cat_1",
        slug: "school-prospectus-and-fee-charts",
        category: "School Prospectus & Fee Charts",
        description: "Official documents",
        displayOrder: 0,
        docs: [
          {
            id: "doc_1",
            title: "Official School Prospectus (Session 2026–27)",
            file: "/documents/original/prospectus-2.pdf",
            size: "5.6 MB",
            fileType: "application/pdf",
            displayOrder: 0,
          },
          {
            id: "doc_2",
            title: "New Admission Fee Chart 2026–27",
            file: "/documents/original/new-admission-chart-2026-27.pdf",
            size: "722 KB",
            fileType: "application/pdf",
            displayOrder: 1,
          },
        ],
      },
    ],
  };

  const parsed = publicDownloadsResponseSchema.safeParse(validResponse);
  assert.strictEqual(parsed.success, true, "Valid response should parse successfully");
  assert.strictEqual(parsed.data.categories.length, 1);
  assert.strictEqual(parsed.data.categories[0].docs.length, 2);
  console.log("  [PASS] Valid API payload parses successfully");
}

// 3. Test Authoritative Empty Array
{
  const emptyResponse = {
    success: true,
    categories: [],
  };

  const parsed = publicDownloadsResponseSchema.safeParse(emptyResponse);
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
        // missing category name
        docs: [],
      },
    ],
  };

  const parsed = publicDownloadsResponseSchema.safeParse(malformed);
  assert.strictEqual(parsed.success, false, "Malformed category must be rejected");
  console.log("  [PASS] Malformed payload fails Zod validation to trigger emergency fallback");
}

// 5. Test Static Source Verification: "use cache" & revalidate 60 & tag "downloads"
{
  const downloadsApiSource = fs.readFileSync(
    path.join(__dirname, "../lib/api/downloads.ts"),
    "utf8"
  );

  const getPublicDownloadsMatch = downloadsApiSource.match(
    /export async function getPublicDownloads\s*\([^)]*\)\s*:[^{]*\{([^}]+)/
  );
  assert.ok(getPublicDownloadsMatch, "getPublicDownloads function body must exist");
  const funcBody = getPublicDownloadsMatch[1].trim();
  assert.ok(
    funcBody.startsWith('"use cache";') || funcBody.startsWith("'use cache';"),
    "First statement in getPublicDownloads must be \"use cache\";"
  );
  assert.ok(
    downloadsApiSource.includes('tags: ["downloads"]') || downloadsApiSource.includes("tags: ['downloads']"),
    "Production caching must tag 'downloads'"
  );
  assert.ok(
    downloadsApiSource.includes("revalidate: 60"),
    "Production caching must set revalidate: 60"
  );
  assert.ok(
    downloadsApiSource.includes('cache: "no-store"'),
    "Development caching must use cache: 'no-store'"
  );
  console.log("  [PASS] 'use cache' directive, 60s revalidation, 'downloads' tag, and dev no-store verified");
}

// 6. Test downloads/page.tsx: Plain-text rendering, No dangerouslySetInnerHTML
{
  const pageSource = fs.readFileSync(
    path.join(__dirname, "../app/downloads/page.tsx"),
    "utf8"
  );

  assert.strictEqual(
    pageSource.includes("dangerouslySetInnerHTML"),
    false,
    "downloads/page.tsx must NOT contain dangerouslySetInnerHTML"
  );
  assert.ok(
    pageSource.includes("getPublicDownloads"),
    "downloads/page.tsx must call getPublicDownloads"
  );
  assert.ok(
    pageSource.includes("sections.length === 0"),
    "downloads/page.tsx must handle authoritative empty state when sections.length === 0"
  );
  console.log("  [PASS] downloads/page.tsx plain-text rendering and authoritative empty state verified");
}

console.log("===============================================================");
console.log("  All frontend downloads integration tests passed successfully!");
console.log("===============================================================");
