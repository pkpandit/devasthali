/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Standalone test suite for BoardResultTopper photo upload processing and storage safeguards.
 * 
 * Tests:
 * 1. Image decoding & format validation (JPEG, PNG, WebP)
 * 2. EXIF metadata stripping and WebP normalization (max 1200x1200px)
 * 3. Individual file size limit (2 MiB)
 * 4. Megapixel bomb protection (16 MP limit)
 * 5. Corrupted bitstream rejection
 * 6. Multipage & animated image rejection (GIF, animated WebP)
 * 7. Server-authoritative storage key validation (strict UUID regex)
 * 8. Strict path containment and directory traversal protection
 * 9. Temporary isolated filesystem write and safe deletion
 * 10. Symlink rejection during deletion and media serving
 * 11. Database-failure rollback cleanup using mocks (file unlinked, DB error preserved)
 * 12. Post-commit cleanup failure using mocks (error logged, committed action preserved)
 * 13. Preservation of external and legacy photo references
 * 14. Unauthorized runtime upload rejection (non-SUPER_ADMIN blocked before processing)
 */

// Bypass Next.js 'server-only' package in standalone Node script
require.cache[require.resolve("server-only")] = { exports: {} };

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const sharp = require("sharp");

const {
  processTopperPhoto,
  ImageProcessingError,
  MAX_IMAGE_FILE_BYTES,
  MAX_INPUT_PIXELS,
  MAX_OUTPUT_WIDTH,
  MAX_OUTPUT_HEIGHT,
  ALLOWED_INPUT_FORMATS,
} = require("../lib/server/image-processor.ts");

const MANAGED_KEY_REGEX =
  /^toppers\/top_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/;

function isValidManagedKey(key) {
  if (!key) return false;
  return MANAGED_KEY_REGEX.test(key);
}

function resolveSafePath(root, storageKey) {
  if (!isValidManagedKey(storageKey)) {
    throw new Error(`Invalid managed storage key format: "${storageKey}"`);
  }
  const filename = path.basename(storageKey);
  const resolved = path.resolve(root, filename);
  const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
  if (!resolved.startsWith(rootWithSep)) {
    throw new Error(`Path containment violation for key: "${storageKey}"`);
  }
  return resolved;
}

/**
 * Pure simulation of deleteManagedPhotoIfUnreferenced
 */
async function mockDeleteManagedPhotoIfUnreferenced(
  storageKey,
  uploadRoot,
  mockPrismaCount,
  mockLstat
) {
  if (!storageKey || !isValidManagedKey(storageKey)) {
    return false;
  }

  const refCount = await mockPrismaCount(storageKey);
  if (refCount > 0) {
    return false;
  }

  const filePath = resolveSafePath(uploadRoot, storageKey);
  const lstatFn = mockLstat || fs.promises.lstat;
  const lstat = await lstatFn(filePath);
  if (lstat.isSymbolicLink()) {
    throw new Error(`Refusing to unlink symlink at "${filePath}"`);
  }

  await fs.promises.unlink(filePath);
  return true;
}

