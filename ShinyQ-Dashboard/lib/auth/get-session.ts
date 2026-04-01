import "server-only";

import { getCurrentUser } from "@/lib/actions/auth/auth.service";
import type { SessionUser } from "@/types/session";

/**
 * Server-only session read — used by RSC layouts and server components.
 * Delegates to the auth vertical slice for the actual implementation.
 */
export async function getSession(): Promise<SessionUser | null> {
  return getCurrentUser();
}
