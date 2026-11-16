/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Milestone 2 E2E Verification Suite:
 * Backend-Managed Navigation: Header, Footers, Live API, and Frontend Integration.
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
  console.log("  Running Milestone 2 Navigation E2E Verification Suite");
  console.log("==================================================================\n");

  // -------------------------------------------------------------
  // 1. Live Server Health Checks
  // -------------------------------------------------------------
  console.log("--- 1. Live Server Health Checks ---");
  try {
    const backendRes = await fetch(`${BACKEND_URL}/login`);
    assert("Backend server is responsive on port 3001", backendRes.status === 200);

    const frontendRes = await fetch(`${FRONTEND_URL}/`);
    assert("Frontend server is responsive on port 3000", frontendRes.status === 200);
  } catch (err) {
    assert("Servers are reachable on 3001 and 3000", false, err.message);
    console.error("Please ensure dev servers are running before executing E2E suite.");
    process.exit(1);
  }

  // -------------------------------------------------------------
  // 2. Public Navigation API Endpoint
  // -------------------------------------------------------------
  console.log("\n--- 2. Public Navigation API Endpoint ---");
  let navData = null;
  try {
    const navRes = await fetch(`${BACKEND_URL}/api/public/navigation`);
    assert("GET /api/public/navigation returns HTTP 200", navRes.status === 200);

    const cacheHeader = navRes.headers.get("cache-control") || "";
    assert(
      "Navigation API specifies public caching with s-maxage=60 and stale-while-revalidate=300",
      cacheHeader.includes("public") && cacheHeader.includes("s-maxage=60") && cacheHeader.includes("stale-while-revalidate=300")
    );

    const json = await navRes.json();
    assert("Response body has success: true", json.success === true);
    assert("Response body contains data object", Boolean(json.data));
    navData = json.data;

    // Header items
    assert("Header navigation contains 7 published items", navData.header?.length === 7);
    const headerLabels = navData.header.map((i) => i.name);
    assert("Header contains 'Home'", headerLabels.includes("Home"));
    assert("Header contains 'About Us'", headerLabels.includes("About Us"));
    assert("Header contains 'Academics'", headerLabels.includes("Academics"));
    assert("Header contains 'Admissions'", headerLabels.includes("Admissions"));
    assert("Header contains 'Life at School'", headerLabels.includes("Life at School"));
    assert("Header contains 'Students & Parents'", headerLabels.includes("Students & Parents"));
    assert("Header contains 'Contact'", headerLabels.includes("Contact"));

    // Dropdown Panels & Columns
    const aboutUs = navData.header.find((i) => i.name === "About Us");
    assert("About Us has panelType 'mega'", aboutUs?.panelType === "mega");
    assert("About Us contains 2 columns", aboutUs?.columns?.length === 2);
    assert("About Us column 1 heading is 'Overview & Heritage'", aboutUs?.columns?.[0]?.heading === "Overview & Heritage");
    assert("About Us column 2 heading is 'Leadership Messages'", aboutUs?.columns?.[1]?.heading === "Leadership Messages");

    const academics = navData.header.find((i) => i.name === "Academics");
    assert("Academics has panelType 'mega'", academics?.panelType === "mega");
    const resultsLink = academics?.columns?.[1]?.items?.find((l) => l.name === "Board Examination Results & Toppers");
    assert("Board Examination Results & Toppers has badge '100% Pass'", resultsLink?.badge === "100% Pass");

    const admissions = navData.header.find((i) => i.name === "Admissions");
    assert("Admissions has panelType 'mega'", admissions?.panelType === "mega");
    const onlineForm = admissions?.columns?.[1]?.items?.find((l) => l.name === "Online Admission Form");
    assert("Online Admission Form has badge 'Apply Now'", onlineForm?.badge === "Apply Now");

    const lifeAtSchool = navData.header.find((i) => i.name === "Life at School");
    assert("Life at School has panelType 'medium'", lifeAtSchool?.panelType === "medium");

    const students = navData.header.find((i) => i.name === "Students & Parents");
    assert("Students & Parents has panelType 'compact'", students?.panelType === "compact");

    // Footers
    assert("Footer admissions contains 8 published links", navData.footerAdmissions?.length === 8);
    assert("Footer admissions has 'Admissions 2026–27 Overview'", navData.footerAdmissions?.[0]?.name === "Admissions 2026–27 Overview");

    assert("Footer life contains 8 published links", navData.footerLife?.length === 8);
    assert("Footer life has 'Campus Facilities & 15-Acre Grounds'", navData.footerLife?.[0]?.name === "Campus Facilities & 15-Acre Grounds");

  } catch (err) {
    assert("Navigation API test failed", false, err.message);
  }

  // -------------------------------------------------------------
  // 3. Frontend HTML Render Verification
  // -------------------------------------------------------------
  console.log("\n--- 3. Frontend HTML Render Verification ---");
  try {
    const frontendRes = await fetch(`${FRONTEND_URL}/`);
    const html = await frontendRes.text();

    assert("Frontend rendered HTML contains header link 'Home'", html.includes("Home"));
    assert("Frontend rendered HTML contains header link 'About Us'", html.includes("About Us"));
    assert("Frontend rendered HTML contains header link 'Academics'", html.includes("Academics"));
    assert("Frontend rendered HTML contains header link 'Admissions'", html.includes("Admissions"));
    assert("Frontend rendered HTML contains header link 'Life at School'", html.includes("Life at School"));
    assert(
      "Frontend rendered HTML contains header link 'Students & Parents'",
      html.includes("Students &amp; Parents") || (html.includes("Students") && html.includes("Parents"))
    );
    assert("Frontend rendered HTML contains header link 'Contact'", html.includes("Contact"));
    assert("Frontend rendered HTML contains footer link 'Admissions 2026–27 Overview'", html.includes("Admissions 2026–27 Overview"));
    assert("Frontend rendered HTML contains footer link 'Campus Facilities'", html.includes("Campus Facilities") && html.includes("15-Acre Grounds"));
    assert("Frontend rendered HTML contains CBSE Affiliation", html.includes("2130238"));
    assert("Frontend rendered HTML contains CTA button", html.includes("Apply 2026"));
  } catch (err) {
    assert("Frontend HTML verification failed", false, err.message);
  }

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log("\n==================================================================");
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`  Milestone 2 E2E Suite: ${passedCount} Passed, ${failedCount} Failed`);
  console.log("==================================================================\n");

  await prisma.$disconnect();

  if (failedCount > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("E2E test suite fatal error:", err);
  process.exit(1);
});
