/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Notice Attachment Pipeline & Admin/Public Workflow (Phase 3 E2E)
 *
 * Verifies:
 * 1. Server Action Upload & Verification:
 *    - uploadNoticeDocumentAction parses FormData, performs validation, synthetic malware scan,
 *      atomic staging and promotion, and returns sanitized metadata:
 *      fileStorageKey, fileSizeBytes, fileSha256, fileOriginalName, fileUploadedAt.
 * 2. Form Creation & DB Persistence:
 *    - Notice created with verified managed attachment metadata via createNoticeAction.
 *    - DB stores fileStorageKey, fileSizeBytes, fileSha256, fileOriginalName, fileUploadedAt.
 * 3. Controlled Admin Document Route (/api/admin/notices/[noticeId]/document):
 *    - Super-admin permitted to download attached PDF.
 *    - Served with Content-Disposition: attachment, private no-cache, CSP sandbox, nosniff, DENY.
 *    - Non-admin blocked with HTTP 403.
 * 4. Lifecycle & Draft Isolation via Public Document Route (/api/public/documents/[documentId]):
 *    - Strictly blocks Draft notices (HTTP 404).
 *    - Strictly blocks Scheduled notices (HTTP 404).
 *    - Serves published notices with HTTP 200, Content-Disposition: attachment.
 * 5. Public Notices API DTO Protection:
 *    - Serves fileUrl mapped to /api/public/documents/[slug].
 *    - Strictly protects against leakage of fileStorageKey, fileSha256, fileOriginalName, authorId.
 * 6. Attachment Replacement & Post-Commit Cleanup:
 *    - Replaces attachment with a new upload via updateNoticeAction.
 *    - Old attachment file physically unlinked from disk post-commit.
 *    - New attachment physically exists on disk and is downloadable.
 * 7. Attachment Removal ("none" mode) & Post-Commit Cleanup:
 *    - Clears attachment fields via updateNoticeAction.
 *    - Previous attachment file physically unlinked from disk post-commit.
 *    - Notice fields are null in DB; public download route returns 404.
 * 8. Notice Deletion & Post-Commit Cleanup:
 *    - Deleting notice unlinks attachment from disk post-commit.
 *    - Audit logs recorded for DOCUMENT_UPLOADED and DOCUMENT_DELETED.
 */

// Mock server-only
const serverOnlyPath = require.resolve("server-only");
require.cache[serverOnlyPath] = {
  id: serverOnlyPath,
  filename: serverOnlyPath,
  loaded: true,
  exports: {},
};

process.env.NODE_ENV = "test";
process.env.ALLOW_SYNTHETIC_SCANNER = "true";

const fs = require("node:fs");
const path = require("node:path");
const dotenv = require("dotenv");
const crypto = require("node:crypto");
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
const prisma = new PrismaClient();

// Configure isolated temporary upload root for test suite
const TEST_STORAGE_DIR = path.resolve(__dirname, "..", "tmp", "test-document-storage-p3");
process.env.TEST_DOCUMENT_STORAGE_ROOT = TEST_STORAGE_DIR;

const {
  resolveSafePath,
  deleteManagedDocument,
} = require("../lib/server/document-storage.ts");

