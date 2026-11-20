/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { z } = require("zod");

console.log("===============================================================");
console.log("  Running Frontend Mandatory Disclosure Integration Unit Tests");
console.log("===============================================================");

// 1. Replicate Zod schemas from frontend/lib/api/mandatory-disclosure.ts
const publicDisclosureDocumentSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  fileUrl: z.string().min(1),
  linkLabel: z.string().default("VIEW/DOWNLOAD"),
  fileSizeBytes: z.number().default(0),
  fileSize: z.string().default("PDF Document"),
  fileType: z.string().default("application/pdf"),
  displayOrder: z.number().default(0),
});

const publicDisclosureSectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  displayOrder: z.number().default(0),
  documents: z.array(publicDisclosureDocumentSchema).default([]),
});

const publicDisclosureResponseSchema = z.object({
  success: z.boolean(),
  sections: z.array(publicDisclosureSectionSchema),
});

// 2. Test Zod Schemas Validation
{
  const validResponse = {
    success: true,
    sections: [
      {
        id: "sec_1",
        title: "DOCUMENTS AND INFORMATION",
        description: "Statutory affiliation and compliance documents",
        displayOrder: 0,
        documents: [
          {
            id: "doc_1",
            title: "COPIES OF AFFILIATION/UPGRADATION LETTER AND RECENT EXTENSION OF AFFILIATION",
            fileUrl: "/documents/disclosure/copy-of-affiliation-letter.pdf",
            linkLabel: "VIEW/DOWNLOAD",
            fileSizeBytes: 2457600,
            fileSize: "2.3 MB",
            fileType: "application/pdf",
            displayOrder: 0,
          },
        ],
      },
      {
        id: "sec_2",
        title: "RESULTS AND ACADEMICS",
        description: "Fee structure and academic calendar",
        displayOrder: 1,
        documents: [
          {
            id: "doc_2",
            title: "FEE STRUCTURE OF THE SCHOOL",
            fileUrl: "/documents/original/fee-structure.pdf",
            linkLabel: "VIEW/DOWNLOAD",
            fileSizeBytes: 1048576,
            fileSize: "1.0 MB",
            fileType: "application/pdf",
            displayOrder: 0,
          },
        ],
      },
    ],
  };

  const parsed = publicDisclosureResponseSchema.safeParse(validResponse);
  assert.strictEqual(parsed.success, true, "Valid response should parse successfully");
  assert.strictEqual(parsed.data.sections.length, 2);
  assert.strictEqual(parsed.data.sections[0].documents.length, 1);
  assert.strictEqual(parsed.data.sections[1].documents.length, 1);
  console.log("  [PASS] Valid API payload parses successfully");
}

// 3. Test Authoritative Empty Array
{
  const emptyResponse = {
    success: true,
    sections: [],
  };

  const parsed = publicDisclosureResponseSchema.safeParse(emptyResponse);
  assert.strictEqual(parsed.success, true, "Empty sections should parse successfully");
  assert.strictEqual(parsed.data.sections.length, 0, "Empty sections length must be 0");
  console.log("  [PASS] Authoritative empty sections response parses cleanly without error");
}

// 4. Test Malformed Response Rejection
{
  const malformed = {
    success: true,
    sections: [
      {
        id: "sec_invalid",
        // missing section title
        documents: [],
      },
    ],
  };

  const parsed = publicDisclosureResponseSchema.safeParse(malformed);
  assert.strictEqual(parsed.success, false, "Malformed section must be rejected");
  console.log("  [PASS] Malformed payload fails Zod validation to trigger emergency fallback");
}

// 5. Test Static Source Verification: "use cache" & revalidate 60 & tag "mandatory-disclosure"
{
  const apiSource = fs.readFileSync(
    path.join(__dirname, "../lib/api/mandatory-disclosure.ts"),
    "utf8"
  );

  const getPublicDisclosureMatch = apiSource.match(
    /export async function getPublicMandatoryDisclosure\s*\([^)]*\)\s*:[^{]*\{([^}]+)/
  );
  assert.ok(getPublicDisclosureMatch, "getPublicMandatoryDisclosure function body must exist");
  const funcBody = getPublicDisclosureMatch[1].trim();
  assert.ok(
    funcBody.startsWith('"use cache";') || funcBody.startsWith("'use cache';"),
    'First statement in getPublicMandatoryDisclosure must be "use cache";'
  );
  assert.ok(
    apiSource.includes('tags: ["mandatory-disclosure"]') ||
      apiSource.includes("tags: ['mandatory-disclosure']"),
    "Production caching must tag 'mandatory-disclosure'"
  );
  assert.ok(
    apiSource.includes("revalidate: 60"),
    "Production caching must set revalidate: 60"
  );
  assert.ok(
    apiSource.includes('cache: "no-store"'),
    "Development caching must use cache: 'no-store'"
  );
  console.log("  [PASS] 'use cache' directive, 60s revalidation, 'mandatory-disclosure' tag, and dev no-store verified");
}

// 6. Test mandatory-public-disclosure/page.tsx: Plain-text rendering, No dangerouslySetInnerHTML
{
  const pageSource = fs.readFileSync(
    path.join(__dirname, "../app/mandatory-public-disclosure/page.tsx"),
    "utf8"
  );

  assert.strictEqual(
    pageSource.includes("dangerouslySetInnerHTML"),
    false,
    "page.tsx must NOT contain dangerouslySetInnerHTML"
  );
  assert.ok(
    pageSource.includes("getPublicMandatoryDisclosure"),
    "page.tsx must call getPublicMandatoryDisclosure"
  );
  assert.ok(
    pageSource.includes("No Compliance Documents Currently Published"),
    "page.tsx must handle empty state"
  );
  assert.ok(
    pageSource.includes("GENERAL INFORMATION"),
    "page.tsx must preserve Table A: GENERAL INFORMATION"
  );
  assert.ok(
    pageSource.includes("RESULT CLASS X"),
    "page.tsx must preserve Result Class X table"
  );
  assert.ok(
    pageSource.includes("STAFF DETAIL"),
    "page.tsx must preserve Table D: STAFF DETAIL"
  );
  assert.ok(
    pageSource.includes("SCHOOL INFRASTRUCTURE"),
    "page.tsx must preserve Table E: SCHOOL INFRASTRUCTURE"
  );
  console.log("  [PASS] page.tsx verified: plain text, empty state, and all static sections preserved");
}

console.log("===============================================================");
console.log("  All Frontend Mandatory Disclosure Integration Tests Passed!");
console.log("===============================================================");
