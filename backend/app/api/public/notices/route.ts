import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { NoticeCategory } from "@prisma/client";
import { getPublicMediaOrigin } from "@/lib/server/storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CATEGORY_LABEL_MAP: Record<NoticeCategory, string> = {
  CIRCULAR: "Circular",
  EXAMINATION: "Examination",
  ADMISSION: "Admission",
  EVENT: "Event",
};

export interface PublicNoticeAttachmentDto {
  id: string;
  title: string;
  fileUrl: string | null;
  fileSize: string | null;
  fileType: string;
  displayOrder: number;
}

export interface PublicNoticeDto {
  id: string;
  slug: string;
  title: string;
  category: NoticeCategory;
  categoryLabel: string;
  summary: string | null;
  content: string | null;
  isUrgent: boolean;
  fileUrl: string | null;
  fileSize: string | null;
  attachments: PublicNoticeAttachmentDto[];
  publishDate: string;
  publishedAt: string | null;
  expiryDate: string | null;
  isNew: boolean;
}

export interface PublicNoticesResponse {
  data: PublicNoticeDto[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

function formatByteSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Public Notices & Circulars Feed Endpoint.
 *
 * Implements:
 * 1. Filtering: category, urgentOnly
 * 2. Pagination: page, limit (max 50)
 * 3. Scope: Strictly active published notices (publishDate <= now, expiryDate null or > now)
 * 4. Whitelist projection: Omits internal identifiers (authorId, fileStorageKey, fileSha256)
 * 5. Document resolution: Managed attachments route via controlled public document endpoint
 * 6. Attachment ordering: Orders attachments by displayOrder ascending
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. Pagination parameters
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = parseInt(searchParams.get("limit") || "10", 10);

    const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit =
      Number.isInteger(limitParam) && limitParam > 0
        ? Math.min(limitParam, 50)
        : 10;
    const skip = (page - 1) * limit;

    // 2. Filter parameters
    const categoryParam = searchParams.get("category")?.toUpperCase();
    const urgentParam = searchParams.get("urgentOnly");
    const urgentOnly = urgentParam === "true" || urgentParam === "1";

    // 3. Build Prisma where clause (Active Published Notices only)
    const now = new Date();
    const where: Record<string, unknown> = {
      isPublished: true,
      publishDate: { lte: now },
      OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
    };

    if (
      categoryParam &&
      Object.values(NoticeCategory).includes(categoryParam as NoticeCategory)
    ) {
      where.category = categoryParam as NoticeCategory;
    }

    if (urgentOnly) {
      where.isUrgent = true;
    }

    // 4. Fetch records and total count concurrently
    const [totalItems, notices] = await Promise.all([
      prisma.notice.count({ where }),
      prisma.notice.findMany({
        where,
        select: {
          id: true,
          slug: true,
          title: true,
          category: true,
          summary: true,
          content: true,
          isUrgent: true,
          fileUrl: true,
          fileSize: true,
          fileStorageKey: true,
          fileSizeBytes: true,
          publishDate: true,
          publishedAt: true,
          expiryDate: true,
          attachments: {
            where: { isPublished: true },
            orderBy: { displayOrder: "asc" },
            select: {
              id: true,
              title: true,
              fileUrl: true,
              fileStorageKey: true,
              fileSizeBytes: true,
              fileSize: true,
              fileType: true,
              displayOrder: true,
            },
          },
        },
        orderBy: [
          { isUrgent: "desc" },
          { displayOrder: "asc" },
          { publishDate: "desc" },
          { id: "asc" },
        ],
        skip,
        take: limit,
      }),
    ]);

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const mediaOrigin = getPublicMediaOrigin();

    // 5. Strict DTO Whitelist Projection
    // Never expose raw storage keys, SHA-256 hashes, original filenames, or author IDs
    const data: PublicNoticeDto[] = notices.map((n) => {
      const resolvedFileUrl = n.fileStorageKey
        ? `${mediaOrigin}/api/public/documents/${n.slug}`
        : n.fileUrl;

      const resolvedFileSize = n.fileSize
        ? n.fileSize
        : n.fileSizeBytes
        ? formatByteSize(n.fileSizeBytes)
        : null;

      const mappedAttachments: PublicNoticeAttachmentDto[] = n.attachments.map((att) => {
        const attUrl = att.fileStorageKey
          ? `${mediaOrigin}/api/public/documents/${att.id}`
          : att.fileUrl;
        const attSize = att.fileSize
          ? att.fileSize
          : att.fileSizeBytes
          ? formatByteSize(att.fileSizeBytes)
          : null;
        return {
          id: att.id,
          title: att.title,
          fileUrl: attUrl,
          fileSize: attSize,
          fileType: att.fileType,
          displayOrder: att.displayOrder,
        };
      });

      // Maintain backward compatibility: if attachments list has elements, use it;
      // if empty but notice has legacy root doc, synthesize 1 attachment entry.
      const finalAttachments = mappedAttachments.length > 0
        ? mappedAttachments
        : (resolvedFileUrl ? [{
            id: `att_${n.id}`,
            title: n.title,
            fileUrl: resolvedFileUrl,
            fileSize: resolvedFileSize,
            fileType: "application/pdf",
            displayOrder: 0,
          }] : []);

      const finalRootFileUrl = resolvedFileUrl || (finalAttachments[0]?.fileUrl ?? null);
      const finalRootFileSize = resolvedFileSize || (finalAttachments[0]?.fileSize ?? null);

      return {
        id: n.id,
        slug: n.slug,
        title: n.title,
        category: n.category,
        categoryLabel: CATEGORY_LABEL_MAP[n.category] || n.category,
        summary: n.summary,
        content: n.content,
        isUrgent: n.isUrgent,
        fileUrl: finalRootFileUrl,
        fileSize: finalRootFileSize,
        attachments: finalAttachments,
        publishDate: n.publishDate.toISOString(),
        publishedAt: n.publishedAt ? n.publishedAt.toISOString() : null,
        expiryDate: n.expiryDate ? n.expiryDate.toISOString() : null,
        isNew: n.isUrgent || n.publishDate >= sevenDaysAgo,
      };
    });

    const totalPages = Math.ceil(totalItems / limit) || 1;

    const responsePayload: PublicNoticesResponse = {
      data,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("[public-notices-api] Error fetching notices:", err);
    return NextResponse.json(
      { error: "Internal server error fetching notices." },
      { status: 500 }
    );
  }
}