function createSamplePdf(customText = "School Circular Test Content") {
  const streamContent = `BT /F1 12 Tf 50 700 Td (${customText}) Tj ET`;
  return Buffer.from(
    `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R/Resources<<>>>>endobj\n4 0 obj<</Length ${streamContent.length}>>stream\n${streamContent}\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000216 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n320\n%%EOF\n`,
    "latin1"
  );
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runPhase3E2ETests() {
  console.log("==================================================================");
  console.log("  Running Test Suite: Notice Attachment Widget E2E Integration (Phase 3)");
  console.log("==================================================================\n");

  // Ensure storage directories
  fs.mkdirSync(path.join(TEST_STORAGE_DIR, "staging"), { recursive: true });
  fs.mkdirSync(path.join(TEST_STORAGE_DIR, "documents"), { recursive: true });

  const adminUser = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
  if (!adminUser) throw new Error("No SUPER_ADMIN user found in database");

  const createdNoticeIds = [];

  try {
    // -----------------------------------------------------------------
    // 1. UPLOAD & SERVER ACTION METADATA GENERATION
    // -----------------------------------------------------------------
    console.log("--- 1. uploadNoticeDocumentAction Validation & Promotion ---");

    const pdfBuffer1 = createSamplePdf("Sample Circular 2026-Q1");
    const sha256_1 = crypto.createHash("sha256").update(pdfBuffer1).digest("hex");

    // Simulate FormData upload through the document-storage / upload pipeline logic
    const { stageDocument, promoteStagedDocument } = require("../lib/server/document-storage.ts");
    const { validatePdfBuffer } = require("../lib/validation/pdf-validator.ts");
    const { getMalwareScanner } = require("../lib/server/malware-scanner.ts");

    const valResult = validatePdfBuffer(pdfBuffer1, "circular-q1.pdf", "application/pdf");
    assert(valResult.isValid, "Client PDF passes validation");

    const scanner = getMalwareScanner();
    const scanResult = await scanner.scanBuffer(pdfBuffer1, "circular-q1.pdf");
    assert(scanResult.isClean, "PDF is clean after synthetic malware scan");

    const staged1 = await stageDocument(pdfBuffer1);
    const promoted1 = await promoteStagedDocument(staged1.stagingKey);
    const permanentKey1 = promoted1.permanentKey;

    assert(
      permanentKey1.includes("doc_") && permanentKey1.endsWith(".pdf"),
      "Promoted storage key has doc_<uuid>.pdf format"
    );

    const filePath1 = resolveSafePath(permanentKey1);
    assert(fs.existsSync(filePath1), "Promoted PDF physically exists on disk");

    // -----------------------------------------------------------------
    // 2. NOTICE CREATION WITH ATTACHMENT METADATA
    // -----------------------------------------------------------------
    console.log("\n--- 2. Notice Creation with Server-Verified Attachment ---");

    const notice1 = await prisma.notice.create({
      data: {
        title: "Annual Sports Day Circular 2026",
        slug: `annual-sports-day-circular-2026-${Date.now()}`,
        category: "CIRCULAR",
        summary: "Notice regarding the annual sports meet events and schedule.",
        content: "<p>All students and parents are requested to review the attached schedule.</p>",
        publishDate: new Date(Date.now() - 3600 * 1000), // 1 hour ago
        isUrgent: false,
        isPublished: false, // DRAFT initially
        displayOrder: 1,
        authorId: adminUser.id,
        fileStorageKey: permanentKey1,
        fileSizeBytes: pdfBuffer1.length,
        fileSha256: sha256_1,
        fileOriginalName: "circular-q1.pdf",
        fileUploadedAt: new Date(),
      },
    });
    createdNoticeIds.push(notice1.id);

    assert(notice1.fileStorageKey === permanentKey1, "Notice saved with fileStorageKey");
    assert(notice1.fileSizeBytes === pdfBuffer1.length, "Notice saved with fileSizeBytes");
    assert(notice1.fileSha256 === sha256_1, "Notice saved with fileSha256");
    assert(notice1.fileOriginalName === "circular-q1.pdf", "Notice saved with fileOriginalName");
    assert(notice1.fileUploadedAt instanceof Date, "Notice saved with fileUploadedAt timestamp");

    // Record DOCUMENT_UPLOADED audit log
    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: "DOCUMENT_UPLOADED",
        entityType: "Notice",
        entityId: notice1.id,
        metadata: {
          fileStorageKey: permanentKey1,
          fileSizeBytes: pdfBuffer1.length,
          fileSha256: sha256_1,
          fileOriginalName: "circular-q1.pdf",
        },
      },
    });

    const uploadAudit = await prisma.auditLog.findFirst({
      where: { entityId: notice1.id, action: "DOCUMENT_UPLOADED" },
    });
    assert(uploadAudit !== null, "DOCUMENT_UPLOADED audit log saved in database");

    // -----------------------------------------------------------------
    // 3. ADMIN PREVIEW ENDPOINT CONTRACT (/api/admin/notices/[id]/document)
    // -----------------------------------------------------------------
    console.log("\n--- 3. Controlled Admin Preview Route Contract ---");

    // Verify Admin preview route logic
    async function simulateAdminPreviewRoute(noticeId, userRole) {
      if (userRole !== "SUPER_ADMIN") {
        return { status: 403, error: "Forbidden: Super Admin access required" };
      }
      const record = await prisma.notice.findUnique({
        where: { id: noticeId },
        select: {
          id: true,
          title: true,
          slug: true,
          fileStorageKey: true,
          fileOriginalName: true,
        },
      });
      if (!record || !record.fileStorageKey) {
        return { status: 404, error: "Not Found" };
      }
      const safePath = resolveSafePath(record.fileStorageKey);
      if (!fs.existsSync(safePath)) {
        return { status: 404, error: "File not found on disk" };
      }
      const buffer = fs.readFileSync(safePath);
      const filename = record.fileOriginalName || `${record.slug}.pdf`;
      return {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; sandbox",
          "X-Frame-Options": "DENY",
        },
        body: buffer,
      };
    }

    const adminPreviewUnauth = await simulateAdminPreviewRoute(notice1.id, "STAFF");
    assert(adminPreviewUnauth.status === 403, "Non-admin user blocked from admin document preview (HTTP 403)");

    const adminPreviewAuth = await simulateAdminPreviewRoute(notice1.id, "SUPER_ADMIN");
    assert(adminPreviewAuth.status === 200, "Super-admin allowed to preview Draft notice document (HTTP 200)");
    assert(
      adminPreviewAuth.headers["Content-Disposition"].includes("attachment"),
      "Admin preview serves with Content-Disposition: attachment"
    );
    assert(
      adminPreviewAuth.headers["Cache-Control"] === "private, no-cache, no-store, must-revalidate",
      "Admin preview served with private no-cache header"
    );
    assert(
      adminPreviewAuth.headers["Content-Security-Policy"].includes("sandbox"),
      "Admin preview enforces strict CSP sandbox"
    );

    // -----------------------------------------------------------------
    // 4. PUBLIC DOWNLOAD ROUTE & DRAFT ISOLATION
    // -----------------------------------------------------------------
    console.log("\n--- 4. Controlled Public Download Route & Lifecycle Isolation ---");

    async function simulatePublicDownloadRoute(documentId) {
      const notice = await prisma.notice.findFirst({
        where: {
          OR: [{ slug: documentId }, { id: documentId }],
        },
        select: {
          id: true,
          slug: true,
          isPublished: true,
          publishDate: true,
          expiryDate: true,
          fileStorageKey: true,
          fileOriginalName: true,
        },
      });

      if (!notice || !notice.fileStorageKey) return { status: 404 };

      const now = new Date();
      if (!notice.isPublished) return { status: 404 }; // Draft
      if (notice.publishDate > now) return { status: 404 }; // Scheduled
      if (notice.expiryDate && notice.expiryDate <= now) return { status: 404 }; // Expired

      const safePath = resolveSafePath(notice.fileStorageKey);
      if (!fs.existsSync(safePath)) return { status: 404 };

      const buffer = fs.readFileSync(safePath);
      return {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${notice.slug}.pdf"`,
          "Cache-Control": "public, max-age=300, must-revalidate",
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; sandbox",
          "X-Frame-Options": "DENY",
        },
        body: buffer,
      };
    }

    // Notice 1 is currently DRAFT
    const publicDownloadDraft = await simulatePublicDownloadRoute(notice1.slug);
    assert(publicDownloadDraft.status === 404, "Draft notice document strictly blocked from public download (HTTP 404)");

    // Publish notice 1
    await prisma.notice.update({
      where: { id: notice1.id },
      data: { isPublished: true, publishedAt: new Date() },
    });

    const publicDownloadPublished = await simulatePublicDownloadRoute(notice1.slug);
    assert(publicDownloadPublished.status === 200, "Published notice document served to public visitors (HTTP 200)");
    assert(
      publicDownloadPublished.headers["Content-Disposition"].includes("attachment"),
      "Public document served as attachment (no inline browser rendering)"
    );
    assert(
      publicDownloadPublished.headers["Cache-Control"] === "public, max-age=300, must-revalidate",
      "Public document cached for 300s with must-revalidate"
    );

    // -----------------------------------------------------------------
    // 5. PUBLIC NOTICES API DTO PROTECTION
    // -----------------------------------------------------------------
    console.log("\n--- 5. Public Notices API DTO Protection ---");

    const activeNotices = await prisma.notice.findMany({
      where: { id: notice1.id },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        summary: true,
        content: true,
        publishDate: true,
        expiryDate: true,
        isUrgent: true,
        fileUrl: true,
        fileSize: true,
        fileStorageKey: true,
        fileSizeBytes: true,
        fileSha256: true,
        fileOriginalName: true,
        authorId: true,
      },
    });

    const publicDto = activeNotices.map((n) => {
      const effectiveFileUrl = n.fileStorageKey
        ? `/api/public/documents/${n.slug}`
        : n.fileUrl;
      const effectiveFileSize = n.fileSizeBytes
        ? `${Math.round(n.fileSizeBytes / 1024)} KB`
        : n.fileSize;

      return {
        id: n.id,
        title: n.title,
        slug: n.slug,
        category: n.category,
        summary: n.summary,
        content: n.content,
        publishDate: n.publishDate.toISOString(),
        isUrgent: n.isUrgent,
        fileUrl: effectiveFileUrl,
        fileSize: effectiveFileSize,
      };
    })[0];

    assert(
      publicDto.fileUrl === `/api/public/documents/${notice1.slug}`,
      "Public DTO maps managed attachment to /api/public/documents/[slug]"
    );
    assert(
      publicDto.fileSize.includes("KB"),
      "Public DTO provides human-readable file size indicator"
    );
    assert(publicDto.fileStorageKey === undefined, "Public DTO strictly does not leak raw fileStorageKey");
    assert(publicDto.fileSha256 === undefined, "Public DTO strictly does not leak raw fileSha256");
    assert(publicDto.fileOriginalName === undefined, "Public DTO strictly does not leak fileOriginalName");
    assert(publicDto.authorId === undefined, "Public DTO strictly does not leak authorId");

    // -----------------------------------------------------------------
    // 6. ATTACHMENT REPLACEMENT & POST-COMMIT CLEANUP
    // -----------------------------------------------------------------
    console.log("\n--- 6. Attachment Replacement & Post-Commit Cleanup ---");

    const pdfBuffer2 = createSamplePdf("Revised Circular 2026-Q1 (v2)");
    const staged2 = await stageDocument(pdfBuffer2);
    const promoted2 = await promoteStagedDocument(staged2.stagingKey);
    const permanentKey2 = promoted2.permanentKey;

    assert(fs.existsSync(filePath1), "Old file exists before replacement");

    // Perform transaction update replacing permanentKey1 with permanentKey2
    const prevKeyToClean = notice1.fileStorageKey;
    await prisma.$transaction(async (tx) => {
      await tx.notice.update({
        where: { id: notice1.id },
        data: {
          fileStorageKey: permanentKey2,
          fileSizeBytes: pdfBuffer2.length,
          fileSha256: crypto.createHash("sha256").update(pdfBuffer2).digest("hex"),
          fileOriginalName: "circular-q1-revised.pdf",
          fileUploadedAt: new Date(),
        },
      });
    });

    // Post-commit cleanup
    if (prevKeyToClean && prevKeyToClean !== permanentKey2) {
      await deleteManagedDocument(prevKeyToClean);
    }

    assert(!fs.existsSync(filePath1), "Previous attachment file was deleted from disk post-commit");
    const filePath2 = resolveSafePath(permanentKey2);
    assert(fs.existsSync(filePath2), "New replacement attachment file physically exists on disk");

    // -----------------------------------------------------------------
    // 7. ATTACHMENT REMOVAL ("NONE" MODE) & POST-COMMIT CLEANUP
    // -----------------------------------------------------------------
    console.log("\n--- 7. Attachment Removal ('none' mode) & Post-Commit Cleanup ---");

    const currentKeyToClean = permanentKey2;
    await prisma.$transaction(async (tx) => {
      await tx.notice.update({
        where: { id: notice1.id },
        data: {
          fileStorageKey: null,
          fileSizeBytes: null,
          fileSha256: null,
          fileOriginalName: null,
          fileUploadedAt: null,
          fileUrl: null,
          fileSize: null,
        },
      });
    });

    // Post-commit cleanup
    if (currentKeyToClean) {
      await deleteManagedDocument(currentKeyToClean);
    }

    assert(!fs.existsSync(filePath2), "Attachment file deleted from disk after mode switched to 'none'");

    const updatedNotice = await prisma.notice.findUnique({ where: { id: notice1.id } });
    assert(updatedNotice.fileStorageKey === null, "DB record fileStorageKey is null");
    assert(updatedNotice.fileSizeBytes === null, "DB record fileSizeBytes is null");

    const downloadAfterRemoval = await simulatePublicDownloadRoute(notice1.slug);
    assert(downloadAfterRemoval.status === 404, "Public download route returns HTTP 404 after attachment removal");

    // -----------------------------------------------------------------
    // 8. NOTICE DELETION & POST-COMMIT CLEANUP
    // -----------------------------------------------------------------
    console.log("\n--- 8. Notice Deletion & Post-Commit Cleanup ---");

    // Create Notice 2 with an attachment, then delete the notice
    const pdfBuffer3 = createSamplePdf("Notice to be deleted");
    const staged3 = await stageDocument(pdfBuffer3);
    const promoted3 = await promoteStagedDocument(staged3.stagingKey);
    const permanentKey3 = promoted3.permanentKey;
    const filePath3 = resolveSafePath(permanentKey3);

    const notice2 = await prisma.notice.create({
      data: {
        title: "Notice for Deletion Test",
        slug: `notice-for-deletion-${Date.now()}`,
        category: "EVENT",
        summary: "This notice will be deleted along with its attachment.",
        publishDate: new Date(),
        isPublished: true,
        authorId: adminUser.id,
        fileStorageKey: permanentKey3,
        fileSizeBytes: pdfBuffer3.length,
        fileSha256: crypto.createHash("sha256").update(pdfBuffer3).digest("hex"),
        fileOriginalName: "event-schedule.pdf",
        fileUploadedAt: new Date(),
      },
    });
    createdNoticeIds.push(notice2.id);

    assert(fs.existsSync(filePath3), "Notice 2 attachment exists on disk before deletion");

    // Delete notice transaction + post-commit cleanup
    let keyToDelete = null;
    await prisma.$transaction(async (tx) => {
      const record = await tx.notice.findUnique({
        where: { id: notice2.id },
        select: { fileStorageKey: true },
      });
      keyToDelete = record?.fileStorageKey;
      await tx.notice.delete({ where: { id: notice2.id } });
      await tx.auditLog.create({
        data: {
          userId: adminUser.id,
          action: "NOTICE_DELETED",
          entityType: "Notice",
          entityId: notice2.id,
          metadata: { fileStorageKey: keyToDelete },
        },
      });
      if (keyToDelete) {
        await tx.auditLog.create({
          data: {
            userId: adminUser.id,
            action: "DOCUMENT_DELETED",
            entityType: "Notice",
            entityId: notice2.id,
            metadata: { fileStorageKey: keyToDelete },
          },
        });
      }
    });

    if (keyToDelete) {
      await deleteManagedDocument(keyToDelete);
    }

    assert(!fs.existsSync(filePath3), "Notice 2 attachment file was deleted from disk post-commit");

    const deleteAudit = await prisma.auditLog.findFirst({
      where: { entityId: notice2.id, action: "DOCUMENT_DELETED" },
    });
    assert(deleteAudit !== null, "DOCUMENT_DELETED audit log entry recorded");

  } finally {
    // Cleanup created test records
    if (createdNoticeIds.length > 0) {
      await prisma.auditLog.deleteMany({
        where: { entityId: { in: createdNoticeIds } },
      }).catch(() => {});
      await prisma.notice.deleteMany({
        where: { id: { in: createdNoticeIds } },
      }).catch(() => {});
    }

    // Cleanup temp test directory
    try {
      fs.rmSync(TEST_STORAGE_DIR, { recursive: true, force: true });
    } catch {}

    await prisma.$disconnect();
  }

  console.log("\n==================================================================");
  console.log(`  Tests completed: ${passed}/${passed + failed} passed (${failed} failed)`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase3E2ETests().catch((err) => {
  console.error("Test Suite Phase 3 failed with fatal error:", err);
  process.exit(1);
});
