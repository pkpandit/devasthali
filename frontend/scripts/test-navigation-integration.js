/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Frontend Navigation Integration, Schema Conformance,
 * Authoritative Empty Menu, and Fallback Resilience.
 */

const { z } = require("zod");

console.log("===============================================================");
console.log("  Running Frontend Navigation Integration & Fallback Tests");
console.log("===============================================================\n");

// Replicate schemas from frontend/lib/api/navigation.ts
const publicNavItemChildSchema = z.object({
  name: z.string().min(1),
  href: z.string().min(1),
  badge: z.string().optional(),
  openInNewTab: z.boolean().optional(),
});

const publicNavColumnSchema = z.object({
  heading: z.string().optional(),
  items: z.array(publicNavItemChildSchema),
});

const publicNavItemSchema = z.object({
  name: z.string().min(1),
  href: z.string().min(1),
  badge: z.string().optional(),
  openInNewTab: z.boolean().optional(),
  panelType: z.enum(["compact", "medium", "mega"]).optional(),
  columns: z.array(publicNavColumnSchema).optional(),
});

const publicFooterLinkItemSchema = z.object({
  name: z.string().min(1),
  href: z.string().min(1),
  openInNewTab: z.boolean().optional(),
});

const publicNavigationResponseSchema = z.object({
  header: z.array(publicNavItemSchema),
  footerAdmissions: z.array(publicFooterLinkItemSchema),
  footerLife: z.array(publicFooterLinkItemSchema),
});

const results = [];
function check(name, condition, details = "") {
  results.push({ name, passed: Boolean(condition), details });
  if (!condition) {
    console.error(`  [FAIL] ${name}: ${details}`);
  } else {
    console.log(`  [PASS] ${name}`);
  }
}

// -------------------------------------------------------------
// 1. Zod Schema Conformance Tests
// -------------------------------------------------------------
console.log("--- 1. Navigation Zod Schema Validation ---");

// Valid full payload
const samplePayload = {
  header: [
    { name: "Home", href: "/" },
    {
      name: "About Us",
      href: "/about",
      panelType: "mega",
      columns: [
        {
          heading: "Overview",
          items: [
            { name: "About School", href: "/about" },
            { name: "CBSE Disclosure", href: "https://cbse.gov.in", openInNewTab: true },
          ],
        },
      ],
    },
    {
      name: "Academics",
      href: "/academics",
      badge: "Top",
      panelType: "medium",
      columns: [
        {
          heading: "Courses",
          items: [{ name: "Results", href: "/results", badge: "100%" }],
        },
      ],
    },
  ],
  footerAdmissions: [
    { name: "Procedure", href: "/admissions/procedure" },
    { name: "External Portal", href: "https://external.edu", openInNewTab: true },
  ],
  footerLife: [
    { name: "Facilities", href: "/facilities" },
  ],
};

const parseResult = publicNavigationResponseSchema.safeParse(samplePayload);
check("Sample navigation payload satisfies Zod schema", parseResult.success);

const invalidPayload = {
  header: [{ name: "", href: "/" }], // Empty name
  footerAdmissions: [],
  footerLife: [],
};
const invalidResult = publicNavigationResponseSchema.safeParse(invalidPayload);
check("Invalid item with empty name fails schema", !invalidResult.success);

// -------------------------------------------------------------
// 2. Authoritative Empty Menu Principle Tests
// -------------------------------------------------------------
console.log("\n--- 2. Authoritative Empty Menu Principle ---");

// Simulating getPublicNavigation logic:
function resolveNavigationResponse(apiResult, fallback) {
  if (!apiResult || !apiResult.ok) {
    // Network or server error -> fallback
    return fallback;
  }
  const parsed = publicNavigationResponseSchema.safeParse(apiResult.data);
  if (!parsed.success) {
    // Malformed schema -> fallback
    return fallback;
  }
  // Authoritative empty menu: if header is [], keep []!
  return parsed.data;
}

const FALLBACK_NAV = {
  header: [{ name: "Fallback Home", href: "/" }],
  footerAdmissions: [{ name: "Fallback Admissions", href: "/admissions" }],
  footerLife: [{ name: "Fallback Life", href: "/facilities" }],
};

// Test 2a: Empty published menu from valid API response
const emptyApiResponse = {
  ok: true,
  data: {
    header: [],
    footerAdmissions: [],
    footerLife: [],
  },
};
const resolvedEmpty = resolveNavigationResponse(emptyApiResponse, FALLBACK_NAV);
check("Authoritative empty menu: header remains []", Array.isArray(resolvedEmpty.header) && resolvedEmpty.header.length === 0);
check("Authoritative empty menu: does NOT fall back to FALLBACK_NAV", resolvedEmpty !== FALLBACK_NAV);

// Test 2b: Server 500 Error -> uses fallback
const errorApiResponse = {
  ok: false,
  status: 500,
};
const resolvedError = resolveNavigationResponse(errorApiResponse, FALLBACK_NAV);
check("Server error (500) triggers static fallback", resolvedError === FALLBACK_NAV);

// Test 2c: Malformed data -> uses fallback
const malformedApiResponse = {
  ok: true,
  data: {
    header: "invalid-string",
  },
};
const resolvedMalformed = resolveNavigationResponse(malformedApiResponse, FALLBACK_NAV);
check("Malformed data triggers static fallback", resolvedMalformed === FALLBACK_NAV);

// -------------------------------------------------------------
// 3. Fallback Constants Conformance Test
// -------------------------------------------------------------
console.log("\n--- 3. Static Fallback Constants Verification ---");

