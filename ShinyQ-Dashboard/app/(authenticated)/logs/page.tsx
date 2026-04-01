"use client";

import { useState } from "react";

import {
  Bot,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  DollarSign,
  MessageSquare,
  Search,
  Zap,
} from "lucide-react";

import { PageContainer } from "@/components/dashboard/page-container";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LogStatus = "success" | "error" | "timeout" | "filtered";

interface ConversationLog {
  id: string;
  model: string;
  status: LogStatus;
  inputPreview: string;
  outputPreview: string;
  inputTokens: number;
  outputTokens: number;
  latency: number;
  cost: number;
  timestamp: string;
  userId: string;
  tags: string[];
}

const logs: ConversationLog[] = [
  {
    id: "log-001",
    model: "Claude Sonnet 4",
    status: "success",
    inputPreview:
      "Analyze our Q4 revenue data and identify the top 3 growth drivers...",
    outputPreview:
      "Based on the Q4 revenue analysis, the top 3 growth drivers are: 1) Enterprise subscriptions grew 34% YoY...",
    inputTokens: 1240,
    outputTokens: 890,
    latency: 2340,
    cost: 0.0064,
    timestamp: "2 min ago",
    userId: "sarah.chen",
    tags: ["analytics", "production"],
  },
  {
    id: "log-002",
    model: "Claude Haiku 4.5",
    status: "success",
    inputPreview:
      "Classify this support ticket: 'My account was charged twice for...'",
    outputPreview:
      '{"category": "billing", "priority": "high", "sentiment": "negative", "suggested_action": "refund_review"}',
    inputTokens: 85,
    outputTokens: 42,
    latency: 180,
    cost: 0.0001,
    timestamp: "5 min ago",
    userId: "system",
    tags: ["classification", "production"],
  },
  {
    id: "log-003",
    model: "GPT-4o",
    status: "error",
    inputPreview:
      "Generate a comprehensive market analysis report for the semiconductor industry...",
    outputPreview: "Error: Rate limit exceeded. Please retry after 30 seconds.",
    inputTokens: 2100,
    outputTokens: 0,
    latency: 450,
    cost: 0.0,
    timestamp: "12 min ago",
    userId: "marcus.rivera",
    tags: ["reports", "staging"],
  },
  {
    id: "log-004",
    model: "Claude Sonnet 4",
    status: "success",
    inputPreview:
      "Review this PR diff and suggest improvements:\\n```diff\\n- const data = fetch(url)\\n+ const data = await...",
    outputPreview:
      "Code review findings:\\n\\n1. **Missing error handling**: The fetch call should be wrapped in try/catch...",
    inputTokens: 3200,
    outputTokens: 1850,
    latency: 4120,
    cost: 0.0152,
    timestamp: "18 min ago",
    userId: "emily.watson",
    tags: ["code-review", "development"],
  },
  {
    id: "log-005",
    model: "Llama 3.3 70B",
    status: "success",
    inputPreview:
      "Extract structured data from this invoice PDF: vendor name, invoice number, line items...",
    outputPreview:
      '{"vendor": "Acme Corp", "invoice_number": "INV-2024-0892", "total": 12450.00, "line_items": [...]}',
    inputTokens: 4500,
    outputTokens: 320,
    latency: 890,
    cost: 0.0004,
    timestamp: "24 min ago",
    userId: "system",
    tags: ["extraction", "production"],
  },
  {
    id: "log-006",
    model: "Claude Sonnet 4",
    status: "filtered",
    inputPreview:
      "Write a script that can bypass the authentication system by...",
    outputPreview:
      "[FILTERED] Content blocked by safety policy. Category: harmful_instructions",
    inputTokens: 156,
    outputTokens: 0,
    latency: 95,
    cost: 0.0005,
    timestamp: "31 min ago",
    userId: "unknown",
    tags: ["safety", "blocked"],
  },
  {
    id: "log-007",
    model: "Gemini 2.5 Pro",
    status: "timeout",
    inputPreview:
      "Process the entire 2024 customer feedback dataset and generate sentiment trends per region...",
    outputPreview:
      "Error: Request timed out after 120s. Consider breaking the task into smaller chunks.",
    inputTokens: 48000,
    outputTokens: 0,
    latency: 120000,
    cost: 0.168,
    timestamp: "45 min ago",
    userId: "jake.thompson",
    tags: ["batch", "staging"],
  },
  {
    id: "log-008",
    model: "Claude Haiku 4.5",
    status: "success",
    inputPreview:
      "Translate to Japanese: 'Welcome to our platform. Your account has been successfully created.'",
    outputPreview:
      "「プラットフォームへようこそ。アカウントが正常に作成されました。」",
    inputTokens: 32,
    outputTokens: 28,
    latency: 120,
    cost: 0.0001,
    timestamp: "52 min ago",
    userId: "i18n-service",
    tags: ["translation", "production"],
  },
];

