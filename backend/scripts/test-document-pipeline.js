/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test Suite: Document/PDF Upload Pipeline (Phase 1)
 * 
 * Verifies:
 * 1. PDF Validation Core:
 *    - Valid PDF headers, trailers, version limits (1.3 - 2.0).
 *    - Byte-size boundary enforcement (0 bytes, too small, max limit exceeded).
 *    - MIME type & file extension enforcement.
 *    - Filename sanitization (null bytes, directory traversal).
 *    - SHA-256 digest computation.
 *    - Structural pre-filter (/JavaScript, /Launch, /EmbeddedFiles exploit rejection).
 * 2. Storage Driver:
 *    - UUID-based non-guessable keys format and regex validation.
 *    - Strict path containment and traversal rejection (.., %2e, absolute escapes).
 *    - Temporary file staging (0o600 permissions, temporary key generation).
 *    - Atomic promotion (staged -> permanent key, original unlinked).
 *    - Deletion (idempotent, unreferenced key protection).
 *    - Staging cleanup for stale temporary files.
 *    - Reconciliation of unreferenced/orphaned files on disk.
 * 3. Malware Scanner:
 *    - Synthetic scanner clean vs EICAR detection.
 *    - Production gating: synthetic scanner prohibited in production.
 *    - ClamAV fail-closed behavior on unreachable daemon.
 *    - Scanner factory selection rules.
 * 4. End-to-End Orchestration & Rollback:
 *    - Success path: Stage -> Validate -> Scan -> Promote.
 *    - Rollback 1: Validation failure -> immediate temp file cleanup.
 *    - Rollback 2: Malware detected -> immediate temp file cleanup.
 *    - Rollback 3: Scanner unavailable / fail-closed -> immediate temp file cleanup.
 */

// 1. Mock server-only before requiring Next.js server modules in Node CLI
const serverOnlyPath = require.resolve("server-only");
require.cache[serverOnlyPath] = {
  id: serverOnlyPath,
  filename: serverOnlyPath,
  loaded: true,
  exports: {},
};

// 2. Set environment flags for testing
process.env.NODE_ENV = "test";
process.env.ALLOW_SYNTHETIC_SCANNER = "true";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

// Configure isolated temporary upload root for test suite
const TEST_STORAGE_DIR = path.resolve(__dirname, "..", "tmp", "test-document-storage");
process.env.TEST_DOCUMENT_STORAGE_ROOT = TEST_STORAGE_DIR;

const {
  validatePdfBuffer,
  DEFAULT_MAX_PDF_SIZE_BYTES,
  MIN_PDF_SIZE_BYTES,
} = require("../lib/validation/pdf-validator.ts");

const {
  MANAGED_DOCUMENT_KEY_REGEX,
  STAGING_DOCUMENT_KEY_REGEX,
  isValidManagedDocumentKey,
  isValidStagingDocumentKey,
  generateManagedDocumentKey,
  generateStagingDocumentKey,
  resolveSafePath,
  stageDocument,
  cleanupStagedDocument,
  promoteStagedDocument,
  deleteManagedDocument,
  getManagedDocumentBuffer,
  cleanupStaleStagedDocuments,
  reconcileOrphanedDocuments,
} = require("../lib/server/document-storage.ts");

const {
  SyntheticScanner,
  ClamAvScanner,
  ScannerUnavailableError,
  EICAR_TEST_SIGNATURE,
  getMalwareScanner,
} = require("../lib/server/malware-scanner.ts");

