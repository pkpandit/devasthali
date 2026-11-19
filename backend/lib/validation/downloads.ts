import { z } from "zod";

/**
 * Permitted document file extensions for school downloads.
 */
const PERMITTED_DOCUMENT_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".txt",
];

function hasPermittedExtension(pathname: string): boolean {
  const lower = pathname.toLowerCase().split("?")[0].split("#")[0];
  return PERMITTED_DOCUMENT_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/**
 * Validates document links:
 * Permits either:
 * 1. Root-relative path (/documents/...):
 *    - Starts with /
 *    - Must NOT start with // (no protocol-relative)
 *    - Must NOT contain .. or encoded traversal (%2e)
 *    - Must have permitted document extension
 * 2. External HTTPS URL:
 *    - Protocol must be https:
 *    - Valid FQDN hostname with at least one dot
 *    - No localhost, loopback, or private hostnames
 *    - No credentials (username/password)
 *    - Must have permitted document extension or standard path
 */
export const downloadLinkSchema = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (!val || val === "") return true;

      // Reject control characters, whitespace, dangerous protocols
      if (/\\s/.test(val)) return false;
      const lower = val.toLowerCase();
      if (
        lower.startsWith("javascript:") ||
        lower.startsWith("data:") ||
        lower.startsWith("vbscript:") ||
        lower.startsWith("file:")
      ) {
        return false;
      }

      // 1. Root-relative check
      if (val.startsWith("/")) {
        if (val.startsWith("//")) return false; // Reject protocol-relative
        if (val.includes("..") || lower.includes("%2e%2e")) return false; // Traversal guard
        return hasPermittedExtension(val);
      }

      // 2. External HTTPS URL check
      try {
        const parsed = new URL(val);
        if (parsed.protocol !== "https:") return false;
        if (parsed.username || parsed.password) return false;
        const host = parsed.hostname.toLowerCase();
        if (host === "localhost" || host === "127.0.0.1" || host === "::1") return false;
        if (!host.includes(".") || host.endsWith(".")) return false; // FQDN check
        return hasPermittedExtension(parsed.pathname) || parsed.pathname.length > 1;
      } catch {
        return false;
      }
    },
    {
      message:
        "Document link must be a safe root-relative path (e.g. /documents/...pdf) or secure HTTPS URL pointing to a document (.pdf, .docx, etc.)",
    }
  )
  .nullable()
  .optional();

export const MANAGED_DOWNLOAD_STORAGE_KEY_REGEX =
  /^documents\/downloads\/doc_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.pdf$/;

export const ANY_MANAGED_DOCUMENT_KEY_REGEX =
  /^documents\/(notices|downloads)\/doc_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.pdf$/;

/* -------------------------------------------------------------------------- */
/* CATEGORY SCHEMAS                                                           */
/* -------------------------------------------------------------------------- */

export const createDownloadCategorySchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Category title must be at least 2 characters")
    .max(100, "Category title must not exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .nullable()
    .optional(),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isPublished: z.boolean().default(true),
});

export type CreateDownloadCategoryInput = z.infer<typeof createDownloadCategorySchema>;

export const updateDownloadCategorySchema = createDownloadCategorySchema.extend({
  id: z.string().min(1, "Category ID is required"),
});

export type UpdateDownloadCategoryInput = z.infer<typeof updateDownloadCategorySchema>;

export const deleteDownloadCategorySchema = z.object({
  id: z.string().min(1, "Category ID is required"),
});

export const toggleDownloadCategoryStatusSchema = z.object({
  id: z.string().min(1, "Category ID is required"),
  isPublished: z.boolean(),
});

export const reorderDownloadCategoriesSchema = z.object({
  orderedIds: z
    .array(z.string().min(1, "Category ID is required"))
    .min(1, "At least one category ID is required"),
});

/* -------------------------------------------------------------------------- */
/* DOCUMENT SCHEMAS                                                           */
/* -------------------------------------------------------------------------- */

const baseDownloadDocumentFields = {
  title: z
    .string()
    .trim()
    .min(2, "Document title must be at least 2 characters")
    .max(200, "Document title must not exceed 200 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .nullable()
    .optional(),
  categoryId: z.string().min(1, "Category ID is required"),
  fileUrl: downloadLinkSchema,
  fileStorageKey: z
    .string()
    .trim()
    .regex(ANY_MANAGED_DOCUMENT_KEY_REGEX, "Invalid managed storage key format")
    .nullable()
    .optional(),
  fileSizeBytes: z
    .coerce
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024, "File size exceeds 10 MiB limit")
    .nullable()
    .optional(),
  fileSize: z
    .string()
    .trim()
    .max(30, "File size description must not exceed 30 characters")
    .nullable()
    .optional(),
  fileType: z.string().trim().default("application/pdf"),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isPublished: z.boolean().default(true),
};

