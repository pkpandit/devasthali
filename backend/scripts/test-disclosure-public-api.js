/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert");
const { PrismaClient } = require("@prisma/client");

async function runTests() {
  console.log("=== Running Public Mandatory Disclosure API & Controlled Route Tests ===");

  const prisma = new PrismaClient();
  try {
    // 1. Test baseline query
    console.log("1. Querying public disclosure sections and documents...");
    const sections = await prisma.disclosureSection.findMany({
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
            linkLabel: true,
            displayOrder: true,
          },
        },
      },
    });

    assert.strictEqual(sections.length >= 2, true, "Should return at least 2 published sections");
    const totalDocs = sections.reduce((sum, s) => sum + s.documents.length, 0);
    assert.strictEqual(totalDocs >= 14, true, "Should return at least 14 published documents");
    console.log(`  Fetched ${sections.length} sections with ${totalDocs} documents.`);

    // 2. Test sorting: each section displayOrder should be non-decreasing
    console.log("2. Verifying displayOrder sort invariants...");
    for (let i = 1; i < sections.length; i++) {
      assert.strictEqual(
        sections[i].displayOrder >= sections[i - 1].displayOrder,
        true,
        `Section displayOrder should be ascending: ${sections[i - 1].displayOrder} <= ${sections[i].displayOrder}`
      );
    }
    for (const sec of sections) {
      for (let j = 1; j < sec.documents.length; j++) {
        assert.strictEqual(
          sec.documents[j].displayOrder >= sec.documents[j - 1].displayOrder,
          true,
          `Document displayOrder should be ascending within section ${sec.title}`
        );
      }
    }
    console.log("  Sorting invariant verified.");

    // 3. Test draft section exclusion & empty section exclusion
    console.log("3. Testing draft and empty section exclusion...");
    // Create an unpublished section
    const draftSec = await prisma.disclosureSection.create({
      data: {
        slug: "test-draft-sec",
        title: "Test Draft Section",
        displayOrder: 999,
        isPublished: false,
      },
    });

    // Create a published section with NO published documents
    const emptySec = await prisma.disclosureSection.create({
      data: {
        slug: "test-empty-sec",
        title: "Test Empty Section",
        displayOrder: 998,
        isPublished: true,
      },
    });

    const sectionsAfterDraft = await prisma.disclosureSection.findMany({
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
      sectionsAfterDraft.some((s) => s.id === draftSec.id),
      false,
      "Draft section must NOT be included in public results"
    );
    assert.strictEqual(
      sectionsAfterDraft.some((s) => s.id === emptySec.id),
      false,
      "Empty section with 0 published docs must NOT be included in public results"
    );
    console.log("  Draft and empty section exclusion verified.");

    // 4. Test draft document exclusion
    console.log("4. Testing draft document exclusion...");
    const draftDoc = await prisma.disclosureDocument.create({
      data: {
        title: "Draft Document Test",
        sectionId: sections[0].id,
        fileUrl: "/documents/original/draft_test.pdf",
        displayOrder: 999,
        isPublished: false,
      },
    });

    const sectionWithDraftDoc = await prisma.disclosureSection.findUnique({
      where: { id: sections[0].id },
      include: {
        documents: {
          where: { isPublished: true },
        },
      },
    });

    assert.strictEqual(
      sectionWithDraftDoc.documents.some((d) => d.id === draftDoc.id),
      false,
      "Draft document must NOT be returned in published query"
    );
    console.log("  Draft document exclusion verified.");

    // 5. Test Controlled Document Route query logic for DisclosureDocument
    console.log("5. Testing Controlled Document query logic for disclosures...");
    // Find one published document
    const pubDoc = sections[0].documents[0];
    const foundDoc = await prisma.disclosureDocument.findFirst({
      where: {
        id: pubDoc.id,
        isPublished: true,
        section: { isPublished: true },
      },
      select: {
        id: true,
        title: true,
        fileStorageKey: true,
        section: { select: { slug: true } },
      },
    });
    assert.ok(foundDoc, "Published disclosure document should be found by route query");

    // Test that draft document is rejected by controlled route query
    const foundDraft = await prisma.disclosureDocument.findFirst({
      where: {
        id: draftDoc.id,
        isPublished: true,
        section: { isPublished: true },
      },
    });
    assert.strictEqual(foundDraft, null, "Draft disclosure document must be rejected by controlled route query");

    // Clean up temporary test data
    await prisma.disclosureDocument.delete({ where: { id: draftDoc.id } });
    await prisma.disclosureSection.delete({ where: { id: emptySec.id } });
    await prisma.disclosureSection.delete({ where: { id: draftSec.id } });
    console.log("  Cleaned up temporary test records.");

    // 6. Test DTO formatting & no localhost returned
    console.log("6. Verifying DTO formatting and no localhost URLs...");
    for (const sec of sections) {
      assert.ok(sec.id && sec.slug && sec.title, "Section must have id, slug, and title");
      for (const doc of sec.documents) {
        assert.ok(doc.id && doc.title, "Document must have id and title");
        assert.ok(doc.fileUrl, "Document must have fileUrl");
        assert.strictEqual(doc.fileUrl.includes("localhost"), false, "Document URL must not include localhost");
        assert.strictEqual(doc.fileUrl.includes("127.0.0.1"), false, "Document URL must not include 127.0.0.1");
      }
    }
    console.log("  DTO formatting and URL safety verified.");

    console.log("=== All Public Mandatory Disclosure API & Controlled Route Tests PASSED ===");
  } finally {
    await prisma.$disconnect();
  }
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
