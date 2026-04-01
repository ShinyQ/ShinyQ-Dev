import { NextResponse } from "next/server";

import { createJob } from "@/lib/actions/jobs/jobs.service";
import { getRequestId } from "@/lib/api-client/request-id";
import type { ApiDataEnvelope } from "@/lib/types/api";

export async function POST(request: Request) {
  const id = crypto.randomUUID();
  createJob(id);

  const body: ApiDataEnvelope<{ id: string }> = {
    data: { id },
    meta: { requestId: getRequestId(request) },
  };
  return NextResponse.json(body);
}
