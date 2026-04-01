import "server-only";

import { internalApiUrl } from "@/lib/config/backend";

export type InternalFetchInit = RequestInit & {
  /** Propagated as `X-Request-Id` to FastAPI (baseline §8). */
  requestId?: string;
};

/**
 * Server-only fetch to the internal FastAPI host. Never import from client components.
 */
export async function internalFetch(
  path: string,
  init: InternalFetchInit = {},
): Promise<Response> {
  const { requestId: incomingId, ...rest } = init;
  const requestId = incomingId ?? crypto.randomUUID();
  const headers = new Headers(rest.headers);
  headers.set("X-Request-Id", requestId);
  const url = path.startsWith("http") ? path : internalApiUrl(path);
  return fetch(url, {
    ...rest,
    headers,
    cache: "no-store",
  });
}

export async function internalJson<T>(
  path: string,
  init: InternalFetchInit = {},
): Promise<{ res: Response; json: T; requestId: string }> {
  const requestId = init.requestId ?? crypto.randomUUID();
  const res = await internalFetch(path, { ...init, requestId });
  const json = (await res.json()) as T;
  return { res, json, requestId };
}
