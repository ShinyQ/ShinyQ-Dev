import { type NextRequest, NextResponse } from "next/server";

import { internalJson } from "@/lib/api-client";
import type { ApiErrorEnvelope } from "@/lib/types/api";

export async function GET(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const qs = request.nextUrl.searchParams.toString();
  const path = `/api/v1/items${qs ? `?${qs}` : ""}`;

  try {
    const { res, json } = await internalJson(path, { requestId });
    return NextResponse.json(json, { status: res.status });
  } catch {
    const err: ApiErrorEnvelope = {
      error: {
        code: "INTERNAL",
        message: "Backend unreachable",
        requestId,
      },
    };
    return NextResponse.json(err, { status: 502 });
  }
}
