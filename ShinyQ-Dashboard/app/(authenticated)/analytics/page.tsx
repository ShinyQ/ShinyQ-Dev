"use client";

import { useState } from "react";

import { ArrowUpRight, Bot, Clock, DollarSign, Gauge, Zap } from "lucide-react";

import { PageContainer } from "@/components/dashboard/page-container";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const timeRanges = ["7d", "30d", "90d"] as const;

/* ── KPI Stats ── */
const stats = [
  { label: "Total API Calls", value: "284,210", change: "+18.4%", icon: Zap },
  { label: "Avg Latency", value: "1.24s", change: "-12.3%", icon: Clock },
  { label: "Error Rate", value: "0.82%", change: "-0.15%", icon: Gauge },
  {
    label: "Total Cost",
    value: "$1,847.52",
    change: "+9.1%",
    icon: DollarSign,
  },
];

/* ── Daily API Calls (current vs previous week) ── */
const dailyApiCalls = [
  { day: "Mon", current: 42000, previous: 38000 },
  { day: "Tue", current: 51000, previous: 42000 },
  { day: "Wed", current: 48000, previous: 45000 },
  { day: "Thu", current: 62000, previous: 51000 },
  { day: "Fri", current: 55000, previous: 49000 },
  { day: "Sat", current: 32000, previous: 31000 },
  { day: "Sun", current: 28000, previous: 26000 },
];

/* ── Model Usage Distribution ── */
const modelUsage = [
  { model: "Claude Sonnet 4", calls: 98400, pct: 35, color: "bg-violet-500" },
  { model: "GPT-4o", calls: 72800, pct: 26, color: "bg-emerald-500" },
  { model: "Claude Haiku 4.5", calls: 56200, pct: 20, color: "bg-blue-500" },
  { model: "Gemini 2.5 Pro", calls: 33600, pct: 12, color: "bg-amber-500" },
  { model: "Llama 3.3 70B", calls: 23200, pct: 7, color: "bg-rose-500" },
];

/* ── Cost Breakdown by Model ── */
const costByModel = [
  { model: "Claude Sonnet 4", cost: 682.4, pct: 37, color: "bg-violet-500" },
  { model: "GPT-4o", cost: 498.2, pct: 27, color: "bg-emerald-500" },
  { model: "Gemini 2.5 Pro", cost: 295.6, pct: 16, color: "bg-amber-500" },
  { model: "Claude Haiku 4.5", cost: 221.82, pct: 12, color: "bg-blue-500" },
  { model: "Llama 3.3 70B", cost: 149.5, pct: 8, color: "bg-rose-500" },
];

/* ── Response Time Distribution ── */
const latencyBuckets = [
  { range: "<100ms", count: 48200, pct: 17 },
  { range: "100-500ms", count: 89600, pct: 32 },
  { range: "500ms-1s", count: 71200, pct: 25 },
  { range: "1-2s", count: 42400, pct: 15 },
  { range: "2-5s", count: 22400, pct: 8 },
  { range: ">5s", count: 10400, pct: 3 },
];

/* ── Top Endpoints ── */
const topEndpoints = [
  {
    endpoint: "/v1/chat/completions",
    calls: 124500,
    avgLatency: "1.8s",
    errorRate: "0.5%",
    cost: "$842.30",
  },
  {
    endpoint: "/v1/embeddings",
    calls: 68200,
    avgLatency: "0.3s",
    errorRate: "0.2%",
    cost: "$124.60",
  },
  {
    endpoint: "/v1/classifications",
    calls: 42800,
    avgLatency: "0.4s",
    errorRate: "0.8%",
    cost: "$98.40",
  },
  {
    endpoint: "/v1/summarize",
    calls: 28400,
    avgLatency: "2.1s",
    errorRate: "1.2%",
    cost: "$312.50",
  },
  {
    endpoint: "/v1/translate",
    calls: 20310,
    avgLatency: "0.9s",
    errorRate: "0.3%",
    cost: "$189.72",
  },
];

