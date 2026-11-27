/**
 * Integration Test: Frontend Public Homepage Announcements & FAQs Integration (Milestone 21)
 *
 * Validates:
 * - Frontend Zod schemas (publicAnnouncementSchema, publicFaqSchema, publicHomepageResponseSchema)
 * - Static fallback definitions and authoritative empty state preservation
 * - Live fetch via getPublicHomepage() returning announcement and faqs
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("assert");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const bundleOutfile = path.resolve(
  __dirname,
  "../dist_test_homepage_integration.js"
);

try {
  execSync(
    `npx esbuild lib/api/homepage.ts --bundle --platform=node --outfile="${bundleOutfile}" --external:next --external:react`,
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
} catch (e) {
  console.error("esbuild compilation failed:", e);
  process.exit(1);
}

const {
  publicAnnouncementSchema,
  publicFaqSchema,
  publicHomepageResponseSchema,
  STATIC_FALLBACK_HOMEPAGE,
  getPublicHomepage,
} = require(bundleOutfile);

async function runTests() {
  console.log("=== Running Frontend Homepage Announcements & FAQs Integration Tests ===");

  // 1. Validate Zod Schemas
  console.log("1. Testing Frontend Schemas...");
  const validAnn = {
    enabled: false,
    title: "Alumni Meet 2026",
    badge: "Special Event",
    subtitle: "Reconnect, Relive, Rejoice",
    imageUrl: "/images/announcements/alumni-meet-2026.webp",
    imageAlt: "Poster",
    linkHref: "/alumni",
    linkLabel: "Join",
    delayMs: 3000,
    dismissalKey: "test_key",
  };
  assert.strictEqual(publicAnnouncementSchema.safeParse(validAnn).success, true);
  assert.strictEqual(publicAnnouncementSchema.safeParse(null).success, true);

  const validFaq = {
    id: "faq-1",
    question: "What are the school hours?",
    answer: "8:00 AM to 2:00 PM.",
    displayOrder: 0,
  };
  assert.strictEqual(publicFaqSchema.safeParse(validFaq).success, true);

  // 2. Validate Fallback Definition
  console.log("2. Testing Fallback Definition...");
  assert.ok(STATIC_FALLBACK_HOMEPAGE, "STATIC_FALLBACK_HOMEPAGE must exist");
  assert.strictEqual(STATIC_FALLBACK_HOMEPAGE.announcement, null);
  assert.ok(Array.isArray(STATIC_FALLBACK_HOMEPAGE.faqs));
  assert.ok(STATIC_FALLBACK_HOMEPAGE.faqs.length >= 6);

  // 3. Validate Authoritative Empty State Parsing
  console.log("3. Testing Authoritative Empty State Preservation in Response Schema...");
  const emptyPayload = {
    success: true,
    data: {
      hero: null,
      principal: null,
      statistics: [],
      highlights: [],
      announcement: null,
      faqs: [],
    },
  };
  const parsedEmpty = publicHomepageResponseSchema.safeParse(emptyPayload);
  assert.strictEqual(parsedEmpty.success, true);
  assert.deepStrictEqual(parsedEmpty.data.data.faqs, []);
  assert.strictEqual(parsedEmpty.data.data.announcement, null);

  // 4. Test Live API Fetch
  console.log("4. Testing Live API Fetch via getPublicHomepage()...");
  process.env.BACKEND_INTERNAL_URL = "http://127.0.0.1:3001";
  process.env.NODE_ENV = "development";

  const liveData = await getPublicHomepage();
  assert.ok(liveData, "Live data must not be null");
  assert.ok(liveData.announcement !== undefined, "Announcement must be defined");
  assert.strictEqual(
    liveData.announcement.enabled,
    false,
    "Live announcement must be default disabled"
  );
  assert.strictEqual(liveData.announcement.title, "Alumni Meet 2026");
  assert.strictEqual(
    liveData.announcement.imageUrl,
    "/images/announcements/alumni-meet-2026.webp"
  );

  assert.ok(Array.isArray(liveData.faqs), "Live faqs must be an array");
  assert.ok(liveData.faqs.length >= 6, `Expected at least 6 FAQs, got ${liveData.faqs.length}`);
  console.log(`   Live FAQs count: ${liveData.faqs.length}`);
  console.log(`   Announcement: "${liveData.announcement.title}" (enabled: ${liveData.announcement.enabled})`);

  console.log("✔ All Frontend Homepage Announcements & FAQs Integration Tests Passed!");
}

runTests()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(() => {
    try {
      if (fs.existsSync(bundleOutfile)) fs.unlinkSync(bundleOutfile);
    } catch {}
  });
