import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { logServerError, logServerInfo } from "src/lib/serverLogger";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  const startedAt = Date.now();
  try {
    const { getToken } = await auth();
    const token = await getToken();
    const { entryId } = await params;
    logServerInfo("foods_entry_delete_request", { entry_id: entryId });

    const res = await fetch(
      `${BACKEND_URL}/api/v1/foods/entry/${entryId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    logServerInfo("foods_entry_delete_response", {
      entry_id: entryId,
      status: res.status,
      duration_ms: Date.now() - startedAt,
    });
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    logServerError("foods_entry_delete_failed", error, {
      duration_ms: Date.now() - startedAt,
    });
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