export default function AnalyticsPage() {
  const [range, setRange] = useState<(typeof timeRanges)[number]>("30d");
  const maxDaily = Math.max(
    ...dailyApiCalls.flatMap((d) => [d.current, d.previous]),
  );
  const maxLatencyPct = Math.max(...latencyBuckets.map((b) => b.pct));

  return (
    <PageContainer>
      <PageHeader
        title="Analytics"
        description="AI model usage, performance metrics, and cost analysis."
        actions={
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
            {timeRanges.map((r) => (
              <Button
                key={r}
                variant={range === r ? "default" : "ghost"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setRange(r)}
              >
                {r}
              </Button>
            ))}
          </div>
        }
      />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {s.label}
                  </p>
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="size-4 text-primary" />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold">{s.value}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                  <ArrowUpRight className="size-3" />
                  {s.change} from last period
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Daily API Calls + Model Usage */}
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Daily API Calls bar chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Daily API Calls</CardTitle>
            <CardDescription>Current week vs previous week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[220px] items-end gap-3">
              {dailyApiCalls.map((d) => (
                <div
                  key={d.day}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <div className="flex w-full items-end justify-center gap-1">
                    <div
                      className="w-[40%] rounded-t-sm bg-primary/25"
                      style={{ height: `${(d.previous / maxDaily) * 180}px` }}
                    />
                    <div
                      className="w-[40%] rounded-t-sm bg-primary transition-all hover:bg-primary/90"
                      style={{ height: `${(d.current / maxDaily) * 180}px` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-2.5 rounded-sm bg-primary/25" />{" "}
                Previous
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block size-2.5 rounded-sm bg-primary" />{" "}
                Current
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Model Usage Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Model Usage</CardTitle>
            <CardDescription>API calls by model</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {modelUsage.map((m) => (
                <div key={m.model} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      <Bot className="size-3.5 text-muted-foreground" />
                      {m.model}
                    </span>
                    <span className="text-muted-foreground">
                      {m.calls.toLocaleString()} ({m.pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${m.color} transition-all`}
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown + Response Time Distribution */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Cost Breakdown by Model */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>Spend by model this period</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Stacked bar */}
            <div className="mb-4 flex h-6 w-full overflow-hidden rounded-full">
              {costByModel.map((m) => (
                <div
                  key={m.model}
                  className={`${m.color} transition-all`}
                  style={{ width: `${m.pct}%` }}
                  title={`${m.model}: $${m.cost.toFixed(2)} (${m.pct}%)`}
                />
              ))}
            </div>
            <div className="space-y-3">
              {costByModel.map((m) => (
                <div
                  key={m.model}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`inline-block size-3 rounded-sm ${m.color}`}
                    />
                    <span className="font-medium">{m.model}</span>
                  </span>
                  <span className="font-mono tabular-nums text-muted-foreground">
                    ${m.cost.toFixed(2)}
                    <span className="ml-2 text-xs">({m.pct}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Response Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Response Time Distribution</CardTitle>
            <CardDescription>
              Latency distribution across all requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-end gap-2">
              {latencyBuckets.map((b) => (
                <div
                  key={b.range}
                  className="flex flex-1 flex-col items-center gap-1.5"
                >
                  <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
                    {b.pct}%
                  </span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary/60 transition-all hover:from-primary/90 hover:to-primary/50"
                    style={{ height: `${(b.pct / maxLatencyPct) * 140}px` }}
                  />
                  <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                    {b.range}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2 text-xs">
              <span className="text-muted-foreground">
                Median:{" "}
                <span className="font-semibold text-foreground">620ms</span>
              </span>
              <span className="text-muted-foreground">
                P95: <span className="font-semibold text-foreground">3.2s</span>
              </span>
              <span className="text-muted-foreground">
                P99: <span className="font-semibold text-foreground">8.4s</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Endpoints */}
      <Card className="mb-8 mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top Endpoints</CardTitle>
            <CardDescription>
              Most called API endpoints this period
            </CardDescription>
          </div>
          <Badge variant="secondary">
            <Zap className="mr-1 size-3" />
            {range}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Endpoint
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                    Calls
                  </th>
                  <th className="hidden px-6 py-3 text-right font-medium text-muted-foreground md:table-cell">
                    Avg Latency
                  </th>
                  <th className="hidden px-6 py-3 text-right font-medium text-muted-foreground sm:table-cell">
                    Error Rate
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {topEndpoints.map((ep) => (
                  <tr
                    key={ep.endpoint}
                    className="border-b border-border transition-colors last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-6 py-3 font-mono text-xs font-medium">
                      {ep.endpoint}
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums">
                      {ep.calls.toLocaleString()}
                    </td>
                    <td className="hidden px-6 py-3 text-right tabular-nums text-muted-foreground md:table-cell">
                      {ep.avgLatency}
                    </td>
                    <td className="hidden px-6 py-3 text-right tabular-nums sm:table-cell">
                      <Badge
                        variant={
                          parseFloat(ep.errorRate) > 1
                            ? "destructive"
                            : "success"
                        }
                      >
                        {ep.errorRate}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right font-medium tabular-nums">
                      {ep.cost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
