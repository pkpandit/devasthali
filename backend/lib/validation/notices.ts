import { z } from "zod";

export const NOTICE_CATEGORIES = [
  "CIRCULAR",
  "EXAMINATION",
  "ADMISSION",
  "EVENT",
] as const;

export type NoticeCategoryType = (typeof NOTICE_CATEGORIES)[number];

export const noticeCategorySchema = z.enum(NOTICE_CATEGORIES);

export const NOTICE_STATUSES = [
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "EXPIRED",
] as const;

export type NoticeComputedStatus = (typeof NOTICE_STATUSES)[number];

/**
 * Computes the lifecycle status of a notice based on publication flags and timestamps.
 * 
 * Rules:
 * 1. DRAFT: isPublished is false, regardless of dates.
 * 2. SCHEDULED: isPublished is true, but publishDate is in the future.
 * 3. EXPIRED: isPublished is true, and expiryDate is set and has passed.
 * 4. PUBLISHED: isPublished is true, publishDate <= now, and (expiryDate is null or > now).
 */
export function getNoticeStatus(
  notice: {
    isPublished: boolean;
    publishDate: Date | string;
    expiryDate?: Date | string | null;
  },
  now: Date = new Date()
): NoticeComputedStatus {
  if (!notice.isPublished) {
    return "DRAFT";
  }

  const pubDate = new Date(notice.publishDate);
  if (pubDate.getTime() > now.getTime()) {
    return "SCHEDULED";
  }

  if (notice.expiryDate) {
    const expDate = new Date(notice.expiryDate);
    if (expDate.getTime() <= now.getTime()) {
      return "EXPIRED";
    }
  }

  return "PUBLISHED";
}

/**
 * Permitted document file extensions for school notices.
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
 * Tightened document link validation:
 * Permits either:
 * 1. Root-relative path (/documents/...):
 *    - Starts with /
 *    - Must NOT start with // (no protocol-relative)
 *    - Must NOT contain .. or encoded traversal (%2e)
 *    - Must have permitted document extension
 * 2. External HTTPS URL:
 *    - Protocol must be https:
 *    - Valid FQDN hostname with at least one dot
 *    - No credentials (username/password)
 *    - Must have permitted document extension or standard path
 */
export const documentLinkSchema = z
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
        if (parsed.username || parsed.password) return false; // No embedded credentials
        if (!parsed.hostname.includes(".") || parsed.hostname.endsWith(".")) return false; // FQDN check
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

export const createNoticeSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title must not exceed 200 characters"),
    category: noticeCategorySchema.default("CIRCULAR"),
    summary: z
      .string()
      .trim()
      .max(500, "Summary must not exceed 500 characters")
      .nullable()
      .optional(),
    content: z
      .string()
      .trim()
      .max(10000, "Content must not exceed 10,000 characters")
      .nullable()
      .optional(),
    isUrgent: z.boolean().default(false),
    isPublished: z.boolean().default(false),
    fileUrl: documentLinkSchema,
    fileSize: z
      .string()
      .trim()
      .max(30, "File size description must not exceed 30 characters")
      .nullable()
      .optional(),
    publishDate: z.coerce.date().default(() => new Date()),
    expiryDate: z.coerce.date().nullable().optional(),
    displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  })
  .refine(
    (data) => {
      if (data.expiryDate && data.expiryDate <= data.publishDate) {
        return false;
      }
      return true;
    },
    {
      message: "Expiry date must be strictly after the publish date",
      path: ["expiryDate"],
    }
  );

export type CreateNoticeInput = z.infer<typeof createNoticeSchema>;

export const updateNoticeSchema = createNoticeSchema.and(
  z.object({
    id: z.string().min(1, "Notice ID is required"),
  })
);

export type UpdateNoticeInput = z.infer<typeof updateNoticeSchema>;

export const deleteNoticeSchema = z.object({
  id: z.string().min(1, "Notice ID is required"),
});

export const toggleNoticeStatusSchema = z.object({
  id: z.string().min(1, "Notice ID is required"),
  isPublished: z.boolean(),
});
