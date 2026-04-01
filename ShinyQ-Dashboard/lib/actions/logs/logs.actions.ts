"use server";

import { withActionResult } from "@/lib/actions/middleware.actions";

import { searchLogs } from "./logs.service";
import type { LogsFilter } from "./logs.types";

export type { ConversationLog, LogsFilter, LogStatus } from "./logs.types";

export async function searchLogsResultAction(filter: LogsFilter) {
  return withActionResult(() => searchLogs(filter));
}
