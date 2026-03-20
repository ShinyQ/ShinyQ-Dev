import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const { getToken } = await auth();
    const token = await getToken();

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "20";

    const res = await fetch(
      `${BACKEND_URL}/api/v1/foods/recent?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
