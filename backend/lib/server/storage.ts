import "server-only";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { prisma } from "@/lib/server/prisma";

export type ManagedMediaFolder = "toppers" | "gallery" | "events" | "facilities" | "academics" | "activities" | "alumni";

export const MANAGED_KEY_REGEX =
  /^(toppers\/top|gallery\/gal|events\/eve)_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/;

export const MANAGED_FACILITY_KEY_REGEX =
  /^facilities\/fac_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/;

export const MANAGED_ACADEMIC_KEY_REGEX =
  /^academics\/aca_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/;

export const MANAGED_ACTIVITY_KEY_REGEX =
  /^activities\/act_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/;

export function isValidManagedActivityKey(key: string | null | undefined): key is string {
  if (!key) return false;
  return MANAGED_ACTIVITY_KEY_REGEX.test(key) ||
    MANAGED_ALUMNI_KEY_REGEX.test(key);
}

export function isValidManagedFacilityKey(key: string | null | undefined): key is string {
  if (!key) return false;
  return MANAGED_FACILITY_KEY_REGEX.test(key);
}

export function isValidManagedAcademicKey(key: string | null | undefined): key is string {
  if (!key) return false;
  return MANAGED_ACADEMIC_KEY_REGEX.test(key);
}

export const MANAGED_ALUMNI_KEY_REGEX =
  /^alumni\/alu_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/;

export function isValidManagedAlumniKey(key: string | null | undefined): key is string {
  if (!key) return false;
  return MANAGED_ALUMNI_KEY_REGEX.test(key);
}

export function isValidManagedMediaKey(key: string | null | undefined): key is string {
  if (!key) return false;
  return (
    MANAGED_KEY_REGEX.test(key) ||
    MANAGED_FACILITY_KEY_REGEX.test(key) ||
    MANAGED_ACADEMIC_KEY_REGEX.test(key) ||
    MANAGED_ACTIVITY_KEY_REGEX.test(key)
  );
}

export function getUploadRoot(folder: ManagedMediaFolder = "toppers"): string {
  if (process.env.TEST_UPLOAD_ROOT) {
    return path.resolve(process.env.TEST_UPLOAD_ROOT, folder);
  }
  return path.resolve(process.cwd(), "storage", "uploads", folder);
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
export function generateManagedKey(folder: ManagedMediaFolder = "toppers"): string {
  const uuid = crypto.randomUUID();
  const prefix =
    folder === "gallery"
      ? "gal"
      : folder === "events"
      ? "eve"
      : folder === "facilities"
      ? "fac"
      : folder === "academics"
      ? "aca"
      : folder === "activities"
      ? "act"
      : folder === "alumni"
      ? "alu"
      : "top";
  return `${folder}/${prefix}_${uuid}.webp`;
}

/**
 * Resolves a managed key to an absolute filesystem path with strict boundary containment.
 */
export function resolveSafePath(storageKey: string): string {
  if (!isValidManagedMediaKey(storageKey)) {
    throw new Error(`Invalid managed storage key format: "${storageKey}"`);
  }

  const [folder, filename] = storageKey.split("/");
  const root = getUploadRoot(folder as ManagedMediaFolder);
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
  buffer: Buffer,
  folder: ManagedMediaFolder = "toppers"
): Promise<{ storageKey: string; publicUrl: string }> {
  assertLocalStoragePermitted();

  const storageKey = generateManagedKey(folder);
  const root = getUploadRoot(folder);

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
  if (!storageKey || !isValidManagedMediaKey(storageKey)) {
    // Legacy assets or external URLs have null or unmanaged keys — ignore safely
    return false;
  }

  assertLocalStoragePermitted();

  // Reference check: ensure no active records in PostgreSQL reference this key across all modules
  const [
    topperCount,
    heroCount,
    principalCount,
    statCount,
    highlightCount,
    aboutSettingCount,
    narrativeCount,
    leadershipImageCount,
    leadershipSignatureCount,
    facultyCount,
    galleryAlbumCount,
    galleryImageCount,
    eventCount,
    facilityItemCount,
    academicOverviewCount,
    activityOverviewCount,
    alumniReunionCount,
  ] = await Promise.all([
    prisma.boardResultTopper.count({ where: { photoStorageKey: storageKey } }),
    prisma.homepageHero.count({ where: { backgroundImageStorageKey: storageKey } }),
    prisma.homepagePrincipalMessage.count({ where: { imageStorageKey: storageKey } }),
    prisma.homepageStatistic.count({ where: { imageStorageKey: storageKey } }),
    prisma.homepageHighlight.count({ where: { imageStorageKey: storageKey } }),
    prisma.aboutPageSetting.count({ where: { showcaseImageStorageKey: storageKey } }),
    prisma.aboutNarrativeSection.count({ where: { imageStorageKey: storageKey } }),
    prisma.leadershipMember.count({ where: { imageStorageKey: storageKey } }),
    prisma.leadershipMember.count({ where: { signatureStorageKey: storageKey } }),
    prisma.facultyMember.count({ where: { imageStorageKey: storageKey } }),
    prisma.galleryAlbum.count({ where: { coverImageStorageKey: storageKey } }),
    prisma.galleryImage.count({ where: { imageStorageKey: storageKey } }),
    prisma.schoolEvent.count({ where: { coverImageStorageKey: storageKey } }),
    prisma.facilityItem.count({ where: { imageStorageKey: storageKey } }),
    prisma.academicOverview.count({ where: { heroImageStorageKey: storageKey } }),
    prisma.activityOverview.count({ where: { heroImageStorageKey: storageKey } }),
    prisma.alumniReunion.count({ where: { heroImageStorageKey: storageKey } }),
  ]);

  const refCount =
    topperCount +
    heroCount +
    principalCount +
    statCount +
    highlightCount +
    aboutSettingCount +
    narrativeCount +
    leadershipImageCount +
    leadershipSignatureCount +
    facultyCount +
    galleryAlbumCount +
    galleryImageCount +
    eventCount +
    facilityItemCount +
    academicOverviewCount +
    activityOverviewCount +
    alumniReunionCount;

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
