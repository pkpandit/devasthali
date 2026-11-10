import { NextResponse, type NextRequest } from "next/server";

/**
 * Lightweight Next.js 16 proxy strictly for request header enrichment.
 * Attaches the incoming pathname to request headers so Server Component layouts
 * can preserve the exact deep-link workspace target during unauthenticated redirects.
 *
 * NOTE: Session validation is NOT performed here to prevent edge-runtime DB incompatibilities.
 * All authentication and authorization boundaries remain strictly server-side in Server Components.
 */
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
