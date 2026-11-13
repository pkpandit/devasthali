import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs";
import { prisma } from "@/lib/server/prisma";
import {
  isValidManagedDocumentKey,
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
 * 1. Identifier: Uses stable public document identifier (Notice ID or Slug).
 *    Never exposes raw storage keys, internal paths, or SHA-256 hashes.
 * 2. Strict Lifecycle Guard:
 *    Only serves documents for ACTIVE, PUBLISHED notices:
 *    - isPublished === true
 *    - publishDate <= now
 *    - expiryDate is null OR expiryDate > now
 *    Returns 404 for Draft, Scheduled, or Expired notices.
 * 3. Content-Disposition: Strictly 'attachment' (no inline PDF rendering).
 * 4. Cache-Control: Conservative public cache 'public, max-age=300, must-revalidate'.
 * 5. Filename Sanitization: Server-derived safe filename (${notice.slug}.pdf).
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
    // 1. Query Notice by ID or Slug with active published lifecycle constraints
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

    if (!notice || !notice.fileStorageKey) {
      return new NextResponse("Document not found or inaccessible.", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // 2. Validate managed storage key format and containment
    if (!isValidManagedDocumentKey(notice.fileStorageKey)) {
      console.error(
        `[public-download] Notice "${notice.id}" has invalid storage key: "${notice.fileStorageKey}"`
      );
      return new NextResponse("Document not found.", { status: 404 });
    }

    const filePath = resolveSafePath(notice.fileStorageKey, "managed");

    // 3. Verify file exists on disk and is a regular file (not symlink)
    const lstat = await fs.promises.lstat(filePath);
    if (lstat.isSymbolicLink() || !lstat.isFile()) {
      return new NextResponse("Document not found.", { status: 404 });
    }

    const fileBuffer = await getManagedDocumentBuffer(notice.fileStorageKey);

    // 4. Generate safe download filename from server-side slug
    const safeBase = (notice.slug || "notice-document").replace(/[^a-zA-Z0-9_-]/g, "_");
    const downloadFilename = `${safeBase}.pdf`;

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${downloadFilename}"`,
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
