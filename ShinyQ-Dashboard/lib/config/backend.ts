import "server-only";

import { env } from "@/lib/config/env";

/**
 * Server-side base URL for the FastAPI service (BFF proxies use this).
 * Not exposed to the browser bundle except in Route Handlers / Server Actions.
 */
export function getInternalApiBase(): string {
  return env.INTERNAL_API_URL;
}

export function internalApiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getInternalApiBase()}${p}`;
}
