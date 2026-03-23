import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { logServerError, logServerInfo } from "src/lib/serverLogger";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const { getToken } = await auth();
    const token = await getToken();

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      logServerInfo("summary_range_bad_request", { start, end });
      return NextResponse.json(
        { error: "start and end query params required" },
        { status: 400 }
      );
    }
    logServerInfo("summary_range_request", { start, end });

    const res = await fetch(
      `${BACKEND_URL}/api/v1/summary/range?start=${start}&end=${end}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    logServerInfo("summary_range_response", {
      status: res.status,
      duration_ms: Date.now() - startedAt,
    });
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    logServerError("summary_range_failed", error, {
      duration_ms: Date.now() - startedAt,
    });
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
