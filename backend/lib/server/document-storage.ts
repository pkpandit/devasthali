import "server-only";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const MANAGED_DOCUMENT_KEY_REGEX =
  /^documents\/notices\/doc_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.pdf$/;

export const STAGING_DOCUMENT_KEY_REGEX =
  /^documents\/staging\/tmp_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.tmp$/;

const DEFAULT_DOCUMENT_ROOT = path.resolve(process.cwd(), "storage", "documents");

/**
 * Returns the resolved root directory for managed document storage.
 * Supports environment override for isolated unit and integration testing.
 */
export function getDocumentStorageRoot(): string {
  if (process.env.TEST_DOCUMENT_STORAGE_ROOT) {
    return path.resolve(process.env.TEST_DOCUMENT_STORAGE_ROOT);
  }
  if (process.env.DOCUMENT_STORAGE_ROOT) {
    return path.resolve(process.env.DOCUMENT_STORAGE_ROOT);
  }
  return DEFAULT_DOCUMENT_ROOT;
}

/**
 * Asserts that local disk storage is explicitly permitted in production.
 */
function assertLocalStoragePermitted() {
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.ALLOW_LOCAL_STORAGE_IN_PRODUCTION
  ) {
    throw new Error(
      "Local filesystem document storage is disabled in production. External durable storage must be configured."
    );
  }
}

/**
 * Validates that a permanent document key matches the strict authoritative format.
 */
export function isValidManagedDocumentKey(key: string | null | undefined): key is string {
  if (!key) return false;
  return MANAGED_DOCUMENT_KEY_REGEX.test(key);
}

/**
 * Validates that a temporary staging key matches the strict staging format.
 */
export function isValidStagingDocumentKey(key: string | null | undefined): key is string {
  if (!key) return false;
  return STAGING_DOCUMENT_KEY_REGEX.test(key);
}

/**
 * Generates an unpredictable, UUID-based permanent storage key.
 */
export function generateManagedDocumentKey(): string {
  const uuid = crypto.randomUUID();
  return `documents/notices/doc_${uuid}.pdf`;
}

/**
 * Generates an unpredictable, UUID-based staging storage key.
 */
export function generateStagingDocumentKey(): string {
  const uuid = crypto.randomUUID();
  return `documents/staging/tmp_${uuid}.tmp`;
}

/**
 * Resolves any storage key to an absolute filesystem path with strict boundary containment
 * and symlink protection.
 */
export function resolveSafePath(
  storageKey: string,
  allowedType: "managed" | "staging" | "any" = "any"
): string {
  const isManaged = isValidManagedDocumentKey(storageKey);
  const isStaging = isValidStagingDocumentKey(storageKey);

  if (allowedType === "managed" && !isManaged) {
    throw new Error(`Invalid managed document key format: "${storageKey}"`);
  }
  if (allowedType === "staging" && !isStaging) {
    throw new Error(`Invalid staging document key format: "${storageKey}"`);
  }
  if (allowedType === "any" && !isManaged && !isStaging) {
    throw new Error(`Invalid document storage key format: "${storageKey}"`);
  }

  // Reject directory traversal patterns
  if (storageKey.includes("..") || storageKey.includes("%2e") || storageKey.includes("\0")) {
    throw new Error(`Path traversal attempt detected in key: "${storageKey}"`);
  }

  const root = getDocumentStorageRoot();
  // Split key into relative segments ("documents/notices/doc_..." or "documents/staging/tmp_...")
  // We strip the leading "documents/" to resolve under root
  const subPath = storageKey.replace(/^documents[/\\]/, "");
  const resolved = path.resolve(root, subPath);

  // Path containment check
  const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
  if (!resolved.startsWith(rootWithSep)) {
    throw new Error(`Path containment violation for key: "${storageKey}"`);
  }

  return resolved;
}

/**
 * Stages an uploaded document buffer into the temporary staging directory.
 * Sets restrictive file permissions (0o600).
 */
export async function stageDocument(
  buffer: Buffer
): Promise<{ stagingKey: string; tempPath: string; byteSize: number }> {
  assertLocalStoragePermitted();

  const stagingKey = generateStagingDocumentKey();
  const root = getDocumentStorageRoot();
  const stagingDir = path.resolve(root, "staging");

  await fs.promises.mkdir(stagingDir, { recursive: true });

  const tempPath = resolveSafePath(stagingKey, "staging");
  await fs.promises.writeFile(tempPath, buffer, { mode: 0o600 });

  return {
    stagingKey,
    tempPath,
    byteSize: buffer.length,
  };
}

/**
 * Safely removes a staged temporary file (used for validation failure or rollback).
 */
export async function cleanupStagedDocument(stagingKey: string): Promise<boolean> {
  if (!isValidStagingDocumentKey(stagingKey)) {
    return false;
  }

  try {
    const tempPath = resolveSafePath(stagingKey, "staging");
    const lstat = await fs.promises.lstat(tempPath);
    if (lstat.isSymbolicLink()) {
      throw new Error(`Refusing to unlink symlink at "${tempPath}"`);
    }
    await fs.promises.unlink(tempPath);
    return true;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return true; // Already removed
    }
    console.error(`[storage] Failed to clean up staged file "${stagingKey}":`, err);
    return false;
  }
}

/**
 * Atomically promotes a staged file to its permanent, non-guessable document key.
 */
