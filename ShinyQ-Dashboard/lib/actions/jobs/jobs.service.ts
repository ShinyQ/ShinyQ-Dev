import "server-only";

import { getJob, patchJob, setJob } from "./jobs.repository";
import type { DemoJobRecord } from "./jobs.types";

/**
 * Create a new demo job and schedule its background execution.
 */
export function createJob(id: string): DemoJobRecord {
  const record: DemoJobRecord = {
    id,
    status: "pending",
    progress: 0,
    log: [],
  };
  setJob(record);
  scheduleJobRun(id);
  return record;
}

/**
 * Retrieve a job by ID.
 */
export function findJob(id: string): DemoJobRecord | null {
  return getJob(id);
}

/**
 * Schedule background execution of a demo job.
 * Simulates progress ticks for SSE streaming demonstration.
 */
function scheduleJobRun(id: string): void {
  const run = () => {
    const j = getJob(id);
    if (!j || j.status === "completed" || j.status === "failed") return;

    patchJob(id, {
      status: "running",
      log: [...(getJob(id)?.log ?? []), "Job started"],
      progress: 5,
    });

    const steps = [
      { progress: 35, line: "Fetching context" },
      { progress: 60, line: "Running step" },
      { progress: 85, line: "Finalizing" },
    ];
    let i = 0;

    const tick = () => {
      const current = getJob(id);
      if (!current || current.status === "failed") return;
      if (i >= steps.length) {
        patchJob(id, {
          status: "completed",
          progress: 100,
          log: [...(getJob(id)?.log ?? []), "Done"],
          result: { message: "Demo job finished" },
        });
        return;
      }
      const s = steps[i]!;
      i += 1;
      patchJob(id, {
        progress: s.progress,
        log: [...(getJob(id)?.log ?? []), s.line],
      });
      setTimeout(tick, 650);
    };

    setTimeout(tick, 400);
  };

  queueMicrotask(run);
}
