import { NextResponse } from "next/server";

import { login } from "@/lib/actions/auth/auth.service";

export async function POST(request: Request) {
  let email = "";
  try {
    const body = (await request.json()) as { email?: string };
    email = body.email?.trim() ?? "";
  } catch {
    /* allow empty body */
  }

  await login({ email });
  return NextResponse.json({ ok: true });
}
