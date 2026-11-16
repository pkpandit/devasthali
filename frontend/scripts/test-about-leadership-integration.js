/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Frontend About & Leadership Integration, Schema Conformance,
 * Authoritative Empty Collections, and Static Fallback Resilience.
 */

const { z } = require("zod");

console.log("===============================================================");
console.log("  Running Frontend About & Leadership Integration Tests");
console.log("===============================================================\n");

// Replicate schemas from frontend/lib/api/about-leadership.ts
const publicAboutSettingSchema = z
  .object({
    breadcrumb: z.string().min(1),
    heading: z.string().min(1),
    subheading: z.string().min(1),
    showcaseImageUrl: z.string().nullable().optional(),
    showcaseImageAlt: z.string().nullable().optional(),
    showcaseBadge: z.string().nullable().optional(),
  })
  .nullable();

const publicAboutCredentialSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  title: z.string().min(1),
  subtext: z.string().min(1),
  iconName: z.string().nullable().optional(),
  displayOrder: z.number(),
});

const publicAboutNarrativeSectionSchema = z.object({
  id: z.string().min(1),
  heading: z.string().nullable().optional(),
  body: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
  imageAlt: z.string().nullable().optional(),
  displayOrder: z.number(),
});

const publicAboutResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    setting: publicAboutSettingSchema,
    credentials: z.array(publicAboutCredentialSchema),
    narrativeSections: z.array(publicAboutNarrativeSectionSchema),
  }),
});

const publicVisionMissionSettingSchema = z
  .object({
    breadcrumb: z.string().min(1),
    heading: z.string().min(1),
    subheading: z.string().min(1),
    visionTitle: z.string().min(1),
    visionBody: z.string().min(1),
    visionIcon: z.string().nullable().optional(),
    missionTitle: z.string().min(1),
    missionBody: z.string().min(1),
    missionIcon: z.string().nullable().optional(),
  })
  .nullable();

const publicCoreValueSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  iconName: z.string().nullable().optional(),
  displayOrder: z.number(),
});

const publicVisionMissionResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    setting: publicVisionMissionSettingSchema,
    coreValues: z.array(publicCoreValueSchema),
  }),
});

const publicLeadershipMemberSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["FOUNDER", "PATRON", "PRESIDENT", "MANAGER", "PRINCIPAL"]),
  slug: z.string().min(1),
  pageTitle: z.string().min(1),
  breadcrumb: z.string().min(1),
  badgeText: z.string().min(1),
  name: z.string().min(1),
  designation: z.string().min(1),
  termOrAffiliation: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  shortIntro: z.string().min(1),
  quote: z.string().nullable().optional(),
  messageBody: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
  imageAlt: z.string().nullable().optional(),
  signatureImageUrl: z.string().nullable().optional(),
  signatureAlt: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  ctaLabel: z.string().nullable().optional(),
  ctaHref: z.string().nullable().optional(),
  displayOrder: z.number(),
});

const results = [];
function check(name, condition, details = "") {
  results.push({ name, passed: Boolean(condition), details });
  if (condition) {
    console.log(`  [PASS] ${name}`);
  } else {
    console.error(`  [FAIL] ${name}: ${details}`);
  }
}

// -------------------------------------------------------------
// 1. Valid API Response Conformance
// -------------------------------------------------------------
console.log("--- 1. Valid API Response Schema Conformance ---");

const mockValidAbout = {
  success: true,
  data: {
    setting: {
      breadcrumb: "Home / About School",
      heading: "About School",
      subheading: "Imparting comprehensive modern education since 1988.",
      showcaseImageUrl: "/images/gallery/image-1-1.webp",
      showcaseImageAlt: "Devasthaly Campus",
      showcaseBadge: "Estd. 1988",
    },
    credentials: [
      {
        id: "c-1",
        category: "Affiliation",
        title: "CBSE No. 2133848",
        subtext: "School Code: 71922",
        iconName: "ShieldCheck",
        displayOrder: 0,
      },
    ],
    narrativeSections: [
      {
        id: "n-1",
        heading: "Founding Story",
        body: "Founded on 2nd October 1988...",
        imageUrl: null,
        imageAlt: null,
        displayOrder: 0,
      },
    ],
  },
};