export const createDownloadDocumentSchema = z
  .object(baseDownloadDocumentFields)
  .refine(
    (data) => {
      const hasUrl = Boolean(data.fileUrl && data.fileUrl.trim().length > 0);
      const hasKey = Boolean(data.fileStorageKey && data.fileStorageKey.trim().length > 0);
      return hasUrl || hasKey;
    },
    {
      message: "Either an uploaded document file or an authoritative file link is required",
      path: ["fileUrl"],
    }
  );

export type CreateDownloadDocumentInput = z.infer<typeof createDownloadDocumentSchema>;

export const updateDownloadDocumentSchema = z
  .object({
    ...baseDownloadDocumentFields,
    id: z.string().min(1, "Document ID is required"),
  })
  .refine(
    (data) => {
      const hasUrl = Boolean(data.fileUrl && data.fileUrl.trim().length > 0);
      const hasKey = Boolean(data.fileStorageKey && data.fileStorageKey.trim().length > 0);
      return hasUrl || hasKey;
    },
    {
      message: "Either an uploaded document file or an authoritative file link is required",
      path: ["fileUrl"],
    }
  );

export type UpdateDownloadDocumentInput = z.infer<typeof updateDownloadDocumentSchema>;

export const deleteDownloadDocumentSchema = z.object({
  id: z.string().min(1, "Document ID is required"),
});

export const toggleDownloadDocumentStatusSchema = z.object({
  id: z.string().min(1, "Document ID is required"),
  isPublished: z.boolean(),
});

export const reorderDownloadDocumentsSchema = z.object({
  categoryId: z.string().min(1, "Category ID is required"),
  orderedIds: z
    .array(z.string().min(1, "Document ID is required"))
    .min(1, "At least one document ID is required"),
});

/* -------------------------------------------------------------------------- */
/* DIFF CALCULATORS FOR AUDIT LOGGING                                         */
/* -------------------------------------------------------------------------- */

export function computeCategoryDiff(
  existing: {
    title: string;
    description: string | null;
    displayOrder: number;
    isPublished: boolean;
  },
  data: {
    title: string;
    description?: string | null;
    displayOrder: number;
    isPublished: boolean;
  }
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};

  if (existing.title !== data.title) {
    diff.title = { from: existing.title, to: data.title };
  }
  if ((existing.description ?? null) !== (data.description ?? null)) {
    diff.description = { from: existing.description, to: data.description ?? null };
  }
  if (existing.displayOrder !== data.displayOrder) {
    diff.displayOrder = { from: existing.displayOrder, to: data.displayOrder };
  }
  if (existing.isPublished !== data.isPublished) {
    diff.isPublished = { from: existing.isPublished, to: data.isPublished };
  }

  return diff;
}

export function computeDocumentDiff(
  existing: {
    title: string;
    description: string | null;
    categoryId: string;
    fileUrl: string | null;
    fileStorageKey: string | null;
    fileSizeBytes: number | null;
    fileSize: string | null;
    fileType: string;
    displayOrder: number;
    isPublished: boolean;
  },
  data: {
    title: string;
    description?: string | null;
    categoryId: string;
    fileUrl?: string | null;
    fileStorageKey?: string | null;
    fileSizeBytes?: number | null;
    fileSize?: string | null;
    fileType?: string;
    displayOrder: number;
    isPublished: boolean;
  }
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};

  if (existing.title !== data.title) {
    diff.title = { from: existing.title, to: data.title };
  }
  if ((existing.description ?? null) !== (data.description ?? null)) {
    diff.description = { from: existing.description, to: data.description ?? null };
  }
  if (existing.categoryId !== data.categoryId) {
    diff.categoryId = { from: existing.categoryId, to: data.categoryId };
  }
  if ((existing.fileUrl ?? null) !== (data.fileUrl ?? null)) {
    diff.fileUrl = { from: existing.fileUrl, to: data.fileUrl ?? null };
  }
  if ((existing.fileStorageKey ?? null) !== (data.fileStorageKey ?? null)) {
    diff.fileStorageKey = {
      from: existing.fileStorageKey ? "[MANAGED_FILE]" : null,
      to: data.fileStorageKey ? "[MANAGED_FILE]" : null,
    };
  }
  if ((existing.fileSizeBytes ?? null) !== (data.fileSizeBytes ?? null)) {
    diff.fileSizeBytes = { from: existing.fileSizeBytes, to: data.fileSizeBytes ?? null };
  }
  if ((existing.fileSize ?? null) !== (data.fileSize ?? null)) {
    diff.fileSize = { from: existing.fileSize, to: data.fileSize ?? null };
  }
  if (data.fileType && existing.fileType !== data.fileType) {
    diff.fileType = { from: existing.fileType, to: data.fileType };
  }
  if (existing.displayOrder !== data.displayOrder) {
    diff.displayOrder = { from: existing.displayOrder, to: data.displayOrder };
  }
  if (existing.isPublished !== data.isPublished) {
    diff.isPublished = { from: existing.isPublished, to: data.isPublished };
  }

  return diff;
}
