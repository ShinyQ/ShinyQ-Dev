import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { logServerError, logServerInfo } from "src/lib/serverLogger";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const endpointPath = "/api/v1/foods/recent";
  try {
    const { getToken } = await auth();
    const token = await getToken();

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "20";
    const targetUrl = `${BACKEND_URL}${endpointPath}?limit=${limit}`;
    logServerInfo("foods_recent_request", {
      limit,
      target_url: targetUrl,
      token_present: Boolean(token),
      backend_url_source: process.env.BACKEND_URL ? "env" : "default",
    });

    const res = await fetch(targetUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    logServerInfo("foods_recent_response", {
      status: res.status,
      duration_ms: Date.now() - startedAt,
    });
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    logServerError("foods_recent_failed", error, {
      duration_ms: Date.now() - startedAt,
      backend_url: BACKEND_URL,
      endpoint_path: endpointPath,
      backend_url_source: process.env.BACKEND_URL ? "env" : "default",
      hint: "Check BACKEND_URL, backend container status, and network reachability from Next server runtime.",
    });
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
