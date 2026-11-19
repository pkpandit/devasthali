/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert");
const { PrismaClient } = require("@prisma/client");

async function runTests() {
  console.log("=== Running Public Downloads API & Controlled Route Tests ===");

  const prisma = new PrismaClient();
  try {
    // 1. Test baseline query
    console.log("1. Querying public categories and documents...");
    const categories = await prisma.downloadCategory.findMany({
      where: {
        isPublished: true,
        documents: {
          some: {
            isPublished: true,
          },
        },
      },
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "asc" },
      ],
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        displayOrder: true,
        documents: {
          where: {
            isPublished: true,
          },
          orderBy: [
            { displayOrder: "asc" },
            { createdAt: "asc" },
          ],
          select: {
            id: true,
            title: true,
            description: true,
            fileUrl: true,
            fileStorageKey: true,
            fileSize: true,
            fileSizeBytes: true,
            fileType: true,
            displayOrder: true,
          },
        },
      },
    });

    assert.strictEqual(categories.length >= 3, true, "Should return at least 3 published categories");
    const totalDocs = categories.reduce((sum, c) => sum + c.documents.length, 0);
    assert.strictEqual(totalDocs >= 14, true, "Should return at least 14 published documents");
    console.log(`  Fetched ${categories.length} categories with ${totalDocs} documents.`);

    // 2. Test sorting: each category displayOrder should be non-decreasing
    console.log("2. Verifying displayOrder sort invariants...");
    for (let i = 1; i < categories.length; i++) {
      assert.strictEqual(
        categories[i].displayOrder >= categories[i - 1].displayOrder,
        true,
        `Category displayOrder should be ascending: ${categories[i - 1].displayOrder} <= ${categories[i].displayOrder}`
      );
    }
    for (const cat of categories) {
      for (let j = 1; j < cat.documents.length; j++) {
        assert.strictEqual(
          cat.documents[j].displayOrder >= cat.documents[j - 1].displayOrder,
          true,
          `Document displayOrder should be ascending within category ${cat.title}`
        );
      }
    }
    console.log("  Sorting invariant verified.");

    // 3. Test draft category exclusion & empty category exclusion
    console.log("3. Testing draft and empty category exclusion...");
    // Create an unpublished category
    const draftCat = await prisma.downloadCategory.create({
      data: {
        slug: "test-draft-cat",
        title: "Test Draft Category",
        displayOrder: 999,
        isPublished: false,
      },
    });

    // Create a published category with NO published documents
    const emptyCat = await prisma.downloadCategory.create({
      data: {
        slug: "test-empty-cat",
        title: "Test Empty Category",
        displayOrder: 998,
        isPublished: true,
      },
    });

    const categoriesAfterDraft = await prisma.downloadCategory.findMany({
      where: {
        isPublished: true,
        documents: {
          some: {
            isPublished: true,
          },
        },
      },
    });

    assert.strictEqual(
      categoriesAfterDraft.some((c) => c.id === draftCat.id),
      false,
      "Draft category must NOT be included in public results"
    );
    assert.strictEqual(
      categoriesAfterDraft.some((c) => c.id === emptyCat.id),
      false,
      "Empty category with 0 published docs must NOT be included in public results"
    );
    console.log("  Draft and empty category exclusion verified.");

    // 4. Test draft document exclusion
    console.log("4. Testing draft document exclusion...");
    const draftDoc = await prisma.downloadDocument.create({
      data: {
        title: "Draft Document Test",
        categoryId: categories[0].id,
        fileUrl: "/documents/original/draft_test.pdf",
        displayOrder: 999,
        isPublished: false,
      },
    });

    const categoryWithDraftDoc = await prisma.downloadCategory.findUnique({
      where: { id: categories[0].id },
      include: {
        documents: {
          where: { isPublished: true },
        },
      },
    });

    assert.strictEqual(
      categoryWithDraftDoc.documents.some((d) => d.id === draftDoc.id),
      false,
      "Draft document must NOT be returned in published query"
    );
    console.log("  Draft document exclusion verified.");

    // 5. Test Controlled Document Route query logic for DownloadDocument
    console.log("5. Testing Controlled Document query logic...");
    // Find one published document
    const pubDoc = categories[0].documents[0];
    const foundDoc = await prisma.downloadDocument.findFirst({
      where: {
        id: pubDoc.id,
        isPublished: true,
        category: { isPublished: true },
      },
      select: {
        id: true,
        title: true,
        fileStorageKey: true,
        category: { select: { slug: true } },
      },
    });
    assert.ok(foundDoc, "Published document should be found by route query");

    // Test that draft document is rejected
    const foundDraft = await prisma.downloadDocument.findFirst({
      where: {
        id: draftDoc.id,
        isPublished: true,
        category: { isPublished: true },
      },
    });
    assert.strictEqual(foundDraft, null, "Draft document must be rejected by controlled route query");

    // Clean up temporary test data
    await prisma.downloadDocument.delete({ where: { id: draftDoc.id } });
    await prisma.downloadCategory.delete({ where: { id: emptyCat.id } });
    await prisma.downloadCategory.delete({ where: { id: draftCat.id } });
    console.log("  Cleaned up temporary test records.");

    console.log("=== All Public Downloads API & Controlled Route Tests PASSED ===");
  } finally {
    await prisma.$disconnect();
  }
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
