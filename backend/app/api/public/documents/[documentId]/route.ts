import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs";
import { prisma } from "@/lib/server/prisma";
import {
  isValidAnyManagedDocumentKey,
  resolveSafePath,
  getManagedDocumentBuffer,
} from "@/lib/server/document-storage";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ documentId: string }>;
}

/**
 * Public Controlled Document Download Endpoint.
 * 
 * Invariants:
 * 1. Identifier: Uses stable public document identifier (Notice ID, Slug, Attachment ID, DownloadDocument ID, or DisclosureDocument ID).
 *    Never exposes raw storage keys, internal paths, or SHA-256 hashes.
 * 2. Strict Lifecycle Guard:
 *    Only serves documents for ACTIVE, PUBLISHED items:
 *    - Notice/Attachment: isPublished === true, publishDate <= now, expiryDate is null OR expiryDate > now
 *    - DownloadDocument: isPublished === true AND category.isPublished === true
 *    - DisclosureDocument: isPublished === true AND section.isPublished === true
 *    Returns 404 for Draft, Scheduled, or Expired items.
 * 3. Content-Disposition: Strictly 'attachment' (no inline PDF rendering).
 * 4. Cache-Control: Conservative public cache 'public, max-age=300, must-revalidate'.
 * 5. Filename Sanitization: Server-derived safe filename (${slug}_${title}.pdf).
 * 6. Restrictive Security Headers: nosniff, sandbox CSP, DENY frame options.
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  const { documentId } = await params;

  if (!documentId || typeof documentId !== "string" || documentId.trim() === "") {
    return new NextResponse("Not Found", { status: 404 });
  }

  const cleanId = documentId.trim();
  const now = new Date();

  try {
    let storageKeyToServe: string | null = null;
    let safeDownloadFilename = "document.pdf";

    // 1. First check if documentId matches an active, published NoticeAttachment
    const attachment = await prisma.noticeAttachment.findFirst({
      where: {
        id: cleanId,
        isPublished: true,
        notice: {
          isPublished: true,
          publishDate: { lte: now },
          OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
        },
      },
      select: {
        id: true,
        title: true,
        fileStorageKey: true,
        fileSizeBytes: true,
        notice: {
          select: {
            id: true,
            slug: true,
            title: true,
          },
        },
      },
    });

    if (attachment && attachment.fileStorageKey) {
      storageKeyToServe = attachment.fileStorageKey;
      const safeNoticeSlug = (attachment.notice.slug || "notice").replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeAttachmentTitle = attachment.title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
      safeDownloadFilename = `${safeNoticeSlug}_${safeAttachmentTitle}.pdf`;
    } else {
      // 2. Query Notice by ID or Slug with active published lifecycle constraints
      const notice = await prisma.notice.findFirst({
        where: {
          OR: [{ id: cleanId }, { slug: cleanId }],
          isPublished: true,
          publishDate: { lte: now },
          AND: [
            {
              OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
            },
          ],
        },
        select: {
          id: true,
          slug: true,
          title: true,
          fileStorageKey: true,
          fileSizeBytes: true,
        },
      });

      if (notice && notice.fileStorageKey) {
        storageKeyToServe = notice.fileStorageKey;
        const safeBase = (notice.slug || "notice-document").replace(/[^a-zA-Z0-9_-]/g, "_");
        safeDownloadFilename = `${safeBase}.pdf`;
      }
    }

    // 3. Query DownloadDocument if not resolved by notice attachment/notice
    if (!storageKeyToServe) {
      const downloadDoc = await prisma.downloadDocument.findFirst({
        where: {
          id: cleanId,
          isPublished: true,
          category: { isPublished: true },
        },
        select: {
          id: true,
          title: true,
          fileStorageKey: true,
          fileSizeBytes: true,
          category: {
            select: {
              slug: true,
            },
          },
        },
      });

      if (downloadDoc && downloadDoc.fileStorageKey) {
        storageKeyToServe = downloadDoc.fileStorageKey;
        const safeCatSlug = (downloadDoc.category.slug || "download").replace(/[^a-zA-Z0-9_-]/g, "_");
        const safeDocTitle = downloadDoc.title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
        safeDownloadFilename = `${safeCatSlug}_${safeDocTitle}.pdf`;
      }
    }

    // 4. Query DisclosureDocument if not resolved by notice attachment/notice/download document
    if (!storageKeyToServe) {
      const disclosureDoc = await prisma.disclosureDocument.findFirst({
        where: {
          id: cleanId,
          isPublished: true,
          section: { isPublished: true },
        },
        select: {
          id: true,
          title: true,
          fileStorageKey: true,
          fileSizeBytes: true,
          section: {
            select: {
              slug: true,
            },
          },
        },
      });

      if (disclosureDoc && disclosureDoc.fileStorageKey) {
        storageKeyToServe = disclosureDoc.fileStorageKey;
        const safeSecSlug = (disclosureDoc.section.slug || "disclosure").replace(/[^a-zA-Z0-9_-]/g, "_");
        const safeDocTitle = disclosureDoc.title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
        safeDownloadFilename = `${safeSecSlug}_${safeDocTitle}.pdf`;
      }
    }

    if (!storageKeyToServe) {
      return new NextResponse("Document not found or inaccessible.", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // 5. Validate managed storage key format and containment
    if (!isValidAnyManagedDocumentKey(storageKeyToServe)) {
      console.error(
        `[public-download] Document "${cleanId}" has invalid storage key: "${storageKeyToServe}"`
      );
      return new NextResponse("Document not found.", { status: 404 });
    }

    const filePath = resolveSafePath(storageKeyToServe, "managed");

    // 6. Verify file exists on disk and is a regular file (not symlink)
    const lstat = await fs.promises.lstat(filePath);
    if (lstat.isSymbolicLink() || !lstat.isFile()) {
      return new NextResponse("Document not found.", { status: 404 });
    }

    const fileBuffer = await getManagedDocumentBuffer(storageKeyToServe);

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeDownloadFilename}"`,
        "Cache-Control": "public, max-age=300, must-revalidate",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "X-Frame-Options": "DENY",
        "Content-Length": String(fileBuffer.length),
      },
    });
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return new NextResponse("Document file not found.", { status: 404 });
    }
    console.error("[public-download] Error serving document:", err);
    return new NextResponse("Internal server error.", { status: 500 });
  }
}

export async function POST() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET" } });
}
