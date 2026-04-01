"use client";

import { useState } from "react";

import {
  Activity,
  ArrowUpRight,
  Bot,
  Check,
  Clock,
  Copy,
  MoreVertical,
  Pause,
  Play,
  RefreshCw,
  Server,
  Zap,
} from "lucide-react";

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

type ModelStatus = "active" | "idle" | "deploying" | "error";

interface Model {
  id: string;
  name: string;
  provider: string;
  version: string;
  status: ModelStatus;
  latency: string;
  throughput: string;
  uptime: string;
  totalRequests: string;
  costPer1k: string;
  contextWindow: string;
  lastUsed: string;
}

const models: Model[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    version: "2024-11-20",
    status: "active",
    latency: "320ms",
    throughput: "42 req/s",
    uptime: "99.97%",
    totalRequests: "1.2M",
    costPer1k: "$2.50",
    contextWindow: "128K",
    lastUsed: "2 min ago",
  },
  {
    id: "claude-sonnet",
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    version: "claude-sonnet-4-20250514",
    status: "active",
    latency: "280ms",
    throughput: "38 req/s",
    uptime: "99.99%",
    totalRequests: "890K",
    costPer1k: "$3.00",
    contextWindow: "200K",
    lastUsed: "Just now",
  },
  {
    id: "claude-haiku",
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    version: "claude-haiku-4-5-20251001",
    status: "active",
    latency: "85ms",
    throughput: "120 req/s",
    uptime: "99.99%",
    totalRequests: "3.4M",
    costPer1k: "$0.25",
    contextWindow: "200K",
    lastUsed: "Just now",
  },
  {
    id: "gemini-2",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    version: "gemini-2.5-pro-preview",
    status: "idle",
    latency: "410ms",
    throughput: "28 req/s",
    uptime: "99.91%",
    totalRequests: "340K",
    costPer1k: "$3.50",
    contextWindow: "1M",
    lastUsed: "1 hr ago",
  },
  {
    id: "llama-3",
    name: "Llama 3.3 70B",
    provider: "Meta (Self-hosted)",
    version: "3.3-70b-instruct",
    status: "active",
    latency: "190ms",
    throughput: "55 req/s",
    uptime: "99.85%",
    totalRequests: "2.1M",
    costPer1k: "$0.08",
    contextWindow: "128K",
    lastUsed: "5 min ago",
  },
  {
    id: "mistral-large",
    name: "Mistral Large",
    provider: "Mistral AI",
    version: "mistral-large-2411",
    status: "deploying",
    latency: "—",
    throughput: "—",
    uptime: "—",
    totalRequests: "0",
    costPer1k: "$2.00",
    contextWindow: "128K",
    lastUsed: "Never",
  },
];

const statusConfig: Record<
  ModelStatus,
  { label: string; variant: "success" | "warning" | "default" | "destructive" }
> = {
  active: { label: "Active", variant: "success" },
  idle: { label: "Idle", variant: "warning" },
  deploying: { label: "Deploying", variant: "default" },
  error: { label: "Error", variant: "destructive" },
};

const overviewStats = [
  { label: "Total Models", value: "6", icon: Bot, change: "+2 this month" },
  {
    label: "Active Models",
    value: "4",
    icon: Activity,
    change: "67% of fleet",
  },
  {
    label: "Avg Latency",
    value: "215ms",
    icon: Zap,
    change: "-12% vs last week",
  },
  {
    label: "Total Requests",
    value: "7.9M",
    icon: Server,
    change: "+340K today",
  },
];

export default function ModelsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Models"
        description="Manage and monitor your AI model deployments."
        actions={
          <Button size="sm">
            <Play className="mr-1.5 size-3.5" />
            Deploy Model
          </Button>
        }
      />

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((s) => {
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
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  {s.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Model Cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {models.map((model) => {
          const sc = statusConfig[model.status];
          return (
            <Card key={model.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {model.name}
                      <Badge variant={sc.variant}>{sc.label}</Badge>
                    </CardTitle>
                    <CardDescription>{model.provider}</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="size-8 p-0">
                    <MoreVertical className="size-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                {/* Model ID */}
                <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <code className="flex-1 truncate text-xs text-muted-foreground">
                    {model.version}
                  </code>
                  <button
                    onClick={() => handleCopy(model.version)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {copiedId === model.version ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </button>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Latency</p>
                    <p className="font-semibold tabular-nums">
                      {model.latency}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Throughput</p>
                    <p className="font-semibold tabular-nums">
                      {model.throughput}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Context</p>
                    <p className="font-semibold tabular-nums">
                      {model.contextWindow}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Cost / 1K tokens
                    </p>
                    <p className="font-semibold tabular-nums">
                      {model.costPer1k}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ArrowUpRight className="size-3" />
                    {model.totalRequests} requests
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {model.lastUsed}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Model Comparison Table */}
      <Card className="mb-8 mt-6">
        <CardHeader>
          <CardTitle>Model Comparison</CardTitle>
          <CardDescription>
            Performance and cost metrics across all models
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                    Latency
                  </th>
                  <th className="hidden px-6 py-3 text-right font-medium text-muted-foreground sm:table-cell">
                    Throughput
                  </th>
                  <th className="hidden px-6 py-3 text-right font-medium text-muted-foreground md:table-cell">
                    Uptime
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                    Cost/1K
                  </th>
                  <th className="px-6 py-3 text-center font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => {
                  const sc = statusConfig[m.status];
                  return (
                    <tr
                      key={m.id}
                      className="border-b border-border transition-colors last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-6 py-3 font-medium">{m.name}</td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {m.provider}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums">
                        {m.latency}
                      </td>
                      <td className="hidden px-6 py-3 text-right tabular-nums text-muted-foreground sm:table-cell">
                        {m.throughput}
                      </td>
                      <td className="hidden px-6 py-3 text-right tabular-nums text-muted-foreground md:table-cell">
                        {m.uptime}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums">
                        {m.costPer1k}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
