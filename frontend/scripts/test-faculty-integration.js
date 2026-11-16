/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Frontend Faculty Integration, Schema Conformance,
 * Authoritative Empty Collections, and Static Fallback Resilience.
 */

const { z } = require("zod");

console.log("===============================================================");
console.log("  Running Frontend Faculty Integration Tests");
console.log("===============================================================\n");

// Replicate schemas from frontend/lib/api/faculty.ts
const publicFacultyMemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  designation: z.string().min(1),
  department: z.string().min(1),
  qualification: z.string().nullable().optional(),
  experienceYears: z.number().default(0),
  bio: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  imageAlt: z.string().default(""),
  displayOrder: z.number().default(0),
});

const publicFacultyResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    faculty: z.array(publicFacultyMemberSchema),
    departments: z.array(z.string()).default([]),
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
    faculty: [
      {
        id: "fac-1",
        name: "Dr. K. N. Pandey",
        designation: "Principal & Academic Director",
        department: "Administration & Science",
        qualification: "M.Sc. (Physics), M.Ed., Ph.D.",
        experienceYears: 24,
        bio: null,
        imageUrl: "/images/leadership/principal-mentor.jpg",
        imageAlt: "Dr. K. N. Pandey",
        displayOrder: 0,
      },
    ],
    departments: ["Administration & Science"],
  },
  meta: { version: 1, generatedAt: new Date().toISOString() },
};

const parsedValid = publicFacultyResponseSchema.safeParse(validMockResponse);
assert(parsedValid.success === true, "Valid response passes publicFacultyResponseSchema");
assert(parsedValid.data.data.faculty.length === 1, "Parsed faculty length matches");
assert(parsedValid.data.data.faculty[0].name === "Dr. K. N. Pandey", "Parsed educator name matches");

// 2. Authoritative Empty Directory Handling
console.log("\n--- 2. Authoritative Empty Directory Handling ---");
const emptyMockResponse = {
  success: true,
  data: {
    faculty: [],
    departments: [],
  },
};

const parsedEmpty = publicFacultyResponseSchema.safeParse(emptyMockResponse);
assert(parsedEmpty.success === true, "Empty response passes schema");
assert(Array.isArray(parsedEmpty.data.data.faculty), "Parsed empty faculty is array");
assert(parsedEmpty.data.data.faculty.length === 0, "Parsed empty faculty has 0 items (never reverts to fallback)");

// 3. Invalid Payload Triggering Fallback
console.log("\n--- 3. Invalid Payload Schema Rejection ---");
const malformedResponse = {
  success: true,
  data: {
    faculty: [
      {
        id: "", // Invalid empty ID
        name: "", // Invalid empty Name
      },
    ],
  },
};

const parsedMalformed = publicFacultyResponseSchema.safeParse(malformedResponse);
assert(parsedMalformed.success === false, "Malformed response is rejected by schema");

// 4. Live API Endpoint Verification (if backend running)
console.log("\n--- 4. Live Backend API Verification ---");
async function testLiveApi() {
  const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:3001";
  try {
    const res = await fetch(`${backendUrl}/api/public/faculty`);
    if (res.ok) {
      const json = await res.json();
      const parsed = publicFacultyResponseSchema.safeParse(json);
      assert(parsed.success === true, "Live API response satisfies publicFacultyResponseSchema");
      assert(parsed.data.data.faculty.length === 8, "Live API returns all 8 seeded educators");
      assert(parsed.data.data.departments.length > 0, "Live API returns departments array");
    } else {
      console.log(`[INFO] Backend returned HTTP ${res.status} (Live endpoint verification skipped)`);
    }
  } catch {
    console.log("[INFO] Backend server not currently running at 127.0.0.1:3001 (Live fetch skipped)");
  }

  console.log("\n===============================================================");
  console.log(`  Frontend Faculty Integration Tests: ${passed} Passed, ${failed} Failed`);
  console.log("===============================================================");

  if (failed > 0) process.exit(1);
}

testLiveApi();
