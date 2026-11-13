import crypto from "node:crypto";

export const DEFAULT_MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MIN_PDF_SIZE_BYTES = 32; // Smallest plausible PDF with header, xref, trailer

export const ALLOWED_PDF_MIME_TYPES = ["application/pdf"] as const;

export const SUPPORTED_PDF_VERSIONS = [
  "1.3",
  "1.4",
  "1.5",
  "1.6",
  "1.7",
  "2.0",
] as const;

export type SupportedPdfVersion = (typeof SUPPORTED_PDF_VERSIONS)[number];

export type PdfValidationErrorCode =
  | "EMPTY_FILE"
  | "FILE_TOO_SMALL"
  | "SIZE_LIMIT_EXCEEDED"
  | "INVALID_MIME_TYPE"
  | "INVALID_EXTENSION"
  | "INVALID_FILENAME"
  | "INVALID_MAGIC_HEADER"
  | "UNSUPPORTED_PDF_VERSION"
  | "MISSING_EOF_TRAILER"
  | "SUSPICIOUS_CONTENT"
  | "MALFORMED_PDF";

export interface PdfValidationDetails {
  byteSize: number;
  sha256: string;
  pdfVersion: string | null;
  hasValidHeader: boolean;
  hasValidTrailer: boolean;
  hasStartXref: boolean;
  detectedRisks: string[];
}

export interface PdfValidationResult {
  isValid: boolean;
  error?: string;
  code?: PdfValidationErrorCode;
  details?: PdfValidationDetails;
}

export interface ValidatePdfOptions {
  maxSizeBytes?: number;
  mimeType?: string | null;
  originalFilename?: string | null;
  allowJavaScript?: boolean;
  allowEmbeddedFiles?: boolean;
  allowLaunchActions?: boolean;
  allowedVersions?: readonly string[];
}

// Byte signature for %PDF-
const PDF_MAGIC_BYTES = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]); // "%PDF-"

