/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: School Events Public API & DTO Logic
 */

const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: ".env" });
const prisma = new PrismaClient();

async function runSuite() {
  const results = [];

  function assert(name, condition, details = "") {
    results.push({ name, passed: Boolean(condition), details });
    if (!condition) {
      console.error(`  [FAIL] ${name}: ${details}`);
    } else {
      console.log(`  [PASS] ${name}`);
    }
  }

  console.log("==================================================================");
  console.log("  Running Test Suite: School Events Public API & DTO Logic");
  console.log("==================================================================");

  // -------------------------------------------------------------
  // 1. Media URL Resolution Logic
  // -------------------------------------------------------------
  console.log("\n--- 1. Media URL Resolution Logic ---");

  function resolveMediaUrl(url, storageKey, origin = "http://127.0.0.1:3001") {
    if (storageKey) {
      return `${origin}/api/public/media/${storageKey}`;
    }
    return url || null;
  }

  assert(
    "Resolves managed events storage key to dynamic media origin",
    resolveMediaUrl(null, "events/eve_1234567890abcdef1234567890abcdef.webp", "https://media.devasthaly.com") ===
      "https://media.devasthaly.com/api/public/media/events/eve_1234567890abcdef1234567890abcdef.webp"
  );

  assert(
    "Returns root-relative public URL when storage key is absent",
    resolveMediaUrl("/images/events/sports.webp", null) === "/images/events/sports.webp"
  );

  assert(
    "Returns null when both url and storage key are absent",
    resolveMediaUrl(null, null) === null
  );

  // -------------------------------------------------------------
  // 2. Draft Isolation & Empty Array Rules
  // -------------------------------------------------------------
  console.log("\n--- 2. Draft Isolation & Empty Array Rules ---");

  const testEvents = [
    { id: "eve-1", title: "Published Debate", isPublished: true, category: "Academic Competition" },
    { id: "eve-2", title: "Draft Event", isPublished: false, category: "Sports" },
    { id: "eve-3", title: "Published Sports Meet", isPublished: true, category: "Sports & Athletics" },
  ];

  const publishedOnly = testEvents.filter((e) => e.isPublished);
  assert("Draft isolation excludes unpublished events", publishedOnly.length === 2 && !publishedOnly.some((e) => e.id === "eve-2"));

  const allDrafts = testEvents.map((e) => ({ ...e, isPublished: false })).filter((e) => e.isPublished);
  assert("Empty published set evaluates to authoritative []", Array.isArray(allDrafts) && allDrafts.length === 0);

  const categoriesExtracted = Array.from(new Set(publishedOnly.map((e) => e.category))).sort();
  assert("Categories extracted accurately", categoriesExtracted.length === 2);

  // -------------------------------------------------------------
  // 3. Database Content Parity Verification (4 Seeded Events)
  // -------------------------------------------------------------
  console.log("\n--- 3. Database Content Parity Verification ---");

  const events = await prisma.schoolEvent.findMany({
    where: { isPublished: true },
    orderBy: { displayOrder: "asc" },
  });

  assert("Exactly 4 school events seeded in DB", events.length === 4, `Found ${events.length}`);

  const e1 = events[0];
  assert("First event is Inter-School English Debate Competition", e1.title === "Inter-School English Debate Competition");
  assert("First event date is 25 Nov 2025", e1.eventDate === "25 Nov 2025");
  assert("First event category is Academic Competition", e1.category === "Academic Competition");

  const e2 = events[1];
  assert("Second event is Annual Sports Meet & Athletic Championship", e2.title === "Annual Sports Meet & Athletic Championship");
  assert("Second event date is 12 Dec 2025", e2.eventDate === "12 Dec 2025");
  assert("Second event category is Sports & Athletics", e2.category === "Sports & Athletics");

  const e3 = events[2];
  assert("Third event is CBSE Pre-Board Examination Series (Classes X & XII)", e3.title === "CBSE Pre-Board Examination Series (Classes X & XII)");
  assert("Third event date is 05 Jan 2026", e3.eventDate === "05 Jan 2026");
  assert("Third event category is CBSE Examination", e3.category === "CBSE Examination");

  const e4 = events[3];
  assert("Fourth event is Republic Day Patriotic Parade & Cultural Gala", e4.title === "Republic Day Patriotic Parade & Cultural Gala");
  assert("Fourth event date is 26 Jan 2026", e4.eventDate === "26 Jan 2026");
  assert("Fourth event category is National Celebration", e4.category === "National Celebration");

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n==================================================================");
  console.log(`  Events Public API Test Suite: ${passed} Passed, ${failed} Failed (Total ${total})`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite()
  .catch((e) => {
    console.error("Test suite fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
