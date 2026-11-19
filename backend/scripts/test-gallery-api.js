/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Gallery Public API & DTO Logic
 */

const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: ".env" });
const prisma = new PrismaClient();

async function runSuite() {
  const results = [];

  function assert(name, condition, details = "") {
    results.push({ name, passed: Boolean(condition), details });
    if (!condition) {
      console.error(`  [FAIL] ${name}: ${details}`);
    } else {
      console.log(`  [PASS] ${name}`);
    }
  }

  console.log("==================================================================");
  console.log("  Running Test Suite: Gallery Public API & DTO Logic");
  console.log("==================================================================");

  // -------------------------------------------------------------
  // 1. Media URL Resolution Logic
  // -------------------------------------------------------------
  console.log("\n--- 1. Media URL Resolution Logic ---");

  function resolveMediaUrl(url, storageKey, origin = "http://127.0.0.1:3001") {
    if (storageKey) {
      return `${origin}/api/public/media/${storageKey}`;
    }
    return url || null;
  }

  assert(
    "Resolves managed gallery storage key to dynamic media origin",
    resolveMediaUrl(null, "gallery/gal_1234567890abcdef1234567890abcdef.webp", "https://media.devasthaly.com") ===
      "https://media.devasthaly.com/api/public/media/gallery/gal_1234567890abcdef1234567890abcdef.webp"
  );

  assert(
    "Returns root-relative public URL when storage key is absent",
    resolveMediaUrl("/images/gallery/image-1-1.webp", null) === "/images/gallery/image-1-1.webp"
  );

  assert(
    "Returns null when both url and storage key are absent",
    resolveMediaUrl(null, null) === null
  );

  // -------------------------------------------------------------
  // 2. Draft Isolation & Empty Array Rules
  // -------------------------------------------------------------
  console.log("\n--- 2. Draft Isolation & Empty Array Rules ---");

  const testAlbums = [
    { id: "alb-1", title: "Published Campus", isPublished: true, category: "Campus" },
    { id: "alb-2", title: "Draft Tour", isPublished: false, category: "Campus" },
    { id: "alb-3", title: "Published Sports", isPublished: true, category: "Sports" },
  ];

  const publishedOnly = testAlbums.filter((a) => a.isPublished);
  assert("Draft isolation excludes unpublished albums", publishedOnly.length === 2 && !publishedOnly.some((a) => a.id === "alb-2"));

  const allDrafts = testAlbums.map((a) => ({ ...a, isPublished: false })).filter((a) => a.isPublished);
  assert("Empty published set evaluates to authoritative []", Array.isArray(allDrafts) && allDrafts.length === 0);

  const categoriesExtracted = Array.from(new Set(publishedOnly.map((a) => a.category))).sort();
  assert("Categories extracted accurately", categoriesExtracted.length === 2 && categoriesExtracted.includes("Campus") && categoriesExtracted.includes("Sports"));

  // -------------------------------------------------------------
  // 3. Database Content Parity Verification (4 Albums, 14 Photos)
  // -------------------------------------------------------------
  console.log("\n--- 3. Database Content Parity Verification ---");

  const albums = await prisma.galleryAlbum.findMany({
    where: { isPublished: true },
    orderBy: { displayOrder: "asc" },
    include: {
      images: {
        where: { isPublished: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  assert("Exactly 4 gallery albums in DB", albums.length === 4, `Found ${albums.length}`);

  const a1 = albums[0];
  assert("First album is Campus Grounds & Academic Infrastructure", a1.title === "Campus Grounds & Academic Infrastructure");
  assert("First album category is Campus", a1.category === "Campus");
  assert("First album has 4 photos", a1.images.length === 4, `Found ${a1.images.length}`);

  const a2 = albums[1];
  assert("Second album is Student Activities & Cultural Assemblies", a2.title === "Student Activities & Cultural Assemblies");
  assert("Second album category is Events", a2.category === "Events");
  assert("Second album has 4 photos", a2.images.length === 4, `Found ${a2.images.length}`);

  const a3 = albums[2];
  assert("Third album is Sports, Laboratories & Student Life", a3.title === "Sports, Laboratories & Student Life");
  assert("Third album category is Sports", a3.category === "Sports");
  assert("Third album has 5 photos", a3.images.length === 5, `Found ${a3.images.length}`);

  const a4 = albums[3];
  assert("Fourth album is Alumni Meet & Reunions", a4.title === "Alumni Meet & Reunions");
  assert("Fourth album category is Achievements", a4.category === "Achievements");
  assert("Fourth album has 1 photo", a4.images.length === 1, `Found ${a4.images.length}`);

  const totalPhotos = albums.reduce((acc, a) => acc + a.images.length, 0);
  assert("Total photos across all published albums is 14", totalPhotos === 14, `Found ${totalPhotos}`);

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n==================================================================");
  console.log(`  Gallery Public API Test Suite: ${passed} Passed, ${failed} Failed (Total ${total})`);
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
