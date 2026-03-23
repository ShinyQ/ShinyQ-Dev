import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { logServerError, logServerInfo } from "src/lib/serverLogger";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const endpointPath = "/api/v1/summary/daily";
  try {
    const { getToken } = await auth();
    const token = await getToken();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const params = date ? `?date=${date}` : "";
    const targetUrl = `${BACKEND_URL}${endpointPath}${params}`;
    logServerInfo("summary_daily_request", {
      date: date ?? "today",
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
    logServerInfo("summary_daily_response", {
      status: res.status,
      duration_ms: Date.now() - startedAt,
    });
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    logServerError("summary_daily_failed", error, {
      duration_ms: Date.now() - startedAt,
      backend_url: BACKEND_URL,
      endpoint_path: endpointPath,
      backend_url_source: process.env.BACKEND_URL ? "env" : "default",
      hint: "Check BACKEND_URL, backend container status, and network reachability from Next server runtime.",
    });
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
