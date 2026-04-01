import { type NextRequest, NextResponse } from "next/server";

import { getPresignedDownloadUrl } from "@/lib/storage/r2";

/**
 * GET /api/v1/storage/image?key=blog/my-image-123.png
 *
 * Secure proxy route that fetches a private R2 object server-side and streams
 * the bytes back to the browser. This keeps image responses on the same origin
 * so the strict `img-src 'self'` CSP is satisfied, and the signed R2 URL is
 * never exposed to the client.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get("key");

    if (!key) {
      return new NextResponse("Missing key parameter", { status: 400 });
    }

    if (key.startsWith("http://") || key.startsWith("https://")) {
      return NextResponse.redirect(key);
    }

    // You could also apply additional session authentication checks here
    // to secure sensitive assets if auth logic is hooked up.

    const downloadUrl = await getPresignedDownloadUrl(key);

    // Fetch the object from R2 server-side and stream bytes back.
    // A 302 redirect would send the browser to *.r2.cloudflarestorage.com,
    // which is blocked by the `img-src 'self'` CSP. Proxying keeps the
    // response on the same origin and avoids exposing the bucket URL.
    const r2Response = await fetch(downloadUrl);

    if (!r2Response.ok) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const contentType =
      r2Response.headers.get("content-type") ?? "application/octet-stream";

    return new NextResponse(r2Response.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600, immutable",
      },
    });
  } catch (error) {
    console.error("[Storage Proxy Error]", error);
    return new NextResponse("Failed to load image", { status: 500 });
  }
}
