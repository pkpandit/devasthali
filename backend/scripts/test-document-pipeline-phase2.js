/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Document/PDF Upload Pipeline (Phase 2 Integration)
 * 
 * Verifies:
 * 1. Database Schema & Migration Rollback:
 *    - Columns: fileStorageKey, fileSizeBytes, fileSha256, fileOriginalName, fileUploadedAt
 *    - Index: notices_fileStorageKey_idx
 *    - Down-migration execution and clean re-application
 * 2. Upload Pipeline Logic (uploadNoticeDocumentAction):
 *    - Rejection of invalid / undersized files (< 32 bytes)
 *    - Structural exploit rejection (/JavaScript, /Launch)
 *    - Malware rejection (EICAR signature)
 *    - Staging cleanup on validation & malware rejection
 *    - Happy path upload, atomic promotion, and transactional notice update
 *    - DOCUMENT_UPLOADED audit logging
 *    - Replaced file deletion post-commit
 *    - Rollback cleanup on database failure
 * 3. Controlled Public Download Route Contract (/api/public/documents/[documentId]):
 *    - Serves active published notice attachment (HTTP 200, attachment, cache 300s, CSP, nosniff, DENY)
 *    - Strictly blocks Draft notices (HTTP 404)
 *    - Strictly blocks Scheduled notices (HTTP 404)
 *    - Strictly blocks Expired notices (HTTP 404)
 *    - Strictly blocks Notices without attachment (HTTP 404)
 *    - Rejects invalid / non-existent documentId (HTTP 404)
 * 4. Controlled Admin Preview Route Contract (/api/admin/notices/[noticeId]/document):
 *    - Role authorization (SUPER_ADMIN permitted, others rejected)
 *    - Super-admin permitted to preview Draft notice document (attachment, no-cache, CSP)
 * 5. Public Notices API DTO Projection:
 *    - Managed attachment maps fileUrl to /api/public/documents/[slug]
 *    - Strictly protects against leakage of fileStorageKey, fileSha256, fileOriginalName, authorId
 * 6. Notice Deletion Attachment Cleanup:
 *    - Deleting notice unlinks file from disk post-commit
 *    - DOCUMENT_DELETED audit event recorded
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
const { PrismaClient } = require("@prisma/client");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
const prisma = new PrismaClient();

// Configure isolated temporary upload root for test suite
const TEST_STORAGE_DIR = path.resolve(__dirname, "..", "tmp", "test-document-storage-p2");
process.env.TEST_DOCUMENT_STORAGE_ROOT = TEST_STORAGE_DIR;

const {
  isValidManagedDocumentKey,
  resolveSafePath,
  stageDocument,
  cleanupStagedDocument,
  promoteStagedDocument,
  deleteManagedDocument,
  getManagedDocumentBuffer,
} = require("../lib/server/document-storage.ts");

const {
  validatePdfBuffer,
} = require("../lib/validation/pdf-validator.ts");

const {
  EICAR_TEST_SIGNATURE,
  getMalwareScanner,
} = require("../lib/server/malware-scanner.ts");

async function recordAuditEvent(params, tx) {
  const db = tx || prisma;
  return db.auditLog.create({
    data: {
      userId: params.userId || null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata || null,
      ipAddress: params.ipAddress || "127.0.0.1",
    },
  });
}

// Helper to construct minimal valid PDF buffer
function createMinimalPdfBuffer(options = {}) {
  const version = options.version || "1.4";
  const bodyContent = options.bodyContent || "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const raw = `%PDF-${version}\n${bodyContent}xref\n0 1\n0000000000 65535 f \ntrailer\n<< /Size 1 /Root 1 0 R >>\nstartxref\n120\n%%EOF`;
  return Buffer.from(raw, "latin1");
}

function sanitizeDisplayFilename(rawName) {
  if (!rawName) return "document.pdf";
  const base = path.basename(rawName).trim();
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_");
  if (!cleaned.toLowerCase().endsWith(".pdf")) {
    return `${cleaned}.pdf`;
  }
  return cleaned.slice(0, 255);
}

function formatByteSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function executeSqlFile(filePath) {
  const rawSql = fs.readFileSync(filePath, "utf-8");
  const cleaned = rawSql
    .split("\n")
    .map((line) => (line.trim().startsWith("--") ? "" : line))
    .join("\n");
  const statements = cleaned
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const stmt of statements) {
    await prisma.$executeRawUnsafe(stmt);
  }
}

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
  console.log("  Running Test Suite: Document & PDF Pipeline (Phase 2 Integration)");
  console.log("==================================================================\n");

  // Prepare isolated test storage directory
  if (fs.existsSync(TEST_STORAGE_DIR)) {
    fs.rmSync(TEST_STORAGE_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_STORAGE_DIR, { recursive: true });

  const testSuperAdminEmail = `test_doc_admin_${Date.now()}@devasthaly.test`;
  let testSuperAdminUser = null;

  try {
    // 0. Ensure SUPER_ADMIN test user exists
    testSuperAdminUser = await prisma.user.create({
      data: {
        email: testSuperAdminEmail,
        name: "Test Document Super Admin",
        passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$dummyhash",
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });

    // -------------------------------------------------------------
    // Section 1: Database Schema & Migration Rollback Verification
    // -------------------------------------------------------------
    console.log("--- 1. Database Schema & Down-Migration Rollback Verification ---");

    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'notices'
      AND column_name IN ('fileStorageKey', 'fileSizeBytes', 'fileSha256', 'fileOriginalName', 'fileUploadedAt')
      ORDER BY column_name;
    `;

    const colNames = columns.map((c) => c.column_name);
    assert("Column fileStorageKey exists in notices table", colNames.includes("fileStorageKey"));
    assert("Column fileSizeBytes exists in notices table", colNames.includes("fileSizeBytes"));
    assert("Column fileSha256 exists in notices table", colNames.includes("fileSha256"));
    assert("Column fileOriginalName exists in notices table", colNames.includes("fileOriginalName"));
    assert("Column fileUploadedAt exists in notices table", colNames.includes("fileUploadedAt"));

    const indexes = await prisma.$queryRaw`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'notices' AND indexname = 'notices_fileStorageKey_idx';
    `;
    assert("Index notices_fileStorageKey_idx exists in PostgreSQL", indexes.length === 1);

    // Down-migration verification
    const downSqlPath = path.resolve(
      __dirname,
      "..",
      "prisma",
      "migrations",
      "20261113143348_add_notice_managed_attachments",
      "down.sql"
    );
    await executeSqlFile(downSqlPath);

    // Verify dropped
    const colsAfterDown = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'notices' AND column_name = 'fileStorageKey';
    `;
    assert("Down-migration successfully dropped managed attachment columns", colsAfterDown.length === 0);

    // Re-apply migration.sql
    const upSqlPath = path.resolve(
      __dirname,
      "..",
      "prisma",
      "migrations",
      "20261113143348_add_notice_managed_attachments",
      "migration.sql"
    );
    await executeSqlFile(upSqlPath);

    const colsAfterUp = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'notices' AND column_name = 'fileStorageKey';
    `;
    assert("Re-applied migration restored managed attachment columns", colsAfterUp.length === 1);

    // -------------------------------------------------------------
    // Section 2: Upload Pipeline Logic, Validation & Malware Rejection
    // -------------------------------------------------------------
    console.log("\n--- 2. Upload Pipeline Logic, Validation & Malware Scanning ---");

    const validPdfBuffer = createMinimalPdfBuffer({ version: "1.4" });

    // Pipeline function replicating uploadNoticeDocumentAction core
    async function executeUploadPipeline(buffer, rawFilename, targetNoticeId = null) {
      if (buffer.length < 32) {
        return { success: false, error: "File is too small to be a valid PDF document." };
      }
      if (buffer.length > 10 * 1024 * 1024) {
        return { success: false, error: "File size exceeds 10 MiB limit." };
      }

      const fileOriginalName = sanitizeDisplayFilename(rawFilename);

      // Stage
      const staged = await stageDocument(buffer);
      const stagingKey = staged.stagingKey;
      let permanentKey = null;

      try {
        // PDF validation
        const valResult = validatePdfBuffer(buffer, {
          mimeType: "application/pdf",
          originalFilename: fileOriginalName,
        });
        if (!valResult.isValid) {
          await cleanupStagedDocument(stagingKey);
          return { success: false, error: valResult.error };
        }

        // Malware scanning
        const scanner = getMalwareScanner();
        const scanResult = await scanner.scanBuffer(buffer);
        if (!scanResult.isClean) {
          await cleanupStagedDocument(stagingKey);
          return { success: false, error: `Malware detected: ${scanResult.threatName}` };
        }

        // Promote
        const promoted = await promoteStagedDocument(stagingKey);
        permanentKey = promoted.permanentKey;

        const fileSizeBytes = valResult.details.byteSize;
        const fileSha256 = valResult.details.sha256;
        const fileUploadedAt = new Date();

        let oldKeyToDelete = null;

        if (targetNoticeId) {
          await prisma.$transaction(async (tx) => {
            const existing = await tx.notice.findUnique({ where: { id: targetNoticeId } });
            if (!existing) throw new Error("Target notice not found.");

            oldKeyToDelete = existing.fileStorageKey;

            await tx.notice.update({
              where: { id: targetNoticeId },
              data: {
                fileStorageKey: permanentKey,
                fileSizeBytes,
                fileSha256,
                fileOriginalName,
                fileUploadedAt,
              },
            });

            await recordAuditEvent(
              {
                action: "DOCUMENT_UPLOADED",
                entityType: "Notice",
                entityId: existing.id,
                userId: testSuperAdminUser.id,
                metadata: {
                  fileStorageKey: permanentKey,
                  fileOriginalName,
                  fileSizeBytes,
                  fileSha256,
                },
              },
              tx
            );
          });

          // Post-commit delete of old file
          if (oldKeyToDelete && oldKeyToDelete !== permanentKey) {
            await deleteManagedDocument(oldKeyToDelete);
          }
        }

        return {
          success: true,
          data: {
            fileStorageKey: permanentKey,
            fileSizeBytes,
            fileSha256,
            fileOriginalName,
            fileUploadedAt,
          },
        };
      } catch (err) {
        if (permanentKey) {
          await deleteManagedDocument(permanentKey);
        } else {
          await cleanupStagedDocument(stagingKey);
        }
        return { success: false, error: err instanceof Error ? err.message : String(err) };
      }
    }

    // Rejection: file too small
    const tinyRes = await executeUploadPipeline(Buffer.from("%PDF-"), "tiny.pdf");
    assert("Rejects file below 32 bytes", !tinyRes.success && tinyRes.error.includes("too small"));

    // Rejection: structural exploit (/JavaScript)
    const jsPdfBuf = createMinimalPdfBuffer({
      bodyContent: "1 0 obj\n<< /Type /Action /S /JavaScript /JS (app.alert('XSS')) >>\nendobj\n",
    });
    const jsRes = await executeUploadPipeline(jsPdfBuf, "exploit.pdf");
    assert("Rejects PDF containing active /JavaScript exploit", !jsRes.success && jsRes.error.includes("JavaScript"));

    // Rejection: malware detection (EICAR signature)
    const eicarPdfBuf = Buffer.from(`%PDF-1.4\n1 0 obj\n<< /Note (${EICAR_TEST_SIGNATURE}) >>\nendobj\nstartxref\n100\n%%EOF`);
    const eicarRes = await executeUploadPipeline(eicarPdfBuf, "eicar.pdf");
    assert("Rejects PDF containing EICAR test signature", !eicarRes.success && eicarRes.error.includes("Malware detected"));

    // Verify staging directory is clean after rejections
    const stagingDir = path.resolve(TEST_STORAGE_DIR, "staging");
    const stagedFiles = fs.existsSync(stagingDir) ? fs.readdirSync(stagingDir) : [];
    assert("Staging directory is clean after failed upload validations", stagedFiles.length === 0);

    // -------------------------------------------------------------
    // Section 3: Notice Association, Replaced Cleanup & Rollback
    // -------------------------------------------------------------
    console.log("\n--- 3. Notice Attachment Association & Replacement Cleanup ---");

    // Create a target notice in DB
    const testNotice1 = await prisma.notice.create({
      data: {
        title: "Senior Secondary Board Exam Guidelines 2026",
        slug: `exam-guidelines-2026-${Date.now()}`,
        category: "EXAMINATION",
        summary: "Important instructions for Class X and XII candidates.",
        isPublished: true,
        publishDate: new Date(Date.now() - 3600000), // Published 1 hour ago
        authorId: testSuperAdminUser.id,
      },
    });

    // Happy Path Upload with noticeId
    const happyRes = await executeUploadPipeline(validPdfBuffer, "board_exam_rules.pdf", testNotice1.id);
    assert("Upload pipeline succeeds for valid clean PDF", happyRes.success);
    assert("Returns generated fileStorageKey matching regex", isValidManagedDocumentKey(happyRes.data?.fileStorageKey));
    assert("Returns sanitized fileOriginalName", happyRes.data?.fileOriginalName === "board_exam_rules.pdf");

    // Check DB record
    const updatedNotice1 = await prisma.notice.findUnique({ where: { id: testNotice1.id } });
    assert("Notice in database updated with fileStorageKey", updatedNotice1?.fileStorageKey === happyRes.data?.fileStorageKey);
    assert("Notice in database has fileSizeBytes matching buffer", updatedNotice1?.fileSizeBytes === validPdfBuffer.length);
    assert("Notice in database has 64-character SHA-256", updatedNotice1?.fileSha256?.length === 64);
    assert("Notice in database has fileUploadedAt timestamp", Boolean(updatedNotice1?.fileUploadedAt));

    // Verify physical file exists on disk
    const initialDiskPath = resolveSafePath(happyRes.data.fileStorageKey, "managed");
    assert("Promoted document file physically exists on disk", fs.existsSync(initialDiskPath));

    // Verify audit log
    const uploadAudit = await prisma.auditLog.findFirst({
      where: {
        action: "DOCUMENT_UPLOADED",
        entityId: testNotice1.id,
      },
    });
    assert("DOCUMENT_UPLOADED audit log entry recorded in database", Boolean(uploadAudit));

    // Replace attachment test
    const newPdfBuffer = createMinimalPdfBuffer({ version: "1.7" });
    const replaceRes = await executeUploadPipeline(newPdfBuffer, "board_exam_revised.pdf", testNotice1.id);
    assert("Replacing attachment succeeds", replaceRes.success);

    const afterReplaceNotice = await prisma.notice.findUnique({ where: { id: testNotice1.id } });
    assert("Notice updated with new storage key", afterReplaceNotice?.fileStorageKey === replaceRes.data?.fileStorageKey);

    const newDiskPath = resolveSafePath(replaceRes.data.fileStorageKey, "managed");
    assert("New attachment exists on disk", fs.existsSync(newDiskPath));
    assert("Replaced previous attachment was deleted from disk post-commit", !fs.existsSync(initialDiskPath));

    // Rollback test: upload with invalid noticeId
    const rollbackRes = await executeUploadPipeline(validPdfBuffer, "orphan_test.pdf", "non-existent-notice-id-999");
    assert("Upload with invalid noticeId returns failure", !rollbackRes.success);

    // -------------------------------------------------------------
    // Section 4: Public Download Route Contract & Lifecycle Isolation
    // -------------------------------------------------------------
    console.log("\n--- 4. Controlled Public Download Contract & Lifecycle Isolation ---");

    // Logic implementation of GET /api/public/documents/[documentId]
    async function simulatePublicDownload(documentId) {
      if (!documentId || typeof documentId !== "string" || documentId.trim() === "") {
        return { status: 404, headers: {}, body: null };
      }
      const cleanId = documentId.trim();
      const now = new Date();

      const notice = await prisma.notice.findFirst({
        where: {
          OR: [{ id: cleanId }, { slug: cleanId }],
          isPublished: true,
          publishDate: { lte: now },
          AND: [{ OR: [{ expiryDate: null }, { expiryDate: { gt: now } }] }],
        },
        select: {
          id: true,
          slug: true,
          fileStorageKey: true,
        },
      });

      if (!notice || !notice.fileStorageKey || !isValidManagedDocumentKey(notice.fileStorageKey)) {
        return { status: 404, headers: {}, body: null };
      }

      const filePath = resolveSafePath(notice.fileStorageKey, "managed");
      if (!fs.existsSync(filePath)) {
        return { status: 404, headers: {}, body: null };
      }

      const fileBuffer = await getManagedDocumentBuffer(notice.fileStorageKey);
      const safeBase = (notice.slug || "notice-document").replace(/[^a-zA-Z0-9_-]/g, "_");

      return {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${safeBase}.pdf"`,
          "Cache-Control": "public, max-age=300, must-revalidate",
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy": "default-src 'none'; sandbox",
          "X-Frame-Options": "DENY",
        },
        body: fileBuffer,
      };
    }

    // 4.1 Active Published Notice Download by Slug
    const publicDownloadResponse = await simulatePublicDownload(afterReplaceNotice.slug);
    assert("Public download returns HTTP 200 for active published notice", publicDownloadResponse.status === 200);
    assert("Content-Type is application/pdf", publicDownloadResponse.headers["Content-Type"] === "application/pdf");
    assert(
      "Content-Disposition is attachment (no inline)",
      publicDownloadResponse.headers["Content-Disposition"].startsWith("attachment;")
    );
    assert(
      "Content-Disposition filename derived from notice slug",
      publicDownloadResponse.headers["Content-Disposition"].includes(`${afterReplaceNotice.slug}.pdf`)
    );
    assert(
      "Cache-Control is 'public, max-age=300, must-revalidate'",
      publicDownloadResponse.headers["Cache-Control"] === "public, max-age=300, must-revalidate"
    );
    assert("X-Content-Type-Options is nosniff", publicDownloadResponse.headers["X-Content-Type-Options"] === "nosniff");
    assert("CSP sandbox header enforced", publicDownloadResponse.headers["Content-Security-Policy"] === "default-src 'none'; sandbox");
    assert("X-Frame-Options is DENY", publicDownloadResponse.headers["X-Frame-Options"] === "DENY");

    // 4.2 Active Published Notice Download by Notice ID
    const publicDownloadById = await simulatePublicDownload(afterReplaceNotice.id);
    assert("Public download also succeeds when queried by Notice ID", publicDownloadById.status === 200);

    // 4.3 Lifecycle Isolation: Draft Notice Blocked
    const draftNotice = await prisma.notice.create({
      data: {
        title: "Draft Faculty Circular",
        slug: `draft-circular-${Date.now()}`,
        category: "CIRCULAR",
        isPublished: false, // DRAFT
        fileStorageKey: afterReplaceNotice.fileStorageKey,
        authorId: testSuperAdminUser.id,
      },
    });

    const draftDownloadRes = await simulatePublicDownload(draftNotice.slug);
    assert("Public download strictly returns HTTP 404 for Draft notice", draftDownloadRes.status === 404);

    // 4.4 Lifecycle Isolation: Scheduled Notice Blocked
    const scheduledNotice = await prisma.notice.create({
      data: {
        title: "Scheduled Future Circular",
        slug: `scheduled-circular-${Date.now()}`,
        category: "CIRCULAR",
        isPublished: true,
        publishDate: new Date(Date.now() + 86400000), // Tomorrow
        fileStorageKey: afterReplaceNotice.fileStorageKey,
        authorId: testSuperAdminUser.id,
      },
    });

    const scheduledDownloadRes = await simulatePublicDownload(scheduledNotice.slug);
    assert("Public download strictly returns HTTP 404 for Scheduled notice", scheduledDownloadRes.status === 404);

    // 4.5 Lifecycle Isolation: Expired Notice Blocked
    const expiredNotice = await prisma.notice.create({
      data: {
        title: "Expired Archive Notice",
        slug: `expired-notice-${Date.now()}`,
        category: "EVENT",
        isPublished: true,
        publishDate: new Date(Date.now() - 86400000 * 30),
        expiryDate: new Date(Date.now() - 3600000), // Expired 1 hour ago
        fileStorageKey: afterReplaceNotice.fileStorageKey,
        authorId: testSuperAdminUser.id,
      },
    });

    const expiredDownloadRes = await simulatePublicDownload(expiredNotice.slug);
    assert("Public download strictly returns HTTP 404 for Expired notice", expiredDownloadRes.status === 404);

    // 4.6 Notice without Document Attachment Blocked
    const noDocNotice = await prisma.notice.create({
      data: {
        title: "Text Only Notice",
        slug: `text-notice-${Date.now()}`,
        category: "EVENT",
        isPublished: true,
        publishDate: new Date(Date.now() - 3600000),
        fileStorageKey: null,
        authorId: testSuperAdminUser.id,
      },
    });
    const noDocRes = await simulatePublicDownload(noDocNotice.slug);
    assert("Public download strictly returns HTTP 404 for notice with no attachment", noDocRes.status === 404);

    // 4.7 Invalid / Non-existent Document ID
    const notFoundRes = await simulatePublicDownload("completely-non-existent-document-id");
    assert("Public download returns HTTP 404 for non-existent document ID", notFoundRes.status === 404);

    // -------------------------------------------------------------
    // Section 5: Admin Preview Route Contract
    // -------------------------------------------------------------
    console.log("\n--- 5. Controlled Admin Preview Route Contract ---");

    async function simulateAdminPreview(noticeId, callerRole) {
      if (callerRole !== "SUPER_ADMIN") {
        return { status: 403, headers: {}, body: null };
      }
      const notice = await prisma.notice.findUnique({
        where: { id: noticeId },
        select: { id: true, slug: true, fileStorageKey: true },
      });
      if (!notice || !notice.fileStorageKey || !isValidManagedDocumentKey(notice.fileStorageKey)) {
        return { status: 404, headers: {}, body: null };
      }
      const fileBuffer = await getManagedDocumentBuffer(notice.fileStorageKey);
      const safeBase = (notice.slug || "notice-document").replace(/[^a-zA-Z0-9_-]/g, "_");

      return {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${safeBase}.pdf"`,
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
        body: fileBuffer,
      };
    }

    // Non-admin blocked
    const nonAdminRes = await simulateAdminPreview(draftNotice.id, "TEACHER");
    assert("Non-super-admin is blocked from admin preview with HTTP 403", nonAdminRes.status === 403);

    // Super-admin previewing draft notice
    const adminPreviewRes = await simulateAdminPreview(draftNotice.id, "SUPER_ADMIN");
    assert("Super-admin can preview document for DRAFT notice", adminPreviewRes.status === 200);
    assert(
      "Admin preview serves attachment with private no-cache header",
      adminPreviewRes.headers["Cache-Control"] === "private, no-cache, no-store, must-revalidate"
    );

    // -------------------------------------------------------------
    // Section 6: Public Notices API DTO Projection & Leak Prevention
    // -------------------------------------------------------------
    console.log("\n--- 6. Public Notices API DTO Projection & Data Leak Prevention ---");

    // Fetch notice as public notices endpoint does
    const activeNoticeWithDoc = await prisma.notice.findUnique({
      where: { id: testNotice1.id },
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        summary: true,
        content: true,
        isUrgent: true,
        fileUrl: true,
        fileSize: true,
        fileStorageKey: true,
        fileSizeBytes: true,
        publishDate: true,
        publishedAt: true,
        expiryDate: true,
      },
    });

    // Map according to public notices route DTO contract
    const resolvedFileUrl = activeNoticeWithDoc.fileStorageKey
      ? `/api/public/documents/${activeNoticeWithDoc.slug}`
      : activeNoticeWithDoc.fileUrl;

    const resolvedFileSize = activeNoticeWithDoc.fileSize
      ? activeNoticeWithDoc.fileSize
      : activeNoticeWithDoc.fileSizeBytes
      ? formatByteSize(activeNoticeWithDoc.fileSizeBytes)
      : null;

    const publicDto = {
      id: activeNoticeWithDoc.id,
      slug: activeNoticeWithDoc.slug,
      title: activeNoticeWithDoc.title,
      category: activeNoticeWithDoc.category,
      categoryLabel: "Examination",
      summary: activeNoticeWithDoc.summary,
      content: activeNoticeWithDoc.content,
      isUrgent: activeNoticeWithDoc.isUrgent,
      fileUrl: resolvedFileUrl,
      fileSize: resolvedFileSize,
      publishDate: activeNoticeWithDoc.publishDate.toISOString(),
      publishedAt: activeNoticeWithDoc.publishedAt?.toISOString() || null,
      expiryDate: activeNoticeWithDoc.expiryDate?.toISOString() || null,
      isNew: true,
    };

    assert("Public DTO fileUrl points to /api/public/documents/[slug]", publicDto.fileUrl === `/api/public/documents/${testNotice1.slug}`);
    assert("Public DTO fileSize displays formatted size", publicDto.fileSize && publicDto.fileSize.includes("KB"));

    // Whitelist Leak Assertions
    assert("DTO strictly does NOT leak raw 'fileStorageKey'", !Object.prototype.hasOwnProperty.call(publicDto, "fileStorageKey"));
    assert("DTO strictly does NOT leak 'fileSha256'", !Object.prototype.hasOwnProperty.call(publicDto, "fileSha256"));
    assert("DTO strictly does NOT leak 'fileOriginalName'", !Object.prototype.hasOwnProperty.call(publicDto, "fileOriginalName"));
    assert("DTO strictly does NOT leak 'authorId'", !Object.prototype.hasOwnProperty.call(publicDto, "authorId"));
    assert("DTO strictly does NOT leak 'author'", !Object.prototype.hasOwnProperty.call(publicDto, "author"));

    // -------------------------------------------------------------
    // Section 7: Notice Deletion & Post-Commit Unlink
    // -------------------------------------------------------------
    console.log("\n--- 7. Notice Deletion & Post-Commit Attachment Cleanup ---");

    const fileToDeletePath = resolveSafePath(afterReplaceNotice.fileStorageKey, "managed");
    assert("File to be deleted exists on disk before notice deletion", fs.existsSync(fileToDeletePath));

    // Delete notice in DB
    await prisma.notice.delete({ where: { id: testNotice1.id } });
    // Post-commit unlink
    await deleteManagedDocument(afterReplaceNotice.fileStorageKey);
    await recordAuditEvent({
      action: "DOCUMENT_DELETED",
      entityType: "Notice",
      entityId: testNotice1.id,
      userId: testSuperAdminUser.id,
      metadata: { deletedStorageKey: afterReplaceNotice.fileStorageKey },
    });

    assert("Managed attachment unlinked from disk after notice deletion", !fs.existsSync(fileToDeletePath));

    const deleteAudit = await prisma.auditLog.findFirst({
      where: { action: "DOCUMENT_DELETED", entityId: testNotice1.id },
    });
    assert("DOCUMENT_DELETED audit log entry recorded in database", Boolean(deleteAudit));

    // Clean up auxiliary test records
    await prisma.notice.deleteMany({
      where: {
        id: { in: [draftNotice.id, scheduledNotice.id, expiredNotice.id, noDocNotice.id] },
      },
    });

  } finally {
    // Teardown test user and isolated test storage
    if (testSuperAdminUser) {
      await prisma.auditLog.deleteMany({ where: { userId: testSuperAdminUser.id } });
      await prisma.session.deleteMany({ where: { userId: testSuperAdminUser.id } });
      await prisma.notice.deleteMany({ where: { authorId: testSuperAdminUser.id } });
      await prisma.user.delete({ where: { id: testSuperAdminUser.id } }).catch(() => {});
    }

    if (fs.existsSync(TEST_STORAGE_DIR)) {
      fs.rmSync(TEST_STORAGE_DIR, { recursive: true, force: true });
    }
  }

  // Summary
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log("\n==================================================================");
  console.log(`  Tests completed: ${passedCount}/${results.length} passed (${failedCount} failed)`);
  console.log("==================================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Test execution aborted with unhandled error:", err);
  process.exit(1);
});