const statusConfig: Record<
  LogStatus,
  {
    label: string;
    variant: "success" | "destructive" | "warning" | "secondary";
    borderColor: string;
    badgeClass: string;
  }
> = {
  success: {
    label: "Success",
    variant: "success",
    borderColor: "border-l-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  error: {
    label: "Error",
    variant: "destructive",
    borderColor: "border-l-red-500",
    badgeClass: "bg-red-50 text-red-800 border-red-200",
  },
  timeout: {
    label: "Timeout",
    variant: "warning",
    borderColor: "border-l-amber-500",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
  },
  filtered: {
    label: "Filtered",
    variant: "secondary",
    borderColor: "border-l-slate-400",
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
  },
};

const overviewStats = [
  {
    label: "Total Requests",
    value: "12,847",
    icon: MessageSquare,
    change: "+1,240 today",
  },
  {
    label: "Avg Latency",
    value: "1.2s",
    icon: Zap,
    change: "-180ms vs yesterday",
  },
  {
    label: "Error Rate",
    value: "0.8%",
    icon: Clock,
    change: "Below 1% target",
  },
  {
    label: "Total Cost",
    value: "$47.23",
    icon: DollarSign,
    change: "Today's spend",
  },
];

function formatLatency(ms: number) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

/* ── Kibana-style detail sub-components ── */
function SectionHeader({ label }: { label: string }) {
  return (
    <div className="border-b border-slate-100 bg-slate-100/80 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
      {label}
    </div>
  );
}

function DetailRow({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string | number | null | undefined;
  className?: string;
}) {
  if (value === undefined || value === null) return null;
  return (
    <div
      className={`grid grid-cols-[180px_1fr] items-start border-b border-slate-100/80 transition-colors hover:bg-white/60 ${className}`}
    >
      <div className="flex items-center border-r border-slate-100 bg-slate-50/40 px-4 py-2.5 pl-10 text-xs font-medium text-slate-500">
        <span className="truncate" title={label}>
          {label}
        </span>
      </div>
      <div className="break-all bg-white/80 px-4 py-2.5 font-mono text-xs text-slate-800">
        {value}
      </div>
    </div>
  );
}

