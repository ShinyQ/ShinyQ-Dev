import { NextResponse } from "next/server";

import { findJob } from "@/lib/actions/jobs/jobs.service";
import { getRequestId } from "@/lib/api-client/request-id";
import type { ApiDataEnvelope, ApiErrorEnvelope } from "@/lib/types/api";

export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const requestId = getRequestId(request);
  const { id } = await ctx.params;
  const job = findJob(id);
  if (!job) {
    const err: ApiErrorEnvelope = {
      error: {
        code: "NOT_FOUND",
        message: "Job not found",
        requestId,
      },
    };
    return NextResponse.json(err, { status: 404 });
  }

  const body: ApiDataEnvelope<typeof job> = {
    data: job,
    meta: { requestId },
  };
  return NextResponse.json(body);
}