// Test that static fallback from frontend/lib/api/navigation.ts matches schema
const FALLBACK_HEADER_NAV = [
  { name: "Home", href: "/" },
  {
    name: "About Us",
    href: "/about",
    panelType: "mega",
    columns: [
      {
        heading: "Overview & Heritage",
        items: [
          { name: "About School & Heritage", href: "/about" },
          { name: "Vision and Mission", href: "/vision-mission" },
          { name: "CBSE Mandatory Disclosure", href: "/mandatory-public-disclosure" },
        ],
      },
      {
        heading: "Leadership Messages",
        items: [
          { name: "Founder’s Message", href: "/founders-message" },
          { name: "Patron’s Message", href: "/patrons-message" },
          { name: "President’s Message", href: "/presidents-message" },
          { name: "Manager’s Message", href: "/managers-message" },
          { name: "Principal’s Message", href: "/principals-message" },
        ],
      },
    ],
  },
  {
    name: "Academics",
    href: "/academics",
    panelType: "mega",
    columns: [
      {
        heading: "Pedagogy & Structure",
        items: [
          { name: "Curriculum & Academic System", href: "/academic-system" },
          { name: "Faculty & Mentors Directory", href: "/faculty" },
        ],
      },
      {
        heading: "Excellence & Achievements",
        items: [
          { name: "Board Examination Results & Toppers", href: "/results", badge: "100% Pass" },
          { name: "Student Activities & Competitions", href: "/events" },
        ],
      },
    ],
  },
  {
    name: "Admissions",
    href: "/admissions",
    panelType: "mega",
    columns: [
      {
        heading: "Admission Information",
        items: [
          { name: "Admission Procedure & Entrance", href: "/admissions/procedure" },
          { name: "Fee Structure (2026–27)", href: "/admissions/fees" },
        ],
      },
      {
        heading: "Application & Prospectus",
        items: [
          { name: "School Prospectus", href: "/school-prospectus" },
          { name: "Online Admission Form", href: "/online-admission-form", badge: "Apply Now" },
        ],
      },
    ],
  },
  {
    name: "Life at School",
    href: "/facilities",
    panelType: "medium",
    columns: [
      {
        heading: "Campus & Boarding",
        items: [
          { name: "Campus Infrastructure & Facilities", href: "/facilities" },
          { name: "Hostels & Residential Care", href: "/facilities#hostel" },
          { name: "Safe Transport Network", href: "/facilities#transport" },
        ],
      },
      {
        heading: "Activities & Culture",
        items: [
          { name: "Co-Curricular Activities & Sports", href: "/co-curricular-activities" },
          { name: "Campus Photo Gallery", href: "/gallery" },
        ],
      },
    ],
  },
  {
    name: "Students & Parents",
    href: "/notices",
    panelType: "compact",
    columns: [
      {
        items: [
          { name: "Official Notices & Circulars", href: "/notices" },
          { name: "Downloads & Public Records", href: "/downloads" },
          { name: "General Instructions & Rules", href: "/general-instructions" },
          { name: "Alumni Corner & Reunion", href: "/alumni" },
        ],
      },
    ],
  },
  {
    name: "Contact",
    href: "/contact",
    panelType: "compact",
    columns: [
      {
        items: [
          { name: "Contact Us & Directory", href: "/contact" },
          { name: "How to Reach Campus", href: "/contact#location" },
        ],
      },
    ],
  },
];

const FALLBACK_FOOTER_ADMISSIONS = [
  { name: "Admissions 2026–27 Overview", href: "/admissions" },
  { name: "Admission Procedure & Guidelines", href: "/admissions/procedure" },
  { name: "Fee Schedule & Structure", href: "/admissions/fees" },
  { name: "School Prospectus (PDF)", href: "/school-prospectus" },
  { name: "Online Admission Form", href: "/online-admission-form" },
  { name: "CBSE Curriculum & Wings", href: "/academics" },
  { name: "Academic System & Assessment", href: "/academic-system" },
  { name: "Board Examination Results", href: "/results" },
];

const FALLBACK_FOOTER_LIFE = [
  { name: "Campus Facilities & 15-Acre Grounds", href: "/facilities" },
  { name: "Residential Hostels & Mess", href: "/facilities#hostel" },
  { name: "Safe Transport Network", href: "/facilities#transport" },
  { name: "Co-Curricular Activities & Sports", href: "/co-curricular-activities" },
  { name: "Campus Photo Gallery", href: "/gallery" },
  { name: "Official Notices & Circulars", href: "/notices" },
  { name: "General Instructions & Rules", href: "/general-instructions" },
  { name: "Alumni Network & Reunion", href: "/alumni" },
];

const fallbackPayload = {
  header: FALLBACK_HEADER_NAV,
  footerAdmissions: FALLBACK_FOOTER_ADMISSIONS,
  footerLife: FALLBACK_FOOTER_LIFE,
};

const fallbackParse = publicNavigationResponseSchema.safeParse(fallbackPayload);
check("Static fallback structure satisfies publicNavigationResponseSchema", fallbackParse.success);
check("Static fallback header contains 7 items", FALLBACK_HEADER_NAV.length === 7);
check("Static fallback footer admissions contains 8 links", FALLBACK_FOOTER_ADMISSIONS.length === 8);
check("Static fallback footer life contains 8 links", FALLBACK_FOOTER_LIFE.length === 8);

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log("\n===============================================================");
const passedCount = results.filter((r) => r.passed).length;
const failedCount = results.filter((r) => !r.passed).length;
console.log(`  Frontend Navigation Tests: ${passedCount} Passed, ${failedCount} Failed`);
console.log("===============================================================\n");

if (failedCount > 0) {
  process.exit(1);
}
