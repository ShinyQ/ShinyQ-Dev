import { NextResponse } from "next/server";

import { internalJson } from "@/lib/api-client";
import type { ApiDataEnvelope, ApiErrorEnvelope } from "@/lib/types/api";

type HelloData = { message: string };

export async function GET(request: Request) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();

  try {
    const { res, json } = await internalJson<
      ApiDataEnvelope<HelloData> | ApiErrorEnvelope
    >("/api/v1/hello", { requestId });

    if (!res.ok && "error" in json) {
      return NextResponse.json(json, { status: res.status });
    }

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
