"use server";

import { withActionResult } from "@/lib/actions/middleware.actions";

import { getWelcomeMessage } from "./example.service";

export type { WelcomePayload } from "./example.types";

/**
 * Public server action — fetch a welcome message.
 *
 * Actions are the public API of a vertical slice. They handle:
 *   1. Permission checks (RBAC via withRequiredScopes)
 *   2. Input validation
 *   3. Delegation to the service layer
 *   4. Wrapping results in ActionResult<T>
 */
export async function getWelcomeMessageResultAction() {
  return withActionResult(() => getWelcomeMessage());
}
