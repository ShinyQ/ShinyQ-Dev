export type ModelStatus = "active" | "idle" | "deploying" | "error";

export type Model = {
  id: string;
  name: string;
  provider: string;
  version: string;
  status: ModelStatus;
  latencyMs: number;
  throughput: number;
  uptime: number;
  totalRequests: number;
  costPerToken: number;
};
