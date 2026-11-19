import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getPublicMediaOrigin } from "@/lib/server/storage";

export const dynamic = "force-dynamic";

export interface PublicDownloadDocumentDto {
  id: string;
  title: string;
  description: string | null;
  file: string;
  size: string;
  fileType: string;
  displayOrder: number;
}

export interface PublicDownloadCategoryDto {
  id: string;
  slug: string;
  category: string;
  description: string | null;
  displayOrder: number;
  docs: PublicDownloadDocumentDto[];
}

export interface PublicDownloadsResponse {
  success: boolean;
  categories: PublicDownloadCategoryDto[];
}

function formatByteSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Public Downloads & Documents Endpoint.
 *
 * Requirements:
 * 1. Scope: Only active published categories and published documents.
 * 2. Categories with 0 published documents are excluded.
 * 3. Sorting: Categories by displayOrder asc, then createdAt asc.
 *    Documents by displayOrder asc, then createdAt asc.
 * 4. Whitelist projection: Omits internal storage keys and hashes.
 * 5. Resolution: Managed keys route via /api/public/documents/${doc.id}.
 *    Legacy/static root-relative paths (/documents/original/...) are preserved.
 * 6. Cache Policy:
 *    - Development: no-store
 *    - Production: s-maxage=60, stale-while-revalidate=300
 */
export async function GET() {
  try {
    const publicOrigin = getPublicMediaOrigin();

    const categories = await prisma.downloadCategory.findMany({
      where: {
        isPublished: true,
        documents: {
          some: {
            isPublished: true,
          },
        },
      },
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "asc" },
      ],
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        displayOrder: true,
        documents: {
          where: {
            isPublished: true,
          },
          orderBy: [
            { displayOrder: "asc" },
            { createdAt: "asc" },
          ],
          select: {
            id: true,
            title: true,
            description: true,
            fileUrl: true,
            fileStorageKey: true,
            fileSize: true,
            fileSizeBytes: true,
            fileType: true,
            displayOrder: true,
          },
        },
      },
    });

    const data: PublicDownloadCategoryDto[] = categories.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      category: cat.title,
      description: cat.description,
      displayOrder: cat.displayOrder,
      docs: cat.documents.map((doc) => {
        let file = doc.fileUrl || "";
        if (doc.fileStorageKey) {
          file = `${publicOrigin}/api/public/documents/${doc.id}`;
        }

        let size = doc.fileSize;
        if (!size && doc.fileSizeBytes) {
          size = formatByteSize(doc.fileSizeBytes);
        }
        if (!size) {
          size = "PDF Document";
        }

        return {
          id: doc.id,
          title: doc.title,
          description: doc.description,
          file,
          size,
          fileType: doc.fileType || "application/pdf",
          displayOrder: doc.displayOrder,
        };
      }),
    }));

    const isDev = process.env.NODE_ENV !== "production";
    const cacheControl = isDev
      ? "no-store, no-cache, must-revalidate"
      : "public, s-maxage=60, stale-while-revalidate=300";

    return NextResponse.json(
      {
        success: true,
        categories: data,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": cacheControl,
        },
      }
    );
  } catch (err) {
    console.error("[public-downloads] Failed to fetch downloads:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load downloads.",
        categories: [],
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET" } });
}
