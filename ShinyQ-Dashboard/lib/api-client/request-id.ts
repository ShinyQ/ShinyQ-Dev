/**
 * Extract the request ID from incoming headers, or generate a new one.
 * Use this in BFF route handlers to propagate the tracing ID set by middleware.
 */
export function getRequestId(request: Request): string {
  return request.headers.get("x-request-id") ?? crypto.randomUUID();
}
