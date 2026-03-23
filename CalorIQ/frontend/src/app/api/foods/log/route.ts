import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { logServerError, logServerInfo } from "src/lib/serverLogger";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const { getToken } = await auth();
    const token = await getToken();
    const body = await request.json();
    logServerInfo("foods_log_request", {
      has_description: Boolean(body?.description),
      has_image: Boolean(body?.image_base64),
    });

    const res = await fetch(`${BACKEND_URL}/api/v1/foods/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res
      .json()
      .catch(() => ({ error: "service_error", detail: "Request failed" }));
    const response = NextResponse.json(data, { status: res.status });

    const aiRemaining = res.headers.get("x-ai-remaining");
    const retryAfter = res.headers.get("retry-after");
    if (aiRemaining) response.headers.set("X-AI-Remaining", aiRemaining);
    if (retryAfter) response.headers.set("Retry-After", retryAfter);
    logServerInfo("foods_log_response", {
      status: res.status,
      duration_ms: Date.now() - startedAt,
    });

    return response;
  } catch (error) {
    logServerError("foods_log_failed", error, {
      duration_ms: Date.now() - startedAt,
    });
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