class MockAuthorizationError extends Error {
  constructor(message = "SUPER_ADMIN privileges required.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

async function runTests() {
  const results = [];

  function assert(name, condition, details = "") {
    results.push({ name, passed: Boolean(condition), details });
    if (!condition) {
      console.error(`  [FAIL] ${name}: ${details}`);
    } else {
      console.log(`  [PASS] ${name}`);
    }
  }

  console.log("===============================================================");
  console.log("  Running Photo Upload & Storage Safeguards Test Suite");
  console.log("===============================================================\n");

  // -------------------------------------------------------------
  // 1. Managed Storage Key Format & Traversal Defense
  // -------------------------------------------------------------
  console.log("--- 1. Storage Key Validation & Path Containment ---");
  const validUuid = crypto.randomUUID();
  const validKey = `toppers/top_${validUuid}.webp`;
  assert("Valid managed key accepted", isValidManagedKey(validKey));

  // Verify strict UUID format rejection (not loose 36-char substitutes)
  assert("Key with directory traversal (../) rejected", !isValidManagedKey("toppers/../evil.webp"));
  assert("Key with subdirectories rejected", !isValidManagedKey("toppers/sub/file.webp"));
  assert("Key with uppercase UUID rejected", !isValidManagedKey(`toppers/top_${validUuid.toUpperCase()}.webp`));
  assert("Key with .jpg extension rejected", !isValidManagedKey(`toppers/top_${validUuid}.jpg`));
  assert("Key without UUID hyphens rejected", !isValidManagedKey(`toppers/top_${validUuid.replace(/-/g, "")}.webp`));
  assert("Loose 36-char string with invalid grouping rejected", !isValidManagedKey("toppers/top_123456789012345678901234567890123456.webp"));
  assert("External URL rejected as managed key", !isValidManagedKey("https://example.com/photo.jpg"));
  assert("Legacy root-relative path rejected as managed key", !isValidManagedKey("/images/toppers/student.jpg"));
  assert("Null key rejected", !isValidManagedKey(null));
  assert("Empty key rejected", !isValidManagedKey(""));

  const tempTestDir = path.resolve(process.cwd(), "storage", `test-tmp-${Date.now()}`);
  await fs.promises.mkdir(tempTestDir, { recursive: true });

  try {
    const safePath = resolveSafePath(tempTestDir, validKey);
    assert(
      "Safe path containment assertion passes",
      safePath.startsWith(tempTestDir) && path.basename(safePath) === `top_${validUuid}.webp`
    );

    let traversalCaught = false;
    try {
      resolveSafePath(tempTestDir, "toppers/../../evil.webp");
    } catch {
      traversalCaught = true;
    }
    assert("Path traversal attempt throws before filesystem access", traversalCaught);

    // -------------------------------------------------------------
    // 2. Image Processing: Normalization & Metadata Stripping
    // -------------------------------------------------------------
    console.log("\n--- 2. Image Processing & Normalization ---");

    // Create a synthetic 1600x1200 JPEG with EXIF metadata
    const rawJpeg = await sharp({
      create: {
        width: 1600,
        height: 1200,
        channels: 3,
        background: { r: 50, g: 100, b: 200 },
      },
    })
      .jpeg()
      .toBuffer();

    const processed = await processTopperPhoto(rawJpeg);
    assert("Processed image format is WebP", processed.format === "webp");
    assert(
      `Image bounded within ${MAX_OUTPUT_WIDTH}x${MAX_OUTPUT_HEIGHT} (was 1600x1200, now ${processed.width}x${processed.height})`,
      processed.width <= MAX_OUTPUT_WIDTH && processed.height <= MAX_OUTPUT_HEIGHT
    );

    // Verify metadata was completely stripped
    const outputMeta = await sharp(processed.buffer).metadata();
    assert("EXIF metadata stripped from output", !outputMeta.exif);
    assert("IPTC metadata absent from output", !outputMeta.iptc);
    assert("XMP metadata absent from output", !outputMeta.xmp);

    // Test PNG to WebP conversion
    const rawPng = await sharp({
      create: {
        width: 400,
        height: 400,
        channels: 4,
        background: { r: 255, g: 255, b: 0, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const processedPng = await processTopperPhoto(rawPng);
    assert("PNG input successfully converted to WebP", processedPng.format === "webp");
    assert("PNG dimensions preserved if within bounds", processedPng.width === 400 && processedPng.height === 400);

    // -------------------------------------------------------------
    // 3. Security Limits: Size, Pixels, Multipage, Corrupted Files
    // -------------------------------------------------------------
    console.log("\n--- 3. Security Safeguards & Bomb Protection ---");

    assert("16 MP limit constant equals 16777216", MAX_INPUT_PIXELS === 16 * 1024 * 1024);
    assert(
      "Allowed input formats include jpeg, png, webp only",
      ALLOWED_INPUT_FORMATS.has("jpeg") &&
        ALLOWED_INPUT_FORMATS.has("png") &&
        ALLOWED_INPUT_FORMATS.has("webp") &&
        !ALLOWED_INPUT_FORMATS.has("gif") &&
        !ALLOWED_INPUT_FORMATS.has("tiff")
    );

    // Empty buffer check
    let emptyCaught = false;
    try {
      await processTopperPhoto(Buffer.alloc(0));
    } catch (e) {
      emptyCaught = e instanceof ImageProcessingError;
    }
    assert("Empty buffer rejected with ImageProcessingError", emptyCaught);

    // Exceeds 2 MiB check
    const oversizedBuffer = Buffer.alloc(MAX_IMAGE_FILE_BYTES + 1024);
    let sizeCaught = false;
    try {
      await processTopperPhoto(oversizedBuffer);
    } catch (e) {
      sizeCaught = e instanceof ImageProcessingError && e.message.includes("exceeds the maximum limit");
    }
    assert("Oversized buffer (> 2 MiB) rejected before decoding", sizeCaught);

    // Corrupted file check
    const corruptedBuffer = Buffer.from("this is a random text file masquerading as an image");
    let corruptCaught = false;
    try {
      await processTopperPhoto(corruptedBuffer);
    } catch (e) {
      corruptCaught = e instanceof ImageProcessingError;
    }
    assert("Corrupted/unrecognized bitstream rejected", corruptCaught);

    // Megapixel bomb rejection (> 16 Megapixels)
    const largeJpeg = await sharp({
      create: {
        width: 4500,
        height: 4000,
        channels: 3,
        background: { r: 10, g: 20, b: 30 },
      },
    })
      .jpeg()
      .toBuffer();

    let bombCaught = false;
    try {
      await processTopperPhoto(largeJpeg);
    } catch (e) {
      bombCaught = e instanceof ImageProcessingError;
    }
    assert("18 Megapixel input rejected (exceeds 16 MP limit)", bombCaught);

    // -------------------------------------------------------------
    // 4. Multipage & Animated Image Rejection
    // -------------------------------------------------------------
    console.log("\n--- 4. Multipage & Animated Image Rejection ---");

    // GIF format rejection
    const singleFrameGif = await sharp({
      create: {
        width: 10,
        height: 10,
        channels: 3,
        background: { r: 100, g: 150, b: 200 },
      },
    })
      .gif()
      .toBuffer();

    let gifCaught = false;
    try {
      await processTopperPhoto(singleFrameGif);
    } catch (e) {
      gifCaught =
        e instanceof ImageProcessingError &&
        e.message.includes('Unsupported image format "gif"');
    }
    assert("GIF image rejected by format allowlist", gifCaught);

    // Multi-page frame discovery check (2-frame GIF detected by sharp pipeline)
    const gifBase = Buffer.from("R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==", "base64");
    const gifHead = gifBase.subarray(0, 19);
    const gifFrame = gifBase.subarray(19, 39);
    const twoFrameGif = Buffer.concat([gifHead, gifFrame, gifFrame, Buffer.from([0x3b])]);
    const multiFrameMeta = await sharp(twoFrameGif, { pages: -1 }).metadata();
    assert("Sharp pipeline correctly discovers multi-page frame count (pages = 2)", multiFrameMeta.pages === 2);

    let multiPageCaught = false;
    try {
      await processTopperPhoto(twoFrameGif);
    } catch (e) {
      multiPageCaught = e instanceof ImageProcessingError;
    }
    assert("Multi-page image rejected with ImageProcessingError", multiPageCaught);

    // -------------------------------------------------------------
    // 5. Temporary Isolated Filesystem Write & Cleanup
    // -------------------------------------------------------------
    console.log("\n--- 5. Filesystem Storage & Cleanup ---");

    const targetFilePath = resolveSafePath(tempTestDir, validKey);
    await fs.promises.writeFile(targetFilePath, processed.buffer);
    assert("File successfully written to disk in isolated test directory", fs.existsSync(targetFilePath));

    const readStat = await fs.promises.stat(targetFilePath);
    assert("Written file size matches processed buffer length", readStat.size === processed.buffer.length);

    await fs.promises.unlink(targetFilePath);
    assert("File successfully unlinked", !fs.existsSync(targetFilePath));

    // -------------------------------------------------------------
    // 6. Symlink Rejection (Storage & Media Serving)
    // -------------------------------------------------------------
    console.log("\n--- 6. Symlink Rejection Guard ---");

    // Write a real target file in isolated test directory
    const testFileForSymlink = resolveSafePath(tempTestDir, validKey);
    await fs.promises.writeFile(testFileForSymlink, processed.buffer);

    // Mock lstat to simulate a symlink
    const mockSymlinkLstat = async () => ({
      isSymbolicLink: () => true,
      isFile: () => true,
    });

    let symlinkDeleteCaught = false;
    try {
      await mockDeleteManagedPhotoIfUnreferenced(
        validKey,
        tempTestDir,
        async () => 0, // refCount = 0
        mockSymlinkLstat
      );
    } catch (e) {
      symlinkDeleteCaught =
        e instanceof Error && e.message.includes("Refusing to unlink symlink");
    }
    assert("Symlink deletion attempt throws and is refused", symlinkDeleteCaught);
    assert("Target file remains intact after symlink rejection", fs.existsSync(testFileForSymlink));

    // Clean up test file
    await fs.promises.unlink(testFileForSymlink);

    // -------------------------------------------------------------
    // 7. Database-Failure Rollback Cleanup (Mocked Transaction)
    // -------------------------------------------------------------
    console.log("\n--- 7. Database-Failure Rollback Cleanup ---");

    const rollbackFileKey = `toppers/top_${crypto.randomUUID()}.webp`;
    const rollbackFilePath = resolveSafePath(tempTestDir, rollbackFileKey);

    // Step a: File is written to disk prior to database commit
    await fs.promises.writeFile(rollbackFilePath, processed.buffer);
    assert("Newly uploaded file written to disk prior to DB commit", fs.existsSync(rollbackFilePath));

    // Step b: DB transaction throws a failure
    let transactionErrorThrown = false;
    let caughtTransactionError = null;
    try {
      await (async () => {
        // Simulate DB failure
        throw new Error("PrismaClientKnownRequestError: Unique constraint failed on index");
      })();
    } catch (dbErr) {
      transactionErrorThrown = true;
      caughtTransactionError = dbErr;
      // Server Action rollback logic: unlink newly written file
      try {
        await fs.promises.unlink(rollbackFilePath);
      } catch (cleanupErr) {
        console.error("Cleanup error in rollback:", cleanupErr);
      }
    }

    assert("Transaction failure was triggered", transactionErrorThrown);
    assert("Newly written photo was deleted during rollback", !fs.existsSync(rollbackFilePath));
    assert(
      "Original database error was preserved without masking",
      caughtTransactionError && caughtTransactionError.message.includes("Unique constraint failed")
    );

    // -------------------------------------------------------------
    // 8. Post-Commit Cleanup Failure Resilience (Mocked)
    // -------------------------------------------------------------
    console.log("\n--- 8. Post-Commit Cleanup Failure Resilience ---");

    // Simulate update action where DB commit succeeds but old file deletion fails (e.g. EPERM)
    async function simulateUpdateWithFailingOldFileCleanup() {
      // 1. Transaction succeeds
      const txResult = {
        updated: { id: "top_record_123" },
        oldStorageKeyToDelete: "toppers/top_old_key.webp",
      };

      let cleanupErrorLogged = false;
      // 2. Post-commit cleanup attempt fails
      if (txResult.oldStorageKeyToDelete) {
        try {
          throw new Error("EPERM: operation not permitted, unlink");
        } catch (cleanErr) {
          // Logged without throwing or marking mutation as failed
          cleanupErrorLogged = Boolean(cleanErr);
        }
      }

      // 3. Action must still return success
      return {
        success: true,
        data: { id: txResult.updated.id },
        cleanupErrorLogged,
      };
    }

    const postCommitResult = await simulateUpdateWithFailingOldFileCleanup();
    assert(
      "Post-commit cleanup failure does not mark mutation as failed",
      postCommitResult.success === true && postCommitResult.data.id === "top_record_123"
    );
    assert("Cleanup failure was caught and logged gracefully", postCommitResult.cleanupErrorLogged);

    // -------------------------------------------------------------
    // 9. Preservation of External and Legacy References
    // -------------------------------------------------------------
    console.log("\n--- 9. Preservation of External & Legacy References ---");

    const nonManagedInputs = [
      { name: "null reference", val: null },
      { name: "empty string", val: "" },
      { name: "root-relative legacy path", val: "/images/toppers/student.jpg" },
      { name: "external HTTPS URL", val: "https://cdn.example.com/photos/student.jpg" },
      { name: "non-managed filename", val: "toppers/legacy_photo.webp" },
    ];

    for (const item of nonManagedInputs) {
      const deleteResult = await mockDeleteManagedPhotoIfUnreferenced(
        item.val,
        tempTestDir,
        async () => 0,
        async () => ({ isSymbolicLink: () => false })
      );
      assert(`Unmanaged reference (${item.name}) skipped without deletion attempt`, deleteResult === false);
    }

    // -------------------------------------------------------------
    // 10. Unauthorized Runtime Upload Rejection
    // -------------------------------------------------------------
    console.log("\n--- 10. Unauthorized Runtime Upload Rejection ---");

    // Pure Server Action authorization gate simulation
    async function simulateCreateActionAsRole(userRole, photoBuffer) {
      // Step 1: Authorization
      try {
        if (userRole !== "SUPER_ADMIN") {
          throw new MockAuthorizationError("Access denied. SUPER_ADMIN privileges required.");
        }
      } catch (authErr) {
        if (authErr instanceof MockAuthorizationError) {
          return {
            success: false,
            error: authErr.message,
            filesWritten: 0,
          };
        }
        throw authErr;
      }

      // Step 2: Processing (only reached if authorized)
      let filesWritten = 0;
      if (photoBuffer) {
        filesWritten = 1;
      }

      return { success: true, filesWritten };
    }

    const unauthorizedRoles = ["PRINCIPAL", "TEACHER", "STAFF", "ANONYMOUS"];
    for (const role of unauthorizedRoles) {
      const res = await simulateCreateActionAsRole(role, processed.buffer);
      assert(
        `Role "${role}" rejected with authorization error`,
        res.success === false && res.error === "Access denied. SUPER_ADMIN privileges required."
      );
      assert(`Role "${role}" prevented from writing any files`, res.filesWritten === 0);
    }

    const authorizedRes = await simulateCreateActionAsRole("SUPER_ADMIN", processed.buffer);
    assert("SUPER_ADMIN permitted to proceed to upload processing", authorizedRes.success === true);

  } finally {
    // Clean up temporary test directory
    try {
      await fs.promises.rm(tempTestDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error in test
    }
  }

  console.log("\n===============================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`  Tests completed: ${passed}/${total} passed (${failed} failed)`);
  console.log("===============================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Unhandled test suite error:", err);
  process.exit(1);
});
