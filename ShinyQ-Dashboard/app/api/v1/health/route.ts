import { NextResponse } from "next/server";

import { internalFetch } from "@/lib/api-client";
import { getRequestId } from "@/lib/api-client/request-id";
import type { ApiDataEnvelope } from "@/lib/types/api";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  let backend: { ok: boolean; detail?: string } = { ok: false };

  try {
    const res = await internalFetch("/health", {
      requestId,
      signal: AbortSignal.timeout(3000),
    });
    backend = { ok: res.ok };
  } catch {
    backend = { ok: false, detail: "unreachable" };
  }

  const body: ApiDataEnvelope<{
    app: string;
    backendReachable: boolean;
    backendDetail?: string;
  }> = {
    data: {
      app: "next",
      backendReachable: backend.ok,
      ...(backend.detail ? { backendDetail: backend.detail } : {}),
    },
    meta: { requestId },
  };
  return NextResponse.json(body);
}
