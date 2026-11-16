/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Milestone 1 E2E Verification Suite:
 * Site Identity, Contact Information, Footer, and Campus Directory Register.
 */

const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: ".env" });
const prisma = new PrismaClient();

const BACKEND_URL = "http://127.0.0.1:3001";
const FRONTEND_URL = "http://127.0.0.1:3000";

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
  console.log("  Running Milestone 1 E2E Verification Suite");
  console.log("==================================================================\n");

  // -------------------------------------------------------------
  // 1. Health Checks
  // -------------------------------------------------------------
  console.log("--- 1. Live Server Health Checks ---");
  try {
    const backendRes = await fetch(`${BACKEND_URL}/login`);
    assert("Backend server is responsive on port 3001", backendRes.status === 200);

    const frontendRes = await fetch(`${FRONTEND_URL}/`);
    assert("Frontend server is responsive on port 3000", frontendRes.status === 200);
  } catch (err) {
    assert("Servers are reachable", false, err.message);
    process.exit(1);
  }

  // -------------------------------------------------------------
  // 2. Public API Endpoints
  // -------------------------------------------------------------
  console.log("\n--- 2. Public Profile & Directory API Endpoints ---");
  try {
    // 2.1 GET /api/public/profile
    const profileRes = await fetch(`${BACKEND_URL}/api/public/profile`);
    assert("GET /api/public/profile returns HTTP 200", profileRes.status === 200);

    const cacheHeader = profileRes.headers.get("cache-control") || "";
    assert("Profile API specifies public caching with s-maxage and stale-while-revalidate",
      cacheHeader.includes("public") && cacheHeader.includes("s-maxage=60") && cacheHeader.includes("stale-while-revalidate=300")
    );

    const profileData = await profileRes.json();
    assert("Profile DTO contains schoolName", profileData.schoolName === "Devasthaly Vidyapeeth");
    assert("Profile DTO contains affiliationNo 2130238", profileData.affiliationNo === "2130238");
    assert("Profile DTO contains schoolCode 70184", profileData.schoolCode === "70184");
    assert("Profile DTO contains nested address", Boolean(profileData.address && profileData.address.campus === "Chilkahar"));
    assert("Profile DTO contains nested contacts", Boolean(profileData.contacts && profileData.contacts.admissionsPhone === "9554960408"));
    assert("Profile DTO contains nested social", Boolean(profileData.social && profileData.social.facebook));
    assert("Profile DTO does not leak database ID", profileData.id === undefined);
    assert("Profile DTO does not leak audit or internal keys", profileData.internalAuditId === undefined);

    // 2.2 GET /api/public/directory
    const dirRes = await fetch(`${BACKEND_URL}/api/public/directory`);
    assert("GET /api/public/directory returns HTTP 200", dirRes.status === 200);

    const dirCacheHeader = dirRes.headers.get("cache-control") || "";
    assert("Directory API specifies public caching with s-maxage and stale-while-revalidate",
      dirCacheHeader.includes("public") && dirCacheHeader.includes("s-maxage=60") && dirCacheHeader.includes("stale-while-revalidate=300")
    );

    const dirData = await dirRes.json();
    assert("Directory returns an array of entries", Array.isArray(dirData));
    assert("Directory contains at least 25 seeded entries", dirData.length >= 25);
    assert("All directory entries have roleTitle and phoneNumber", dirData.every((e) => e.roleTitle && e.phoneNumber));
    assert("Directory entries are ordered ascending by displayOrder",
      dirData.every((e, i, arr) => i === 0 || e.displayOrder >= arr[i - 1].displayOrder)
    );
  } catch (err) {
    assert("Public API endpoint tests succeeded", false, err.message);
  }

  // -------------------------------------------------------------
  // 3. Admin Authentication & Route Protection
  // -------------------------------------------------------------
  console.log("\n--- 3. Admin Route Protection ---");
  try {
    const unauthRes = await fetch(`${BACKEND_URL}/admin/contact/directory`, {
      redirect: "manual",
    });
    // Unauthenticated request should redirect (307/302) to login or return login
    assert("Unauthenticated request to /admin/contact/directory is intercepted",
      unauthRes.status === 307 || unauthRes.status === 302 || unauthRes.status === 401
    );
  } catch (err) {
    assert("Admin route protection verified", false, err.message);
  }

  // -------------------------------------------------------------
  // 4. Frontend Content Dynamic Reflection
  // -------------------------------------------------------------
  console.log("\n--- 4. Frontend Dynamic Reflection ---");
  try {
    // 4.1 Home Page Header & Footer reflection
    const homeHtmlRes = await fetch(`${FRONTEND_URL}/`);
    const homeHtml = await homeHtmlRes.text();

    assert("Frontend Header renders dynamic affiliation: 2130238", homeHtml.includes("2130238"));
    assert("Frontend Header renders dynamic school code: 70184", homeHtml.includes("70184"));
    assert("Frontend Header renders dynamic admissions phone: 9554960408", homeHtml.includes("9554960408"));
    assert("Frontend Footer renders physical address: Chilkahar", homeHtml.includes("Chilkahar"));
    assert("Frontend Footer renders working hours", homeHtml.includes("8:00 AM"));

    // 4.2 Contact Page Directory Tables reflection
    const contactHtmlRes = await fetch(`${FRONTEND_URL}/contact`);
    const contactHtml = await contactHtmlRes.text();

    assert("Contact page renders 'Contact Us & Directory'", contactHtml.includes("Contact Us") && contactHtml.includes("Directory"));
    assert("Contact page renders Coordinator Mrs. Anita Singh", contactHtml.toLowerCase().includes("anita singh"));
    assert("Contact page renders Coordinator Mrs. Sadhana Mishra", contactHtml.toLowerCase().includes("sadhana mishra"));
    assert("Contact page renders Chief Warden Mr. Dhirendra Singh", contactHtml.includes("Dhirendra Singh"));
    assert("Contact page renders Fee Counter Mr. Mukesh Prasad", contactHtml.includes("Mukesh Prasad"));
    assert("Contact page renders Medical Emergency Desk", contactHtml.includes("Medical Emergency Desk"));
    assert("Contact page renders Campus Security Desk", contactHtml.includes("Security"));
    assert("Contact page renders Google Maps iframe", contactHtml.includes("google.com/maps/embed"));
  } catch (err) {
    assert("Frontend reflection verified", false, err.message);
  }

  // -------------------------------------------------------------
  // 5. Dynamic Mutation & Live Reflection Round-Trip
  // -------------------------------------------------------------
  console.log("\n--- 5. Dynamic Mutation & Round-Trip Reflection ---");
  try {
    // 5.1 Create temporary test directory entry
    const testEntry = await prisma.campusDirectoryEntry.create({
      data: {
        category: "HOSTEL_WARDEN",
        roleTitle: "Special QA Warden Wing",
        contactName: "Mr. Test Warden",
        department: "Experimental Wing",
        phoneNumber: "9988776655",
        displayOrder: 9999,
        isPublished: true,
      },
    });

    // Check reflection in public directory API
    const postCreateRes = await fetch(`${BACKEND_URL}/api/public/directory`, { cache: "no-store" });
    const postCreateData = await postCreateRes.json();
    const foundEntry = postCreateData.find((e) => e.id === testEntry.id);
    assert("Newly created directory entry reflects immediately in public directory API", Boolean(foundEntry && foundEntry.roleTitle === "Special QA Warden Wing"));

    // 5.2 Toggle to Draft
    await prisma.campusDirectoryEntry.update({
      where: { id: testEntry.id },
      data: { isPublished: false },
    });

    const postDraftRes = await fetch(`${BACKEND_URL}/api/public/directory`, { cache: "no-store" });
    const postDraftData = await postDraftRes.json();
    const foundDraftEntry = postDraftData.find((e) => e.id === testEntry.id);
    assert("Draft/unpublished directory entry is completely absent from public directory API", foundDraftEntry === undefined);

    // 5.3 Delete test entry
    await prisma.campusDirectoryEntry.delete({
      where: { id: testEntry.id },
    });

    const postDeleteRes = await fetch(`${BACKEND_URL}/api/public/directory`, { cache: "no-store" });
    const postDeleteData = await postDeleteRes.json();
    const foundDeletedEntry = postDeleteData.find((e) => e.id === testEntry.id);
    assert("Deleted directory entry removed completely from public directory API", foundDeletedEntry === undefined);
  } catch (err) {
    assert("Dynamic mutation round-trip completed without errors", false, err.message);
  } finally {
    await prisma.$disconnect();
  }

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log("\n==================================================================");
  console.log(`  Milestone 1 E2E Verification Suite: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
