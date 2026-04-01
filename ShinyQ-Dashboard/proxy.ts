import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "template_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  // Generate or propagate request ID for tracing
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();

  // Unauthenticated users hitting protected API routes get 401
  if (
    !hasSession &&
    pathname.startsWith("/api/v1") &&
    !pathname.startsWith("/api/v1/auth")
  ) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Authentication required" } },
      { status: 401, headers: { "x-request-id": requestId } },
    );
  }

  // Unauthenticated users hitting protected pages get redirected
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.headers.set("x-request-id", requestId);
    return response;
  }

  // Authenticated — pass through with request ID
  const response = NextResponse.next({
    request: { headers: new Headers(request.headers) },
  });
  response.headers.set("x-request-id", requestId);
  request.headers.set("x-request-id", requestId);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next (static files, HMR)
     * - favicon.ico, images, static assets
     * - /login (public)
     * - /api/v1/auth/* (auth endpoints must be accessible without session)
     */
    "/((?!_next|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)|login|api/v1/auth).*)",
  ],
};
