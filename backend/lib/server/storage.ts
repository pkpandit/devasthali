import "server-only";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { prisma } from "@/lib/server/prisma";

export const MANAGED_KEY_REGEX =
  /^toppers\/top_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/;

const DEFAULT_UPLOAD_ROOT = path.resolve(process.cwd(), "storage", "uploads", "toppers");

export function getUploadRoot(): string {
  // Allow overriding via environment for isolated unit testing
  if (process.env.TEST_UPLOAD_ROOT) {
    return path.resolve(process.env.TEST_UPLOAD_ROOT);
  }
  return DEFAULT_UPLOAD_ROOT;
}

export function getPublicMediaOrigin(): string {
  if (process.env.PUBLIC_MEDIA_ORIGIN) {
    return process.env.PUBLIC_MEDIA_ORIGIN.replace(/\/+$/, "");
  }
  return "http://127.0.0.1:3001";
}

/**
 * Validates that local disk storage is permitted.
 * In production, local storage is explicitly blocked unless configured for durable storage.
 */
function assertLocalStoragePermitted() {
  if (
    process.env.NODE_ENV === "production" &&
    !process.env.ALLOW_LOCAL_STORAGE_IN_PRODUCTION
  ) {
    throw new Error(
      "Local filesystem storage is disabled in production. External durable storage must be configured."
    );
  }
}

/**
 * Validates that a managed storage key conforms strictly to application ownership rules.
 */
export function isValidManagedKey(key: string | null | undefined): key is string {
  if (!key) return false;
  return MANAGED_KEY_REGEX.test(key);
}

/**
 * Generates a server-authoritative managed storage key.
 */
export function generateManagedKey(): string {
  const uuid = crypto.randomUUID();
  return `toppers/top_${uuid}.webp`;
}

/**
 * Resolves a managed key to an absolute filesystem path with strict boundary containment.
 */
export function resolveSafePath(storageKey: string): string {
  if (!isValidManagedKey(storageKey)) {
    throw new Error(`Invalid managed storage key format: "${storageKey}"`);
  }

  const root = getUploadRoot();
  const filename = path.basename(storageKey);
  const resolved = path.resolve(root, filename);

  // Path containment assert
  const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
  if (!resolved.startsWith(rootWithSep)) {
    throw new Error(`Path containment violation for key: "${storageKey}"`);
  }

  return resolved;
}

/**
 * Writes a processed WebP image buffer to managed local storage.
 */
export async function saveManagedPhoto(
  buffer: Buffer
): Promise<{ storageKey: string; publicUrl: string }> {
  assertLocalStoragePermitted();

  const storageKey = generateManagedKey();
  const root = getUploadRoot();

  // Ensure upload directory exists
  await fs.promises.mkdir(root, { recursive: true });

  const targetPath = resolveSafePath(storageKey);
  await fs.promises.writeFile(targetPath, buffer);

  const origin = getPublicMediaOrigin();
  const publicUrl = `${origin}/api/public/media/${storageKey}`;

  return { storageKey, publicUrl };
}

/**
 * Safely unlinks an unreferenced managed file.
 * Leaves external URLs, legacy paths, and referenced keys completely untouched.
 */
export async function deleteManagedPhotoIfUnreferenced(
  storageKey: string | null | undefined
): Promise<boolean> {
  if (!storageKey || !isValidManagedKey(storageKey)) {
    // Legacy assets or external URLs have null or unmanaged keys — ignore safely
    return false;
  }

  assertLocalStoragePermitted();

  // Reference check: ensure no active records in PostgreSQL reference this key
  const refCount = await prisma.boardResultTopper.count({
    where: { photoStorageKey: storageKey },
  });

  if (refCount > 0) {
    console.warn(
      `[storage] File "${storageKey}" is still referenced by ${refCount} record(s). Deletion skipped.`
    );
    return false;
  }

  const filePath = resolveSafePath(storageKey);

  try {
    const lstat = await fs.promises.lstat(filePath);
    if (lstat.isSymbolicLink()) {
      throw new Error(`Refusing to unlink symlink at "${filePath}"`);
    }
    await fs.promises.unlink(filePath);
    return true;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      // File already removed
      return true;
    }
    console.error(`[storage] Failed to delete file "${filePath}":`, err);
    return false;
  }
}

/**
 * Constructs the canonical public URL for an authoritative managed key.
 */
export function buildPublicMediaUrl(storageKey: string): string {
  const origin = getPublicMediaOrigin();
  return `${origin}/api/public/media/${storageKey}`;
}