export default function LogsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LogStatus | "all">("all");

  const filteredLogs = logs.filter((log) => {
    if (statusFilter !== "all" && log.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.inputPreview.toLowerCase().includes(q) ||
        log.outputPreview.toLowerCase().includes(q) ||
        log.model.toLowerCase().includes(q) ||
        log.userId.toLowerCase().includes(q) ||
        log.tags.some((t) => t.includes(q))
      );
    }
    return true;
  });

  const handleCopyJson = async (log: ConversationLog) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    } catch {
      // silently fail
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Logs"
        description="Monitor AI conversations, track costs and debug issues."
      />

      {/* Stats */}
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
                <p className="mt-1 text-xs text-muted-foreground">{s.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1">
          {(["all", "success", "error", "timeout", "filtered"] as const).map(
            (s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "ghost"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setStatusFilter(s)}
              >
                {s === "all" ? "All" : statusConfig[s].label}
              </Button>
            ),
          )}
        </div>
      </div>

      {/* Log Entries — Kibana Style */}
      <div className="mb-8 mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {/* Table Header */}
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <div className="w-4 shrink-0" />
          <div className="grid min-w-0 flex-1 grid-cols-12 items-center gap-2">
            <div className="col-span-3 md:col-span-3">Timestamp</div>
            <div className="col-span-2 text-center md:col-span-2">Status</div>
            <div className="col-span-6 text-center md:col-span-3">Model</div>
            <div className="hidden text-center md:col-span-1 md:block">
              Tokens
            </div>
            <div className="hidden text-center md:col-span-1 md:block">
              Latency
            </div>
            <div className="hidden text-center md:col-span-1 md:block">
              Cost
            </div>
          </div>
        </div>

        {filteredLogs.map((log) => {
          const sc = statusConfig[log.status];
          const isExpanded = expandedId === log.id;

          return (
            <div
              key={log.id}
              className={`group border-l-4 transition-all duration-200 ease-out ${sc.borderColor} ${isExpanded ? "bg-slate-50/80" : "bg-white hover:bg-slate-50/60"} border-b border-slate-100`}
            >
              {/* Compact Row */}
              <div
                className="flex cursor-pointer items-center gap-2 px-3 py-2.5"
                onClick={() => setExpandedId(isExpanded ? null : log.id)}
              >
                <div className="flex-shrink-0 text-slate-400">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>

                <div className="grid min-w-0 flex-1 grid-cols-12 items-center gap-2">
                  {/* Timestamp */}
                  <div className="col-span-3 truncate font-mono text-xs text-slate-600 md:col-span-3">
                    {log.timestamp}
                  </div>

                  {/* Status Badge */}
                  <div className="col-span-2 text-center md:col-span-2">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${sc.badgeClass}`}
                    >
                      {sc.label}
                    </span>
                  </div>

                  {/* Model */}
                  <div className="col-span-6 flex items-center justify-center gap-2 text-xs md:col-span-3">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="size-3 text-primary" />
                    </div>
                    <span className="truncate font-medium text-slate-900">
                      {log.model}
                    </span>
                  </div>

                  {/* Tokens */}
                  <div className="hidden text-center font-mono text-xs tabular-nums text-slate-500 md:col-span-1 md:block">
                    {(log.inputTokens + log.outputTokens).toLocaleString()}
                  </div>

                  {/* Latency */}
                  <div className="hidden text-center font-mono text-xs tabular-nums text-slate-500 md:col-span-1 md:block">
                    {formatLatency(log.latency)}
                  </div>

                  {/* Cost */}
                  <div className="hidden text-center font-mono text-xs tabular-nums text-slate-500 md:col-span-1 md:block">
                    ${log.cost.toFixed(4)}
                  </div>
                </div>
              </div>

              {/* Expanded Kibana-style Detail */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-0 font-mono text-xs">
                  <div className="grid grid-cols-1 divide-y divide-slate-100/80">
                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 border-b border-slate-100 bg-white/80 px-4 py-2.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 border-slate-200 bg-slate-50 text-xs"
                        onClick={() => handleCopyJson(log)}
                      >
                        <Copy className="mr-2 h-3 w-3 text-slate-400" />
                        Copy JSON
                      </Button>
                      <div className="flex-1" />
                      <div className="text-[10px] text-slate-400">
                        ID: {log.id}
                      </div>
                    </div>

                    <DetailRow label="timestamp" value={log.timestamp} />
                    <DetailRow label="status" value={log.status} />
                    <DetailRow label="model" value={log.model} />

                    <SectionHeader label="User Context" />
                    <DetailRow label="user.id" value={log.userId} />
                    <DetailRow label="tags" value={log.tags.join(", ")} />

                    <SectionHeader label="Metrics" />
                    <DetailRow
                      label="tokens.input"
                      value={log.inputTokens.toLocaleString()}
                    />
                    <DetailRow
                      label="tokens.output"
                      value={log.outputTokens.toLocaleString()}
                    />
                    <DetailRow
                      label="tokens.total"
                      value={(
                        log.inputTokens + log.outputTokens
                      ).toLocaleString()}
                    />
                    <DetailRow
                      label="latency"
                      value={formatLatency(log.latency)}
                    />
                    <DetailRow label="cost" value={`$${log.cost.toFixed(4)}`} />

                    <SectionHeader label="Input" />
                    <div className="group/row grid grid-cols-[180px_1fr] border-b border-slate-100 hover:bg-white">
                      <div className="flex items-start border-r border-slate-100 bg-slate-50/50 p-2 pl-10 text-xs font-medium text-slate-500">
                        <span className="truncate">request.body</span>
                      </div>
                      <div className="bg-white p-3">
                        <pre className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
                          {log.inputPreview}
                        </pre>
                      </div>
                    </div>

                    <SectionHeader label="Output" />
                    <div className="group/row grid grid-cols-[180px_1fr] border-b border-slate-100 hover:bg-white">
                      <div className="flex items-start border-r border-slate-100 bg-slate-50/50 p-2 pl-10 text-xs font-medium text-slate-500">
                        <span className="truncate">response.body</span>
                      </div>
                      <div className="bg-white p-3">
                        <pre className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
                          {log.outputPreview}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="mb-3 size-8 text-muted-foreground" />
            <h3 className="font-semibold">No logs found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search query or filters.
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
