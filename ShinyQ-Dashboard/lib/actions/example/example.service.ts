import type { WelcomePayload } from "./example.types";

/**
 * Example service — business logic for the demo domain.
 *
 * In a real slice, this would orchestrate calls to the repository,
 * apply business rules, and return typed results.
 */
export async function getWelcomeMessage(): Promise<WelcomePayload> {
  return {
    message: "Server action is wired. Replace with your domain logic.",
    at: new Date().toISOString(),
  };
}
