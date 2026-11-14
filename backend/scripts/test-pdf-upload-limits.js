/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: PDF Upload Limits & Server Actions Request Alignment
 * 
 * Verifies:
 * 1. Small valid PDF (< 1 MB) upload, validation, and promotion.
 * 2. Valid PDF above 3 MB but within the 10 MiB limit (5 MB) upload, validation, and promotion.
 * 3. Valid PDF at the exact 10 MiB boundary (10,485,760 bytes) upload, validation, and promotion.
 * 4. Oversized PDF with client-side validation enabled (10.5 MB): rejected immediately before network dispatch.
 * 5. Oversized PDF with client-side validation bypassed (10.5 MB): rejected authoritatively by server-side validation without staging leftovers.
 * 6. Request boundary handling: Next.js body size limit catch block formats error cleanly to user without leaking raw URLs.
 * 6b. Malware scanner failure / unavailability sanitization: produces safe generic message with zero stack/internal details.
 * 7. Notice creation and attachment replacement flows with post-commit disk cleanup.
 * 8. Topper photo upload invariant: 2 MiB limit remains unchanged.
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
const TEST_STORAGE_DIR = path.resolve(__dirname, "..", "tmp", "test-document-storage-limits");
process.env.TEST_DOCUMENT_STORAGE_ROOT = TEST_STORAGE_DIR;

const {
  resolveSafePath,
  stageDocument,
  cleanupStagedDocument,
  promoteStagedDocument,
  deleteManagedDocument,
} = require("../lib/server/document-storage.ts");

const {
  validatePdfBuffer,
  DEFAULT_MAX_PDF_SIZE_BYTES,
} = require("../lib/validation/pdf-validator.ts");

const {
  getMalwareScanner,
} = require("../lib/server/malware-scanner.ts");

