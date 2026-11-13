import "server-only";
import sharp from "sharp";
import type { Metadata, OutputInfo } from "sharp";

export const MAX_IMAGE_FILE_BYTES = 2 * 1024 * 1024; // 2 MiB
export const MAX_INPUT_PIXELS = 16 * 1024 * 1024; // 16 Megapixels
export const MAX_OUTPUT_WIDTH = 1200;
export const MAX_OUTPUT_HEIGHT = 1200;
export const ALLOWED_INPUT_FORMATS = new Set(["jpeg", "jpg", "png", "webp"]);

export class ImageProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageProcessingError";
  }
}

export interface ProcessedImageResult {
  buffer: Buffer;
  format: "webp";
  width: number;
  height: number;
  sizeBytes: number;
}

/**
 * Validates, strips metadata, normalizes orientation, and re-encodes
 * an uploaded image buffer to standardized WebP.
 */
export async function processTopperPhoto(
  inputBuffer: Buffer
): Promise<ProcessedImageResult> {
  // 1. Enforce individual buffer size limit
  if (!inputBuffer || inputBuffer.length === 0) {
    throw new ImageProcessingError("Uploaded image file is empty.");
  }
  if (inputBuffer.length > MAX_IMAGE_FILE_BYTES) {
    throw new ImageProcessingError(
      `Image file size exceeds the maximum limit of 2 MiB (received ${Math.round(
        inputBuffer.length / 1024
      )} KB).`
    );
  }

  // 2. Initialize sharp with decompression bomb protection and page discovery
  const pipeline = sharp(inputBuffer, {
    limitInputPixels: MAX_INPUT_PIXELS,
    pages: -1,
    failOn: "error", // Fail on truncated or corrupted bitstreams
  });

  // 3. Inspect decoded metadata
  let metadata: Metadata;
  try {
    metadata = await pipeline.metadata();
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Invalid image format";
    throw new ImageProcessingError(`Failed to decode image: ${detail}`);
  }

  // 4. Verify input format
  const detectedFormat = (metadata.format || "").toLowerCase();
  if (!ALLOWED_INPUT_FORMATS.has(detectedFormat)) {
    throw new ImageProcessingError(
      `Unsupported image format "${detectedFormat}". Only JPEG, PNG, and WebP images are allowed.`
    );
  }

  // 5. Reject animated or multipage inputs
  const isAnimatedWebp =
    detectedFormat === "webp" &&
    (inputBuffer.includes(Buffer.from("ANIM")) || inputBuffer.includes(Buffer.from("ANMF")));
  if ((metadata.pages && metadata.pages > 1) || isAnimatedWebp) {
    throw new ImageProcessingError(
      "Animated or multi-page images (GIF/animated WebP/TIFF) are not permitted."
    );
  }

  // 6. Check dimension bounds
  const rawWidth = metadata.width ?? 0;
  const rawHeight = metadata.height ?? 0;
  if (rawWidth === 0 || rawHeight === 0) {
    throw new ImageProcessingError("Image dimensions could not be determined.");
  }
  if (rawWidth * rawHeight > MAX_INPUT_PIXELS) {
    throw new ImageProcessingError(
      `Image pixel count exceeds 16 megapixels (${rawWidth}x${rawHeight}).`
    );
  }

  // 7. Process pipeline: rotate -> resize -> strip EXIF -> encode WebP
  let outputBuffer: Buffer;
  let info: OutputInfo;
  try {
    const transformed = sharp(inputBuffer, {
      limitInputPixels: MAX_INPUT_PIXELS,
      failOn: "error",
    })
      .rotate() // Auto-orient based on EXIF
      .resize({
        width: MAX_OUTPUT_WIDTH,
        height: MAX_OUTPUT_HEIGHT,
        fit: "inside",
        withoutEnlargement: true,
      })
      // Intentionally omitting .withMetadata() strips all EXIF, GPS, and personal metadata
      .webp({
        quality: 82,
        effort: 4,
      });

    const res = await transformed.toBuffer({ resolveWithObject: true });
    outputBuffer = res.data;
    info = res.info;
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Processing error";
    throw new ImageProcessingError(`Image transformation failed: ${detail}`);
  }

  return {
    buffer: outputBuffer,
    format: "webp",
    width: info.width,
    height: info.height,
    sizeBytes: info.size,
  };
}
