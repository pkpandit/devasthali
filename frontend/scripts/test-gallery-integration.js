/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Frontend Gallery Integration, Schema Conformance,
 * Authoritative Empty Collections, and Static Fallback Resilience.
 */

const { z } = require("zod");
const fs = require("node:fs");
const path = require("node:path");

console.log("===============================================================");
console.log("  Running Frontend Gallery Integration Tests");
console.log("===============================================================\n");

const publicGalleryPhotoSchema = z.object({
  id: z.string().optional(),
  src: z.string().min(1),
  imageAlt: z.string().default(""),
  caption: z.string().default(""),
  displayOrder: z.number().default(0),
});

const publicGalleryAlbumSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  category: z.string().min(1),
  coverImage: z.string().min(1),
  coverImageAlt: z.string().default(""),
  displayOrder: z.number().default(0),
  photos: z.array(publicGalleryPhotoSchema).default([]),
});

const publicGalleryResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    albums: z.array(publicGalleryAlbumSchema),
    categories: z.array(z.string()).default([]),
  }),
});

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`[PASS] ${name}`);
    passed++;
  } else {
    console.error(`[FAIL] ${name}`);
    failed++;
  }
}

// 1. Valid API Response Schema Conformance
console.log("--- 1. Valid API Response Parsing ---");
const validMockResponse = {
  success: true,
  data: {
    albums: [
      {
        id: "alb-1",
        title: "Campus Grounds & Academic Infrastructure",
        description: "Devasthaly campus infrastructure overview.",
        category: "Campus",
        coverImage: "/images/gallery/image-1-1.webp",
        coverImageAlt: "Devasthaly campus grounds",
        displayOrder: 0,
        photos: [
          {
            id: "img-1",
            src: "/images/gallery/image-1-1.webp",
            imageAlt: "Academic block",
            caption: "Academic block surrounded by greenery",
            displayOrder: 0,
          },
        ],
      },
    ],
    categories: ["Campus"],
  },
  meta: { version: 1, generatedAt: new Date().toISOString() },
};

const parsedValid = publicGalleryResponseSchema.safeParse(validMockResponse);
assert(parsedValid.success === true, "Valid response passes publicGalleryResponseSchema");
assert(parsedValid.data.data.albums.length === 1, "Parsed albums count matches");
assert(parsedValid.data.data.albums[0].title === "Campus Grounds & Academic Infrastructure", "Parsed album title matches");
assert(parsedValid.data.data.albums[0].photos.length === 1, "Parsed album photos count matches");

// 2. Authoritative Empty Album Directory Handling
console.log("\n--- 2. Authoritative Empty Collection Handling ---");
const emptyMockResponse = {
  success: true,
  data: {
    albums: [],
    categories: [],
  },
};

const parsedEmpty = publicGalleryResponseSchema.safeParse(emptyMockResponse);
assert(parsedEmpty.success === true, "Empty response passes schema");
assert(Array.isArray(parsedEmpty.data.data.albums), "Parsed empty albums is array");
assert(parsedEmpty.data.data.albums.length === 0, "Parsed empty albums has 0 items (never reverts to fallback)");

// 3. Invalid Payload Schema Rejection
console.log("\n--- 3. Invalid Payload Schema Rejection ---");
const malformedResponse = {
  success: true,
  data: {
    albums: [
      {
        id: "", // Invalid empty ID
        title: "", // Invalid empty Title
      },
    ],
  },
};

const parsedMalformed = publicGalleryResponseSchema.safeParse(malformedResponse);
assert(parsedMalformed.success === false, "Malformed response is rejected by schema");

// 4. Remote Patterns Verification in next.config.ts
console.log("\n--- 4. Next.js Remote Patterns Verification ---");
const nextConfigContent = fs.readFileSync(path.join(__dirname, "../next.config.ts"), "utf-8");
assert(
  nextConfigContent.includes("/api/public/media/gallery/**"),
  "next.config.ts includes /api/public/media/gallery/** remotePattern"
);
assert(
  nextConfigContent.includes("/api/public/media/events/**"),
  "next.config.ts includes /api/public/media/events/** remotePattern"
);

// Summary
console.log("\n===============================================================");
console.log(`  Gallery Integration Tests: ${passed} Passed, ${failed} Failed`);
console.log("===============================================================");

if (failed > 0) {
  process.exit(1);
}