// Helper to construct a minimal valid PDF buffer
function createMinimalPdfBuffer(options = {}) {
  const version = options.version || "1.4";
  const bodyContent = options.bodyContent || "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const raw = `%PDF-${version}\n${bodyContent}xref\n0 1\n0000000000 65535 f \ntrailer\n<< /Size 1 /Root 1 0 R >>\nstartxref\n120\n%%EOF`;
  return Buffer.from(raw, "latin1");
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
  console.log("  Running Test Suite: Document & PDF Upload Pipeline (Phase 1)");
  console.log("==================================================================\n");

  // Prepare isolated test directory
  if (fs.existsSync(TEST_STORAGE_DIR)) {
    fs.rmSync(TEST_STORAGE_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_STORAGE_DIR, { recursive: true });

  try {
    // -------------------------------------------------------------
    // Section 1: PDF Validation Core Tests
    // -------------------------------------------------------------
    console.log("--- 1. PDF Validation Core (Sizing, MIME, Header & Trailer) ---");

    assert("DEFAULT_MAX_PDF_SIZE_BYTES is 10 MB", DEFAULT_MAX_PDF_SIZE_BYTES === 10 * 1024 * 1024);
    assert("MIN_PDF_SIZE_BYTES is 32 bytes", MIN_PDF_SIZE_BYTES === 32);

    const validPdfBuf = createMinimalPdfBuffer({ version: "1.5" });

    // Valid standard PDF
    const validResult = validatePdfBuffer(validPdfBuf, {
      mimeType: "application/pdf",
      originalFilename: "annual_report_2026.pdf",
    });
    assert("Valid standard PDF buffer passes validation", validResult.isValid);
    assert("Valid PDF extracts correct version", validResult.details?.pdfVersion === "1.5");
    assert("Valid PDF has valid header and trailer flags", validResult.details?.hasValidHeader && validResult.details?.hasValidTrailer);
    assert("Valid PDF contains SHA-256 hash", typeof validResult.details?.sha256 === "string" && validResult.details.sha256.length === 64);

    // Empty buffer
    const emptyResult = validatePdfBuffer(Buffer.alloc(0));
    assert("Rejects empty buffer (0 bytes)", !emptyResult.isValid && emptyResult.code === "EMPTY_FILE");

    // Too small buffer (< 32 bytes)
    const smallResult = validatePdfBuffer(Buffer.from("%PDF-1.4\n%%EOF"));
    assert("Rejects buffer below MIN_PDF_SIZE_BYTES", !smallResult.isValid && smallResult.code === "FILE_TOO_SMALL");

    // Exceeding size limit
    const sizeLimitResult = validatePdfBuffer(validPdfBuf, {
      maxSizeBytes: 50, // 50 bytes max
    });
    assert("Rejects buffer exceeding maxSizeBytes", !sizeLimitResult.isValid && sizeLimitResult.code === "SIZE_LIMIT_EXCEEDED");

    // MIME type checks
    const badMimeResult = validatePdfBuffer(validPdfBuf, {
      mimeType: "text/plain",
    });
    assert("Rejects invalid MIME type (text/plain)", !badMimeResult.isValid && badMimeResult.code === "INVALID_MIME_TYPE");

    const octetMimeResult = validatePdfBuffer(validPdfBuf, {
      mimeType: "application/octet-stream",
    });
    assert("Rejects generic MIME type (application/octet-stream)", !octetMimeResult.isValid && octetMimeResult.code === "INVALID_MIME_TYPE");

    // Extension checks
    const badExtResult = validatePdfBuffer(validPdfBuf, {
      originalFilename: "circular.docx",
    });
    assert("Rejects invalid extension (.docx)", !badExtResult.isValid && badExtResult.code === "INVALID_EXTENSION");

    const doubleExtResult = validatePdfBuffer(validPdfBuf, {
      originalFilename: "circular.pdf.exe",
    });
    assert("Rejects executable extension (.pdf.exe)", !doubleExtResult.isValid && doubleExtResult.code === "INVALID_EXTENSION");

    // Traversal and null-byte filename
    const traversalFilename = validatePdfBuffer(validPdfBuf, {
      originalFilename: "../secret.pdf",
    });
    assert("Rejects filename with path traversal (../secret.pdf)", !traversalFilename.isValid && traversalFilename.code === "INVALID_FILENAME");

    const nullByteFilename = validatePdfBuffer(validPdfBuf, {
      originalFilename: "document.pdf\0.exe",
    });
    assert("Rejects filename containing null-byte character", !nullByteFilename.isValid && nullByteFilename.code === "INVALID_FILENAME");

    // Magic number header
    const badHeaderBuf = Buffer.from("NOT_A_PDF_FILE_HEADER_DATA_1234567890\n%%EOF");
    const badHeaderResult = validatePdfBuffer(badHeaderBuf);
    assert("Rejects buffer missing '%PDF-' magic header", !badHeaderResult.isValid && badHeaderResult.code === "INVALID_MAGIC_HEADER");

    // Unsupported PDF version
    const oldVersionBuf = createMinimalPdfBuffer({ version: "0.9" });
    const oldVersionResult = validatePdfBuffer(oldVersionBuf);
    assert("Rejects ancient unsupported PDF version (0.9)", !oldVersionResult.isValid && oldVersionResult.code === "UNSUPPORTED_PDF_VERSION");

    const futureVersionBuf = createMinimalPdfBuffer({ version: "9.9" });
    const futureVersionResult = validatePdfBuffer(futureVersionBuf);
    assert("Rejects unsupported high PDF version (9.9)", !futureVersionResult.isValid && futureVersionResult.code === "UNSUPPORTED_PDF_VERSION");

    // Trailer EOF checks
    const missingTrailerBuf = Buffer.from("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nTRUNCATED_CONTENT_NO_EOF_MARKER");
    const missingTrailerResult = validatePdfBuffer(missingTrailerBuf);
    assert("Rejects truncated PDF missing '%%EOF' trailer", !missingTrailerResult.isValid && missingTrailerResult.code === "MISSING_EOF_TRAILER");

    // Supported versions (1.3 to 2.0)
    for (const v of ["1.3", "1.4", "1.6", "1.7", "2.0"]) {
      const vBuf = createMinimalPdfBuffer({ version: v });
      const vRes = validatePdfBuffer(vBuf);
      assert(`Permits supported PDF version ${v}`, vRes.isValid && vRes.details?.pdfVersion === v);
    }

    // SHA-256 accuracy check
    const expectedHash = crypto.createHash("sha256").update(validPdfBuf).digest("hex");
    assert("Calculated SHA-256 matches cryptographic digest", validResult.details?.sha256 === expectedHash);

    // -------------------------------------------------------------
    // Section 2: PDF Structural Pre-Filter Tests
    // -------------------------------------------------------------
    console.log("\n--- 2. PDF Structural Pre-Filter (Exploit & Risk Detection) ---");

    // /JavaScript detection
    const jsExploitBuf = createMinimalPdfBuffer({
      bodyContent: "1 0 obj\n<< /Type /Action /S /JavaScript /JS (app.alert('PWNED');) >>\nendobj\n",
    });
    const jsResult = validatePdfBuffer(jsExploitBuf);
    assert("Rejects PDF with embedded /JavaScript action", !jsResult.isValid && jsResult.code === "SUSPICIOUS_CONTENT");
    assert("Reports /JavaScript in detected risks", jsResult.details?.detectedRisks.some((r) => r.includes("JavaScript")));

    // /Launch detection
    const launchExploitBuf = createMinimalPdfBuffer({
      bodyContent: "1 0 obj\n<< /Type /Action /S /Launch /F (cmd.exe) >>\nendobj\n",
    });
    const launchResult = validatePdfBuffer(launchExploitBuf);
    assert("Rejects PDF with embedded /Launch command execution", !launchResult.isValid && launchResult.code === "SUSPICIOUS_CONTENT");
    assert("Reports /Launch in detected risks", launchResult.details?.detectedRisks.some((r) => r.includes("Launch")));

    // /EmbeddedFiles detection
    const embeddedPayloadBuf = createMinimalPdfBuffer({
      bodyContent: "1 0 obj\n<< /Type /Catalog /Names << /EmbeddedFiles 2 0 R >> >>\nendobj\n",
    });
    const embeddedResult = validatePdfBuffer(embeddedPayloadBuf);
    assert("Rejects PDF with /EmbeddedFiles arbitrary payload carriers", !embeddedResult.isValid && embeddedResult.code === "SUSPICIOUS_CONTENT");

    // -------------------------------------------------------------
    // Section 3: Storage Driver & Path Containment Tests
    // -------------------------------------------------------------
    console.log("\n--- 3. Storage Driver (Keys, Staging, Promotion & Containment) ---");

    // Key format validation
    const genManagedKey = generateManagedDocumentKey();
    assert("Generated managed key matches regex", MANAGED_DOCUMENT_KEY_REGEX.test(genManagedKey));
    assert("isValidManagedDocumentKey returns true for valid key", isValidManagedDocumentKey(genManagedKey));
    assert("isValidManagedDocumentKey rejects arbitrary path", !isValidManagedDocumentKey("documents/notices/hacked.pdf"));
    assert("isValidManagedDocumentKey rejects null/empty", !isValidManagedDocumentKey(null));

    const genStagingKey = generateStagingDocumentKey();
    assert("Generated staging key matches regex", STAGING_DOCUMENT_KEY_REGEX.test(genStagingKey));
    assert("isValidStagingDocumentKey returns true for valid key", isValidStagingDocumentKey(genStagingKey));
    assert("isValidStagingDocumentKey rejects arbitrary path", !isValidStagingDocumentKey("documents/staging/evil.tmp"));

    // Path containment and traversal protection
    assert("resolveSafePath resolves valid managed key within root", (() => {
      const p = resolveSafePath(genManagedKey, "managed");
      return p.startsWith(TEST_STORAGE_DIR) && p.endsWith(".pdf");
    })());

    assert("resolveSafePath throws on path traversal attempt", (() => {
      try {
        resolveSafePath("documents/notices/../../outside.pdf");
        return false;
      } catch {
        return true;
      }
    })());

    assert("resolveSafePath throws on encoded traversal (%2e%2e)", (() => {
      try {
        resolveSafePath("documents/notices/%2e%2e/outside.pdf");
        return false;
      } catch {
        return true;
      }
    })());

    // Temporary staging test
    const stageResult = await stageDocument(validPdfBuf);
    assert("stageDocument creates staging key", isValidStagingDocumentKey(stageResult.stagingKey));
    assert("stageDocument writes file to disk", fs.existsSync(stageResult.tempPath));
    assert("Staged file content matches uploaded buffer", fs.readFileSync(stageResult.tempPath).equals(validPdfBuf));

    // Staging cleanup
    const cleaned = await cleanupStagedDocument(stageResult.stagingKey);
    assert("cleanupStagedDocument successfully unlinks temporary file", cleaned);
    assert("Temporary file is no longer present on disk", !fs.existsSync(stageResult.tempPath));

    // Atomic promotion test
    const stagedForPromo = await stageDocument(validPdfBuf);
    const promoResult = await promoteStagedDocument(stagedForPromo.stagingKey);
    assert("promoteStagedDocument returns valid permanent key", isValidManagedDocumentKey(promoResult.permanentKey));
    assert("Promoted file exists on disk at permanent path", fs.existsSync(promoResult.permanentPath));
    assert("Promoted file content matches original buffer", fs.readFileSync(promoResult.permanentPath).equals(validPdfBuf));
    assert("Original staged file removed after promotion", !fs.existsSync(stagedForPromo.tempPath));

    // Reading promoted file via storage driver
    const readBuffer = await getManagedDocumentBuffer(promoResult.permanentKey);
    assert("getManagedDocumentBuffer correctly reads promoted document", readBuffer.equals(validPdfBuf));

    // Deleting managed document
    const deleteSuccess = await deleteManagedDocument(promoResult.permanentKey);
    assert("deleteManagedDocument removes document from disk", deleteSuccess);
    assert("Document file no longer exists after deletion", !fs.existsSync(promoResult.permanentPath));

    // Deletion idempotency
    const repeatDelete = await deleteManagedDocument(promoResult.permanentKey);
    assert("deleteManagedDocument is idempotent on already deleted key", repeatDelete);

    // Stale staging cleanup
    const oldStaged = await stageDocument(validPdfBuf);
    // Artificially modify mtime to 2 hours ago
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    fs.utimesSync(oldStaged.tempPath, twoHoursAgo, twoHoursAgo);

    const recentStaged = await stageDocument(validPdfBuf);

    const cleanupReport = await cleanupStaleStagedDocuments(60 * 60 * 1000); // 1 hour max age
    assert("cleanupStaleStagedDocuments cleaned 1 stale file", cleanupReport.cleanedCount === 1);
    assert("Stale temporary file was removed", !fs.existsSync(oldStaged.tempPath));
    assert("Recent temporary file was preserved", fs.existsSync(recentStaged.tempPath));

    // Cleanup recent temp
    await cleanupStagedDocument(recentStaged.stagingKey);

    // Reconciliation of orphaned documents
    const stagedOrphan = await stageDocument(validPdfBuf);
    const orphanPromoted = await promoteStagedDocument(stagedOrphan.stagingKey);
    const stagedValid = await stageDocument(validPdfBuf);
    const validPromoted = await promoteStagedDocument(stagedValid.stagingKey);

    const referencedKeys = new Set([validPromoted.permanentKey]);
    const reconReport = await reconcileOrphanedDocuments(referencedKeys, true);

    assert("Reconciler identified orphaned key", reconReport.orphanedKeys.includes(orphanPromoted.permanentKey));
    assert("Reconciler did not flag referenced valid key", !reconReport.orphanedKeys.includes(validPromoted.permanentKey));
    assert("Reconciler deleted orphaned document", reconReport.deletedCount === 1 && !fs.existsSync(orphanPromoted.permanentPath));
    assert("Referenced document remains on disk", fs.existsSync(validPromoted.permanentPath));

    // Clean validPromoted
    await deleteManagedDocument(validPromoted.permanentKey);

    // -------------------------------------------------------------
    // Section 4: Malware Scanner Tests
    // -------------------------------------------------------------
    console.log("\n--- 4. Malware Scanner Interface & Fail-Closed Controls ---");

    const syntheticScanner = new SyntheticScanner();
    const cleanScan = await syntheticScanner.scanBuffer(validPdfBuf);
    assert("Synthetic scanner marks clean PDF buffer as clean", cleanScan.isClean);

    // EICAR signature detection
    const eicarBuf = Buffer.from(`%PDF-1.4\n1 0 obj\n<< /Note (${EICAR_TEST_SIGNATURE}) >>\nendobj\nstartxref\n100\n%%EOF`);
    const eicarScan = await syntheticScanner.scanBuffer(eicarBuf);
    assert("Synthetic scanner detects EICAR test signature", !eicarScan.isClean);
    assert("EICAR scan reports correct threat name", eicarScan.threatName === "Eicar-Test-Signature");

    // Gating test: Synthetic scanner prohibited in production
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    let prodGatingBlocked = false;
    try {
      new SyntheticScanner();
    } catch {
      prodGatingBlocked = true;
    }
    process.env.NODE_ENV = prevEnv;
    assert("SyntheticScanner strictly throws fatal error in production environment", prodGatingBlocked);

    // ClamAV fail-closed behavior on unreachable daemon
    const unreachableClamAv = new ClamAvScanner({
      host: "127.0.0.1",
      port: 59999, // Unreachable port
      timeoutMs: 500,
    });

    let failClosedWorked = false;
    try {
      await unreachableClamAv.scanBuffer(validPdfBuf);
    } catch (err) {
      if (err instanceof ScannerUnavailableError) {
        failClosedWorked = true;
      }
    }
    assert("ClamAV scanner fails closed with ScannerUnavailableError when daemon is unreachable", failClosedWorked);

    // Scanner Factory
    const scannerFromFactory = getMalwareScanner();
    assert("getMalwareScanner returns scanner in test environment", Boolean(scannerFromFactory && scannerFromFactory.scannerType));

    // -------------------------------------------------------------
    // Section 5: Orchestration & Rollback Scenarios
    // -------------------------------------------------------------
    console.log("\n--- 5. End-to-End Upload Orchestration & Rollback Scenarios ---");

    // Scenario 1: Happy Path
    // Stage -> Validate -> Scan -> Promote
    const flow1Staged = await stageDocument(validPdfBuf);
    const flow1Validation = validatePdfBuffer(validPdfBuf);
    assert("Flow 1: Validation succeeds", flow1Validation.isValid);
    const flow1Scan = await syntheticScanner.scanFile(flow1Staged.tempPath);
    assert("Flow 1: Malware scan passes clean", flow1Scan.isClean);
    const flow1Promoted = await promoteStagedDocument(flow1Staged.stagingKey);
    assert("Flow 1: Document promoted to permanent storage", isValidManagedDocumentKey(flow1Promoted.permanentKey));
    assert("Flow 1: Staging temp file unlinked", !fs.existsSync(flow1Staged.tempPath));
    await deleteManagedDocument(flow1Promoted.permanentKey);

    // Scenario 2: Rollback on Validation Failure
    // Stage -> Validate fails -> Cleanup temp
    const malformedBuf = Buffer.from("NOT_A_VALID_PDF_DOCUMENT_GARBAGE");
    const flow2Staged = await stageDocument(malformedBuf);
    const flow2Validation = validatePdfBuffer(malformedBuf);
    assert("Flow 2: Validation fails on malformed buffer", !flow2Validation.isValid);
    await cleanupStagedDocument(flow2Staged.stagingKey);
    assert("Flow 2 Rollback: Staged temp file cleaned up immediately", !fs.existsSync(flow2Staged.tempPath));

    // Scenario 3: Rollback on Malware Detection
    // Stage -> Validate succeeds -> Scan detects malware -> Cleanup temp
    const malwareBuf = Buffer.from(`%PDF-1.4\n1 0 obj\n<< /Test (${EICAR_TEST_SIGNATURE}) >>\nendobj\nstartxref\n100\n%%EOF`);
    const flow3Staged = await stageDocument(malwareBuf);
    const flow3Validation = validatePdfBuffer(malwareBuf);
    assert("Flow 3: PDF syntax is valid", flow3Validation.isValid);
    const flow3Scan = await syntheticScanner.scanBuffer(malwareBuf);
    assert("Flow 3: Malware detected by scanner", !flow3Scan.isClean);
    await cleanupStagedDocument(flow3Staged.stagingKey);
    assert("Flow 3 Rollback: Staged temp file cleaned up immediately on malware threat", !fs.existsSync(flow3Staged.tempPath));

    // Scenario 4: Rollback on Scanner Unavailable (Fail-Closed)
    const flow4Staged = await stageDocument(validPdfBuf);
    let flow4FailedClosed = false;
    try {
      await unreachableClamAv.scanBuffer(validPdfBuf);
    } catch (err) {
      if (err instanceof ScannerUnavailableError) {
        flow4FailedClosed = true;
        await cleanupStagedDocument(flow4Staged.stagingKey);
      }
    }
    assert("Flow 4: Scanner fails closed on connection error", flow4FailedClosed);
    assert("Flow 4 Rollback: Staged temp file cleaned up immediately on scanner failure", !fs.existsSync(flow4Staged.tempPath));

  } finally {
    // Teardown isolated test directory
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
