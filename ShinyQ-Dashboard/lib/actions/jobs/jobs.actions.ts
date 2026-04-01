"use server";

import { withActionResult } from "@/lib/actions/middleware.actions";

import { createJob, findJob } from "./jobs.service";
import type { DemoJobRecord } from "./jobs.types";

export type { DemoJobRecord, DemoJobStatus } from "./jobs.types";

/**
 * Submit a new demo job for background processing.
 */
export async function submitJobResultAction() {
  return withActionResult(async (): Promise<{ id: string }> => {
    const id = crypto.randomUUID();
    createJob(id);
    return { id };
  });
}

/**
 * Retrieve the current state of a demo job.
 */
export async function getJobResultAction(id: string) {
  return withActionResult(async (): Promise<DemoJobRecord> => {
    const job = findJob(id);
    if (!job) {
      const { ActionError } = await import("@/lib/actions/action-result");
      throw new ActionError("Job not found", "NOT_FOUND");
    }
    return job;
  });
}
