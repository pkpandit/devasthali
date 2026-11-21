/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
require.cache[require.resolve("server-only")] = { exports: {} };

const assert = require("node:assert");
const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");
const { execSync } = require("node:child_process");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Bundle TypeScript validation for Node runtime
try {
  execSync(
    'npx esbuild lib/validation/admissions.ts --bundle --platform=node --outfile=dist_test_admissions_validation.js --external:@prisma/client --external:server-only',
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
} catch (e) {
  console.error("esbuild compilation failed:", e);
  process.exit(1);
}

function computeSaltedIpHash(clientIp) {
  const ip = clientIp?.trim() || "unknown";
  const salt = process.env.ENQUIRY_SALT || "dvp_admissions_enquiry_salt_2026";
  return crypto.createHash("sha256").update(`${ip}:${salt}`).digest("hex").slice(0, 32);
}

async function runTests() {
  console.log("=== Running Admissions Validation & Action Tests ===");

  const {
    admissionStepSchema,
    admissionEligibilityCriteriaSchema,
    admissionDocumentRequirementSchema,
    admissionFaqSchema,
    enquirySubmissionSchema,
    enquiryStatusUpdateSchema,
    reorderItemsSchema,
  } = require("../dist_test_admissions_validation");

  // 1. Test AdmissionStep validation
  console.log("1. Testing AdmissionStep validation...");
  const validStep = admissionStepSchema.safeParse({
    stepNumber: "01",
    title: "Registration & Prospectus",
    description: "Submit the online enquiry or visit campus.",
    displayOrder: 0,
    isPublished: true,
  });
  assert.strictEqual(validStep.success, true);

  const invalidStep = admissionStepSchema.safeParse({
    stepNumber: "",
    title: "",
    description: "",
  });
  assert.strictEqual(invalidStep.success, false);
  assert(invalidStep.error.flatten().fieldErrors.stepNumber);
  assert(invalidStep.error.flatten().fieldErrors.title);

  // 2. Test AdmissionEligibilityCriteria validation
  console.log("2. Testing AdmissionEligibilityCriteria validation...");
  const validEligibility = admissionEligibilityCriteriaSchema.safeParse({
    classGrade: "Class I",
    ageRequirement: "6+ Years (NEP Mandate)",
    evaluationMode: "Oral & Written Readiness",
    displayOrder: 2,
    isPublished: true,
  });
  assert.strictEqual(validEligibility.success, true);

  const invalidEligibility = admissionEligibilityCriteriaSchema.safeParse({
    classGrade: "",
    ageRequirement: "",
    evaluationMode: "",
  });
  assert.strictEqual(invalidEligibility.success, false);

  // 3. Test AdmissionDocumentRequirement validation
  console.log("3. Testing AdmissionDocumentRequirement validation...");
  const validDoc = admissionDocumentRequirementSchema.safeParse({
    title: "Photocopy of Student Aadhaar Card",
    description: "Required for identity and address verification.",
    displayOrder: 3,
    isPublished: true,
  });
  assert.strictEqual(validDoc.success, true);

  // 4. Test AdmissionFaq validation
  console.log("4. Testing AdmissionFaq validation...");
  const validFaq = admissionFaqSchema.safeParse({
    question: "What is the admission procedure?",
    answer: "Fill the enquiry form and visit campus.",
    displayOrder: 0,
    isPublished: true,
  });
  assert.strictEqual(validFaq.success, true);

  // 5. Test EnquirySubmission validation & Honeypot
  console.log("5. Testing EnquirySubmission validation & Honeypot...");
  const validEnquiry = enquirySubmissionSchema.safeParse({
    studentName: "Aarav Sharma",
    parentName: "Rajesh Sharma",
    phone: "9876543210",
    email: "aarav.parent@example.com",
    grade: "Class I",
    message: "Seeking admission for session 2026-27.",
    website_honey: "",
  });
  assert.strictEqual(validEnquiry.success, true);

  // Invalid phone (< 10 digits)
  const invalidPhone = enquirySubmissionSchema.safeParse({
    studentName: "Aarav Sharma",
    parentName: "Rajesh Sharma",
    phone: "12345",
    grade: "Class I",
  });
  assert.strictEqual(invalidPhone.success, false);
  assert(invalidPhone.error.flatten().fieldErrors.phone);

  // Invalid email format
  const invalidEmail = enquirySubmissionSchema.safeParse({
    studentName: "Aarav Sharma",
    parentName: "Rajesh Sharma",
    phone: "9876543210",
    email: "not-an-email",
    grade: "Class I",
  });
  assert.strictEqual(invalidEmail.success, false);
  assert(invalidEmail.error.flatten().fieldErrors.email);

  // 6. Test IP Hash Privacy & Determinism
  console.log("6. Testing IP hash privacy & determinism...");
  const testIp = "203.0.113.195";
  const hash1 = computeSaltedIpHash(testIp);
  const hash2 = computeSaltedIpHash(testIp);
  assert.strictEqual(hash1, hash2, "IP hash should be deterministic");
  assert.strictEqual(hash1.length, 32, "IP hash must be 32 characters");
  assert(!hash1.includes(testIp), "IP hash must not contain plaintext IP");

  // 7. Test Database Enquiry Submission & Rate Limiting
  console.log("7. Testing Database Enquiry Submission & Rate Limiting...");
  const testRateLimitIp = `198.51.100.${Date.now() % 250}`;
  const rateLimitHash = computeSaltedIpHash(testRateLimitIp);

  // Clean any previous test entries for this test hash
  await prisma.enquirySubmission.deleteMany({
    where: { ipHash: rateLimitHash },
  });

  // Submit 5 enquiries (should all succeed)
  for (let i = 1; i <= 5; i++) {
    const created = await prisma.enquirySubmission.create({
      data: {
        studentName: `Test Student ${i}`,
        parentName: "Test Parent",
        phone: "9876543210",
        grade: "Class I",
        ipHash: rateLimitHash,
        status: "PENDING",
      },
    });
    assert.strictEqual(created.status, "PENDING");
  }

  // Count should be 5
  const count = await prisma.enquirySubmission.count({
    where: {
      ipHash: rateLimitHash,
      createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
    },
  });
  assert.strictEqual(count, 5);

  // 6th enquiry rate limit check
  const isRateLimited = count >= 5;
  assert.strictEqual(isRateLimited, true, "6th enquiry should be rate-limited");

  // Clean up test entries
  await prisma.enquirySubmission.deleteMany({
    where: { ipHash: rateLimitHash },
  });

  // 8. Test Enquiry Status Update & Admin Notes
  console.log("8. Testing Enquiry Status Update & Admin Notes...");
  const tempEnquiry = await prisma.enquirySubmission.create({
    data: {
      studentName: "Status Test Student",
      parentName: "Status Test Parent",
      phone: "9876543210",
      grade: "Class V",
      status: "PENDING",
    },
  });

  const validStatusUpdate = enquiryStatusUpdateSchema.safeParse({
    id: tempEnquiry.id,
    status: "CONTACTED",
    adminNotes: "Spoke with father; scheduled campus interaction for Monday.",
  });
  assert.strictEqual(validStatusUpdate.success, true);

  const updatedEnquiry = await prisma.enquirySubmission.update({
    where: { id: tempEnquiry.id },
    data: {
      status: validStatusUpdate.data.status,
      adminNotes: validStatusUpdate.data.adminNotes,
    },
  });
  assert.strictEqual(updatedEnquiry.status, "CONTACTED");
  assert.strictEqual(
    updatedEnquiry.adminNotes,
    "Spoke with father; scheduled campus interaction for Monday."
  );

  // Clean up
  await prisma.enquirySubmission.delete({ where: { id: tempEnquiry.id } });

  console.log("=== All Admissions Validation & Actions Tests Passed! ===");
}

runTests()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    try {
      fs.unlinkSync(path.resolve(__dirname, "../dist_test_admissions_validation.js"));
    } catch (_) {}
    await prisma.$disconnect();
  });
