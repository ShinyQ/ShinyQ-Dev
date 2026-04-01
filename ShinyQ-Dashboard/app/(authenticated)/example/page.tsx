"use client";

import { useState } from "react";

import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Info,
  MessageSquare,
  Settings,
  Trash2,
  UserPlus,
} from "lucide-react";

import { PageContainer } from "@/components/dashboard/page-container";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTableEmptyState } from "@/components/data/data-table-empty-state";
import {
  DataTableScrollRegion,
  DataTableShell,
} from "@/components/data/data-table-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExampleWidgets } from "@/features/_example/example-widgets";

const rows = [
  {
    id: "TASK-001",
    name: "Design token audit",
    assignee: "Sarah C.",
    priority: "high",
    status: "completed" as const,
    updated: "2 hrs ago",
  },
  {
    id: "TASK-002",
    name: "API rate limiting",
    assignee: "Marcus R.",
    priority: "medium",
    status: "in-progress" as const,
    updated: "30 min ago",
  },
  {
    id: "TASK-003",
    name: "Mobile nav fixes",
    assignee: "Emily W.",
    priority: "high",
    status: "in-progress" as const,
    updated: "1 hr ago",
  },
  {
    id: "TASK-004",
    name: "SSE reconnect logic",
    assignee: "Jake T.",
    priority: "low",
    status: "pending" as const,
    updated: "5 hrs ago",
  },
  {
    id: "TASK-005",
    name: "Dashboard KPI cards",
    assignee: "Aisha P.",
    priority: "medium",
    status: "completed" as const,
    updated: "1 day ago",
  },
];

const priorityStyles: Record<string, string> = {
  high: "bg-red-500/15 text-red-700",
  medium: "bg-amber-500/15 text-amber-700",
  low: "bg-slate-500/15 text-slate-600",
};

const statusVariant: Record<string, "success" | "default" | "secondary"> = {
  completed: "success",
  "in-progress": "default",
  pending: "secondary",
};

function ModalShowcase() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modals & Overlays</CardTitle>
        <CardDescription>
          Dialog, AlertDialog, and DropdownMenu patterns — all built on Radix
          primitives with focus trapping and keyboard navigation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Form Modal */}
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <UserPlus className="size-4 text-primary" />
              Form Modal
            </div>
            <p className="text-xs text-muted-foreground">
              Modal with form inputs, validation-ready layout.
            </p>
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="mt-2 w-full">
                  Open Form
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                  <DialogDescription>
                    Invite a new member to your workspace. They&apos;ll receive
                    an email with setup instructions.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="modal-name">Full Name</Label>
                    <Input id="modal-name" placeholder="Jane Smith" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="modal-email">Email Address</Label>
                    <Input
                      id="modal-email"
                      type="email"
                      placeholder="jane@company.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="modal-role">Role</Label>
                    <Input id="modal-role" placeholder="Editor" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setFormOpen(false)}>
                    Send Invite
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Confirmation Modal */}
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Trash2 className="size-4 text-destructive" />
              Confirm Delete
            </div>
            <p className="text-xs text-muted-foreground">
              Destructive action confirmation with AlertDialog.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="mt-2 w-full">
                  Delete Item
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the item and remove all associated data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Info Modal */}
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="size-4 text-blue-500" />
              Info Dialog
            </div>
            <p className="text-xs text-muted-foreground">
              Read-only informational dialog with rich content.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>About This Template</DialogTitle>
                  <DialogDescription>
                    Architecture and technology stack overview.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="font-medium">Frontend</p>
                    <p className="text-muted-foreground">
                      Next.js App Router, TypeScript, Tailwind CSS, Radix UI
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="font-medium">Backend</p>
                    <p className="text-muted-foreground">
                      FastAPI, Pydantic, SQLAlchemy, uv + ruff
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="font-medium">Patterns</p>
                    <p className="text-muted-foreground">
                      BFF proxy, Server Actions, SSE streaming, RBAC
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button>Got it</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Dropdown Menu */}
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Settings className="size-4 text-muted-foreground" />
              Dropdown Menu
            </div>
            <p className="text-xs text-muted-foreground">
              Context menu with sections, icons, and separators.
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full gap-1"
                >
                  Actions
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Edit item</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem>Move to archive</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  Delete permanently
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ExamplePage() {
  const empty = rows.length === 0;

  return (
    <PageContainer>
      <PageHeader
        title="Components"
        description="Reference implementation of UI patterns — tables, badges, dialogs, alerts, and more."
      />

      {/* Modals & Overlays — prominent showcase */}
      <ModalShowcase />

      {/* Alerts showcase */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Alert className="border-blue-200 bg-blue-50 [&>svg]:text-blue-600">
          <Info className="size-4" />
          <AlertTitle className="text-blue-900">Information</AlertTitle>
          <AlertDescription className="text-blue-700">
            Informational notices for non-critical updates.
          </AlertDescription>
        </Alert>
        <Alert className="border-emerald-200 bg-emerald-50 [&>svg]:text-emerald-600">
          <CheckCircle className="size-4" />
          <AlertTitle className="text-emerald-900">Success</AlertTitle>
          <AlertDescription className="text-emerald-700">
            Operation completed successfully.
          </AlertDescription>
        </Alert>
        <Alert className="border-amber-200 bg-amber-50 [&>svg]:text-amber-600">
          <AlertTriangle className="size-4" />
          <AlertTitle className="text-amber-900">Warning</AlertTitle>
          <AlertDescription className="text-amber-700">
            Approaching rate limit threshold.
          </AlertDescription>
        </Alert>
      </div>

      {/* Table showcase */}
      <div className="mt-6">
        <DataTableShell>
          {empty ? (
            <DataTableEmptyState
              title="No tasks yet"
              description="Create your first task to get started."
            />
          ) : (
            <DataTableScrollRegion>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Assignee
                    </TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden text-right md:table-cell">
                      Updated
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs font-medium">
                        {r.id}
                      </TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">
                        {r.assignee}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${priorityStyles[r.priority]}`}
                        >
                          {r.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[r.status]}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-right text-muted-foreground md:table-cell">
                        {r.updated}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DataTableScrollRegion>
          )}
        </DataTableShell>
      </div>

      <ExampleWidgets />
    </PageContainer>
  );
}
