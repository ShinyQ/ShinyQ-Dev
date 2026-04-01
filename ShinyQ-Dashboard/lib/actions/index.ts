/**
 * Shared action infrastructure — re-exported for convenience.
 *
 * Domain-specific actions live in their own vertical slices:
 *   lib/actions/{domain}/{domain}.actions.ts   — Server Actions (public API)
 *   lib/actions/{domain}/{domain}.service.ts   — Business logic
 *   lib/actions/{domain}/{domain}.repository.ts — Data access
 *   lib/actions/{domain}/{domain}.types.ts     — Domain-specific types
 *   lib/actions/{domain}/{domain}.helpers.ts   — Pure utilities
 */
export {
  type ActionErrorCode,
  type ActionErrorPayload,
  type ActionResult,
  ActionError,
  createErrorResult,
  createSuccessResult,
  getUserFacingErrorMessage,
  isActionError,
  toActionErrorPayload,
  unwrapActionResult,
} from "./action-result";

export { withActionResult, withRequiredScopes } from "./middleware.actions";