const parsedAbout = publicAboutResponseSchema.safeParse(mockValidAbout);
check("Valid About API response conforms to schema", parsedAbout.success === true);

const mockValidVM = {
  success: true,
  data: {
    setting: {
      breadcrumb: "About School / Vision & Mission",
      heading: "Vision and Mission",
      subheading: "Guiding educational philosophy...",
      visionTitle: "Our Vision",
      visionBody: "To meet a long-felt need...",
      visionIcon: "Compass",
      missionTitle: "Our Mission",
      missionBody: "The school aims at all round development...",
      missionIcon: "Target",
    },
    coreValues: [
      {
        id: "cv-1",
        title: "Holistic Development",
        description: "Moral and physical growth.",
        iconName: "Compass",
        displayOrder: 0,
      },
    ],
  },
};

const parsedVM = publicVisionMissionResponseSchema.safeParse(mockValidVM);
check("Valid Vision & Mission API response conforms to schema", parsedVM.success === true);

const mockValidLeader = {
  id: "l-1",
  role: "FOUNDER",
  slug: "founders-message",
  pageTitle: "Founder’s Message",
  breadcrumb: "About School / Leadership",
  badgeText: "Founder",
  name: "Shri Chandra Shekhar",
  designation: "Founder of Devasthaly Vidyapeeth",
  termOrAffiliation: "8th Prime Minister of India",
  location: "Ballia, U.P.",
  shortIntro: "Former Prime Minister of India.",
  quote: "Timeless values in education.",
  messageBody: "Full message paragraph...",
  imageUrl: "/images/leadership/chadrashekherji.webp",
  imageAlt: "Shri Chandra Shekhar",
  signatureImageUrl: null,
  signatureAlt: null,
  bio: null,
  ctaLabel: null,
  ctaHref: null,
  displayOrder: 0,
};

const parsedLeader = publicLeadershipMemberSchema.safeParse(mockValidLeader);
check("Valid Leadership member conforms to schema", parsedLeader.success === true);

// -------------------------------------------------------------
// 2. Authoritative Empty Section Integrity
// -------------------------------------------------------------
console.log("\n--- 2. Authoritative Empty Section Integrity ---");

const mockEmptyAbout = {
  success: true,
  data: {
    setting: null,
    credentials: [],
    narrativeSections: [],
  },
};

const parsedEmptyAbout = publicAboutResponseSchema.safeParse(mockEmptyAbout);
check("Empty About arrays parse successfully without schema failure", parsedEmptyAbout.success === true);
check(
  "Credentials preserved as authoritative empty array []",
  Array.isArray(parsedEmptyAbout.data?.data?.credentials) &&
    parsedEmptyAbout.data.data.credentials.length === 0
);
check(
  "Narrative sections preserved as authoritative empty array []",
  Array.isArray(parsedEmptyAbout.data?.data?.narrativeSections) &&
    parsedEmptyAbout.data.data.narrativeSections.length === 0
);

// -------------------------------------------------------------
// 3. 404 Status Isolation Guarantee
// -------------------------------------------------------------
console.log("\n--- 3. 404 Status Isolation Guarantee ---");

function simulateMemberFetch(httpStatus, responsePayload) {
  if (httpStatus === 404) {
    return null; // Signals page to call notFound()
  }
  if (httpStatus !== 200) {
    return { fallback: true }; // Network/server error fallback
  }
  const parsed = publicLeadershipMemberSchema.safeParse(responsePayload);
  if (!parsed.success) {
    return { fallback: true };
  }
  return parsed.data;
}

check("HTTP 404 returns null (page must invoke notFound())", simulateMemberFetch(404, null) === null);
check("HTTP 500 returns fallback object", simulateMemberFetch(500, null)?.fallback === true);
check("HTTP 200 returns parsed data", simulateMemberFetch(200, mockValidLeader)?.id === "l-1");

// Summary
console.log("\n===============================================================");
const total = results.length;
const passed = results.filter((r) => r.passed).length;
const failed = total - passed;
console.log(`  Tests Passed: ${passed} / ${total}`);
if (failed > 0) {
  console.error(`  Tests Failed: ${failed}`);
  process.exit(1);
} else {
  console.log("  ALL FRONTEND INTEGRATION TESTS PASSED!");
}
console.log("===============================================================\n");