// High-risk PDF structural tokens (executable or payload carriers)
const STRUCTURAL_RISK_PATTERNS: Array<{
  name: string;
  regex: RegExp;
  flag: "allowJavaScript" | "allowEmbeddedFiles" | "allowLaunchActions";
}> = [
  {
    name: "Embedded JavaScript (/JavaScript or /JS)",
    regex: /\/(?:JavaScript|JS|#4a#61#76#61#53#63#72#69#70#74|#4a#53)[\s/<>\[(]/i,
    flag: "allowJavaScript",
  },
  {
    name: "Shell Launch Action (/Launch)",
    regex: /\/Launch[\s/<>\[(]/i,
    flag: "allowLaunchActions",
  },
  {
    name: "Embedded Binary Files (/EmbeddedFiles)",
    regex: /\/EmbeddedFiles[\s/<>\[(]/i,
    flag: "allowEmbeddedFiles",
  },
  {
    name: "Embedded RichMedia/Flash (/RichMedia)",
    regex: /\/RichMedia[\s/<>\[(]/i,
    flag: "allowEmbeddedFiles",
  },
];

/**
 * Validates a PDF buffer against strict security, structural, and sizing constraints.
 * 
 * Implements:
 * 1. Byte-level boundary and size enforcement.
 * 2. MIME type & file extension consistency.
 * 3. File-header magic number (%PDF-) and PDF version restriction (1.3 - 2.0).
 * 4. End-of-file trailer (%%EOF) and startxref cross-reference marker checks.
 * 5. Cryptographic SHA-256 digest computation.
 * 6. Structural pre-filtering to reject embedded scripts, shell-launch actions, and hidden file payloads.
 */
export function validatePdfBuffer(
  buffer: Buffer | Uint8Array,
  options: ValidatePdfOptions = {}
): PdfValidationResult {
  const maxBytes = options.maxSizeBytes ?? DEFAULT_MAX_PDF_SIZE_BYTES;
  const allowedVersions = options.allowedVersions ?? SUPPORTED_PDF_VERSIONS;

  // 1. Convert to Buffer if needed
  const nodeBuf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const byteSize = nodeBuf.length;

  if (byteSize === 0) {
    return {
      isValid: false,
      code: "EMPTY_FILE",
      error: "Uploaded file is empty (0 bytes).",
    };
  }

  if (byteSize < MIN_PDF_SIZE_BYTES) {
    return {
      isValid: false,
      code: "FILE_TOO_SMALL",
      error: `File is too small (${byteSize} bytes) to constitute a valid PDF document.`,
    };
  }

  if (byteSize > maxBytes) {
    return {
      isValid: false,
      code: "SIZE_LIMIT_EXCEEDED",
      error: `File size (${(byteSize / (1024 * 1024)).toFixed(2)} MB) exceeds maximum permitted limit (${(maxBytes / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  // 2. MIME type validation (if provided)
  if (options.mimeType !== undefined && options.mimeType !== null) {
    const normalizedMime = options.mimeType.toLowerCase().trim();
    if (!ALLOWED_PDF_MIME_TYPES.includes(normalizedMime as (typeof ALLOWED_PDF_MIME_TYPES)[number])) {
      return {
        isValid: false,
        code: "INVALID_MIME_TYPE",
        error: `Invalid MIME type "${options.mimeType}". Expected "application/pdf".`,
      };
    }
  }

  // 3. Filename & extension validation (if provided)
  if (options.originalFilename !== undefined && options.originalFilename !== null) {
    const rawName = options.originalFilename;

    // Check for null-byte or directory traversal in filename
    if (rawName.includes("\0") || rawName.includes("/") || rawName.includes("\\") || rawName.includes("..")) {
      return {
        isValid: false,
        code: "INVALID_FILENAME",
        error: "Filename contains forbidden path traversal or null-byte characters.",
      };
    }

    const lowerName = rawName.toLowerCase();
    if (!lowerName.endsWith(".pdf")) {
      return {
        isValid: false,
        code: "INVALID_EXTENSION",
        error: `File must have a .pdf extension. Received "${rawName}".`,
      };
    }
  }

  // 4. SHA-256 Digest Computation
  const sha256 = crypto.createHash("sha256").update(nodeBuf).digest("hex");

  // 5. Header Magic Number & Version Extraction
  // PDF header must appear within the first 1024 bytes per PDF-1.7 spec, but standard documents place it at offset 0.
  const headerSearchWindow = nodeBuf.subarray(0, Math.min(1024, byteSize));
  const magicIndex = headerSearchWindow.indexOf(PDF_MAGIC_BYTES);

  if (magicIndex === -1) {
    return {
      isValid: false,
      code: "INVALID_MAGIC_HEADER",
      error: "Invalid PDF header. Missing '%PDF-' magic bytes.",
      details: {
        byteSize,
        sha256,
        pdfVersion: null,
        hasValidHeader: false,
        hasValidTrailer: false,
        hasStartXref: false,
        detectedRisks: [],
      },
    };
  }

  // Extract version immediately following %PDF-
  const headerSlice = headerSearchWindow
    .subarray(magicIndex, Math.min(magicIndex + 16, headerSearchWindow.length))
    .toString("latin1");
  const versionMatch = headerSlice.match(/%PDF-([0-9]+\.[0-9]+)/);
  const pdfVersion = versionMatch ? versionMatch[1] : null;

  if (!pdfVersion || !allowedVersions.includes(pdfVersion as SupportedPdfVersion)) {
    return {
      isValid: false,
      code: "UNSUPPORTED_PDF_VERSION",
      error: `Unsupported PDF version "${pdfVersion || "unknown"}". Allowed versions: ${allowedVersions.join(", ")}.`,
      details: {
        byteSize,
        sha256,
        pdfVersion,
        hasValidHeader: true,
        hasValidTrailer: false,
        hasStartXref: false,
        detectedRisks: [],
      },
    };
  }

  // 6. Trailer and EOF verification
  // Standard PDF ends with %%EOF within the last 1024 bytes.
  const trailerWindowSize = Math.min(1024, byteSize);
  const trailerSlice = nodeBuf
    .subarray(byteSize - trailerWindowSize, byteSize)
    .toString("latin1");

  const hasValidTrailer = trailerSlice.includes("%%EOF");
  const hasStartXref = trailerSlice.includes("startxref");

  if (!hasValidTrailer) {
    return {
      isValid: false,
      code: "MISSING_EOF_TRAILER",
      error: "Corrupted or truncated PDF. Missing '%%EOF' trailer marker in document tail.",
      details: {
        byteSize,
        sha256,
        pdfVersion,
        hasValidHeader: true,
        hasValidTrailer: false,
        hasStartXref,
        detectedRisks: [],
      },
    };
  }

  // 7. Structural Pre-Filter: Inspect for high-risk exploit tokens
  // Convert buffer to latin1 string for safe binary regex search without corrupting byte offsets
  const documentBody = nodeBuf.toString("latin1");
  const detectedRisks: string[] = [];

  for (const risk of STRUCTURAL_RISK_PATTERNS) {
    const isAllowed = options[risk.flag] === true;
    if (risk.regex.test(documentBody)) {
      detectedRisks.push(risk.name);
      if (!isAllowed) {
        return {
          isValid: false,
          code: "SUSPICIOUS_CONTENT",
          error: `PDF rejected by structural security pre-filter: ${risk.name} detected. Educational circulars must not contain active scripts or executable payloads.`,
          details: {
            byteSize,
            sha256,
            pdfVersion,
            hasValidHeader: true,
            hasValidTrailer,
            hasStartXref,
            detectedRisks,
          },
        };
      }
    }
  }

  return {
    isValid: true,
    details: {
      byteSize,
      sha256,
      pdfVersion,
      hasValidHeader: true,
      hasValidTrailer,
      hasStartXref,
      detectedRisks,
    },
  };
}
