/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const assert = require("node:assert");
const path = require("node:path");
const fs = require("node:fs");
const { PrismaClient } = require("@prisma/client");

async function runTests() {
  console.log("=== Running Downloads Validation & Actions Tests ===");

  const {
    createDownloadCategorySchema,
    updateDownloadCategorySchema,
    createDownloadDocumentSchema,
    updateDownloadDocumentSchema,
    downloadLinkSchema,
    computeCategoryDiff,
    computeDocumentDiff,
    MANAGED_DOWNLOAD_STORAGE_KEY_REGEX,
    ANY_MANAGED_DOCUMENT_KEY_REGEX,
  } = require("../dist_test_validation");

  // 1. Test MANAGED_DOWNLOAD_STORAGE_KEY_REGEX
  console.log("1. Testing storage key regexes...");
  const validNoticeKey = "documents/notices/doc_12345678-1234-1234-1234-123456789abc.pdf";
  const validDownloadKey = "documents/downloads/doc_12345678-1234-1234-1234-123456789abc.pdf";
  const invalidKey = "documents/downloads/../doc.pdf";
  const invalidFolder = "documents/other/doc_12345678-1234-1234-1234-123456789abc.pdf";

  assert.strictEqual(MANAGED_DOWNLOAD_STORAGE_KEY_REGEX.test(validDownloadKey), true, "Valid download key should match");
  assert.strictEqual(MANAGED_DOWNLOAD_STORAGE_KEY_REGEX.test(validNoticeKey), false, "Notice key should NOT match download regex");
  assert.strictEqual(ANY_MANAGED_DOCUMENT_KEY_REGEX.test(validDownloadKey), true, "Valid download key should match ANY regex");
  assert.strictEqual(ANY_MANAGED_DOCUMENT_KEY_REGEX.test(validNoticeKey), true, "Valid notice key should match ANY regex");
  assert.strictEqual(ANY_MANAGED_DOCUMENT_KEY_REGEX.test(invalidKey), false, "Invalid traversal key should not match");
  assert.strictEqual(ANY_MANAGED_DOCUMENT_KEY_REGEX.test(invalidFolder), false, "Invalid folder should not match");
  console.log("  Regex tests passed.");

  // 2. Test downloadLinkSchema
  console.log("2. Testing downloadLinkSchema...");
  assert.strictEqual(downloadLinkSchema.safeParse("/documents/original/test.pdf").success, true, "Root relative path should pass");
  assert.strictEqual(downloadLinkSchema.safeParse("https://example.com/files/doc.pdf").success, true, "HTTPS FQDN should pass");
  assert.strictEqual(downloadLinkSchema.safeParse("http://insecure.com/doc.pdf").success, false, "HTTP should fail");
  assert.strictEqual(downloadLinkSchema.safeParse("http://localhost:3000/doc.pdf").success, false, "Localhost HTTP should fail");
  assert.strictEqual(downloadLinkSchema.safeParse("https://localhost/doc.pdf").success, false, "Localhost HTTPS should fail");
  assert.strictEqual(downloadLinkSchema.safeParse("https://127.0.0.1/doc.pdf").success, false, "127.0.0.1 should fail");
  assert.strictEqual(downloadLinkSchema.safeParse("/documents/../etc/passwd").success, false, "Path traversal should fail");
  assert.strictEqual(downloadLinkSchema.safeParse("javascript:alert(1)").success, false, "Javascript scheme should fail");
  console.log("  downloadLinkSchema tests passed.");

  // 3. Test Category Schemas
  console.log("3. Testing Category Schemas...");
  const catValid = createDownloadCategorySchema.safeParse({
    title: "School Policies",
    description: "All official school policies and guidelines.",
    displayOrder: 1,
    isPublished: true,
  });
  assert.strictEqual(catValid.success, true, "Valid category should succeed");

  const catShort = createDownloadCategorySchema.safeParse({
    title: "A",
  });
  assert.strictEqual(catShort.success, false, "Too short title should fail");
  console.log("  Category schema tests passed.");

  // 4. Test Document Schemas
  console.log("4. Testing Document Schemas...");
  const docValidUrl = createDownloadDocumentSchema.safeParse({
    title: "Student Code of Conduct",
    categoryId: "cat_123",
    fileUrl: "/documents/original/code_of_conduct.pdf",
    displayOrder: 0,
  });
  assert.strictEqual(docValidUrl.success, true, "Document with fileUrl should succeed");

  const docValidStorage = createDownloadDocumentSchema.safeParse({
    title: "Student Code of Conduct",
    categoryId: "cat_123",
    fileStorageKey: validDownloadKey,
    displayOrder: 0,
  });
  assert.strictEqual(docValidStorage.success, true, "Document with fileStorageKey should succeed");

  const docMissingFile = createDownloadDocumentSchema.safeParse({
    title: "Student Code of Conduct",
    categoryId: "cat_123",
    displayOrder: 0,
  });
  assert.strictEqual(docMissingFile.success, false, "Document without url or storage key should fail");
  console.log("  Document schema tests passed.");

  // 5. Test Diff Calculators
  console.log("5. Testing Diff Calculators...");
  const catDiff = computeCategoryDiff(
    { title: "Old Title", description: "Old Desc", displayOrder: 0, isPublished: true },
    { title: "New Title", description: "Old Desc", displayOrder: 1, isPublished: false }
  );
  assert.deepStrictEqual(catDiff, {
    title: { from: "Old Title", to: "New Title" },
    displayOrder: { from: 0, to: 1 },
    isPublished: { from: true, to: false },
  });

  const docDiff = computeDocumentDiff(
    {
      title: "Doc 1",
      description: null,
      categoryId: "cat_1",
      fileUrl: "/doc.pdf",
      fileStorageKey: "documents/downloads/doc_12345678-1234-1234-1234-123456789abc.pdf",
      fileSizeBytes: 1000,
      fileSize: "1 KB",
      fileType: "application/pdf",
      displayOrder: 0,
      isPublished: true,
    },
    {
      title: "Doc 1",
      categoryId: "cat_1",
      fileUrl: "/doc.pdf",
      fileStorageKey: "documents/downloads/doc_87654321-4321-4321-4321-cba987654321.pdf",
      fileSizeBytes: 2000,
      fileSize: "2 KB",
      fileType: "application/pdf",
      displayOrder: 0,
      isPublished: true,
    }
  );
  assert.deepStrictEqual(docDiff, {
    fileStorageKey: { from: "[MANAGED_FILE]", to: "[MANAGED_FILE]" },
    fileSizeBytes: { from: 1000, to: 2000 },
    fileSize: { from: "1 KB", to: "2 KB" },
  });
  console.log("  Diff calculators passed.");

  // 6. Test Database operations & seeding integrity
  console.log("6. Testing Database operations and seed integrity...");
  const prisma = new PrismaClient();
  try {
    const categoriesCount = await prisma.downloadCategory.count();
    const documentsCount = await prisma.downloadDocument.count();
    assert.strictEqual(categoriesCount >= 3, true, "Database should have at least 3 categories");
    assert.strictEqual(documentsCount >= 14, true, "Database should have at least 14 documents");

    // Create a temporary category and document, test cascade deletion
    const testCat = await prisma.downloadCategory.create({
      data: {
        slug: "temp-test-category",
        title: "Temporary Test Category",
        description: "Created by automated test",
        displayOrder: 99,
        isPublished: true,
      },
    });

    const testDoc = await prisma.downloadDocument.create({
      data: {
        title: "Temporary Test Document",
        description: "Created by automated test",
        categoryId: testCat.id,
        fileUrl: "/documents/original/test_doc.pdf",
        displayOrder: 0,
        isPublished: true,
      },
    });

    assert.ok(testDoc.id, "Test document should be created");

    // Test cascade delete
    await prisma.downloadCategory.delete({
      where: { id: testCat.id },
    });

    const docAfterDelete = await prisma.downloadDocument.findUnique({
      where: { id: testDoc.id },
    });
    assert.strictEqual(docAfterDelete, null, "Document should be cascade deleted with category");

    // Verify baseline seed is unaffected
    const finalCatCount = await prisma.downloadCategory.count();
    const finalDocCount = await prisma.downloadDocument.count();
    assert.strictEqual(finalCatCount, categoriesCount, "Category count should match baseline");
    assert.strictEqual(finalDocCount, documentsCount, "Document count should match baseline");
    console.log("  Database tests and seed integrity verified.");
  } finally {
    await prisma.$disconnect();
  }

  console.log("=== All Downloads Validation Tests PASSED ===");
}

const { execSync } = require("node:child_process");

const tempCjsPath = path.resolve(__dirname, "../dist_test_validation.js");
try {
  execSync(`npx esbuild backend/lib/validation/downloads.ts --outfile=backend/dist_test_validation.js --format=cjs --platform=node`, {
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
