export type DemoJobStatus = "pending" | "running" | "completed" | "failed";

export type DemoJobRecord = {
  id: string;
  status: DemoJobStatus;
  progress: number;
  log: string[];
  result?: unknown;
  error?: string;
};
