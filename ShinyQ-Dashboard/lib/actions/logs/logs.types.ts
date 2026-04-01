export type LogStatus = "success" | "error" | "timeout" | "filtered";

export type ConversationLog = {
  id: string;
  timestamp: string;
  model: string;
  status: LogStatus;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  cost: number;
  input: string;
  output: string;
};

export type LogsFilter = {
  query?: string;
  status?: LogStatus;
  page?: number;
  pageSize?: number;
};
