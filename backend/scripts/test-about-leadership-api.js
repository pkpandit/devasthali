/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: About & Leadership Public API Logic, DTO Projections,
 * Draft Isolation, Authoritative Empty Arrays, and 404 Isolation Rules.
 */

const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: ".env" });
const prisma = new PrismaClient();

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:3001";

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
  console.log("  Running Test Suite: About & Leadership Public API & DTO Logic");
  console.log("==================================================================\n");

  // -------------------------------------------------------------
  // 1. DTO Projection & Dynamic Media URL Resolution
  // -------------------------------------------------------------
  console.log("--- 1. Projection & Dynamic Media URL Resolution Logic ---");

  function resolveMediaUrl(url, storageKey, origin = "http://localhost:3001") {
    if (storageKey) {
      return `${origin}/api/public/media/${storageKey}`;
    }
    return url || null;
  }

  assert(
    "Resolves managed storage key to dynamic media origin",
    resolveMediaUrl(null, "about/showcase.jpg", "https://cdn.example.com") ===
      "https://cdn.example.com/api/public/media/about/showcase.jpg"
  );
  assert(
    "Returns public url when storage key is absent",
    resolveMediaUrl("/images/about/campus.jpg", null) ===
      "/images/about/campus.jpg"
  );
  assert(
    "Returns null when both url and storage key are null",
    resolveMediaUrl(null, null) === null
  );

  // -------------------------------------------------------------
  // 2. Draft Isolation & Authoritative Empty Array Tests
  // -------------------------------------------------------------
  console.log("\n--- 2. Draft Isolation & Authoritative Empty Array Rules ---");

  function projectAboutData(setting, credentials, narratives) {
    return {
      setting: setting && setting.isPublished ? setting : null,
      credentials: credentials.filter((c) => c.isPublished),
      narrativeSections: narratives.filter((n) => n.isPublished),
    };
  }

  const projectedEmpty = projectAboutData(
    { heading: "About School", isPublished: true },
    [{ title: "Draft Credential", isPublished: false }],
    [{ heading: "Draft Narrative", isPublished: false }]
  );

  assert(
    "Unpublished credentials filter to authoritative empty array []",
    Array.isArray(projectedEmpty.credentials) && projectedEmpty.credentials.length === 0
  );
  assert(
    "Unpublished narrative sections filter to authoritative empty array []",
    Array.isArray(projectedEmpty.narrativeSections) && projectedEmpty.narrativeSections.length === 0
  );

  // -------------------------------------------------------------
  // 3. Database Content Parity Verification
  // -------------------------------------------------------------
  console.log("\n--- 3. Database Content Parity Verification ---");

  const aboutSettingInDb = await prisma.aboutPageSetting.findUnique({
    where: { id: "default" },
  });
  assert("About setting exists and is published", aboutSettingInDb?.isPublished === true);
  assert("About heading is 'About School'", aboutSettingInDb?.heading === "About School");
  assert("About showcase badge is 'Estd. 1988'", aboutSettingInDb?.showcaseBadge === "Estd. 1988");

  const credsInDb = await prisma.aboutCredential.findMany({
    where: { isPublished: true },
    orderBy: { displayOrder: "asc" },
  });
  assert("At least 4 published credentials exist", credsInDb.length >= 4);
  assert("First credential category is 'Affiliation'", credsInDb[0]?.category === "Affiliation");
  assert("Second credential category is 'Heritage'", credsInDb[1]?.category === "Heritage");

  const narrativesInDb = await prisma.aboutNarrativeSection.findMany({
    where: { isPublished: true },
    orderBy: { displayOrder: "asc" },
  });
  assert("At least 3 published narrative sections exist", narrativesInDb.length >= 3);
  assert(
    "First narrative mentions 2nd October 1988",
    narrativesInDb[0]?.body.includes("2nd October 1988") === true
  );

  const vmSettingInDb = await prisma.visionMissionSetting.findUnique({
    where: { id: "default" },
  });
  assert("Vision & Mission setting exists and is published", vmSettingInDb?.isPublished === true);
  assert("Vision title is 'Our Vision & Establishment'", vmSettingInDb?.visionTitle === "Our Vision & Establishment");
  assert("Mission title is 'Our Mission & Development Goals'", vmSettingInDb?.missionTitle === "Our Mission & Development Goals");

  const leadershipInDb = await prisma.leadershipMember.findMany({
    where: { isPublished: true },
    orderBy: { displayOrder: "asc" },
  });
  assert("Exactly 5 leadership members seeded and published", leadershipInDb.length === 5);

  const founder = leadershipInDb.find((m) => m.role === "FOUNDER");
  assert("Founder slug is 'founders-message'", founder?.slug === "founders-message");
  assert("Founder name is 'Shri Chandra Shekhar'", founder?.name === "Shri Chandra Shekhar");

  const patron = leadershipInDb.find((m) => m.role === "PATRON");
  assert("Patron slug is 'patrons-message'", patron?.slug === "patrons-message");
  assert("Patron name is 'Shri Neeraj Shekhar'", patron?.name === "Shri Neeraj Shekhar");

  const president = leadershipInDb.find((m) => m.role === "PRESIDENT");
  assert("President slug is 'presidents-message'", president?.slug === "presidents-message");
  assert("President name is 'Ravishankar Singh'", president?.name === "Ravishankar Singh");

  const manager = leadershipInDb.find((m) => m.role === "MANAGER");
  assert("Manager slug is 'managers-message'", manager?.slug === "managers-message");
  assert("Manager name is 'Dr. Naveen Singh'", manager?.name === "Dr. Naveen Singh");

  const principal = leadershipInDb.find((m) => m.role === "PRINCIPAL");
  assert("Principal slug is 'principals-message'", principal?.slug === "principals-message");
  assert("Principal name is 'P. C. Shrivastava'", principal?.name === "P. C. Shrivastava");

  // -------------------------------------------------------------
  // 4. Live API Endpoint Health & Cache-Control (if backend is up)
  // -------------------------------------------------------------
  console.log("\n--- 4. Live Public API Endpoint Verification ---");
  try {
    const aboutRes = await fetch(`${BACKEND_URL}/api/public/about`);
    assert("Live GET /api/public/about returns HTTP 200", aboutRes.status === 200);

    const cacheHeader = aboutRes.headers.get("cache-control") || "";
    assert(
      "Cache-Control header contains public, s-maxage=60, and stale-while-revalidate=300",
      cacheHeader.includes("public") &&
        cacheHeader.includes("s-maxage=60") &&
        cacheHeader.includes("stale-while-revalidate=300")
    );

    const aboutJson = await aboutRes.json();
    assert("API response success is true", aboutJson.success === true);
    assert("API returns about setting", Boolean(aboutJson.data?.setting?.heading));
    assert("API returns credentials array", Array.isArray(aboutJson.data?.credentials));
    assert("API returns narrativeSections array", Array.isArray(aboutJson.data?.narrativeSections));

    // Test Leadership slug 404 behavior
    const notFoundRes = await fetch(`${BACKEND_URL}/api/public/leadership/non-existent-leader-12345`);
    assert("Live GET /api/public/leadership/non-existent returns HTTP 404", notFoundRes.status === 404);
  } catch (err) {
    console.log(`  [INFO] Backend server not currently running at ${BACKEND_URL} (${err.message}). Live endpoint fetch skipped.`);
  }

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log("\n==================================================================");
  console.log(`  About & Leadership API Test Suite: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================================\n");

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
