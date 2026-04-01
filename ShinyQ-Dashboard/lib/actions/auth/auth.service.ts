import "server-only";

import { clearSession, readSession, writeSession } from "./auth.repository";
import type { AuthResult, LoginRequest, SessionUser } from "./auth.types";

/**
 * Get the current authenticated user, or null.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  return readSession();
}

/**
 * Log in — writes a session cookie.
 * Replace with real auth provider integration.
 */
export async function login(request: LoginRequest): Promise<AuthResult> {
  await writeSession(request.email?.trim() || "demo");
  return { ok: true };
}

/**
 * Log out — clears the session cookie.
 */
export async function logout(): Promise<AuthResult> {
  await clearSession();
  return { ok: true };
}