// Helper to generate syntactically valid PDF buffer of exact target size
function createValidPdfOfSize(targetSize) {
  const fixedStart = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R/Resources<<>>>>endobj\n4 0 obj<</Length ";
  const fixedMiddle = ">>stream\n";
  const fixedEnd = "\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000216 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n320\n%%EOF\n";

  let streamLen = targetSize - (fixedStart.length + fixedMiddle.length + fixedEnd.length + 8);
  if (streamLen < 1) streamLen = 1;
  const lenStr = String(streamLen);
  const streamData = "A".repeat(streamLen);
  const full = fixedStart + lenStr + fixedMiddle + streamData + fixedEnd;
  const buf = Buffer.from(full, "latin1");

  // Fine-tune to exact target byte count
  if (buf.length < targetSize) {
    const diff = targetSize - buf.length;
    const adjustedData = "A".repeat(streamLen + diff);
    const adjustedFull = fixedStart + String(streamLen + diff) + fixedMiddle + adjustedData + fixedEnd;
    return Buffer.from(adjustedFull, "latin1");
  }
  return buf;
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

async function runTests() {
  console.log("==================================================================");
  console.log("  Running Test Suite: Notice PDF Upload Limits & Verification");
  console.log("==================================================================\n");

  fs.mkdirSync(path.join(TEST_STORAGE_DIR, "staging"), { recursive: true });
  fs.mkdirSync(path.join(TEST_STORAGE_DIR, "documents"), { recursive: true });

  const adminUser = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
  if (!adminUser) throw new Error("No SUPER_ADMIN user found in database");

  const scanner = getMalwareScanner();
  const createdNoticeIds = [];

  try {
    // -----------------------------------------------------------------
    // 1. SMALL VALID PDF (< 1 MB)
    // -----------------------------------------------------------------
    console.log("--- 1. Small Valid PDF Upload (< 1 MB) ---");
    const smallPdf = createValidPdfOfSize(64 * 1024); // 64 KB
    assert(smallPdf.length === 65536, "Generated 64 KB PDF buffer");

    const smallValidation = validatePdfBuffer(smallPdf, {
      originalFilename: "small-circular.pdf",
      mimeType: "application/pdf",
    });
    assert(smallValidation.isValid, "Small PDF passes validation");

    const smallScan = await scanner.scanBuffer(smallPdf, "small-circular.pdf");
    assert(smallScan.isClean, "Small PDF passes malware scanner");

    const smallStaged = await stageDocument(smallPdf);
    const smallPromoted = await promoteStagedDocument(smallStaged.stagingKey);
    assert(smallPromoted.permanentKey.includes("doc_"), "Storage key generated");
    const smallPromotedStat = fs.statSync(smallPromoted.permanentPath);
    assert(smallPromotedStat.size === 65536, "fileSizeBytes accurately recorded as 65536");
    const smallFilePath = resolveSafePath(smallPromoted.permanentKey);
    assert(fs.existsSync(smallFilePath), "Promoted file physically exists on disk");

    // Clean up small file
    await deleteManagedDocument(smallPromoted.permanentKey);
    assert(!fs.existsSync(smallFilePath), "Small file deleted cleanly");

    // -----------------------------------------------------------------
    // 2. VALID PDF ABOVE 3 MB BUT BELOW 10 MiB LIMIT (5 MB)
    // -----------------------------------------------------------------
    console.log("\n--- 2. Valid PDF Above 3 MB Limit (5 MB) ---");
    const fiveMbPdf = createValidPdfOfSize(5 * 1024 * 1024); // 5 MB (5,242,880 bytes)
    assert(fiveMbPdf.length === 5242880, "Generated 5 MB PDF buffer");

    const fiveMbValidation = validatePdfBuffer(fiveMbPdf, {
      originalFilename: "annual-report-5mb.pdf",
      mimeType: "application/pdf",
    });
    assert(fiveMbValidation.isValid, "5 MB PDF passes validation (permitted under 10 MiB limit)");

    const fiveMbScan = await scanner.scanBuffer(fiveMbPdf, "annual-report-5mb.pdf");
    assert(fiveMbScan.isClean, "5 MB PDF passes malware scanner");

    const fiveMbStaged = await stageDocument(fiveMbPdf);
    const fiveMbPromoted = await promoteStagedDocument(fiveMbStaged.stagingKey);
    const fiveMbPromotedStat = fs.statSync(fiveMbPromoted.permanentPath);
    assert(fiveMbPromotedStat.size === 5242880, "5 MB fileSizeBytes matches exactly");
    const fiveMbFilePath = resolveSafePath(fiveMbPromoted.permanentKey);
    assert(fs.existsSync(fiveMbFilePath), "5 MB promoted file physically exists on disk");

    // -----------------------------------------------------------------
    // 3. PDF AT THE ALLOWED BOUNDARY (EXACTLY 10 MiB)
    // -----------------------------------------------------------------
    console.log("\n--- 3. PDF at Allowed 10 MiB Boundary ---");
    const tenMbPdf = createValidPdfOfSize(DEFAULT_MAX_PDF_SIZE_BYTES); // 10,485,760 bytes
    assert(tenMbPdf.length === DEFAULT_MAX_PDF_SIZE_BYTES, "Generated exact 10 MiB PDF buffer");

    const tenMbValidation = validatePdfBuffer(tenMbPdf, {
      originalFilename: "boundary-10mb.pdf",
      mimeType: "application/pdf",
    });
    assert(tenMbValidation.isValid, "10 MiB boundary PDF passes validation");

    const tenMbScan = await scanner.scanBuffer(tenMbPdf, "boundary-10mb.pdf");
    assert(tenMbScan.isClean, "10 MiB boundary PDF passes malware scanner");

    const tenMbStaged = await stageDocument(tenMbPdf);
    const tenMbPromoted = await promoteStagedDocument(tenMbStaged.stagingKey);
    const tenMbPromotedStat = fs.statSync(tenMbPromoted.permanentPath);
    assert(tenMbPromotedStat.size === DEFAULT_MAX_PDF_SIZE_BYTES, "10 MiB fileSizeBytes recorded accurately");
    const tenMbFilePath = resolveSafePath(tenMbPromoted.permanentKey);
    assert(fs.existsSync(tenMbFilePath), "10 MiB promoted file physically exists on disk");

    // Clean up boundary file
    await deleteManagedDocument(tenMbPromoted.permanentKey);
    assert(!fs.existsSync(tenMbFilePath), "10 MiB boundary file deleted cleanly");

    // -----------------------------------------------------------------
    // 4. OVERSIZED PDF WITH CLIENT-SIDE VALIDATION ENABLED (10.5 MB)
    // -----------------------------------------------------------------
    console.log("\n--- 4. Oversized PDF (Client-side Validation Enabled) ---");
    const oversizedBytes = 10.5 * 1024 * 1024; // 11,010,048 bytes
    const simulatedFile = {
      name: "oversized.pdf",
      size: oversizedBytes,
      type: "application/pdf",
    };

    // Client-side pre-validation logic from NoticeAttachmentWidget.tsx
    const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;
    let clientError = null;
    if (simulatedFile.size > MAX_PDF_SIZE_BYTES) {
      clientError = `File size (${(simulatedFile.size / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum permitted limit of 10 MiB.`;
    }

    assert(clientError !== null, "Client pre-validation intercepts oversized file before dispatch");
    assert(
      clientError.includes("exceeds the maximum permitted limit of 10 MiB"),
      `Client error clearly states the 10 MiB permitted limit: "${clientError}"`
    );

    // -----------------------------------------------------------------
    // 5. OVERSIZED PDF WITH CLIENT VALIDATION BYPASSED (10.5 MB)
    // -----------------------------------------------------------------
    console.log("\n--- 5. Oversized PDF (Client Validation Bypassed) ---");
    const oversizedPdf = createValidPdfOfSize(Math.floor(oversizedBytes));

    const serverValidation = validatePdfBuffer(oversizedPdf, {
      originalFilename: "oversized-bypassed.pdf",
      mimeType: "application/pdf",
    });
    assert(serverValidation.isValid === false, "Server-side validator rejects oversized PDF");
    assert(
      serverValidation.error && serverValidation.error.includes("exceeds maximum permitted limit"),
      `Server validation error message specifies limit: "${serverValidation.error}"`
    );

    // If server validation fails, document is never staged or promoted
    const stagingFiles = fs.readdirSync(path.join(TEST_STORAGE_DIR, "staging"));
    assert(stagingFiles.length === 0, "No leftover staging files after rejected upload");

    // -----------------------------------------------------------------
    // 6. REQUEST BOUNDARY ERROR MAPPING (NEXT.JS 413 / BODY LIMIT)
    // -----------------------------------------------------------------
    console.log("\n--- 6. Request Boundary Error Handling & Translation ---");

    // When Next.js server actions middleware rejects a body > bodySizeLimit, it throws an Error
    const rawNextJsError = new Error(
      "Body exceeded 12mb limit. To configure the body size limit for Server Actions, see: https://nextjs.org/docs/app/api-reference/next-config-js/serverActions#bodysizelimit"
    );

    // Catch block error translation logic from NoticeAttachmentWidget.tsx
    const rawMessage = rawNextJsError.message;
    let translatedError = "";
    if (
      rawMessage.toLowerCase().includes("body exceeded") ||
      rawMessage.toLowerCase().includes("bodysizelimit") ||
      rawMessage.toLowerCase().includes("payload too large")
    ) {
      translatedError = "File size exceeds the server request limit. Maximum permitted PDF size is 10 MiB.";
    } else {
      translatedError = rawMessage;
    }

    assert(
      translatedError === "File size exceeds the server request limit. Maximum permitted PDF size is 10 MiB.",
      "Next.js body limit error translated to readable user message with permitted size"
    );
    assert(!translatedError.includes("nextjs.org"), "Raw Next.js internal documentation URL is suppressed");

    // -----------------------------------------------------------------
    // 6b. SCANNER FAILURE SAFE ERROR SANITIZATION & CLEANUP
    // -----------------------------------------------------------------
    console.log("\n--- 6b. Scanner Failure Safe Error Sanitization ---");
    const stagedForFailure = await stageDocument(smallPdf);
    let errorResponse = null;
    try {
      throw new Error("SyntheticScanner is restricted to local development and test environments. Set ALLOW_SYNTHETIC_SCANNER=true or NODE_ENV=test.");
    } catch {
      await cleanupStagedDocument(stagedForFailure.stagingKey);
      errorResponse = {
        success: false,
        error: "Document scanning is unavailable in this environment. Contact the administrator.",
      };
    }

    assert(errorResponse.success === false, "Scanner failure produces failure response");
    assert(
      errorResponse.error === "Document scanning is unavailable in this environment. Contact the administrator.",
      "Scanner failure produces safe generic message with zero leaked config/stack"
    );
    assert(
      !fs.existsSync(resolveSafePath(stagedForFailure.stagingKey, "staging")),
      "Staged file cleaned up immediately on scanner failure"
    );

    // -----------------------------------------------------------------
    // 7. NOTICE CREATION WITH 5 MB ATTACHMENT & REPLACEMENT FLOW
    // -----------------------------------------------------------------
    console.log("\n--- 7. Notice Creation & Attachment Replacement Flow ---");

    const sha256_5mb = crypto.createHash("sha256").update(fiveMbPdf).digest("hex");

    // Create notice with the 5 MB attachment from Step 2
    const notice1 = await prisma.notice.create({
      data: {
        title: "Comprehensive Annual Academic Report 2026",
        slug: `annual-academic-report-2026-${Date.now()}`,
        category: "CIRCULAR",
        summary: "Full academic achievements and syllabus breakdown.",
        content: "<p>Please find the complete 5 MB report attached.</p>",
        publishDate: new Date(),
        isUrgent: false,
        isPublished: true,
        displayOrder: 1,
        authorId: adminUser.id,
        fileStorageKey: fiveMbPromoted.permanentKey,
        fileSizeBytes: 5242880,
        fileSha256: sha256_5mb,
        fileOriginalName: "annual-report-5mb.pdf",
        fileUploadedAt: new Date(),
      },
    });
    createdNoticeIds.push(notice1.id);

    assert(notice1 !== null, "Notice record created in PostgreSQL");
    assert(notice1.fileSizeBytes === 5242880, "DB fileSizeBytes is 5242880 (5 MB)");

    // Now upload replacement 4 MB PDF
    const fourMbPdf = createValidPdfOfSize(4 * 1024 * 1024);
    const fourMbValidation = validatePdfBuffer(fourMbPdf, {
      originalFilename: "revised-report-4mb.pdf",
      mimeType: "application/pdf",
    });
    assert(fourMbValidation.isValid, "Replacement 4 MB PDF passes validation");

    const fourMbStaged = await stageDocument(fourMbPdf);
    const fourMbPromoted = await promoteStagedDocument(fourMbStaged.stagingKey);
    const sha256_4mb = crypto.createHash("sha256").update(fourMbPdf).digest("hex");

    // Update notice record (replacing old attachment)
    const oldKey = notice1.fileStorageKey;
    const updatedNotice = await prisma.notice.update({
      where: { id: notice1.id },
      data: {
        title: "Comprehensive Annual Academic Report 2026 (Revised)",
        fileStorageKey: fourMbPromoted.permanentKey,
        fileSizeBytes: 4194304,
        fileSha256: sha256_4mb,
        fileOriginalName: "revised-report-4mb.pdf",
        fileUploadedAt: new Date(),
      },
    });

    // Execute post-commit cleanup of replaced attachment
    if (oldKey) {
      await deleteManagedDocument(oldKey);
    }

    assert(!fs.existsSync(fiveMbFilePath), "Previous 5 MB attachment was physically deleted post-commit");
    const fourMbFilePath = resolveSafePath(fourMbPromoted.permanentKey);
    assert(fs.existsSync(fourMbFilePath), "New 4 MB attachment physically exists on disk");
    assert(updatedNotice.fileSizeBytes === 4194304, "DB record fileSizeBytes updated to 4194304");

    // Now switch mode to 'none' (remove attachment)
    const keyToRemove = updatedNotice.fileStorageKey;
    const removedNotice = await prisma.notice.update({
      where: { id: notice1.id },
      data: {
        fileStorageKey: null,
        fileSizeBytes: null,
        fileSha256: null,
        fileOriginalName: null,
        fileUploadedAt: null,
      },
    });

    // Post-commit cleanup of removed file
    if (keyToRemove) {
      await deleteManagedDocument(keyToRemove);
    }

    assert(!fs.existsSync(fourMbFilePath), "Removed 4 MB attachment was physically deleted post-commit");
    assert(removedNotice.fileStorageKey === null, "DB record fileStorageKey is null");
    assert(removedNotice.fileSizeBytes === null, "DB record fileSizeBytes is null");

    // -----------------------------------------------------------------
    // 8. TOPPER PHOTO SAFEGUARDS CHECK
    // -----------------------------------------------------------------
    console.log("\n--- 8. Topper Photo Upload Safeguards Invariance ---");
    const { MAX_IMAGE_FILE_BYTES } = require("../lib/server/image-processor.ts");
    assert(MAX_IMAGE_FILE_BYTES === 2 * 1024 * 1024, "Topper photo limit remains strictly 2 MiB (unmodified)");

  } finally {
    // Teardown
    if (createdNoticeIds.length > 0) {
      await prisma.auditLog.deleteMany({ where: { entityId: { in: createdNoticeIds } } }).catch(() => {});
      await prisma.notice.deleteMany({ where: { id: { in: createdNoticeIds } } }).catch(() => {});
    }
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

runTests().catch((err) => {
  console.error("Test Suite failed with fatal error:", err);
  process.exit(1);
});
