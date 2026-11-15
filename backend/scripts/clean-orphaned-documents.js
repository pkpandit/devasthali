/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Orphaned Notice Document Cleaner CLI
 *
 * Scans managed notice document storage and detects or deletes unreferenced PDF files.
 *
 * Safety invariants:
 * 1. Dry-run by default. Requires explicit `--apply` flag to execute unlinks.
 * 2. 1-hour grace period: files created/modified within the last hour are NEVER deleted.
 * 3. Strict regex validation: only files matching `doc_<uuid>.pdf` are considered.
 * 4. Symlinks are strictly ignored and never unlinked.
 * 5. External URLs, `/documents/...` legacy paths, and database-referenced files are untouched.
 * 6. Never executed automatically on server startup.
 */

const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");

const MANAGED_DOCUMENT_FILENAME_REGEX =
  /^doc_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.pdf$/;
const GRACE_PERIOD_MS = 60 * 60 * 1000; // 1 hour

function getStorageDirectory() {
  if (process.env.TEST_DOCUMENT_STORAGE_ROOT) {
    return path.resolve(process.env.TEST_DOCUMENT_STORAGE_ROOT, "notices");
  }
  if (process.env.DOCUMENT_STORAGE_ROOT) {
    return path.resolve(process.env.DOCUMENT_STORAGE_ROOT, "notices");
  }
  return path.resolve(process.cwd(), "storage", "documents", "notices");
}

async function main() {
  const args = process.argv.slice(2);
  const isApply = args.includes("--apply");
  const isDryRun = !isApply;

  console.log("==================================================");
  console.log("  Notice Managed Storage Orphan Cleaner CLI");
  console.log(`  Mode: ${isApply ? "APPLY (DESTRUCTIVE)" : "DRY RUN (REPORT ONLY)"}`);
  console.log(`  Grace Period: 1 hour (${GRACE_PERIOD_MS / 60000} mins)`);
  console.log("==================================================\n");

  const storageDir = getStorageDirectory();

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

    // Query all active fileStorageKeys in one database query
    const activeRecords = await prisma.notice.findMany({
      where: {
        fileStorageKey: { not: null },
      },
      select: {
        fileStorageKey: true,
      },
    });

    const activeKeySet = new Set(
      activeRecords.map((r) => r.fileStorageKey).filter(Boolean)
    );

    for (const entry of entries) {
      if (!entry.isFile()) {
        continue;
      }

      totalFiles++;
      const filename = entry.name;
      const filePath = path.join(storageDir, filename);

      // Verify filename adheres strictly to managed key naming convention
      if (!MANAGED_DOCUMENT_FILENAME_REGEX.test(filename)) {
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
      const storageKey = `documents/notices/${filename}`;
      if (activeKeySet.has(storageKey)) {
        activeReferencedFiles++;
      } else {
        orphanedFiles.push({
          filename,
          filePath,
          storageKey,
          ageMs,
          byteSize: lstat.size,
        });
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
      console.log("No orphaned document files found. Storage is clean.");
      return;
    }

    if (isDryRun) {
      console.log("Candidates for deletion (DRY RUN - nothing was deleted):");
      for (const orphan of orphanedFiles) {
        const sizeKb = Math.round(orphan.byteSize / 1024);
        console.log(
          `  - ${orphan.filename} (${sizeKb} KB, age: ${Math.round(orphan.ageMs / 60000)}m)`
        );
      }
      console.log(
        "\nTo permanently delete these orphaned files, run with: npm run documents:clean-orphans -- --apply"
      );
    } else {
      console.log("Executing deletion of orphaned document files (--apply):");
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
      console.log(`\nSuccessfully deleted ${deletedCount}/${orphanedFiles.length} orphaned document files.`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Fatal error during document orphan clean execution:", err);
    process.exit(1);
  });
}

module.exports = {
  main,
  MANAGED_DOCUMENT_FILENAME_REGEX,
  GRACE_PERIOD_MS,
  getStorageDirectory,
};
