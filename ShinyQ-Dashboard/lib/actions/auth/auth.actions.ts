"use server";

import { withActionResult } from "@/lib/actions/middleware.actions";

import { getCurrentUser, login, logout } from "./auth.service";
import type { AuthResult, LoginRequest, SessionUser } from "./auth.types";

export type { AuthResult, LoginRequest, SessionUser };

/**
 * Get the current session user.
 */
export async function getSessionResultAction() {
  return withActionResult(async (): Promise<SessionUser | null> => {
    return getCurrentUser();
  });
}

/**
 * Log in with email.
 */
export async function loginResultAction(request: LoginRequest) {
  return withActionResult(async (): Promise<AuthResult> => {
    return login(request);
  });
}

/**
 * Log out and clear session.
 */
export async function logoutResultAction() {
  return withActionResult(async (): Promise<AuthResult> => {
    return logout();
  });
}
