/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Orphaned Photo Cleaner CLI
 * 
 * Scans managed topper photo storage and detects or deletes unreferenced images.
 * 
 * Safety invariants:
 * 1. Dry-run by default. Requires explicit `--apply` flag to execute unlinks.
 * 2. 1-hour grace period: files created/modified within the last hour are NEVER deleted.
 * 3. Strict regex validation: only files matching `top_<uuid>.webp` are considered.
 * 4. Symlinks are strictly ignored and never unlinked.
 * 5. External URLs, `/images/...` legacy files, and database-referenced files are untouched.
 * 6. Never executed automatically on server startup.
 */

const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");

const MANAGED_FILENAME_REGEX =
  /^top_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/;
const GRACE_PERIOD_MS = 60 * 60 * 1000; // 1 hour

async function main() {
  const args = process.argv.slice(2);
  const isApply = args.includes("--apply");
  const isDryRun = !isApply;

  console.log("==================================================");
  console.log("  Topper Managed Storage Orphan Cleaner CLI");
  console.log(`  Mode: ${isApply ? "APPLY (DESTRUCTIVE)" : "DRY RUN (REPORT ONLY)"}`);
  console.log(`  Grace Period: 1 hour (${GRACE_PERIOD_MS / 60000} mins)`);
  console.log("==================================================\n");

  const storageDir = process.env.TEST_UPLOAD_ROOT
    ? path.resolve(process.env.TEST_UPLOAD_ROOT)
    : path.resolve(process.cwd(), "storage", "uploads", "toppers");

  if (!fs.existsSync(storageDir)) {
    console.log(`Storage directory does not exist: ${storageDir}`);
    console.log("No files to clean. Exiting.");
    process.exit(0);
  }

  const prisma = new PrismaClient();
  const now = Date.now();

  try {
    const entries = await fs.promises.readdir(storageDir, { withFileTypes: true });

    let totalFiles = 0;
    let nonManagedFiles = 0;
    let gracePeriodFiles = 0;
    let activeReferencedFiles = 0;
    const orphanedFiles = [];

    // Query all active photoStorageKeys in one database query
    const activeRecords = await prisma.boardResultTopper.findMany({
      where: {
        photoStorageKey: { not: null },
      },
      select: {
        photoStorageKey: true,
      },
    });

    const activeKeySet = new Set(
      activeRecords.map((r) => r.photoStorageKey).filter(Boolean)
    );

    for (const entry of entries) {
      if (!entry.isFile()) {
        continue;
      }

      totalFiles++;
      const filename = entry.name;
      const filePath = path.join(storageDir, filename);

      // Verify filename adheres strictly to managed key naming convention
      if (!MANAGED_FILENAME_REGEX.test(filename)) {
        nonManagedFiles++;
        console.warn(`[SKIP] Non-managed filename encountered: "${filename}"`);
        continue;
      }

      // Symlink rejection
      const lstat = await fs.promises.lstat(filePath);
      if (lstat.isSymbolicLink()) {
        console.warn(`[SKIP] Symlink rejected: "${filename}"`);
        continue;
      }

      // 1-hour grace period check
      const ageMs = now - lstat.mtimeMs;
      if (ageMs < GRACE_PERIOD_MS) {
        gracePeriodFiles++;
        console.log(
          `[GRACE] File "${filename}" is within 1h grace period (age: ${Math.round(
            ageMs / 60000
          )}m). Skipping.`
        );
        continue;
      }

      // Check database reference
      const storageKey = `toppers/${filename}`;
      if (activeKeySet.has(storageKey)) {
        activeReferencedFiles++;
      } else {
        orphanedFiles.push({ filename, filePath, storageKey, ageMs });
      }
    }

    console.log("\n--------------------------------------------------");
    console.log("  Scan Results:");
    console.log(`  - Total files in storage: ${totalFiles}`);
    console.log(`  - Non-managed/skipped files: ${nonManagedFiles}`);
    console.log(`  - Files in 1-hour grace period: ${gracePeriodFiles}`);
    console.log(`  - Active referenced files: ${activeReferencedFiles}`);
    console.log(`  - Orphaned candidate files: ${orphanedFiles.length}`);
    console.log("--------------------------------------------------\n");

    if (orphanedFiles.length === 0) {
      console.log("No orphaned files found. Storage is clean.");
      return;
    }

    if (isDryRun) {
      console.log("Candidates for deletion (DRY RUN - nothing was deleted):");
      for (const orphan of orphanedFiles) {
        console.log(
          `  - ${orphan.filename} (age: ${Math.round(orphan.ageMs / 60000)}m)`
        );
      }
      console.log(
        "\nTo permanently delete these orphaned files, run with: npm run media:clean-orphans -- --apply"
      );
    } else {
      console.log("Executing deletion of orphaned files (--apply):");
      let deletedCount = 0;
      for (const orphan of orphanedFiles) {
        try {
          await fs.promises.unlink(orphan.filePath);
          console.log(`  [DELETED] ${orphan.filename}`);
          deletedCount++;
        } catch (unlinkErr) {
          console.error(`  [ERROR] Failed to delete ${orphan.filename}:`, unlinkErr);
        }
      }
      console.log(`\nSuccessfully deleted ${deletedCount}/${orphanedFiles.length} orphaned files.`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Fatal error during orphan clean execution:", err);
  process.exit(1);
});
