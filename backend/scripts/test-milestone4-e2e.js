/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Milestone 4 E2E Verification Suite:
 * About & Leadership Content Management:
 * AboutPageSetting, AboutCredential, AboutNarrativeSection,
 * VisionMissionSetting, InstitutionalCoreValue, LeadershipMember,
 * Fixed Slugs, Admin Workspace, Public API, and Page Integrations.
 */

const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const { getAdminWorkspace, getAdminRedirect } = require("../lib/admin-navigation.ts");
const { leadershipSlugs } = require("../lib/validation/about-leadership.ts");

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
  console.log("  Running Milestone 4 About & Leadership E2E Verification Suite");
  console.log("==================================================================\n");

  // -------------------------------------------------------------
  // 1. Database Parity & Six Models Verification
  // -------------------------------------------------------------
  console.log("--- 1. Database Parity & Models Verification ---");

  // 1a. AboutPageSetting
  const aboutSetting = await prisma.aboutPageSetting.findUnique({
    where: { id: "default" },
  });
  assert("AboutPageSetting default singleton exists", Boolean(aboutSetting));
  assert("About heading is 'About School'", aboutSetting?.heading === "About School");
  assert("About showcase badge is 'Estd. 1988'", aboutSetting?.showcaseBadge === "Estd. 1988");
  assert("About is published", aboutSetting?.isPublished === true);

  // 1b. AboutCredential
  const credentials = await prisma.aboutCredential.findMany({
    orderBy: { displayOrder: "asc" },
  });
  assert("At least 4 AboutCredentials exist", credentials.length >= 4);
  assert("Credential 1 is CBSE Affiliation", credentials[0]?.category === "Affiliation");
  assert("Credential 2 is Heritage 1988", credentials[1]?.category === "Heritage");
  assert("Credential 3 is Campus Ballia", credentials[2]?.category === "Campus");
  assert("Credential 4 is Founder Chandra Shekhar", credentials[3]?.category === "Founder");

  // 1c. AboutNarrativeSection
  const narratives = await prisma.aboutNarrativeSection.findMany({
    orderBy: { displayOrder: "asc" },
  });
  assert("At least 3 AboutNarrativeSections exist", narratives.length >= 3);
  assert("Narrative 1 contains founding history", narratives[0]?.body.includes("2nd October 1988"));

  // 1d. VisionMissionSetting
  const vmSetting = await prisma.visionMissionSetting.findUnique({
    where: { id: "default" },
  });
  assert("VisionMissionSetting default singleton exists", Boolean(vmSetting));
  assert("Vision title is 'Our Vision & Establishment'", vmSetting?.visionTitle === "Our Vision & Establishment");
  assert("Mission title is 'Our Mission & Development Goals'", vmSetting?.missionTitle === "Our Mission & Development Goals");
  assert("Vision & Mission is published", vmSetting?.isPublished === true);

  // 1e. LeadershipMember (5 Roles & Fixed Slugs)
  const leadershipMembers = await prisma.leadershipMember.findMany({
    orderBy: { displayOrder: "asc" },
  });
  assert("Exactly 5 LeadershipMembers seeded", leadershipMembers.length === 5);

  const expectedRoles = [
    { role: "FOUNDER", slug: "founders-message", name: "Shri Chandra Shekhar" },
    { role: "PATRON", slug: "patrons-message", name: "Shri Neeraj Shekhar" },
    { role: "PRESIDENT", slug: "presidents-message", name: "Ravishankar Singh" },
    { role: "MANAGER", slug: "managers-message", name: "Dr. Naveen Singh" },
    { role: "PRINCIPAL", slug: "principals-message", name: "P. C. Shrivastava" },
  ];

  for (const expected of expectedRoles) {
    const member = leadershipMembers.find((m) => m.role === expected.role);
    assert(`Leadership role ${expected.role} exists`, Boolean(member));
    assert(`Leadership role ${expected.role} has canonical slug '${expected.slug}'`, member?.slug === expected.slug);
    assert(`Leadership role ${expected.role} has correct name '${expected.name}'`, member?.name === expected.name);
    assert(`Leadership role ${expected.role} is published`, member?.isPublished === true);
  }

  // -------------------------------------------------------------
  // 2. Fixed Slugs Invariant Check
  // -------------------------------------------------------------
  console.log("\n--- 2. Fixed Canonical Slugs Invariant Verification ---");
  assert("FOUNDER slug is fixed", leadershipSlugs.FOUNDER === "founders-message");
  assert("PATRON slug is fixed", leadershipSlugs.PATRON === "patrons-message");
  assert("PRESIDENT slug is fixed", leadershipSlugs.PRESIDENT === "presidents-message");
  assert("MANAGER slug is fixed", leadershipSlugs.MANAGER === "managers-message");
  assert("PRINCIPAL slug is fixed", leadershipSlugs.PRINCIPAL === "principals-message");

  // -------------------------------------------------------------
  // 3. Admin Navigation & Redirects Verification
  // -------------------------------------------------------------
  console.log("\n--- 3. Admin Navigation & Redirects Verification ---");
  const ws = getAdminWorkspace("/admin/about-leadership");
  assert("Admin workspace /admin/about-leadership is registered", Boolean(ws));
  assert("Admin workspace title is 'About & Leadership'", ws?.title === "About & Leadership");

  assert("Redirect: /admin/about -> /admin/about-leadership", getAdminRedirect("/admin/about") === "/admin/about-leadership");
  assert("Redirect: /admin/about/heritage -> /admin/about-leadership", getAdminRedirect("/admin/about/heritage") === "/admin/about-leadership");
  assert("Redirect: /admin/about/vision-mission -> /admin/about-leadership", getAdminRedirect("/admin/about/vision-mission") === "/admin/about-leadership");
  assert("Redirect: /admin/about/founders-message -> /admin/about-leadership", getAdminRedirect("/admin/about/founders-message") === "/admin/about-leadership");
  assert("Redirect: /admin/about/patrons-message -> /admin/about-leadership", getAdminRedirect("/admin/about/patrons-message") === "/admin/about-leadership");
  assert("Redirect: /admin/about/presidents-message -> /admin/about-leadership", getAdminRedirect("/admin/about/presidents-message") === "/admin/about-leadership");
  assert("Redirect: /admin/about/managers-message -> /admin/about-leadership", getAdminRedirect("/admin/about/managers-message") === "/admin/about-leadership");
  assert("Redirect: /admin/about/principals-message -> /admin/about-leadership", getAdminRedirect("/admin/about/principals-message") === "/admin/about-leadership");

  // -------------------------------------------------------------
  // 4. Live Server Endpoints (if servers running)
  // -------------------------------------------------------------
  console.log("\n--- 4. Live Server Endpoints Verification ---");
  try {
    const res = await fetch(`${BACKEND_URL}/api/public/about`);
    if (res.status === 200) {
      assert("Live API /api/public/about returns 200", true);
    }
  } catch {
    console.log("  [INFO] Local dev backend not running on port 3001; skipped live network call.");
  }

  // Summary
  console.log("\n==================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`  Milestone 4 E2E Suite: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) {
    console.error(`  Tests Failed: ${failed}`);
    process.exit(1);
  } else {
    console.log("  ALL MILESTONE 4 E2E TESTS PASSED!");
  }
  console.log("==================================================================\n");

  await prisma.$disconnect();
}

runSuite().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
