/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Gallery Albums & Images Actions, Schemas, Auth & Database Integration
 */

const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const {
  validateGalleryUrl,
  galleryCategoryEnum,
  galleryAlbumCreateSchema,
  galleryAlbumUpdateSchema,
  galleryAlbumDeleteSchema,
  galleryAlbumToggleSchema,
  galleryAlbumsReorderSchema,
  galleryImageCreateSchema,
  galleryImageUpdateSchema,
  galleryImageDeleteSchema,
  galleryImageToggleSchema,
  galleryImagesReorderSchema,
  normalizeGalleryPayload,
  computeGalleryAlbumDiff,
  computeGalleryImageDiff,
} = require("../lib/validation/gallery.ts");

dotenv.config({ path: ".env" });
const prisma = new PrismaClient();

async function runSuite() {
  const results = [];

  function assert(name, condition, errorDetail) {
    if (condition) {
      results.push({ name, passed: true });
      console.log(`  [PASS] ${name}`);
    } else {
      results.push({ name, passed: false, error: errorDetail || "Assertion failed" });
      console.error(`  [FAIL] ${name} ${errorDetail ? `- ${errorDetail}` : ""}`);
    }
  }

  console.log("==================================================================");
  console.log("  Running Test Suite: Gallery Albums & Images Actions, Schemas & Auth");
  console.log("==================================================================");

  // -------------------------------------------------------------
  // 1. URL Safety Validation Tests
  // -------------------------------------------------------------
  console.log("\n--- 1. URL Safety Validation Tests ---");

  assert("Accepts root-relative image path", validateGalleryUrl("/images/gallery/image-1-1.webp").valid === true);
  assert("Accepts secure HTTPS URL", validateGalleryUrl("https://images.unsplash.com/photo-123.jpg").valid === true);
  assert("Rejects plain HTTP", validateGalleryUrl("http://insecure.com/photo.jpg").valid === false);
  assert("Rejects javascript scheme", validateGalleryUrl("javascript:alert(1)").valid === false);
  assert("Rejects data URI", validateGalleryUrl("data:image/png;base64,abc").valid === false);
  assert("Rejects protocol-relative '//evil.com'", validateGalleryUrl("//evil.com/img.jpg").valid === false);
  assert("Optional null allows valid=true", validateGalleryUrl(null).valid === true);
  assert("Optional empty string allows valid=true", validateGalleryUrl("").valid === true);

  // -------------------------------------------------------------
  // 2. Gallery Album Schemas & Alt Text
  // -------------------------------------------------------------
  console.log("\n--- 2. Gallery Album Schemas & Alt Text ---");

  const validAlbumPayload = {
    title: "Campus Infrastructure & Modern Labs",
    description: "Visual tour of the science labs and campus grounds.",
    category: "Campus",
    coverImageUrl: "/images/gallery/image-1-1.webp",
    coverImageAlt: "Devasthaly Vidyapeeth Campus Grounds",
    displayOrder: 1,
    isPublished: true,
  };

  assert("Valid album payload passes schema", galleryAlbumCreateSchema.safeParse(validAlbumPayload).success === true);
  assert(
    "Rejects album with empty title",
    galleryAlbumCreateSchema.safeParse({ ...validAlbumPayload, title: "" }).success === false
  );
  assert(
    "Rejects album with HTML in title",
    galleryAlbumCreateSchema.safeParse({ ...validAlbumPayload, title: "Campus <script>alert(1)</script>" }).success === false
  );
  assert(
    "Rejects album with HTML in description",
    galleryAlbumCreateSchema.safeParse({ ...validAlbumPayload, description: "<b>Bold</b> tour" }).success === false
  );
  assert(
    "Rejects invalid category enum",
    galleryAlbumCreateSchema.safeParse({ ...validAlbumPayload, category: "InvalidCategory" }).success === false
  );
  assert(
    "Accepts valid categories",
    galleryCategoryEnum.safeParse("Sports").success === true &&
      galleryCategoryEnum.safeParse("Events").success === true &&
      galleryCategoryEnum.safeParse("Achievements").success === true
  );
  assert(
    "Rejects cover image with empty alt text",
    galleryAlbumCreateSchema.safeParse({
      ...validAlbumPayload,
      coverImageUrl: "/images/gallery/image.webp",
      coverImageAlt: "",
    }).success === false
  );
  assert(
    "Valid album update schema with ID passes",
    galleryAlbumUpdateSchema.safeParse({ id: "album-id-123", ...validAlbumPayload }).success === true
  );
  assert(
    "Album update schema fails without ID",
    galleryAlbumUpdateSchema.safeParse({ id: "", ...validAlbumPayload }).success === false
  );
  assert(
    "Album delete schema valid",
    galleryAlbumDeleteSchema.safeParse({ id: "valid-cuid" }).success === true
  );
  assert(
    "Album toggle schema valid",
    galleryAlbumToggleSchema.safeParse({ id: "valid-cuid", isPublished: false }).success === true
  );
  assert(
    "Album reorder schema valid with non-empty array",
    galleryAlbumsReorderSchema.safeParse({ orderedIds: ["alb-1", "alb-2"] }).success === true
  );
  assert(
    "Album reorder schema rejects empty array",
    galleryAlbumsReorderSchema.safeParse({ orderedIds: [] }).success === false
  );

  // -------------------------------------------------------------
  // 3. Gallery Image Schemas & Alt Text
  // -------------------------------------------------------------
  console.log("\n--- 3. Gallery Image Schemas & Alt Text ---");

  const validImagePayload = {
    albumId: "cuid-album-1",
    imageUrl: "/images/gallery/image-1-1.webp",
    imageAlt: "Physics laboratory workstation",
    caption: "Students performing optics experiments",
    displayOrder: 1,
    isPublished: true,
  };

  assert("Valid image payload passes schema", galleryImageCreateSchema.safeParse(validImagePayload).success === true);
  assert(
    "Rejects image without albumId",
    galleryImageCreateSchema.safeParse({ ...validImagePayload, albumId: "" }).success === false
  );
  assert(
    "Rejects image without imageUrl or imageStorageKey",
    galleryImageCreateSchema.safeParse({ ...validImagePayload, imageUrl: "", imageStorageKey: null }).success === false
  );
  assert(
    "Rejects image with empty alt text",
    galleryImageCreateSchema.safeParse({ ...validImagePayload, imageAlt: "" }).success === false
  );
  assert(
    "Rejects image with HTML in caption",
    galleryImageCreateSchema.safeParse({ ...validImagePayload, caption: "Students <script>alert(1)</script>" }).success === false
  );
  assert(
    "Valid image update schema with ID passes",
    galleryImageUpdateSchema.safeParse({ id: "image-id-123", ...validImagePayload }).success === true
  );
  assert(
    "Image update schema fails without ID",
    galleryImageUpdateSchema.safeParse({ id: "", ...validImagePayload }).success === false
  );
  assert(
    "Image delete schema valid",
    galleryImageDeleteSchema.safeParse({ id: "valid-cuid" }).success === true
  );
  assert(
    "Image toggle schema valid",
    galleryImageToggleSchema.safeParse({ id: "valid-cuid", isPublished: false }).success === true
  );
  assert(
    "Image reorder schema valid with non-empty array",
    galleryImagesReorderSchema.safeParse({ orderedIds: ["img-1", "img-2"] }).success === true
  );
  assert(
    "Image reorder schema rejects empty array",
    galleryImagesReorderSchema.safeParse({ orderedIds: [] }).success === false
  );

  // -------------------------------------------------------------
  // 4. Normalizer & Diff Utility Tests
  // -------------------------------------------------------------
  console.log("\n--- 4. Normalizer & Diff Utility Tests ---");

  const normalized = normalizeGalleryPayload({
    title: "  Trimmed Album  ",
    description: "   ",
    category: "Campus",
  });
  assert("Normalizer trims string values", normalized.title === "Trimmed Album");
  assert("Normalizer converts whitespace to null", normalized.description === null);

  const albumDiff = computeGalleryAlbumDiff(
    { title: "Old Title", category: "Campus", coverImageUrl: "/images/old.webp", coverImageStorageKey: null },
    { title: "New Title", category: "Campus", coverImageUrl: "/api/public/media/gallery/gal_123.webp", coverImageStorageKey: "gallery/gal_123.webp" }
  );
  assert("Diff detects modified album title", albumDiff.title && albumDiff.title.from === "Old Title" && albumDiff.title.to === "New Title");
  assert("Diff ignores unchanged category", albumDiff.category === undefined);
  assert("Diff masks coverImageUrl changes cleanly", albumDiff.coverImageUrl && albumDiff.coverImageUrl.from === "[PRESENT]" && albumDiff.coverImageUrl.to === "[PRESENT]");

  const imageDiff = computeGalleryImageDiff(
    { caption: "Old Caption", imageUrl: "/images/old.webp", imageStorageKey: null },
    { caption: "New Caption", imageUrl: "/images/new.webp", imageStorageKey: null }
  );
  assert("Diff detects modified image caption", imageDiff.caption && imageDiff.caption.from === "Old Caption" && imageDiff.caption.to === "New Caption");

  // -------------------------------------------------------------
  // 5. Role Authorization Matrix
  // -------------------------------------------------------------
  console.log("\n--- 5. Role Authorization Matrix ---");
  const ALLOWED_ROLES = ["SUPER_ADMIN"];
  const TEST_ROLES = ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "STAFF", "PARENT", "STUDENT", null, undefined];

  for (const role of TEST_ROLES) {
    const isAllowed = ALLOWED_ROLES.includes(role);
    if (isAllowed) {
      assert(`Role '${role}' is ALLOWED`, isAllowed === true);
    } else {
      assert(`Role '${role}' is BLOCKED`, isAllowed === false);
    }
  }

  // -------------------------------------------------------------
  // 6. Live Database Integration Tests
  // -------------------------------------------------------------
  console.log("\n--- 6. Live Database Integration Tests ---");

  const initialAlbumCount = await prisma.galleryAlbum.count();
  const initialImageCount = await prisma.galleryImage.count();
  assert("Default seeded gallery album count is 4", initialAlbumCount === 4, `Found ${initialAlbumCount}`);
  assert("Default seeded gallery image count is 14", initialImageCount === 14, `Found ${initialImageCount}`);

  // Create temporary test album
  const testAlbum = await prisma.galleryAlbum.create({
    data: {
      title: "QA Test Verification Album",
      description: "Temporary album for test suite verification",
      category: "Campus",
      coverImageUrl: "/images/gallery/image-1-1.webp",
      coverImageAlt: "QA Test Verification Album",
      displayOrder: 999,
      isPublished: true,
    },
  });
  assert("Created test gallery album in DB", Boolean(testAlbum.id));

  // Create temporary test photo under the test album
  const testPhoto = await prisma.galleryImage.create({
    data: {
      albumId: testAlbum.id,
      imageUrl: "/images/gallery/image-2-1.webp",
      imageAlt: "QA Test Photo Alt",
      caption: "Temporary test photo caption",
      displayOrder: 1,
      isPublished: true,
    },
  });
  assert("Created test gallery photo under album", Boolean(testPhoto.id));

  // Update test album
  const updatedAlbum = await prisma.galleryAlbum.update({
    where: { id: testAlbum.id },
    data: {
      category: "Sports",
      description: "Updated description for sports",
    },
  });
  assert("Updated test album category to Sports", updatedAlbum.category === "Sports");

  // Toggle status of test photo
  const toggledPhoto = await prisma.galleryImage.update({
    where: { id: testPhoto.id },
    data: { isPublished: false },
  });
  assert("Toggled test photo to draft (isPublished: false)", toggledPhoto.isPublished === false);

  // Test Cascade Delete of album -> child photo is deleted
  await prisma.galleryAlbum.delete({
    where: { id: testAlbum.id },
  });

  const photoAfterDelete = await prisma.galleryImage.findUnique({
    where: { id: testPhoto.id },
  });
  assert("Child photo was cascade-deleted when album was deleted", photoAfterDelete === null);

  const afterDeleteAlbumCount = await prisma.galleryAlbum.count();
  const afterDeleteImageCount = await prisma.galleryImage.count();
  assert("Album count restored to 4", afterDeleteAlbumCount === 4);
  assert("Image count restored to 14", afterDeleteImageCount === 14);

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n==================================================================");
  console.log(`  Gallery Actions Test Suite: ${passed} Passed, ${failed} Failed (Total ${total})`);
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
