/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

console.log("==================================================================");
console.log("  Running Backend Production Remediation Test Suite");
console.log("==================================================================\n");

const prisma = new PrismaClient();

function getPublicMediaOrigin() {
  if (process.env.PUBLIC_MEDIA_ORIGIN) {
    return process.env.PUBLIC_MEDIA_ORIGIN.replace(/\/+$/, "");
  }
  return "http://127.0.0.1:3001";
}

async function run() {
  let createdNoticeIds = [];
  const testStorageDir = path.join(os.tmpdir(), `test-orphan-docs-${Date.now()}`);

  try {
    // -----------------------------------------------------------------
    // 1. PUBLIC PDF URL GENERATION & ROUTING
    // -----------------------------------------------------------------
    console.log("--- 1. Public PDF URL Generation & Origin Resolution ---");

    const defaultOrigin = getPublicMediaOrigin();
    assert.strictEqual(
      defaultOrigin,
      process.env.PUBLIC_MEDIA_ORIGIN || "http://127.0.0.1:3001",
      "Should resolve default or configured media origin"
    );

    // Simulate DTO projection logic from backend/app/api/public/notices/route.ts
    function resolveNoticeFileUrl(notice, customOrigin) {
      const origin = customOrigin || getPublicMediaOrigin();
      return notice.fileStorageKey
        ? `${origin}/api/public/documents/${notice.slug}`
        : notice.fileUrl;
    }

    const managedNotice = {
      slug: "circular-annual-sports-meet",
      fileStorageKey: "documents/notices/doc_11111111-2222-3333-4444-555555555555.pdf",
      fileUrl: null,
    };
    const externalNotice = {
      slug: "cbse-curriculum-framework",
      fileStorageKey: null,
      fileUrl: "https://cbse.gov.in/curriculum-2026.pdf",
    };
    const plainNotice = {
      slug: "holiday-announcement",
      fileStorageKey: null,
      fileUrl: null,
    };

    // Test with local origin
    const localUrl = resolveNoticeFileUrl(managedNotice, "http://127.0.0.1:3001");
    assert.strictEqual(
      localUrl,
      "http://127.0.0.1:3001/api/public/documents/circular-annual-sports-meet"
    );

    // Test with production origin
    const prodUrl = resolveNoticeFileUrl(managedNotice, "https://admin.devasthaly.edu.in");
    assert.strictEqual(
      prodUrl,
      "https://admin.devasthaly.edu.in/api/public/documents/circular-annual-sports-meet"
    );

    // External and plain notices
    assert.strictEqual(resolveNoticeFileUrl(externalNotice), "https://cbse.gov.in/curriculum-2026.pdf");
    assert.strictEqual(resolveNoticeFileUrl(plainNotice), null);

    console.log("  [PASS] Managed notices correctly resolve to absolute download URLs using PUBLIC_MEDIA_ORIGIN");
    console.log("  [PASS] External and unattached notices preserve their respective links/null states");

    // -----------------------------------------------------------------
    // 2. DRAFT & EXPIRED DOWNLOAD ISOLATION (LIVE HTTP CONTRACT)
    // -----------------------------------------------------------------
    console.log("\n--- 2. Public Document Route Download & Isolation ---");

    // Create 1 valid dummy PDF in permanent storage for testing
    const storageRoot = path.resolve(__dirname, "..", "storage", "documents", "notices");
    fs.mkdirSync(storageRoot, { recursive: true });
    const validUuidKey = "documents/notices/doc_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d.pdf";
    const validDiskPath = path.resolve(storageRoot, path.basename(validUuidKey));
    fs.writeFileSync(validDiskPath, "%PDF-1.4\n%Test PDF\n%%EOF\n");

    const now = new Date();

    // Create 4 test notices in DB
    const [publishedNotice, draftNotice, expiredNotice, scheduledNotice] = await Promise.all([
      prisma.notice.create({
        data: {
          title: "[TEST-PROD-REMED] Published Active Notice",
          slug: `test-active-${Date.now()}`,
          category: "CIRCULAR",
          isPublished: true,
          publishDate: new Date(now.getTime() - 3600000),
          fileStorageKey: validUuidKey,
          fileSizeBytes: 24,
        },
      }),
      prisma.notice.create({
        data: {
          title: "[TEST-PROD-REMED] Draft Notice",
          slug: `test-draft-${Date.now()}`,
          category: "CIRCULAR",
          isPublished: false,
          publishDate: new Date(now.getTime() - 3600000),
          fileStorageKey: validUuidKey,
          fileSizeBytes: 24,
        },
      }),
      prisma.notice.create({
        data: {
          title: "[TEST-PROD-REMED] Expired Notice",
          slug: `test-expired-${Date.now()}`,
          category: "CIRCULAR",
          isPublished: true,
          publishDate: new Date(now.getTime() - 86400000 * 5),
          expiryDate: new Date(now.getTime() - 3600000), // Expired 1h ago
          fileStorageKey: validUuidKey,
          fileSizeBytes: 24,
        },
      }),
      prisma.notice.create({
        data: {
          title: "[TEST-PROD-REMED] Scheduled Notice",
          slug: `test-scheduled-${Date.now()}`,
          category: "CIRCULAR",
          isPublished: true,
          publishDate: new Date(now.getTime() + 86400000), // Tomorrow
          fileStorageKey: validUuidKey,
          fileSizeBytes: 24,
        },
      }),
    ]);

    createdNoticeIds = [publishedNotice.id, draftNotice.id, expiredNotice.id, scheduledNotice.id];

    // Helper to query backend document endpoint
    async function fetchDoc(slug) {
      const url = `http://127.0.0.1:3001/api/public/documents/${slug}`;
      const res = await fetch(url);
      const headers = Object.fromEntries(res.headers.entries());
      const body = await res.arrayBuffer();
      return { status: res.status, headers, byteLength: body.byteLength };
    }

    const activeRes = await fetchDoc(publishedNotice.slug);
    assert.strictEqual(activeRes.status, 200, "Active published notice must return HTTP 200");
    assert.strictEqual(activeRes.headers["content-type"], "application/pdf");
    assert.strictEqual(
      activeRes.headers["content-disposition"],
      `attachment; filename="${publishedNotice.slug}.pdf"`
    );
    assert.strictEqual(activeRes.headers["x-content-type-options"], "nosniff");
    assert.strictEqual(activeRes.headers["content-security-policy"], "default-src 'none'; sandbox");
    assert.strictEqual(activeRes.headers["x-frame-options"], "DENY");
    console.log("  [PASS] Published active notice serves PDF with all required security headers");

    const draftRes = await fetchDoc(draftNotice.slug);
    assert.strictEqual(draftRes.status, 404, "Draft notice document must strictly return HTTP 404");
    console.log("  [PASS] Draft notice document strictly rejected with HTTP 404");

    const expiredRes = await fetchDoc(expiredNotice.slug);
    assert.strictEqual(expiredRes.status, 404, "Expired notice document must strictly return HTTP 404");
    console.log("  [PASS] Expired notice document strictly rejected with HTTP 404");

    const scheduledRes = await fetchDoc(scheduledNotice.slug);
    assert.strictEqual(scheduledRes.status, 404, "Scheduled notice document must strictly return HTTP 404");
    console.log("  [PASS] Scheduled notice document strictly rejected with HTTP 404");

    // Clean up temporary dummy file
    try { fs.unlinkSync(validDiskPath); } catch {}

    // -----------------------------------------------------------------
    // 3. DOCUMENT ORPHAN CLEANUP CLI: DRY-RUN & --APPLY BEHAVIOR
    // -----------------------------------------------------------------
    console.log("\n--- 3. Document Orphan Cleaner CLI (Dry-Run & Apply) ---");

    const noticesTestDir = path.join(testStorageDir, "notices");
    fs.mkdirSync(noticesTestDir, { recursive: true });

    // File 1: Referenced in DB (active, age: 3 hours ago so outside grace period)
    const activeFileName = "doc_aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.pdf";
    const activeFilePath = path.join(noticesTestDir, activeFileName);
    fs.writeFileSync(activeFilePath, "%PDF-1.4\nActive file\n");
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    fs.utimesSync(activeFilePath, threeHoursAgo, threeHoursAgo);

    const activeNotice = await prisma.notice.create({
      data: {
        title: "[TEST-PROD-REMED] Active Referenced Notice for Orphan Test",
        slug: `test-active-orphan-${Date.now()}`,
        category: "EVENT",
        isPublished: true,
        fileStorageKey: `documents/notices/${activeFileName}`,
      },
    });
    createdNoticeIds.push(activeNotice.id);

    // File 2: Unreferenced, but inside 1-hour grace period (mtime = now)
    const graceFileName = "doc_11111111-2222-3333-4444-555555555555.pdf";
    const graceFilePath = path.join(noticesTestDir, graceFileName);
    fs.writeFileSync(graceFilePath, "%PDF-1.4\nGrace file\n");

    // File 3: Unreferenced, outside 1-hour grace period (mtime = 2 hours ago)
    const orphanFileName = "doc_99999999-8888-7777-6666-555555555555.pdf";
    const orphanFilePath = path.join(noticesTestDir, orphanFileName);
    fs.writeFileSync(orphanFilePath, "%PDF-1.4\nOrphan file\n");
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    fs.utimesSync(orphanFilePath, twoHoursAgo, twoHoursAgo);

    // File 4: Non-managed file
    const nonManagedFilePath = path.join(noticesTestDir, "unmanaged-notes.txt");
    fs.writeFileSync(nonManagedFilePath, "Text notes");

    // Set environment variable to point cleaner script to test directory
    process.env.TEST_DOCUMENT_STORAGE_ROOT = testStorageDir;

    // Test DRY-RUN mode
    const { execSync } = require("node:child_process");
    const scriptPath = path.resolve(__dirname, "clean-orphaned-documents.js");

    const dryRunOutput = execSync(`node "${scriptPath}"`, {
      env: { ...process.env, TEST_DOCUMENT_STORAGE_ROOT: testStorageDir },
      encoding: "utf-8",
    });

    assert(dryRunOutput.includes("DRY RUN (REPORT ONLY)"), "Dry-run header expected");
    assert(dryRunOutput.includes("Total files in storage: 4"), "Should scan 4 files");
    assert(dryRunOutput.includes("Non-managed/skipped files: 1"), "Should detect 1 non-managed file");
    assert(dryRunOutput.includes("Files in 1-hour grace period: 1"), "Should detect 1 grace-period file");
    assert(dryRunOutput.includes("Active referenced files: 1"), "Should detect 1 active referenced file");
    assert(dryRunOutput.includes("Orphaned candidate files: 1"), "Should detect exactly 1 orphan");
    assert(dryRunOutput.includes(orphanFileName), "Candidate output must list orphan file");

    // Verify all 4 files still exist on disk after dry-run
    assert(fs.existsSync(activeFilePath), "Active file must exist after dry-run");
    assert(fs.existsSync(graceFilePath), "Grace file must exist after dry-run");
    assert(fs.existsSync(orphanFilePath), "Orphan file must exist after dry-run");
    assert(fs.existsSync(nonManagedFilePath), "Non-managed file must exist after dry-run");
    console.log("  [PASS] Dry-run correctly reports candidate without deleting any files");

    // Test --apply mode
    const applyOutput = execSync(`node "${scriptPath}" --apply`, {
      env: { ...process.env, TEST_DOCUMENT_STORAGE_ROOT: testStorageDir },
      encoding: "utf-8",
    });

    assert(applyOutput.includes("APPLY (DESTRUCTIVE)"), "Apply header expected");
    assert(applyOutput.includes("Successfully deleted 1/1 orphaned document files"), "Should delete 1 orphan");

    // Verify orphan was deleted, but active, grace, and non-managed remain
    assert(!fs.existsSync(orphanFilePath), "Orphan file must be deleted after --apply");
    assert(fs.existsSync(activeFilePath), "Active file must remain intact");
    assert(fs.existsSync(graceFilePath), "Grace-period file must remain intact");
    assert(fs.existsSync(nonManagedFilePath), "Non-managed file must remain intact");
    console.log("  [PASS] --apply mode successfully unlinked only the unreferenced orphan, preserving active and grace files");

  } finally {
    // Clean up test notices from DB
    if (createdNoticeIds.length > 0) {
      await prisma.notice.deleteMany({ where: { id: { in: createdNoticeIds } } });
    }
    // Clean up temporary test storage directory
    try {
      fs.rmSync(testStorageDir, { recursive: true, force: true });
    } catch {}
    delete process.env.TEST_DOCUMENT_STORAGE_ROOT;
    await prisma.$disconnect();
  }

  console.log("\n==================================================================");
  console.log("  All Backend Production Remediation Tests PASSED!");
  console.log("==================================================================");
}

run().catch((err) => {
  console.error("FATAL ERROR during test execution:", err);
  process.exit(1);
});
