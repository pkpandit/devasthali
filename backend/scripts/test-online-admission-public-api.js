/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== Running Public Online Admissions API Route Tests ===");

  const baseUrl = "http://localhost:3001";

  // Ensure clean test state for test student
  const testStudentName = "[TEST-API] Dev Student";
  await prisma.admissionApplication.deleteMany({
    where: { studentName: testStudentName },
  });

  // 1. Test GET /api/public/admissions/registration-settings
  console.log("1. Testing GET /api/public/admissions/registration-settings...");
  const getRes = await fetch(`${baseUrl}/api/public/admissions/registration-settings`);
  assert.strictEqual(getRes.status, 200, "Should return 200 OK");
  const getJson = await getRes.json();
  assert.strictEqual(getJson.success, true);
  assert(getJson.settings);
  assert.strictEqual(typeof getJson.settings.isRegistrationOpen, "boolean");
  assert.strictEqual(getRes.headers.get("cache-control")?.includes("no-store"), true, "Must have no-store header");

  // 2. Test POST while registration is CLOSED (default state is closed)
  console.log("2. Testing POST when registration is closed (should fail-closed with 403)...");
  await prisma.admissionRegistrationSetting.update({
    where: { id: "default" },
    data: { isRegistrationOpen: false },
  });

  const closedRes = await fetch(`${baseUrl}/api/public/admissions/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idempotencyKey: "test-closed-key-1",
      appliedClass: "I",
      studentName: testStudentName,
      dob: "2018-05-10",
      gender: "Male",
      mobile: "9450371300",
      address: "Chilkahar Ballia",
      city: "Ballia",
      fatherName: "Father Test",
      declarationAgreed: true,
    }),
  });
  assert.strictEqual(closedRes.status, 403, "Should return 403 when registration closed");
  const closedJson = await closedRes.json();
  assert.strictEqual(closedJson.success, false);

  // 3. Test Honeypot (synthetic success without DB record)
  console.log("3. Testing Honeypot submission...");
  const honeypotRes = await fetch(`${baseUrl}/api/public/admissions/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idempotencyKey: "test-honeypot-key-1",
      appliedClass: "I",
      studentName: testStudentName,
      dob: "2018-05-10",
      gender: "Male",
      mobile: "9450371300",
      address: "Chilkahar Ballia",
      city: "Ballia",
      fatherName: "Father Test",
      declarationAgreed: true,
      website_honey: "bot-trap-value",
    }),
  });
  assert.strictEqual(honeypotRes.status, 201, "Honeypot should return synthetic 201");
  const honeypotJson = await honeypotRes.json();
  assert.strictEqual(honeypotJson.success, true);
  const honeypotDb = await prisma.admissionApplication.findUnique({
    where: { idempotencyKey: "test-honeypot-key-1" },
  });
  assert.strictEqual(honeypotDb, null, "Honeypot must not create database records");

  // Temporarily open registration for testing submissions
  await prisma.admissionRegistrationSetting.update({
    where: { id: "default" },
    data: { isRegistrationOpen: true },
  });

  const idempKey1 = "idemp-test-uuid-" + Date.now();
  const validPayload = {
    idempotencyKey: idempKey1,
    appliedClass: "I",
    studentName: testStudentName,
    dob: "2018-05-10",
    gender: "Male",
    mobile: "9450371300",
    address: "Chilkahar Ballia",
    city: "Ballia",
    fatherName: "Father Test",
    declarationAgreed: true,
  };

  // 4. Test Valid Application Submission
  console.log("4. Testing Valid Application Submission...");
  const validRes = await fetch(`${baseUrl}/api/public/admissions/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Forwarded-For": "198.51.100.10" },
    body: JSON.stringify(validPayload),
  });
  assert.strictEqual(validRes.status, 201, "Should return 201 Created");
  const validJson = await validRes.json();
  assert.strictEqual(validJson.success, true);
  assert(validJson.data.applicationNumber.startsWith("DVP-2627-"), "Application number format DVP-2627-XXXXXX");
  assert.strictEqual(
    validJson.message,
    "This reference number confirms receipt of your online application only. It does not confirm admission. The school will review the application and advise you of the next steps."
  );
  assert.strictEqual(validRes.headers.get("cache-control")?.includes("no-store"), true);

  const initialAppNumber = validJson.data.applicationNumber;

  // 5. Test Matching Idempotency Replay (Same key + same data)
  console.log("5. Testing Matching Idempotency Replay...");
  const replayRes = await fetch(`${baseUrl}/api/public/admissions/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Forwarded-For": "198.51.100.10" },
    body: JSON.stringify(validPayload),
  });
  assert.strictEqual(replayRes.status, 200, "Matching idempotency replay should return 200 OK");
  const replayJson = await replayRes.json();
  assert.strictEqual(replayJson.data.applicationNumber, initialAppNumber, "Must return original reference number");

  // 6. Test Mismatched Idempotency Replay (Same key + different data)
  console.log("6. Testing Mismatched Idempotency Replay...");
  const mismatchRes = await fetch(`${baseUrl}/api/public/admissions/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Forwarded-For": "198.51.100.10" },
    body: JSON.stringify({
      ...validPayload,
      studentName: "Completely Different Student",
    }),
  });
  assert.strictEqual(mismatchRes.status, 409, "Mismatched idempotency replay should return 409 Conflict");
  const mismatchJson = await mismatchRes.json();
  assert.strictEqual(mismatchJson.success, false);
  assert(!mismatchJson.data, "Must NOT expose prior application data or reference number");

  // 7. Test Lost-Response Retry After Registration Closes
  console.log("7. Testing Lost-Response Retry After Registration Closes...");
  await prisma.admissionRegistrationSetting.update({
    where: { id: "default" },
    data: { isRegistrationOpen: false },
  });

  const lostResponseRes = await fetch(`${baseUrl}/api/public/admissions/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Forwarded-For": "198.51.100.10" },
    body: JSON.stringify(validPayload), // same key + same data
  });
  assert.strictEqual(lostResponseRes.status, 200, "Lost-response retry should recover 200 confirmation even if closed");
  const lostResponseJson = await lostResponseRes.json();
  assert.strictEqual(lostResponseJson.data.applicationNumber, initialAppNumber);

  // Reopen for duplicate check test
  await prisma.admissionRegistrationSetting.update({
    where: { id: "default" },
    data: { isRegistrationOpen: true },
  });

  // 8. Test Business Duplicate (Different key, same active student + DOB + mobile)
  console.log("8. Testing Business Duplicate with different key...");
  const dupRes = await fetch(`${baseUrl}/api/public/admissions/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Forwarded-For": "198.51.100.10" },
    body: JSON.stringify({
      ...validPayload,
      idempotencyKey: "completely-new-idemp-key-999",
    }),
  });
  assert.strictEqual(dupRes.status, 409, "Business duplicate should return 409 Conflict");
  const dupJson = await dupRes.json();
  assert.strictEqual(dupJson.success, false);
  assert(!dupJson.data, "Must not expose existing application number to duplicate caller");
  assert(dupJson.error.includes("already been registered"), "Generic duplicate notice returned");

  // 9. Test Durable Rate Limiting (11 rapid submissions from same IP)
  console.log("9. Testing Durable Rate Limiting...");
  const spammerIp = "203.0.113.88";
  let rateLimited = false;
  for (let i = 0; i < 12; i++) {
    const res = await fetch(`${baseUrl}/api/public/admissions/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": spammerIp },
      body: JSON.stringify({
        idempotencyKey: `spam-key-${i}-${Date.now()}`,
        appliedClass: "I",
        studentName: `Spammer Child ${i}`,
        dob: "2018-05-10",
        gender: "Male",
        mobile: `94503713${String(i).padStart(2, "0")}`,
        address: "Test Address",
        city: "Ballia",
        fatherName: "Father Test",
        declarationAgreed: true,
      }),
    });
    if (res.status === 429) {
      rateLimited = true;
      break;
    }
  }
  assert.strictEqual(rateLimited, true, "11th rapid attempt should be 429 rate limited");

  // Clean up test applicant records and ensure registration is CLOSED at end
  await prisma.admissionApplication.deleteMany({
    where: { studentName: { startsWith: "[TEST-API]" } },
  });
  await prisma.admissionApplication.deleteMany({
    where: { studentName: { startsWith: "Spammer Child" } },
  });
  await prisma.admissionRegistrationSetting.update({
    where: { id: "default" },
    data: { isRegistrationOpen: false },
  });

  console.log("✔ Registration successfully restored to CLOSED state.");
  console.log("✔ All Public Online Admission API Route Tests Passed Successfully!");
}

runTests()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
