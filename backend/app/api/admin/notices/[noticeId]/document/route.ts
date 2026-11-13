import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs";
import { prisma } from "@/lib/server/prisma";
import { requireRole, AuthorizationError } from "@/lib/server/auth";
import {
  isValidManagedDocumentKey,
  resolveSafePath,
  getManagedDocumentBuffer,
} from "@/lib/server/document-storage";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ noticeId: string }>;
}

/**
 * Admin Controlled Document Preview / Download Endpoint.
 * 
 * Invariants:
 * 1. Authorization: Restricted strictly to SUPER_ADMIN role.
 * 2. Scope: Supports Draft, Scheduled, Published, and Expired notices.
 * 3. Content-Disposition: Strictly 'attachment' (no inline PDF rendering).
 * 4. Cache-Control: Strictly private and uncacheable ('private, no-cache, no-store, must-revalidate').
 * 5. Filename Sanitization: Server-derived safe filename (${notice.slug}.pdf).
 * 6. Restrictive Security Headers: nosniff, sandbox CSP, DENY frame options.
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  // 1. Authorization check
  try {
    await requireRole(["SUPER_ADMIN"]);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { noticeId } = await params;

  if (!noticeId || typeof noticeId !== "string" || noticeId.trim() === "") {
    return new NextResponse("Not Found", { status: 404 });
  }

  const cleanNoticeId = noticeId.trim();

  try {
    // 2. Query Notice by ID (supports drafts and scheduled notices)
    const notice = await prisma.notice.findUnique({
      where: { id: cleanNoticeId },
      select: {
        id: true,
        slug: true,
        title: true,
        fileStorageKey: true,
        fileSizeBytes: true,
        isPublished: true,
      },
    });

    if (!notice || !notice.fileStorageKey) {
      return new NextResponse("Notice document attachment not found.", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // 3. Validate managed storage key format and containment
    if (!isValidManagedDocumentKey(notice.fileStorageKey)) {
      console.error(
        `[admin-preview] Notice "${notice.id}" has invalid storage key: "${notice.fileStorageKey}"`
      );
      return new NextResponse("Document attachment not found.", { status: 404 });
    }

    const filePath = resolveSafePath(notice.fileStorageKey, "managed");

    // 4. Verify file exists on disk and is a regular file (not symlink)
    const lstat = await fs.promises.lstat(filePath);
    if (lstat.isSymbolicLink() || !lstat.isFile()) {
      return new NextResponse("Document attachment not found on disk.", { status: 404 });
    }

    const fileBuffer = await getManagedDocumentBuffer(notice.fileStorageKey);

    // 5. Generate safe download filename from server-side slug
    const safeBase = (notice.slug || "notice-document").replace(/[^a-zA-Z0-9_-]/g, "_");
    const downloadFilename = `${safeBase}.pdf`;

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${downloadFilename}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "X-Frame-Options": "DENY",
        "Content-Length": String(fileBuffer.length),
      },
    });
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return new NextResponse("Document attachment file not found.", { status: 404 });
    }
    console.error("[admin-preview] Error serving document:", err);
    return new NextResponse("Internal server error.", { status: 500 });
  }
}

export async function POST() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET" } });
}
