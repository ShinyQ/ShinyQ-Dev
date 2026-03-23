import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { logServerError, logServerInfo } from "src/lib/serverLogger";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const { getToken } = await auth();
    const token = await getToken();
    const body = await request.json();
    logServerInfo("users_profile_request", {
      fields: Object.keys(body || {}),
    });

    const res = await fetch(`${BACKEND_URL}/api/v1/users/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    logServerInfo("users_profile_response", {
      status: res.status,
      duration_ms: Date.now() - startedAt,
    });
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    logServerError("users_profile_failed", error, {
      duration_ms: Date.now() - startedAt,
    });
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