export async function promoteStagedDocument(
  stagingKey: string
): Promise<{ permanentKey: string; permanentPath: string }> {
  assertLocalStoragePermitted();

  if (!isValidStagingDocumentKey(stagingKey)) {
    throw new Error(`Cannot promote invalid staging key: "${stagingKey}"`);
  }

  const sourcePath = resolveSafePath(stagingKey, "staging");

  // Verify source exists and is a regular file
  const sourceStat = await fs.promises.lstat(sourcePath);
  if (sourceStat.isSymbolicLink()) {
    throw new Error(`Refusing to promote symlink at "${sourcePath}"`);
  }
  if (!sourceStat.isFile()) {
    throw new Error(`Staged source is not a regular file: "${sourcePath}"`);
  }

  const permanentKey = generateManagedDocumentKey();
  const permanentPath = resolveSafePath(permanentKey, "managed");
  const targetDir = path.dirname(permanentPath);

  // Ensure target directory exists
  await fs.promises.mkdir(targetDir, { recursive: true });

  // Atomic rename promotion (falls back to copy+unlink if cross-device)
  try {
    await fs.promises.rename(sourcePath, permanentPath);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "EXDEV") {
      await fs.promises.copyFile(sourcePath, permanentPath);
      await fs.promises.unlink(sourcePath);
    } else {
      throw err;
    }
  }

  // Ensure read/write mode for owner
  await fs.promises.chmod(permanentPath, 0o600);

  return { permanentKey, permanentPath };
}

/**
 * Permanently deletes a managed document from disk.
 * Idempotent: returns true if already removed.
 */
export async function deleteManagedDocument(
  storageKey: string | null | undefined
): Promise<boolean> {
  if (!storageKey || !isValidManagedDocumentKey(storageKey)) {
    return false;
  }

  assertLocalStoragePermitted();

  const filePath = resolveSafePath(storageKey, "managed");

  try {
    const lstat = await fs.promises.lstat(filePath);
    if (lstat.isSymbolicLink()) {
      throw new Error(`Refusing to unlink symlink at "${filePath}"`);
    }
    await fs.promises.unlink(filePath);
    return true;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return true; // Idempotent
    }
    console.error(`[storage] Failed to delete document "${filePath}":`, err);
    return false;
  }
}

/**
 * Reads a managed permanent document into a Buffer.
 */
export async function getManagedDocumentBuffer(storageKey: string): Promise<Buffer> {
  assertLocalStoragePermitted();
  const filePath = resolveSafePath(storageKey, "managed");

  const lstat = await fs.promises.lstat(filePath);
  if (lstat.isSymbolicLink()) {
    throw new Error(`Refusing to read symlink at "${filePath}"`);
  }

  return fs.promises.readFile(filePath);
}

/**
 * Returns a readable stream for a managed permanent document.
 */
export async function getManagedDocumentStream(storageKey: string): Promise<fs.ReadStream> {
  assertLocalStoragePermitted();
  const filePath = resolveSafePath(storageKey, "managed");

  const lstat = await fs.promises.lstat(filePath);
  if (lstat.isSymbolicLink()) {
    throw new Error(`Refusing to read symlink at "${filePath}"`);
  }

  return fs.createReadStream(filePath);
}

/**
 * Inspects metadata of a managed permanent document.
 */
export async function getManagedDocumentMetadata(
  storageKey: string
): Promise<{ byteSize: number; mtime: Date; sha256: string }> {
  const buffer = await getManagedDocumentBuffer(storageKey);
  const filePath = resolveSafePath(storageKey, "managed");
  const stat = await fs.promises.stat(filePath);
  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

  return {
    byteSize: stat.size,
    mtime: stat.mtime,
    sha256,
  };
}

/**
 * Scans the staging directory and cleans up stale temporary files older than maxAgeMs.
 * Default max age: 1 hour (3600000ms).
 */
export async function cleanupStaleStagedDocuments(
  maxAgeMs = 60 * 60 * 1000
): Promise<{ cleanedCount: number; errors: string[] }> {
  assertLocalStoragePermitted();

  const root = getDocumentStorageRoot();
  const stagingDir = path.resolve(root, "staging");

  const result = { cleanedCount: 0, errors: [] as string[] };

  try {
    const entries = await fs.promises.readdir(stagingDir, { withFileTypes: true });
    const now = Date.now();

    for (const entry of entries) {
      if (!entry.isFile()) continue;

      const fullPath = path.resolve(stagingDir, entry.name);
      try {
        const stat = await fs.promises.stat(fullPath);
        if (now - stat.mtimeMs > maxAgeMs) {
          await fs.promises.unlink(fullPath);
          result.cleanedCount++;
        }
      } catch (err: unknown) {
        result.errors.push(`Failed to clean "${entry.name}": ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      result.errors.push(`Staging cleanup error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return result;
}

/**
 * Reconciles managed notices documents on disk against the set of referenced keys in the database.
 * Identifies and optionally deletes unreferenced / orphaned files.
 */
export async function reconcileOrphanedDocuments(
  referencedKeys: Set<string>,
  autoDelete = false
): Promise<{ orphanedKeys: string[]; deletedCount: number; errors: string[] }> {
  assertLocalStoragePermitted();

  const root = getDocumentStorageRoot();
  const noticesDir = path.resolve(root, "notices");

  const result = {
    orphanedKeys: [] as string[],
    deletedCount: 0,
    errors: [] as string[],
  };

  try {
    const entries = await fs.promises.readdir(noticesDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isFile()) continue;

      const storageKey = `documents/notices/${entry.name}`;
      if (!isValidManagedDocumentKey(storageKey)) {
        continue;
      }

      if (!referencedKeys.has(storageKey)) {
        result.orphanedKeys.push(storageKey);

        if (autoDelete) {
          try {
            await deleteManagedDocument(storageKey);
            result.deletedCount++;
          } catch (err: unknown) {
            result.errors.push(
              `Failed to delete orphan "${storageKey}": ${err instanceof Error ? err.message : String(err)}`
            );
          }
        }
      }
    }
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      result.errors.push(`Reconciliation error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return result;
}
