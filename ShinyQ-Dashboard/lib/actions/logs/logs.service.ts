import type { ConversationLog, LogsFilter } from "./logs.types";

/**
 * Logs service — wire to your logging backend (e.g., Elasticsearch, Loki).
 *
 * Currently returns mock data. Replace with real API calls
 * via internalJson() from @/lib/api-client.
 */

export async function searchLogs(
  _filter: LogsFilter,
): Promise<{ logs: ConversationLog[]; total: number }> {
  // TODO: replace with internalJson("/api/v1/logs", ...)
  return { logs: [], total: 0 };
}
