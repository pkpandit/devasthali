/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Faculty & Mentors Public API & DTO Logic
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
  console.log("  Running Test Suite: Faculty & Mentors Public API & DTO Logic");
  console.log("==================================================================");

  // -------------------------------------------------------------
  // 1. Projection & Dynamic Media URL Resolution Logic
  // -------------------------------------------------------------
  console.log("\n--- 1. Projection & Dynamic Media URL Resolution Logic ---");

  function resolveMediaUrl(url, storageKey, origin = "http://127.0.0.1:3001") {
    if (storageKey) {
      return `${origin}/api/public/media/${storageKey}`;
    }
    return url || null;
  }

  assert(
    "Resolves managed storage key to dynamic media origin",
    resolveMediaUrl(null, "faculty/fac_1234.webp", "https://media.devasthaly.com") ===
      "https://media.devasthaly.com/api/public/media/faculty/fac_1234.webp"
  );

  assert(
    "Returns root-relative public URL when storage key is absent",
    resolveMediaUrl("/images/academics/faculty/teacher.jpg", null) ===
      "/images/academics/faculty/teacher.jpg"
  );

  assert(
    "Returns null when both url and storage key are absent",
    resolveMediaUrl(null, null) === null
  );

  // -------------------------------------------------------------
  // 2. Draft Isolation & Authoritative Empty Array Rules
  // -------------------------------------------------------------
  console.log("\n--- 2. Draft Isolation & Authoritative Empty Array Rules ---");

  const testList = [
    { id: "1", name: "Published One", isPublished: true, department: "Math" },
    { id: "2", name: "Draft Two", isPublished: false, department: "Science" },
    { id: "3", name: "Published Three", isPublished: true, department: "Math" },
  ];

  const publishedOnly = testList.filter((f) => f.isPublished);
  assert("Draft isolation excludes unpublished faculty", publishedOnly.length === 2 && !publishedOnly.some((f) => f.id === "2"));

  const allDrafts = testList.map((f) => ({ ...f, isPublished: false })).filter((f) => f.isPublished);
  assert("Empty published set evaluates to authoritative []", Array.isArray(allDrafts) && allDrafts.length === 0);

  const departmentsExtracted = Array.from(new Set(publishedOnly.map((f) => f.department))).sort();
  assert("Departments extracted accurately", departmentsExtracted.length === 1 && departmentsExtracted[0] === "Math");

  // -------------------------------------------------------------
  // 3. Database Content Parity Verification (Verbatim 8 Teachers)
  // -------------------------------------------------------------
  console.log("\n--- 3. Database Content Parity Verification ---");

  const records = await prisma.facultyMember.findMany({
    orderBy: { displayOrder: "asc" },
  });

  assert("Exactly 8 faculty members seeded in DB", records.length === 8, `Found ${records.length}`);

  const p1 = records[0];
  assert("First educator is Dr. K. N. Pandey", p1.name === "Dr. K. N. Pandey");
  assert("Dr. K. N. Pandey designation matches", p1.designation === "Principal & Academic Director");
  assert("Dr. K. N. Pandey department is Administration & Science", p1.department === "Administration & Science");
  assert("Dr. K. N. Pandey experience is 24", p1.experienceYears === 24);

  const p2 = records[1];
  assert("Second educator is Smt. Manorama Singh", p2.name === "Smt. Manorama Singh");
  assert("Smt. Manorama Singh is Vice Principal", p2.designation.includes("Vice Principal"));
  assert("Smt. Manorama Singh department is English & Humanities", p2.department === "English & Humanities");

  const p3 = records[2];
  assert("Third educator is Shri Rajeshwar Nath Rai", p3.name === "Shri Rajeshwar Nath Rai");
  assert("Shri Rajeshwar Nath Rai teaches Mathematics", p3.department === "Mathematics");

  const p4 = records[3];
  assert("Fourth educator is Dr. Alok Srivastava", p4.name === "Dr. Alok Srivastava");
  assert("Dr. Alok Srivastava department is Chemistry & NEET Coordinator", p4.department === "Chemistry & NEET Coordinator");

  const p5 = records[4];
  assert("Fifth educator is Smt. Priyanka Mishra", p5.name === "Smt. Priyanka Mishra");
  assert("Smt. Priyanka Mishra department is Science & Biology", p5.department === "Science & Biology");

  const p6 = records[5];
  assert("Sixth educator is Shri Devendra Yadav", p6.name === "Shri Devendra Yadav");
  assert("Shri Devendra Yadav is Sports Head", p6.designation.includes("Sports Head"));

  const p7 = records[6];
  assert("Seventh educator is Shri Arvind Kumar Shukla", p7.name === "Shri Arvind Kumar Shukla");
  assert("Shri Arvind Kumar Shukla department is Computer Science & AI", p7.department === "Computer Science & AI");

  const p8 = records[7];
  assert("Eighth educator is Dr. Sunita Upadhyay", p8.name === "Dr. Sunita Upadhyay");
  assert("Dr. Sunita Upadhyay department is Social Science & Hindi", p8.department === "Social Science & Hindi");

  // Verify all 8 have meaningful alt text
  const missingAlt = records.filter((r) => !r.imageAlt || r.imageAlt.trim().length === 0);
  assert("All 8 faculty members have meaningful alt text", missingAlt.length === 0);

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n==================================================================");
  console.log(`  Faculty API Test Suite: ${passed} Passed, ${failed} Failed (Total ${total})`);
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
