import "server-only";
import fs from "node:fs";
import { processTopperPhoto, ImageProcessingError } from "@/lib/server/image-processor";
import {
  saveManagedPhoto,
  resolveSafePath,
  deleteManagedPhotoIfUnreferenced,
  type ManagedMediaFolder,
} from "@/lib/server/storage";

/**
 * Extracts an uploaded File from FormData or plain input object.
 */
export function extractUploadedFile(
  rawInput: FormData | Record<string, unknown> | null | undefined,
  fieldName: string
): File | null {
  if (!rawInput) return null;

  if (typeof FormData !== "undefined" && rawInput instanceof FormData) {
    const file = rawInput.get(fieldName);
    if (
      file &&
      typeof file === "object" &&
      "size" in file &&
      typeof (file as File).size === "number"
    ) {
      const f = file as File;
      if (f.size > 0) return f;
    }
  } else if (typeof rawInput === "object" && fieldName in rawInput) {
    const file = (rawInput as Record<string, unknown>)[fieldName];
    if (
      file &&
      typeof file === "object" &&
      "size" in file &&
      typeof (file as File).size === "number"
    ) {
      const f = file as File;
      if (f.size > 0) return f;
    }
  }
  return null;
}

/**
 * Checks whether an explicit image removal was requested.
 */
export function isRemovalRequested(
  rawInput: FormData | Record<string, unknown> | null | undefined,
  removeFieldName: string
): boolean {
  if (!rawInput) return false;

  if (typeof FormData !== "undefined" && rawInput instanceof FormData) {
    const val = rawInput.get(removeFieldName);
    return val === "true" || val === "1";
  } else if (typeof rawInput === "object") {
    const val = (rawInput as Record<string, unknown>)[removeFieldName];
    return val === true || val === "true" || val === "1";
  }
  return false;
}

/**
 * Processes an uploaded image file with Sharp and writes it to managed storage.
 */
export async function processAndSaveUploadedImage(
  file: File,
  folder: ManagedMediaFolder = "toppers"
): Promise<{ storageKey: string; publicUrl: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);
  const processed = await processTopperPhoto(inputBuffer);
  return await saveManagedPhoto(processed.buffer, folder);
}

/**
 * Safely unlinks an uncommitted orphaned file if a transaction fails.
 */
export async function cleanupOrphanFile(
  storageKey: string | null | undefined
): Promise<void> {
  if (!storageKey) return;
  try {
    const filePath = resolveSafePath(storageKey);
    await fs.promises.unlink(filePath);
  } catch (err) {
    console.error(`[admin-media] Failed to cleanup orphaned file for key ${storageKey}:`, err);
  }
}

export { ImageProcessingError, deleteManagedPhotoIfUnreferenced, type ManagedMediaFolder };
