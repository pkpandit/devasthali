import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { NoticeCategory } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CATEGORY_LABEL_MAP: Record<NoticeCategory, string> = {
  CIRCULAR: "Circular",
  EXAMINATION: "Examination",
  ADMISSION: "Admission",
  EVENT: "Event",
};

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. Pagination parameters
    const rawPage = parseInt(searchParams.get("page") || "1", 10);
    const rawLimit = parseInt(searchParams.get("limit") || "10", 10);
    const page = Math.max(1, isNaN(rawPage) ? 1 : rawPage);
    const limit = Math.min(50, Math.max(1, isNaN(rawLimit) ? 10 : rawLimit));
    const skip = (page - 1) * limit;

    // 2. Filter parameters
    const categoryParam = searchParams.get("category")?.toUpperCase();
    const urgentParam = searchParams.get("urgentOnly");
    const urgentOnly = urgentParam === "true" || urgentParam === "1";

    // 3. Build Prisma where clause
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
          publishDate: true,
          publishedAt: true,
          expiryDate: true,
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

    const data: PublicNoticeDto[] = notices.map((n) => ({
      id: n.id,
      slug: n.slug,
      title: n.title,
      category: n.category,
      categoryLabel: CATEGORY_LABEL_MAP[n.category] || n.category,
      summary: n.summary,
      content: n.content,
      isUrgent: n.isUrgent,
      fileUrl: n.fileUrl,
      fileSize: n.fileSize,
      publishDate: n.publishDate.toISOString(),
      publishedAt: n.publishedAt ? n.publishedAt.toISOString() : null,
      expiryDate: n.expiryDate ? n.expiryDate.toISOString() : null,
      isNew: n.isUrgent || n.publishDate >= sevenDaysAgo,
    }));

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
