import type {
  AnalyticsOverview,
  ModelUsage,
  TimeRange,
} from "./analytics.types";

/**
 * Analytics service — wire to your metrics backend (e.g., ClickHouse, BigQuery).
 *
 * Currently returns mock data. Replace each method with real API calls
 * via internalJson() from @/lib/api-client.
 */

export async function getOverview(
  _range: TimeRange,
): Promise<AnalyticsOverview> {
  // TODO: replace with internalJson("/api/v1/analytics/overview", ...)
  return {
    totalCalls: 284930,
    avgLatency: 245,
    errorRate: 0.23,
    totalCost: 1247.5,
  };
}

export async function getModelUsage(_range: TimeRange): Promise<ModelUsage[]> {
  // TODO: replace with internalJson("/api/v1/analytics/models", ...)
  return [
    {
      model: "claude-sonnet-4-20250514",
      calls: 45200,
      tokens: 12500000,
      cost: 487.5,
    },
    { model: "gpt-4o", calls: 38100, tokens: 9800000, cost: 392.0 },
  ];
}
