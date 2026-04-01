/**
 * Re-export the session type from the shared types directory.
 * Domain-specific auth types (login request, token payload, etc.) go here.
 */
export type { SessionUser } from "@/types/session";

export type LoginRequest = {
  email?: string;
};

export type AuthResult = {
  ok: boolean;
};
