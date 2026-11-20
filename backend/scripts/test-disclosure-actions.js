/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const assert = require("node:assert");
const path = require("node:path");
const fs = require("node:fs");
const { PrismaClient } = require("@prisma/client");

async function runTests() {
  console.log("=== Running Mandatory Public Disclosure Validation & Actions Tests ===");

  const {
    createDisclosureSectionSchema,
    updateDisclosureSectionSchema,
    createDisclosureDocumentSchema,
    updateDisclosureDocumentSchema,
    disclosureLinkSchema,
    computeSectionDiff,
    computeDocumentDiff,
    MANAGED_DISCLOSURE_STORAGE_KEY_REGEX,
    ANY_MANAGED_DOCUMENT_KEY_REGEX,
  } = require("../dist_test_disclosure_validation");

  // 1. Test MANAGED_DISCLOSURE_STORAGE_KEY_REGEX
  console.log("1. Testing storage key regexes...");
  const validNoticeKey = "documents/notices/doc_12345678-1234-1234-1234-123456789abc.pdf";
  const validDownloadKey = "documents/downloads/doc_12345678-1234-1234-1234-123456789abc.pdf";
  const validDisclosureKey = "documents/disclosures/doc_12345678-1234-1234-1234-123456789abc.pdf";
  const invalidKey = "documents/disclosures/../doc.pdf";
  const invalidFolder = "documents/other/doc_12345678-1234-1234-1234-123456789abc.pdf";

  assert.strictEqual(MANAGED_DISCLOSURE_STORAGE_KEY_REGEX.test(validDisclosureKey), true, "Valid disclosure key should match");
  assert.strictEqual(MANAGED_DISCLOSURE_STORAGE_KEY_REGEX.test(validNoticeKey), false, "Notice key should NOT match disclosure regex");
  assert.strictEqual(MANAGED_DISCLOSURE_STORAGE_KEY_REGEX.test(validDownloadKey), false, "Download key should NOT match disclosure regex");

  assert.strictEqual(ANY_MANAGED_DOCUMENT_KEY_REGEX.test(validDisclosureKey), true, "Valid disclosure key should match ANY regex");
  assert.strictEqual(ANY_MANAGED_DOCUMENT_KEY_REGEX.test(validDownloadKey), true, "Valid download key should match ANY regex");
  assert.strictEqual(ANY_MANAGED_DOCUMENT_KEY_REGEX.test(validNoticeKey), true, "Valid notice key should match ANY regex");
  assert.strictEqual(ANY_MANAGED_DOCUMENT_KEY_REGEX.test(invalidKey), false, "Invalid traversal key should not match");
  assert.strictEqual(ANY_MANAGED_DOCUMENT_KEY_REGEX.test(invalidFolder), false, "Invalid folder should not match");
  console.log("  Regex tests passed.");

  // 2. Test disclosureLinkSchema
  console.log("2. Testing disclosureLinkSchema...");
  assert.strictEqual(disclosureLinkSchema.safeParse("/documents/original/test.pdf").success, true, "Root relative path should pass");
  assert.strictEqual(disclosureLinkSchema.safeParse("https://example.com/files/doc.pdf").success, true, "HTTPS FQDN should pass");
  assert.strictEqual(disclosureLinkSchema.safeParse("http://insecure.com/doc.pdf").success, false, "HTTP should fail");
  assert.strictEqual(disclosureLinkSchema.safeParse("http://localhost:3000/doc.pdf").success, false, "Localhost HTTP should fail");
  assert.strictEqual(disclosureLinkSchema.safeParse("https://localhost/doc.pdf").success, false, "Localhost HTTPS should fail");
  assert.strictEqual(disclosureLinkSchema.safeParse("https://127.0.0.1/doc.pdf").success, false, "127.0.0.1 should fail");
  assert.strictEqual(disclosureLinkSchema.safeParse("/documents/../etc/passwd").success, false, "Path traversal should fail");
  assert.strictEqual(disclosureLinkSchema.safeParse("javascript:alert(1)").success, false, "Javascript scheme should fail");
  console.log("  disclosureLinkSchema tests passed.");

  // 3. Test Section Schemas
  console.log("3. Testing Section Schemas...");
  const validSec = createDisclosureSectionSchema.safeParse({
    title: "CBSE Statutory Documents",
    description: "Legal and safety compliance records",
    displayOrder: 1,
    isPublished: true,
  });
  assert.strictEqual(validSec.success, true, "Valid section should pass");

  const invalidSec = createDisclosureSectionSchema.safeParse({
    title: "A", // too short
  });
  assert.strictEqual(invalidSec.success, false, "Short section title should fail");

  const updateSec = updateDisclosureSectionSchema.safeParse({
    id: "clx1234567890123456789012",
    title: "Updated Section Title",
    displayOrder: 2,
    isPublished: false,
  });
  assert.strictEqual(updateSec.success, true, "Valid section update should pass");
  console.log("  Section schemas passed.");

  // 4. Test Document Schemas
  console.log("4. Testing Document Schemas...");
  const validDoc = createDisclosureDocumentSchema.safeParse({
    sectionId: "clx1234567890123456789012",
    title: "Building Safety Certificate 2026",
    description: "Approved by PWD",
    fileUrl: "/documents/original/building-safety.pdf",
    displayOrder: 0,
    isPublished: true,
  });
  assert.strictEqual(validDoc.success, true, "Valid document should pass");

  const validManagedDoc = createDisclosureDocumentSchema.safeParse({
    sectionId: "clx1234567890123456789012",
    title: "Building Safety Certificate 2026",
    fileStorageKey: "documents/disclosures/doc_12345678-1234-1234-1234-123456789abc.pdf",
    fileSize: "231 KB",
    fileSizeBytes: 236879,
    displayOrder: 0,
    isPublished: true,
  });
  assert.strictEqual(validManagedDoc.success, true, "Valid managed document should pass");

  const noFileDoc = createDisclosureDocumentSchema.safeParse({
    sectionId: "clx1234567890123456789012",
    title: "Doc Without File",
    // neither fileUrl nor fileStorageKey
  });
  assert.strictEqual(noFileDoc.success, false, "Document without file or link should fail");
  console.log("  Document schemas passed.");

  // 5. Test Diff Computers
  console.log("5. Testing Diff Computers...");
  const secBefore = { title: "Old Title", description: "Old Desc", displayOrder: 0 };
  const secAfter = { title: "New Title", displayOrder: 1 };
  const secDiff = computeSectionDiff(secBefore, secAfter);
  assert.deepStrictEqual(secDiff, {
    title: { before: "Old Title", after: "New Title" },
    displayOrder: { before: 0, after: 1 },
  });

  const docBefore = { title: "Old Doc", isPublished: true };
  const docAfter = { isPublished: false };
  const docDiff = computeDocumentDiff(docBefore, docAfter);
  assert.deepStrictEqual(docDiff, {
    isPublished: { before: true, after: false },
  });
  console.log("  Diff computers passed.");

  // 6. Database Integration & Cascade Delete Tests
  console.log("6. Testing Database Relationships & Cascade Delete...");
  const prisma = new PrismaClient();
  try {
    const sectionsCount = await prisma.disclosureSection.count();
    const documentsCount = await prisma.disclosureDocument.count();
    console.log(`  Current sections: ${sectionsCount}, documents: ${documentsCount}`);
    assert.ok(sectionsCount >= 2, "Baseline should have at least 2 seeded sections");
    assert.ok(documentsCount >= 14, "Baseline should have at least 14 seeded documents");

    // Create a temporary section and document
    const testSec = await prisma.disclosureSection.create({
      data: {
        slug: `test-sec-${Date.now()}`,
        title: "Temporary Test Section",
        description: "Created by automated test",
        displayOrder: 99,
        isPublished: true,
      },
    });

    const testDoc = await prisma.disclosureDocument.create({
      data: {
        title: "Temporary Test Disclosure Document",
        description: "Created by automated test",
        sectionId: testSec.id,
        fileUrl: "/documents/original/test_disclosure_doc.pdf",
        displayOrder: 0,
        isPublished: true,
      },
    });

    assert.ok(testDoc.id, "Test document should be created");

    // Test cascade delete
    await prisma.disclosureSection.delete({
      where: { id: testSec.id },
    });

    const docAfterDelete = await prisma.disclosureDocument.findUnique({
      where: { id: testDoc.id },
    });
    assert.strictEqual(docAfterDelete, null, "Document should be cascade deleted with section");

    // Verify baseline seed is unaffected
    const finalSecCount = await prisma.disclosureSection.count();
    const finalDocCount = await prisma.disclosureDocument.count();
    assert.strictEqual(finalSecCount, sectionsCount, "Section count should match baseline");
    assert.strictEqual(finalDocCount, documentsCount, "Document count should match baseline");
    console.log("  Database tests and seed integrity verified.");
  } finally {
    await prisma.$disconnect();
  }

  console.log("=== All Mandatory Public Disclosure Validation Tests PASSED ===");
}

const { execSync } = require("node:child_process");

const tempCjsPath = path.resolve(__dirname, "../dist_test_disclosure_validation.js");
try {
  execSync(`npx esbuild backend/lib/validation/disclosure.ts --outfile=backend/dist_test_disclosure_validation.js --format=cjs --platform=node`, {
    cwd: path.resolve(__dirname, "../.."),
    stdio: "inherit",
  });

  runTests()
    .then(() => {
      if (fs.existsSync(tempCjsPath)) fs.unlinkSync(tempCjsPath);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Test failed:", err);
      if (fs.existsSync(tempCjsPath)) fs.unlinkSync(tempCjsPath);
      process.exit(1);
    });
} catch (e) {
  console.error("Setup failed:", e);
  if (fs.existsSync(tempCjsPath)) fs.unlinkSync(tempCjsPath);
  process.exit(1);
}
