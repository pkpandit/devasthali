import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs";
import { resolveSafePath, isValidManagedKey } from "@/lib/server/storage";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ filename: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  const { filename } = await params;
  const storageKey = `toppers/${filename}`;

  if (!isValidManagedKey(storageKey)) {
    return new NextResponse("Invalid media filename", { status: 400 });
  }

  let filePath: string;
  try {
    filePath = resolveSafePath(storageKey);
  } catch {
    return new NextResponse("Path containment violation", { status: 400 });
  }

  try {
    const lstat = await fs.promises.lstat(filePath);
    if (lstat.isSymbolicLink() || !lstat.isFile()) {
      return new NextResponse("Not found", { status: 404 });
    }

    const buffer = await fs.promises.readFile(filePath);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return new NextResponse("Media not found", { status: 404 });
    }
    console.error("[media-route] Internal error streaming media:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function POST() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET" } });
}

export async function PUT() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET" } });
}

export async function DELETE() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET" } });
}

export async function PATCH() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET" } });
}
