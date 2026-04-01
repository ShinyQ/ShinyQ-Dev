import { cookies } from "next/headers";

import "server-only";

import type { SessionUser } from "./auth.types";

export const SESSION_COOKIE = "template_session";

/**
 * Read the session from the cookie store.
 *
 * Replace the hardcoded user below with your auth provider's JWT decode,
 * NextAuth session read, or database lookup.
 */
export async function readSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  // Demo implementation — replace with real auth provider lookup
  return {
    id: "user-1",
    email: "you@company.com",
    name: "Template User",
    roles: [{ groupId: "default", role: "user" }],
  };
}

/**
 * Write a session cookie.
 */
export async function writeSession(value: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
}

/**
 * Clear the session cookie.
 */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
