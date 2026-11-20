import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getPublicMediaOrigin } from "@/lib/server/storage";

export const dynamic = "force-dynamic";

export interface PublicDisclosureDocumentDto {
  id: string;
  title: string;
  description: string | null;
  file: string;
  size: string | null;
  fileType: string;
  linkLabel: string;
  displayOrder: number;
}

export interface PublicDisclosureSectionDto {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  displayOrder: number;
  documents: PublicDisclosureDocumentDto[];
}

export interface PublicDisclosureResponse {
  success: boolean;
  sections: PublicDisclosureSectionDto[];
}

function formatByteSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Public Mandatory Public Disclosure Endpoint.
 *
 * Requirements:
 * 1. Scope: Only published sections and published documents.
 * 2. Exclude sections with zero published documents.
 * 3. Sorting: Sections by displayOrder asc, then createdAt asc.
 *    Documents by displayOrder asc, then createdAt asc.
 * 4. Whitelist projection: Omits internal storage keys and metadata.
 * 5. Resolution: Managed keys route via /api/public/documents/${doc.id}.
 *    Legacy/static root-relative paths (/documents/original/...) are preserved.
 * 6. Never store or return localhost/127.0.0.1 URLs.
 * 7. Cache Policy:
 *    - Development: no-store
 *    - Production: s-maxage=60, stale-while-revalidate=300
 */
export async function GET() {
  try {
    const rawOrigin = getPublicMediaOrigin();
    const isLocalhost =
      rawOrigin.includes("localhost") || rawOrigin.includes("127.0.0.1") || rawOrigin.includes("::1");
    const mediaOrigin = isLocalhost ? "" : rawOrigin;

    const sections = await prisma.disclosureSection.findMany({
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
            linkLabel: true,
            displayOrder: true,
          },
        },
      },
    });

    const data: PublicDisclosureSectionDto[] = sections.map((sec) => ({
      id: sec.id,
      slug: sec.slug,
      title: sec.title,
      description: sec.description,
      displayOrder: sec.displayOrder,
      documents: sec.documents.map((doc) => {
        let file = doc.fileUrl || "";
        if (doc.fileStorageKey) {
          file = mediaOrigin
            ? `${mediaOrigin}/api/public/documents/${doc.id}`
            : `/api/public/documents/${doc.id}`;
        }

        let size = doc.fileSize;
        if (!size && doc.fileSizeBytes) {
          size = formatByteSize(doc.fileSizeBytes);
        }

        return {
          id: doc.id,
          title: doc.title,
          description: doc.description,
          file,
          size,
          fileType: doc.fileType || "application/pdf",
          linkLabel: doc.linkLabel || "VIEW/DOWNLOAD",
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
        sections: data,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": cacheControl,
        },
      }
    );
  } catch (err) {
    console.error("[public-mandatory-disclosure] Failed to fetch disclosures:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load mandatory public disclosure records.",
        sections: [],
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET" } });
}
