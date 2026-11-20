/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
// Bypass Next.js 'server-only' package in standalone Node script
require.cache[require.resolve("server-only")] = { exports: {} };

const assert = require("node:assert");
const path = require("node:path");
const fs = require("node:fs");
const { execSync } = require("node:child_process");
const { PrismaClient } = require("@prisma/client");

// Bundle TypeScript storage for Node runtime
try {
  execSync(
    'npx esbuild lib/server/storage.ts --bundle --platform=node --outfile=dist_test_storage_api.js --external:@prisma/client --external:server-only --external:sharp',
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
} catch (e) {
  console.error("esbuild compilation failed:", e);
  process.exit(1);
}

async function runTests() {
  console.log("=== Running Public Facilities API & Media Serving Route Tests ===");

  const prisma = new PrismaClient();
  const tempBundle = path.resolve(__dirname, "../dist_test_storage_api.js");
  try {
    // 1. Baseline Query Test
    console.log("1. Querying public facility categories and items...");
    const categories = await prisma.facilityCategory.findMany({
      where: {
        isPublished: true,
        items: {
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
        items: {
          where: {
            isPublished: true,
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
            imageUrl: true,
            imageStorageKey: true,
            imageAlt: true,
            iconName: true,
            highlights: true,
            displayOrder: true,
          },
        },
      },
    });

    assert.strictEqual(categories.length >= 5, true, "Should return at least 5 seeded categories");
    const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);
    assert.strictEqual(totalItems >= 8, true, "Should return at least 8 seeded items");
    console.log(`  Fetched ${categories.length} categories with ${totalItems} items.`);

    // 2. Sorting Invariants
    console.log("2. Verifying displayOrder sort invariants...");
    for (let i = 1; i < categories.length; i++) {
      assert.strictEqual(
        categories[i].displayOrder >= categories[i - 1].displayOrder,
        true,
        `Category displayOrder ascending: ${categories[i - 1].displayOrder} <= ${categories[i].displayOrder}`
      );
    }
    for (const cat of categories) {
      for (let j = 1; j < cat.items.length; j++) {
        assert.strictEqual(
          cat.items[j].displayOrder >= cat.items[j - 1].displayOrder,
          true,
          `Item displayOrder ascending in category ${cat.title}`
        );
      }
    }
    console.log("  Sorting invariant verified.");

    // 3. Draft & Empty Category Exclusion
    console.log("3. Testing draft and empty category exclusion...");
    const draftCat = await prisma.facilityCategory.create({
      data: {
        slug: "test-draft-cat",
        title: "Test Draft Category",
        displayOrder: 999,
        isPublished: false,
      },
    });

    const emptyCat = await prisma.facilityCategory.create({
      data: {
        slug: "test-empty-cat",
        title: "Test Empty Category",
        displayOrder: 998,
        isPublished: true,
      },
    });

    const draftItemInDraftCat = await prisma.facilityItem.create({
      data: {
        categoryId: draftCat.id,
        slug: "draft-item-in-draft-cat",
        title: "Draft Item",
        description: "Desc",
        imageAlt: "Alt text here",
        iconName: "Home",
        displayOrder: 0,
        isPublished: true, // Item published but category draft
      },
    });

    const draftItemInEmptyCat = await prisma.facilityItem.create({
      data: {
        categoryId: emptyCat.id,
        slug: "draft-item-in-empty-cat",
        title: "Draft Item",
        description: "Desc",
        imageAlt: "Alt text here",
        iconName: "Home",
        displayOrder: 0,
        isPublished: false, // Category published but item draft
      },
    });

    // Re-query public categories
    const filteredCategories = await prisma.facilityCategory.findMany({
      where: {
        isPublished: true,
        items: {
          some: {
            isPublished: true,
          },
        },
      },
      select: { id: true, slug: true },
    });

    const filteredIds = new Set(filteredCategories.map((c) => c.id));
    assert.strictEqual(filteredIds.has(draftCat.id), false, "Draft category must be excluded");
    assert.strictEqual(filteredIds.has(emptyCat.id), false, "Category with only draft items must be excluded");

    // Clean up temporary records
    await prisma.facilityCategory.delete({ where: { id: draftCat.id } });
    await prisma.facilityCategory.delete({ where: { id: emptyCat.id } });
    console.log("  Draft and empty category exclusion verified.");

    // 4. Test DTO Projection & Zero Localhost URLs
    console.log("4. Verifying DTO structure and zero localhost URLs...");
    for (const cat of categories) {
      assert.ok(cat.id, "Category must have ID");
      assert.ok(cat.slug, "Category must have slug");
      assert.ok(cat.title, "Category must have title");
      for (const item of cat.items) {
        assert.ok(item.id, "Item must have ID");
        assert.ok(item.slug, "Item must have slug");
        assert.ok(item.title, "Item must have title");
        assert.ok(item.description, "Item must have description");
        assert.ok(item.imageAlt, "Item must have imageAlt");
        assert.ok(item.iconName, "Item must have iconName");
        assert.ok(Array.isArray(item.highlights), "Item must have highlights array");

        // Verify image URL does not contain localhost or 127.0.0.1
        if (item.imageUrl) {
          assert.strictEqual(item.imageUrl.includes("localhost"), false, "No localhost URLs allowed");
          assert.strictEqual(item.imageUrl.includes("127.0.0.1"), false, "No 127.0.0.1 URLs allowed");
        }
      }
    }
    console.log("  DTO structure and URL hygiene verified.");

    // 5. Media Route Filesystem & Header Safeguards
    console.log("5. Testing media route safeguards...");
    const facilitiesUploadDir = path.resolve(__dirname, "../storage/uploads/facilities");
    fs.mkdirSync(facilitiesUploadDir, { recursive: true });

    const dummyUuid = "00000000-0000-0000-0000-000000000001";
    const dummyKey = `facilities/fac_${dummyUuid}.webp`;
    const dummyFilePath = path.resolve(facilitiesUploadDir, `fac_${dummyUuid}.webp`);
    fs.writeFileSync(dummyFilePath, Buffer.from("RIFFdummyWEBP"));

    try {
      assert.strictEqual(fs.existsSync(dummyFilePath), true, "Dummy facility image must exist");

      // Verify path containment
      const { resolveSafePath, isValidManagedFacilityKey } = require(tempBundle);
      assert.strictEqual(isValidManagedFacilityKey(dummyKey), true, "Dummy key must be valid managed facility key");
      const resolved = resolveSafePath(dummyKey);
      assert.strictEqual(resolved, dummyFilePath, "Resolved path must match upload root location");

      // Traversal attempt
      assert.throws(() => {
        resolveSafePath("facilities/../fac_00000000-0000-0000-0000-000000000001.webp");
      }, /Invalid managed storage key format/);
      console.log("  Media path containment & validation verified.");
    } finally {
      if (fs.existsSync(dummyFilePath)) {
        fs.unlinkSync(dummyFilePath);
      }
      if (fs.existsSync(tempBundle)) {
        fs.unlinkSync(tempBundle);
      }
    }

    console.log("=== All Public Facilities API & Media Route Tests PASSED ===");
  } finally {
    await prisma.$disconnect();
  }
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
