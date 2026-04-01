"use client";

import { useCallback, useEffect, useState } from "react";

export type JobStreamState = {
  status: string;
  progress: number;
  log: string[];
  result?: unknown;
  error?: string;
  mode: "idle" | "sse" | "poll" | "done" | "error";
};

type StreamPayload = {
  status?: string;
  progress?: number;
  log?: string[];
  result?: unknown;
  error?: string;
  type?: string;
  message?: string;
};

export type UseJobStreamOptions = {
  /** Polling interval in ms when SSE falls back (default: 400) */
  pollInterval?: number;
  /** Max polling attempts before giving up (default: 90) */
  pollMaxAttempts?: number;
};

const INITIAL_STATE: JobStreamState = {
  status: "pending",
  progress: 0,
  log: [],
  mode: "idle",
};

export function useJobStream(
  jobId: string | null,
  options: UseJobStreamOptions = {},
) {
  const { pollInterval = 400, pollMaxAttempts = 90 } = options;
  const [state, setState] = useState<JobStreamState>(INITIAL_STATE);

  const poll = useCallback(async (id: string) => {
    const res = await fetch(`/api/v1/jobs/${id}`, { credentials: "include" });
    const json = (await res.json()) as {
      data?: {
        status: string;
        progress: number;
        log: string[];
        result?: unknown;
        error?: string;
      };
      error?: { message?: string };
    };
    if (!res.ok) {
      throw new Error(json?.error?.message ?? "Poll failed");
    }
    const data = json.data!;
    setState((s) => ({
      ...s,
      status: data.status,
      progress: data.progress,
      log: data.log,
      result: data.result,
      error: data.error,
      mode: "poll",
    }));
    return data.status;
  }, []);

  useEffect(() => {
    if (!jobId) {
      setState(INITIAL_STATE);
      return;
    }

    const abortController = new AbortController();
    const finishedRef = { current: false };

    setState({ ...INITIAL_STATE, mode: "sse" });

    const url = `/api/v1/jobs/${jobId}/stream`;
    const es = new EventSource(url);

    es.onmessage = (ev) => {
      if (abortController.signal.aborted) {
        es.close();
        return;
      }

      let payload: StreamPayload;
      try {
        payload = JSON.parse(ev.data) as StreamPayload;
      } catch {
        return;
      }
      if (payload.type === "error") {
        finishedRef.current = true;
        es.close();
        setState((s) => ({
          ...s,
          mode: "error",
          error: payload.message ?? "Stream error",
        }));
        return;
      }
      setState((s) => ({
        ...s,
        status: payload.status ?? s.status,
        progress: payload.progress ?? s.progress,
        log: payload.log ?? s.log,
        result: payload.result ?? s.result,
        error: payload.error ?? s.error,
        mode: "sse",
      }));
      if (payload.status === "completed" || payload.status === "failed") {
        finishedRef.current = true;
        es.close();
        setState((s) => ({ ...s, mode: "done" }));
      }
    };

    es.onerror = () => {
      es.close();
      if (finishedRef.current || abortController.signal.aborted) return;
      setState((s) => ({ ...s, mode: "poll" }));
      void (async () => {
        try {
          for (let i = 0; i < pollMaxAttempts; i++) {
            if (abortController.signal.aborted) return;
            const status = await poll(jobId);
            if (status === "completed" || status === "failed") {
              setState((s) => ({ ...s, mode: "done" }));
              return;
            }
            await new Promise((r) => setTimeout(r, pollInterval));
          }
          if (!abortController.signal.aborted) {
            setState((s) => ({
              ...s,
              mode: "error",
              error: s.error ?? "Job did not finish in time",
            }));
          }
        } catch {
          if (!abortController.signal.aborted) {
            setState((s) => ({
              ...s,
              mode: "error",
              error: s.error ?? "Polling failed",
            }));
          }
        }
      })();
    };

    return () => {
      finishedRef.current = true;
      abortController.abort();
      es.close();
    };
  }, [jobId, poll, pollInterval, pollMaxAttempts]);

  return state;
}
