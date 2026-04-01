import {
  type ActionResult,
  createErrorResult,
  createSuccessResult,
  toActionErrorPayload,
} from "@/lib/actions/action-result";
import type { SessionUser } from "@/types/session";

/**
 * Wrap an async handler and always return ActionResult (no throw to client).
 */
export async function withActionResult<T>(
  fn: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return createSuccessResult(data);
  } catch (error) {
    return { ok: false, error: toActionErrorPayload(error) };
  }
}

/** Optional RBAC wrapper — `requiredAccess` aligns with `SessionUser.scopes` (baseline §6.4). */
export async function withRequiredScopes<T>(
  user: SessionUser | null,
  scopes: string[],
  fn: () => Promise<T>,
): Promise<ActionResult<T>> {
  if (!user) {
    return createErrorResult({
      message: "Sign in required",
      code: "FORBIDDEN",
    });
  }
  const granted = user.scopes ?? [];
  const allowed =
    scopes.length === 0 || scopes.every((s) => granted.includes(s));
  if (!allowed) {
    return createErrorResult({
      message: "Insufficient permissions",
      code: "FORBIDDEN",
    });
  }
  return withActionResult(fn);
}
