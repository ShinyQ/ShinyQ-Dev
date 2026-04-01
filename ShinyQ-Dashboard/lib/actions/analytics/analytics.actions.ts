"use server";

import { withActionResult } from "@/lib/actions/middleware.actions";

import { getModelUsage, getOverview } from "./analytics.service";
import type { TimeRange } from "./analytics.types";

export type {
  AnalyticsOverview,
  ModelUsage,
  TimeRange,
} from "./analytics.types";

export async function getAnalyticsOverviewResultAction(range: TimeRange) {
  return withActionResult(() => getOverview(range));
}

export async function getModelUsageResultAction(range: TimeRange) {
  return withActionResult(() => getModelUsage(range));
}
