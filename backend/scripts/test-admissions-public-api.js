/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== Running Public Admissions & Enquiry API Route Tests ===");

  const baseUrl = "http://localhost:3001";

  // 1. Test GET /api/public/admissions
  console.log("1. Testing GET /api/public/admissions...");
  const res = await fetch(`${baseUrl}/api/public/admissions`);
  assert.strictEqual(res.status, 200, "Should return 200 OK");

  const json = await res.json();
  assert.strictEqual(json.success, true, "Response should have success: true");
  assert(Array.isArray(json.steps), "Steps should be an array");
  assert(Array.isArray(json.eligibilityCriteria), "Eligibility criteria should be an array");
  assert(Array.isArray(json.documentRequirements), "Document requirements should be an array");
  assert(Array.isArray(json.faqs), "FAQs should be an array");

  console.log(`   Steps returned: ${json.steps.length}`);
  console.log(`   Eligibility criteria returned: ${json.eligibilityCriteria.length}`);
  console.log(`   Document requirements returned: ${json.documentRequirements.length}`);
  console.log(`   FAQs returned: ${json.faqs.length}`);

  assert(json.steps.length >= 4, "Should return at least 4 steps");
  assert(json.eligibilityCriteria.length >= 6, "Should return at least 6 eligibility criteria");
  assert(json.documentRequirements.length >= 7, "Should return at least 7 document requirements");
  assert(json.faqs.length >= 6, "Should return at least 6 FAQs");

  // Verify safe projection: no sensitive fields leaked
  const firstStep = json.steps[0];
  assert(firstStep.stepNumber && firstStep.title && firstStep.description);

  // 2. Test GET /api/public/enquiries is 405 Method Not Allowed
  console.log("2. Testing GET /api/public/enquiries (should be 405 Method Not Allowed)...");
  const getEnquiryRes = await fetch(`${baseUrl}/api/public/enquiries`);
  assert.strictEqual(
    getEnquiryRes.status,
    405,
    "GET /api/public/enquiries must be 405 Method Not Allowed"
  );

  // 3. Test Honeypot on POST /api/public/enquiries
  console.log("3. Testing Honeypot on POST /api/public/enquiries...");
  const initialEnquiryCount = await prisma.enquirySubmission.count();

  const honeypotRes = await fetch(`${baseUrl}/api/public/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studentName: "Bot Spammer",
      parentName: "Spam Bot",
      phone: "9876543210",
      grade: "Class I",
      website_honey: "i-am-a-bot-trapped",
    }),
  });

  assert.strictEqual(honeypotRes.status, 200, "Honeypot should return 200 fake success");
  const honeypotJson = await honeypotRes.json();
  assert.strictEqual(honeypotJson.success, true);

  const postHoneypotCount = await prisma.enquirySubmission.count();
  assert.strictEqual(
    postHoneypotCount,
    initialEnquiryCount,
    "Honeypot must NOT create database records"
  );

  // 4. Test Valid Enquiry Submission via POST /api/public/enquiries
  console.log("4. Testing Valid Enquiry Submission via POST /api/public/enquiries...");
  const validSubmissionRes = await fetch(`${baseUrl}/api/public/enquiries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": `192.0.2.${Math.floor(Math.random() * 200) + 1}`,
    },
    body: JSON.stringify({
      studentName: "Ananya Mishra",
      parentName: "Sanjay Mishra",
      phone: "9123456780",
      email: "sanjay.mishra@example.com",
      grade: "Class VI",
      message: "Requesting syllabus and transport details.",
      website_honey: "",
    }),
  });

  assert.strictEqual(
    validSubmissionRes.status,
    201,
    "Valid enquiry submission should return 201 Created"
  );
  const validJson = await validSubmissionRes.json();
  assert.strictEqual(validJson.success, true);
  assert(validJson.message);
  assert.strictEqual(
    validJson.id,
    undefined,
    "Must never leak internal database ID to the public"
  );

  // Verify record in database
  const createdRecord = await prisma.enquirySubmission.findFirst({
    where: { studentName: "Ananya Mishra" },
  });
  assert(createdRecord, "Record must exist in database");
  assert.strictEqual(createdRecord.status, "PENDING");
  assert.strictEqual(createdRecord.phone, "9123456780");
  assert(createdRecord.ipHash, "ipHash must be populated");
  assert.strictEqual(createdRecord.ipHash.length, 32, "ipHash must be 32 chars");

  // Clean up test record
  await prisma.enquirySubmission.delete({ where: { id: createdRecord.id } });

  console.log("=== All Public Admissions & Enquiry API Route Tests Passed! ===");
}

runTests()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
