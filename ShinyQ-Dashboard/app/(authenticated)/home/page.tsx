import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

import { PageContainer } from "@/components/dashboard/page-container";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const kpis = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    trend: "up" as const,
    icon: DollarSign,
    description: "from last month",
  },
  {
    title: "Active Users",
    value: "2,350",
    change: "+180",
    trend: "up" as const,
    icon: Users,
    description: "from last month",
  },
  {
    title: "Orders",
    value: "12,234",
    change: "+19%",
    trend: "up" as const,
    icon: ShoppingCart,
    description: "from last month",
  },
  {
    title: "Conversion Rate",
    value: "3.2%",
    change: "-0.4%",
    trend: "down" as const,
    icon: TrendingUp,
    description: "from last month",
  },
];

const recentOrders = [
  {
    id: "ORD-7821",
    customer: "Olivia Martin",
    email: "olivia@example.com",
    amount: "$1,999.00",
    status: "completed",
  },
  {
    id: "ORD-7820",
    customer: "Jackson Lee",
    email: "jackson@example.com",
    amount: "$39.00",
    status: "processing",
  },
  {
    id: "ORD-7819",
    customer: "Isabella Nguyen",
    email: "isabella@example.com",
    amount: "$299.00",
    status: "completed",
  },
  {
    id: "ORD-7818",
    customer: "William Kim",
    email: "will@example.com",
    amount: "$99.00",
    status: "completed",
  },
  {
    id: "ORD-7817",
    customer: "Sofia Davis",
    email: "sofia@example.com",
    amount: "$499.00",
    status: "pending",
  },
];

const chartData = [40, 55, 45, 70, 65, 80, 75, 90, 85, 95, 88, 100];
const chartLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const activityItems = [
  {
    user: "Sarah Chen",
    action: "deployed v2.4.1 to production",
    time: "2 min ago",
  },
  {
    user: "Marcus Rivera",
    action: "merged PR #847 — auth refactor",
    time: "18 min ago",
  },
  {
    user: "Emily Watson",
    action: "created new API endpoint /api/v1/reports",
    time: "1 hr ago",
  },
  { user: "Jake Thompson", action: "resolved issue #312", time: "3 hr ago" },
  {
    user: "Aisha Patel",
    action: "added monitoring dashboard",
    time: "5 hr ago",
  },
];

export default function HomePage() {
  const maxChart = Math.max(...chartData);

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Overview of your key metrics and recent activity."
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <div className="rounded-lg bg-primary/10 p-2">
                  <Icon className="size-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">
                  {kpi.value}
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  {kpi.trend === "up" ? (
                    <span className="flex items-center gap-0.5 text-emerald-600">
                      <ArrowUpRight className="size-3" />
                      {kpi.change}
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-red-500">
                      <ArrowDownRight className="size-3" />
                      {kpi.change}
                    </span>
                  )}
                  <span className="text-muted-foreground">
                    {kpi.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts + Activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Monthly revenue for the current year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[240px] items-end gap-2">
              {chartData.map((val, i) => (
                <div
                  key={chartLabels[i]}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <div className="relative w-full">
                    <div
                      className="mx-auto w-full max-w-[36px] rounded-t-md bg-primary/80 transition-all hover:bg-primary"
                      style={{ height: `${(val / maxChart) * 200}px` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {chartLabels[i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions from your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityItems.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="relative flex flex-col items-center">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {item.user
                        .split(" ")
                        .map((w) => w[0])
                        .join("")}
                    </div>
                    {i < activityItems.length - 1 && (
                      <div className="mt-1 h-full w-px bg-border" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pb-4">
                    <p className="text-sm">
                      <span className="font-medium">{item.user}</span>{" "}
                      <span className="text-muted-foreground">
                        {item.action}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="mb-8 mt-6">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest transactions from your store</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Customer
                  </th>
                  <th className="hidden px-6 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right font-medium text-muted-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-6 py-3 font-mono text-xs font-medium">
                      {order.id}
                    </td>
                    <td className="px-6 py-3 font-medium">{order.customer}</td>
                    <td className="hidden px-6 py-3 text-muted-foreground sm:table-cell">
                      {order.email}
                    </td>
                    <td className="px-6 py-3">
                      <Badge
                        variant={
                          order.status === "completed"
                            ? "success"
                            : order.status === "processing"
                              ? "default"
                              : "warning"
                        }
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right font-medium">
                      {order.amount}
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
