/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
// Bypass Next.js 'server-only' package in standalone Node script
require.cache[require.resolve("server-only")] = { exports: {} };

const assert = require("node:assert");
const path = require("node:path");
const fs = require("node:fs");
const { execSync } = require("node:child_process");
const { PrismaClient } = require("@prisma/client");

// Bundle TypeScript validation and storage for Node runtime
try {
  execSync(
    'npx esbuild lib/validation/facilities.ts --bundle --platform=node --outfile=dist_test_facility_validation.js --external:@prisma/client --external:server-only',
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
  execSync(
    'npx esbuild lib/server/storage.ts --bundle --platform=node --outfile=dist_test_storage.js --external:@prisma/client --external:server-only --external:sharp',
    { cwd: path.resolve(__dirname, ".."), stdio: "inherit" }
  );
} catch (e) {
  console.error("esbuild compilation failed:", e);
  process.exit(1);
}

async function runTests() {
  console.log("=== Running Facilities Validation & Actions Tests ===");

  const {
    ALLOWED_FACILITY_ICONS,
    validateFacilityImageUrl,
    facilityCategoryCreateSchema,
    facilityCategoryUpdateSchema,
    reorderFacilityCategoriesSchema,
    toggleFacilityCategoryStatusSchema,
    deleteFacilityCategorySchema,
    facilityItemCreateSchema,
    facilityItemUpdateSchema,
    reorderFacilityItemsSchema,
    toggleFacilityItemStatusSchema,
    deleteFacilityItemSchema,
    computeCategoryDiff,
    computeFacilityItemDiff,
  } = require("../dist_test_facility_validation");

  const {
    MANAGED_KEY_REGEX,
    MANAGED_FACILITY_KEY_REGEX,
    isValidManagedKey,
    isValidManagedFacilityKey,
    isValidManagedMediaKey,
  } = require("../dist_test_storage");

  // 1. Test Storage Key Regex Invariants
  console.log("1. Testing managed media storage key regexes...");
  const validTopperKey = "toppers/top_12345678-1234-1234-1234-123456789abc.webp";
  const validGalleryKey = "gallery/gal_12345678-1234-1234-1234-123456789abc.webp";
  const validEventKey = "events/eve_12345678-1234-1234-1234-123456789abc.webp";
  const validFacilityKey = "facilities/fac_12345678-1234-1234-1234-123456789abc.webp";
  const invalidFacilityKey = "facilities/fac_invalid-uuid.webp";
  const traversalKey = "facilities/../fac_12345678-1234-1234-1234-123456789abc.webp";

  // Existing regex must remain untouched
  assert.strictEqual(MANAGED_KEY_REGEX.test(validTopperKey), true, "MANAGED_KEY_REGEX must match topper key");
  assert.strictEqual(MANAGED_KEY_REGEX.test(validGalleryKey), true, "MANAGED_KEY_REGEX must match gallery key");
  assert.strictEqual(MANAGED_KEY_REGEX.test(validEventKey), true, "MANAGED_KEY_REGEX must match event key");
  assert.strictEqual(MANAGED_KEY_REGEX.test(validFacilityKey), false, "Existing MANAGED_KEY_REGEX must NOT match facility key (unaltered invariant)");

  // New facility regex must match facilities
  assert.strictEqual(MANAGED_FACILITY_KEY_REGEX.test(validFacilityKey), true, "MANAGED_FACILITY_KEY_REGEX must match valid facility key");
  assert.strictEqual(MANAGED_FACILITY_KEY_REGEX.test(invalidFacilityKey), false, "MANAGED_FACILITY_KEY_REGEX must reject invalid uuid");
  assert.strictEqual(MANAGED_FACILITY_KEY_REGEX.test(traversalKey), false, "MANAGED_FACILITY_KEY_REGEX must reject traversal");
  assert.strictEqual(MANAGED_FACILITY_KEY_REGEX.test(validTopperKey), false, "MANAGED_FACILITY_KEY_REGEX must reject topper key");

  // Helper validation
  assert.strictEqual(isValidManagedFacilityKey(validFacilityKey), true);
  assert.strictEqual(isValidManagedMediaKey(validFacilityKey), true);
  assert.strictEqual(isValidManagedMediaKey(validTopperKey), true);
  assert.strictEqual(isValidManagedMediaKey(invalidFacilityKey), false);
  console.log("  Storage key regex tests passed.");

  // 2. Test URL Validation
  console.log("2. Testing validateFacilityImageUrl...");
  assert.strictEqual(validateFacilityImageUrl("/images/facilities/campus-grounds.jpg").valid, true, "Root relative path allowed");
  assert.strictEqual(validateFacilityImageUrl("/api/public/media/facilities/fac_12345678-1234-1234-1234-123456789abc.webp").valid, true, "Managed media URL allowed");
  assert.strictEqual(validateFacilityImageUrl("https://cdn.example.com/facility.jpg").valid, true, "Secure HTTPS allowed");
  assert.strictEqual(validateFacilityImageUrl("http://insecure.com/facility.jpg").valid, false, "Insecure HTTP rejected");
  assert.strictEqual(validateFacilityImageUrl("http://localhost:3000/facility.jpg").valid, false, "Localhost HTTP rejected");
  assert.strictEqual(validateFacilityImageUrl("http://127.0.0.1:3001/facility.jpg").valid, false, "127.0.0.1 rejected");
  assert.strictEqual(validateFacilityImageUrl("https://localhost/facility.jpg").valid, false, "Localhost HTTPS rejected");
  assert.strictEqual(validateFacilityImageUrl("javascript:alert(1)").valid, false, "Javascript scheme rejected");
  assert.strictEqual(validateFacilityImageUrl("data:image/png;base64,...").valid, false, "Data scheme rejected");
  assert.strictEqual(validateFacilityImageUrl("//cdn.example.com/photo.jpg").valid, false, "Protocol-relative rejected");
  console.log("  URL validation tests passed.");

  // 3. Test Icon Allow-list
  console.log("3. Testing Icon Allow-list...");
  assert.ok(ALLOWED_FACILITY_ICONS.includes("MonitorPlay"));
  assert.ok(ALLOWED_FACILITY_ICONS.includes("FlaskConical"));
  assert.ok(ALLOWED_FACILITY_ICONS.includes("Cpu"));
  assert.ok(ALLOWED_FACILITY_ICONS.includes("Home"));
  assert.ok(ALLOWED_FACILITY_ICONS.includes("Trophy"));
  assert.ok(ALLOWED_FACILITY_ICONS.includes("Bus"));
  assert.ok(ALLOWED_FACILITY_ICONS.includes("BookOpen"));
  assert.ok(ALLOWED_FACILITY_ICONS.includes("HeartPulse"));
  assert.strictEqual(ALLOWED_FACILITY_ICONS.includes("InvalidIconName"), false);
  console.log("  Icon allow-list verified.");

  // 4. Test Category Schemas
  console.log("4. Testing Category Schemas...");
  const validCat = {
    title: "Technology Labs",
    description: "Advanced computing and AI infrastructure.",
    displayOrder: 1,
    isPublished: true,
  };
  assert.strictEqual(facilityCategoryCreateSchema.safeParse(validCat).success, true);
  assert.strictEqual(facilityCategoryCreateSchema.safeParse({ ...validCat, title: "" }).success, false, "Empty title rejected");
  assert.strictEqual(facilityCategoryCreateSchema.safeParse({ ...validCat, description: "a".repeat(501) }).success, false, "Description > 500 rejected");

  const validCatUpdate = {
    id: "cat_test_123",
    title: "Updated Title",
    description: null,
    displayOrder: 2,
    isPublished: false,
  };
  assert.strictEqual(facilityCategoryUpdateSchema.safeParse(validCatUpdate).success, true);
  assert.strictEqual(facilityCategoryUpdateSchema.safeParse({ ...validCatUpdate, id: "" }).success, false, "Empty ID rejected");
  assert.strictEqual(reorderFacilityCategoriesSchema.safeParse({ orders: [{ id: "cat_1", displayOrder: 0 }] }).success, true);
  assert.strictEqual(reorderFacilityCategoriesSchema.safeParse({ orders: [] }).success, false, "Empty orders rejected");
  assert.strictEqual(toggleFacilityCategoryStatusSchema.safeParse({ id: "cat_1", isPublished: true }).success, true);
  console.log("  Category schemas passed.");

  // 5. Test Facility Item Schemas
  console.log("5. Testing Facility Item Schemas...");
  const validItem = {
    categoryId: "cat_academic",
    title: "Robotics and Automation Lab",
    description: "Dedicated learning center for STEM robotics kits and microcontrollers.",
    imageUrl: "/images/facilities/science-lab.jpg",
    imageStorageKey: validFacilityKey,
    imageAlt: "Students programming humanoid robotics in the automation lab",
    iconName: "Cpu",
    highlights: ["STEM Kits", "Python MicroPython", "Certified Lab Instructor"],
    displayOrder: 0,
    isPublished: true,
  };
  assert.strictEqual(facilityItemCreateSchema.safeParse(validItem).success, true);
  assert.strictEqual(facilityItemCreateSchema.safeParse({ ...validItem, title: "" }).success, false, "Empty title rejected");
  assert.strictEqual(facilityItemCreateSchema.safeParse({ ...validItem, description: "" }).success, false, "Empty description rejected");
  assert.strictEqual(facilityItemCreateSchema.safeParse({ ...validItem, imageAlt: "" }).success, false, "Empty image alt rejected");
  assert.strictEqual(facilityItemCreateSchema.safeParse({ ...validItem, imageAlt: "ab" }).success, false, "Alt < 3 chars rejected");
  assert.strictEqual(facilityItemCreateSchema.safeParse({ ...validItem, iconName: "RandomNotAllowedIcon" }).success, false, "Disallowed icon rejected");
  assert.strictEqual(facilityItemCreateSchema.safeParse({ ...validItem, imageUrl: "http://localhost:3000/bad.jpg" }).success, false, "Localhost URL rejected");
  assert.strictEqual(facilityItemCreateSchema.safeParse({ ...validItem, imageStorageKey: "invalid_key" }).success, false, "Invalid storage key rejected");
  assert.strictEqual(facilityItemCreateSchema.safeParse({ ...validItem, highlights: Array(11).fill("h") }).success, false, "More than 10 highlights rejected");

  const validItemUpdate = {
    id: "item_123",
    ...validItem,
    displayOrder: 1,
    isPublished: false,
  };
  assert.strictEqual(facilityItemUpdateSchema.safeParse(validItemUpdate).success, true);
  assert.strictEqual(facilityItemUpdateSchema.safeParse({ ...validItemUpdate, id: "" }).success, false, "Empty item ID rejected");
  assert.strictEqual(reorderFacilityItemsSchema.safeParse({ categoryId: "cat_1", orders: [{ id: "item_1", displayOrder: 0 }] }).success, true);
  assert.strictEqual(toggleFacilityItemStatusSchema.safeParse({ id: "item_1", isPublished: false }).success, true);
  console.log("  Facility item schemas passed.");

  // 6. Test Diff Computers
  console.log("6. Testing Diff Computers...");
  const catDiff = computeCategoryDiff(
    { title: "Academic", description: "Old desc", displayOrder: 0, isPublished: true },
    { title: "Academic Updated", description: "New desc", displayOrder: 1, isPublished: false }
  );
  assert.strictEqual(catDiff.title.from, "Academic");
  assert.strictEqual(catDiff.title.to, "Academic Updated");
  assert.strictEqual(catDiff.displayOrder.to, 1);
  assert.strictEqual(catDiff.isPublished.to, false);

  const itemDiff = computeFacilityItemDiff(
    {
      title: "Science Lab",
      categoryId: "cat_1",
      description: "Old description",
      imageUrl: "/images/old.jpg",
      imageStorageKey: "facilities/fac_11111111-1111-1111-1111-111111111111.webp",
      imageAlt: "Old alt",
      iconName: "FlaskConical",
      highlights: ["H1"],
      displayOrder: 0,
      isPublished: true,
    },
    {
      title: "Science Lab (Renovated)",
      categoryId: "cat_1",
      description: "New description",
      imageUrl: null,
      imageStorageKey: null,
      imageAlt: "New alt",
      iconName: "Cpu",
      highlights: ["H1", "H2"],
      displayOrder: 1,
      isPublished: false,
    }
  );
  assert.strictEqual(itemDiff.title.to, "Science Lab (Renovated)");
  assert.strictEqual(itemDiff.description.from, "[OLD_DESCRIPTION]");
  assert.strictEqual(itemDiff.description.to, "[NEW_DESCRIPTION]");
  assert.strictEqual(itemDiff.imageUrl.from, "[PRESENT]");
  assert.strictEqual(itemDiff.imageUrl.to, "[NONE]");
  assert.strictEqual(itemDiff.imageStorageKey.from, "[PRESENT]");
  assert.strictEqual(itemDiff.imageStorageKey.to, "[NONE]");
  assert.strictEqual(itemDiff.imageAlt.to, "New alt");
  assert.strictEqual(itemDiff.iconName.to, "Cpu");
  assert.strictEqual(itemDiff.displayOrder.to, 1);
  assert.strictEqual(itemDiff.isPublished.to, false);
  console.log("  Diff computers passed.");

  // 7. Database Integration & Cascade Delete Test
  console.log("7. Testing Database Relationships & Cascade Delete...");
  const prisma = new PrismaClient();
  try {
    const categoriesCount = await prisma.facilityCategory.count();
    const itemsCount = await prisma.facilityItem.count();
    console.log(`  Current categories in DB: ${categoriesCount}, items: ${itemsCount}`);
    assert.ok(categoriesCount >= 5, "Must have at least 5 seeded categories");
    assert.ok(itemsCount >= 8, "Must have at least 8 seeded items");

    // Create temporary test category and item
    const testCat = await prisma.facilityCategory.create({
      data: {
        slug: "test-temp-category",
        title: "Test Temp Category",
        description: "Temporary category for cascade test",
        displayOrder: 999,
        isPublished: false,
      },
    });

    const testItem = await prisma.facilityItem.create({
      data: {
        categoryId: testCat.id,
        slug: "test-temp-facility-item",
        title: "Test Temp Facility Item",
        description: "Testing cascade delete behavior",
        imageAlt: "Testing image alt",
        iconName: "MonitorPlay",
        highlights: ["Highlight 1"],
        displayOrder: 0,
        isPublished: false,
      },
    });

    // Verify item created
    const verifyItem = await prisma.facilityItem.findUnique({ where: { id: testItem.id } });
    assert.ok(verifyItem, "Test facility item must exist");

    // Delete category and verify cascade delete of item
    await prisma.facilityCategory.delete({ where: { id: testCat.id } });
    const verifyItemAfterCascade = await prisma.facilityItem.findUnique({ where: { id: testItem.id } });
    assert.strictEqual(verifyItemAfterCascade, null, "Facility item must be cascade deleted when category is deleted");
    console.log("  Cascade delete verified cleanly.");
  } finally {
    await prisma.$disconnect();
    // Clean up compiled bundles
    if (fs.existsSync(path.resolve(__dirname, "../dist_test_facility_validation.js"))) {
      fs.unlinkSync(path.resolve(__dirname, "../dist_test_facility_validation.js"));
    }
    if (fs.existsSync(path.resolve(__dirname, "../dist_test_storage.js"))) {
      fs.unlinkSync(path.resolve(__dirname, "../dist_test_storage.js"));
    }
  }

  console.log("=== All Facilities Validation & Actions Tests PASSED ===");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
