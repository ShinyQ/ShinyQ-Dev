export type TimeRange = "7d" | "30d" | "90d";

export type AnalyticsOverview = {
  totalCalls: number;
  avgLatency: number;
  errorRate: number;
  totalCost: number;
};

export type ModelUsage = {
  model: string;
  calls: number;
  tokens: number;
  cost: number;
};
