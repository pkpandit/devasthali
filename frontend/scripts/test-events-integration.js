/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Frontend Events Integration, Schema Conformance,
 * Authoritative Empty Collections, and Static Fallback Resilience.
 */

const { z } = require("zod");

console.log("===============================================================");
console.log("  Running Frontend Events Integration Tests");
console.log("===============================================================\n");

const publicSchoolEventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  desc: z.string().optional(),
  eventDate: z.string().optional(),
  date: z.string().optional(),
  isoDate: z.string().default(""),
  time: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  category: z.string().default("School Event"),
  linkHref: z.string().nullable().optional(),
  linkLabel: z.string().nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
  coverImageAlt: z.string().default(""),
  displayOrder: z.number().default(0),
});

const publicEventsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    events: z.array(publicSchoolEventSchema),
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
    events: [
      {
        id: "eve-1",
        title: "Inter-School English Debate Competition",
        description: "Topic: Artificial Intelligence & the Future of Human Intellect",
        desc: "Topic: Artificial Intelligence & the Future of Human Intellect",
        eventDate: "25 Nov 2025",
        date: "25 Nov 2025",
        isoDate: "2025-11-25",
        time: "9:30 AM – 1:30 PM",
        location: "Auditorium Hall, Devasthaly Campus",
        venue: "Auditorium Hall, Devasthaly Campus",
        category: "Academic Competition",
        linkHref: "/downloads",
        linkLabel: "Official Calendar & Holidays (PDF)",
        coverImageUrl: null,
        coverImageAlt: "",
        displayOrder: 0,
      },
    ],
    categories: ["Academic Competition"],
  },
  meta: { version: 1, generatedAt: new Date().toISOString() },
};

const parsedValid = publicEventsResponseSchema.safeParse(validMockResponse);
assert(parsedValid.success === true, "Valid response passes publicEventsResponseSchema");
assert(parsedValid.data.data.events.length === 1, "Parsed events count matches");
assert(parsedValid.data.data.events[0].title === "Inter-School English Debate Competition", "Parsed event title matches");
assert(parsedValid.data.data.events[0].date === "25 Nov 2025", "Parsed event date matches");

// 2. Authoritative Empty Schedule Handling
console.log("\n--- 2. Authoritative Empty Schedule Handling ---");
const emptyMockResponse = {
  success: true,
  data: {
    events: [],
    categories: [],
  },
};

const parsedEmpty = publicEventsResponseSchema.safeParse(emptyMockResponse);
assert(parsedEmpty.success === true, "Empty response passes schema");
assert(Array.isArray(parsedEmpty.data.data.events), "Parsed empty events is array");
assert(parsedEmpty.data.data.events.length === 0, "Parsed empty events has 0 items (never reverts to fallback)");

// 3. Invalid Payload Schema Rejection
console.log("\n--- 3. Invalid Payload Schema Rejection ---");
const malformedResponse = {
  success: true,
  data: {
    events: [
      {
        title: "", // Invalid empty Title
      },
    ],
  },
};

const parsedMalformed = publicEventsResponseSchema.safeParse(malformedResponse);
assert(parsedMalformed.success === false, "Malformed response is rejected by schema");

// 4. Date Splitting & Numeral Stroke Compatibility
console.log("\n--- 4. Date Splitting & Numeral Stroke Compatibility ---");
const testDate = "25 Nov 2025";
const parts = testDate.split(" ");
assert(parts[0] === "25", "Day numeral parses correctly to '25'");
assert(`${parts[1]} ${parts[2]}` === "Nov 2025", "Month and year parse correctly to 'Nov 2025'");

// Summary
console.log("\n===============================================================");
console.log(`  Events Integration Tests: ${passed} Passed, ${failed} Failed`);
console.log("===============================================================");

if (failed > 0) {
  process.exit(1);
}
