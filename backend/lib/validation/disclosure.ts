import { z } from "zod";

/**
 * Permitted document file extensions for statutory disclosure documents.
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
export const disclosureLinkSchema = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (!val || val === "") return true;

      // Reject control characters, whitespace, dangerous protocols
      if (/\s/.test(val)) return false;
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

export const MANAGED_DISCLOSURE_STORAGE_KEY_REGEX =
  /^documents\/disclosures\/doc_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.pdf$/;

export const ANY_MANAGED_DOCUMENT_KEY_REGEX =
  /^documents\/(notices|downloads|disclosures)\/doc_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.pdf$/;

/* -------------------------------------------------------------------------- */
/* SECTION SCHEMAS                                                            */
/* -------------------------------------------------------------------------- */

export const createDisclosureSectionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Section title must be at least 2 characters")
    .max(150, "Section title must not exceed 150 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .nullable()
    .optional(),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must not exceed 100 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase alphanumeric characters and hyphens")
    .optional(),
  displayOrder: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

export const updateDisclosureSectionSchema = z.object({
  id: z.string().cuid("Invalid section ID"),
  title: z
    .string()
    .trim()
    .min(2, "Section title must be at least 2 characters")
    .max(150, "Section title must not exceed 150 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .nullable()
    .optional(),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .max(100, "Slug must not exceed 100 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase alphanumeric characters and hyphens")
    .optional(),
  displayOrder: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
});

export const deleteDisclosureSectionSchema = z.object({
  id: z.string().cuid("Invalid section ID"),
});

export const toggleDisclosureSectionStatusSchema = z.object({
  id: z.string().cuid("Invalid section ID"),
  isPublished: z.boolean(),
});

export const reorderDisclosureSectionsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().cuid("Invalid section ID"),
      displayOrder: z.number().int().min(0),
    })
  ).min(1, "At least one section must be provided"),
});

/* -------------------------------------------------------------------------- */
/* DOCUMENT SCHEMAS                                                           */
/* -------------------------------------------------------------------------- */

export const createDisclosureDocumentSchema = z
  .object({
    sectionId: z.string().cuid("Invalid section ID"),
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
    fileUrl: disclosureLinkSchema,
    fileStorageKey: z
      .string()
      .trim()
      .refine(
        (val) => !val || MANAGED_DISCLOSURE_STORAGE_KEY_REGEX.test(val),
        "Storage key must be a valid managed disclosure document key"
      )
      .nullable()
      .optional(),
    fileSizeBytes: z.number().int().min(0).nullable().optional(),
    fileSize: z.string().trim().max(50).nullable().optional(),
    fileType: z.string().trim().max(100).default("application/pdf"),
    linkLabel: z.string().trim().max(100).default("VIEW/DOWNLOAD"),
    displayOrder: z.number().int().min(0).default(0),
    isPublished: z.boolean().default(true),
  })
  .refine(
    (data) => Boolean(data.fileUrl || data.fileStorageKey),
    {
      message: "Document requires either a file upload or a valid document URL",
      path: ["fileUrl"],
    }
  );

export const updateDisclosureDocumentSchema = z
  .object({
    id: z.string().cuid("Invalid document ID"),
    sectionId: z.string().cuid("Invalid section ID"),
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
    fileUrl: disclosureLinkSchema,
    fileStorageKey: z
      .string()
      .trim()
      .refine(
        (val) => !val || MANAGED_DISCLOSURE_STORAGE_KEY_REGEX.test(val),
        "Storage key must be a valid managed disclosure document key"
      )
      .nullable()
      .optional(),
    fileSizeBytes: z.number().int().min(0).nullable().optional(),
    fileSize: z.string().trim().max(50).nullable().optional(),
    fileType: z.string().trim().max(100).optional(),
    linkLabel: z.string().trim().max(100).optional(),
    displayOrder: z.number().int().min(0).optional(),
    isPublished: z.boolean().optional(),
  })
  .refine(
    (data) => Boolean(data.fileUrl || data.fileStorageKey),
    {
      message: "Document requires either a file upload or a valid document URL",
      path: ["fileUrl"],
    }
  );

export const deleteDisclosureDocumentSchema = z.object({
  id: z.string().cuid("Invalid document ID"),
});

export const toggleDisclosureDocumentStatusSchema = z.object({
  id: z.string().cuid("Invalid document ID"),
  isPublished: z.boolean(),
});

export const reorderDisclosureDocumentsSchema = z.object({
  sectionId: z.string().cuid("Invalid section ID"),
  items: z.array(
    z.object({
      id: z.string().cuid("Invalid document ID"),
      displayOrder: z.number().int().min(0),
    })
  ).min(1, "At least one document must be provided"),
});

/* -------------------------------------------------------------------------- */
/* DIFF COMPUTERS FOR AUDIT LOGGING                                          */
/* -------------------------------------------------------------------------- */

export function computeSectionDiff<T extends Record<string, unknown>>(
  before: T,
  after: Partial<T>
): Record<string, { before: unknown; after: unknown }> {
  const diff: Record<string, { before: unknown; after: unknown }> = {};
  for (const key of Object.keys(after) as Array<keyof T>) {
    if (after[key] !== undefined && before[key] !== after[key]) {
      diff[String(key)] = {
        before: before[key],
        after: after[key],
      };
    }
  }
  return diff;
}

export function computeDocumentDiff<T extends Record<string, unknown>>(
  before: T,
  after: Partial<T>
): Record<string, { before: unknown; after: unknown }> {
  const diff: Record<string, { before: unknown; after: unknown }> = {};
  for (const key of Object.keys(after) as Array<keyof T>) {
    if (after[key] !== undefined && before[key] !== after[key]) {
      diff[String(key)] = {
        before: before[key],
        after: after[key],
      };
    }
  }
  return diff;
}

export type CreateDisclosureSectionInput = z.infer<typeof createDisclosureSectionSchema>;
export type UpdateDisclosureSectionInput = z.infer<typeof updateDisclosureSectionSchema>;
export type CreateDisclosureDocumentInput = z.infer<typeof createDisclosureDocumentSchema>;
export type UpdateDisclosureDocumentInput = z.infer<typeof updateDisclosureDocumentSchema>;
