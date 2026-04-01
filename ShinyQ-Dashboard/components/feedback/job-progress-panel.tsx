"use client";

import { useState } from "react";

import {
  CheckCircle,
  Loader2,
  Play,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useJobStream } from "@/lib/hooks/useJobStream";
import { cn } from "@/lib/utils";

const modeConfig = {
  idle: {
    label: "Idle",
    icon: WifiOff,
    className: "bg-muted text-muted-foreground",
  },
  sse: {
    label: "Streaming",
    icon: Wifi,
    className: "bg-brand-100 text-brand-800",
  },
  poll: {
    label: "Polling",
    icon: Loader2,
    className: "bg-amber-100 text-amber-800",
  },
  done: {
    label: "Complete",
    icon: CheckCircle,
    className: "bg-emerald-100 text-emerald-800",
  },
  error: {
    label: "Error",
    icon: XCircle,
    className: "bg-red-100 text-red-800",
  },
};

export function JobProgressPanel() {
  const [jobId, setJobId] = useState<string | null>(null);
  const stream = useJobStream(jobId);

  async function startDemo() {
    setJobId(null);
    const res = await fetch("/api/v1/jobs", {
      method: "POST",
      credentials: "include",
    });
    const json = (await res.json()) as { data?: { id: string } };
    if (!res.ok || !json.data?.id) return;
    setJobId(json.data.id);
  }

  const mode = modeConfig[stream.mode];
  const ModeIcon = mode.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Long-Running Job</CardTitle>
        <CardDescription>
          SSE streaming with automatic polling fallback — demonstrates real-time
          progress tracking for background tasks.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button type="button" onClick={startDemo} className="gap-2">
          <Play className="size-3.5" />
          Start Demo Job
        </Button>
        {jobId ? (
          <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs text-muted-foreground">{jobId}</p>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                  mode.className,
                )}
              >
                <ModeIcon
                  className={cn(
                    "size-3",
                    stream.mode === "poll" && "animate-spin",
                  )}
                />
                {mode.label}
              </span>
            </div>

            {/* Progress bar */}
            <div>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="font-medium capitalize">{stream.status}</span>
                <span className="tabular-nums text-muted-foreground">
                  {stream.progress}%
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-500 ease-out",
                    stream.mode === "done"
                      ? "bg-emerald-500"
                      : stream.mode === "error"
                        ? "bg-destructive"
                        : "bg-primary",
                  )}
                  style={{ width: `${stream.progress}%` }}
                />
              </div>
            </div>

            {/* Log output */}
            {stream.log.length > 0 ? (
              <div className="max-h-36 overflow-y-auto rounded-lg bg-slate-900 p-3">
                <ul className="space-y-0.5 font-mono text-[11px] text-slate-300">
                  {stream.log.map((line, i) => (
                    <li key={`${i}-${line}`} className="flex gap-2">
                      <span className="select-none text-slate-600">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Result */}
            {stream.result != null && stream.mode === "done" ? (
              <pre className="max-h-32 overflow-auto rounded-lg bg-slate-900 p-3 text-[11px] text-emerald-400">
                {JSON.stringify(stream.result, null, 2)}
              </pre>
            ) : null}

            {stream.error ? (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <XCircle className="mt-0.5 size-4 shrink-0" />
                {stream.error}
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
