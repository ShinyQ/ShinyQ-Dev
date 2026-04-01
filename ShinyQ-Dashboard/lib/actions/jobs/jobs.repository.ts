import "server-only";

import type { DemoJobRecord } from "./jobs.types";

/**
 * In-memory job store — demo/development only.
 *
 * In production, replace with a persistent store (Redis, database, etc.)
 * by implementing the same interface.
 */
const g = globalThis as typeof globalThis & {
  __demoJobs?: Map<string, DemoJobRecord>;
};

function store(): Map<string, DemoJobRecord> {
  if (!g.__demoJobs) g.__demoJobs = new Map();
  return g.__demoJobs;
}

export function getJob(id: string): DemoJobRecord | null {
  return store().get(id) ?? null;
}

export function setJob(record: DemoJobRecord): void {
  store().set(record.id, record);
}

export function patchJob(id: string, patch: Partial<DemoJobRecord>): void {
  const cur = store().get(id);
  if (!cur) return;
  store().set(id, { ...cur, ...patch });
}
