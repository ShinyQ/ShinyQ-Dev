"use client";

import { useMemo, useState } from "react";

import {
  MoreHorizontal,
  Plus,
  Shield,
  UserCheck,
  UserMinus,
  UserPlus,
} from "lucide-react";

import { PageContainer } from "@/components/dashboard/page-container";
import { PageHeader } from "@/components/dashboard/page-header";
import {
  DataTableScrollRegion,
  DataTableShell,
} from "@/components/data/data-table-shell";
import { DataTableEmptyState } from "@/components/data/data-table-empty-state";
import { PaginationBar } from "@/components/data/pagination-bar";
import { TableToolbar } from "@/components/data/table-toolbar";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "inactive" | "invited";
  lastActive: string;
  joined: string;
};

const allUsers: UserRecord[] = [
  { id: "1", name: "Sarah Chen", email: "sarah@example.com", role: "admin", status: "active", lastActive: "2 min ago", joined: "Jan 12, 2024" },
  { id: "2", name: "Marcus Rivera", email: "marcus@example.com", role: "editor", status: "active", lastActive: "15 min ago", joined: "Feb 3, 2024" },
  { id: "3", name: "Emily Watson", email: "emily@example.com", role: "editor", status: "active", lastActive: "1 hr ago", joined: "Mar 8, 2024" },
  { id: "4", name: "Jake Thompson", email: "jake@example.com", role: "viewer", status: "active", lastActive: "3 hr ago", joined: "Mar 15, 2024" },
  { id: "5", name: "Aisha Patel", email: "aisha@example.com", role: "admin", status: "active", lastActive: "5 hr ago", joined: "Apr 1, 2024" },
  { id: "6", name: "Tom Bradley", email: "tom@example.com", role: "viewer", status: "inactive", lastActive: "2 days ago", joined: "Apr 20, 2024" },
  { id: "7", name: "Lisa Park", email: "lisa@example.com", role: "editor", status: "active", lastActive: "30 min ago", joined: "May 5, 2024" },
  { id: "8", name: "David Kim", email: "david@example.com", role: "viewer", status: "invited", lastActive: "—", joined: "Jun 1, 2024" },
  { id: "9", name: "Rachel Green", email: "rachel@example.com", role: "editor", status: "active", lastActive: "12 min ago", joined: "Jun 15, 2024" },
  { id: "10", name: "Carlos Mendez", email: "carlos@example.com", role: "viewer", status: "active", lastActive: "45 min ago", joined: "Jul 2, 2024" },
  { id: "11", name: "Nina Sharma", email: "nina@example.com", role: "admin", status: "active", lastActive: "1 hr ago", joined: "Jul 20, 2024" },
  { id: "12", name: "Omar Farouk", email: "omar@example.com", role: "viewer", status: "inactive", lastActive: "5 days ago", joined: "Aug 8, 2024" },
];

const roleColors: Record<string, string> = {
  admin: "bg-brand-500/15 text-brand-700",
  editor: "bg-blue-500/15 text-blue-700",
  viewer: "bg-slate-500/15 text-slate-600",
};

const statusVariant: Record<string, "success" | "warning" | "secondary"> = {
  active: "success",
  inactive: "secondary",
  invited: "warning",
};

type RoleFilter = "admin" | "editor" | "viewer" | null;

const ROLE_FILTERS = [
  { label: "All Roles", value: null as RoleFilter },
  { label: "Admin", value: "admin" as RoleFilter },
  { label: "Editor", value: "editor" as RoleFilter },
  { label: "Viewer", value: "viewer" as RoleFilter },
];

const summaryStats = [
  { label: "Total Users", value: "12", icon: UserCheck, color: "text-primary" },
  { label: "Active", value: "9", icon: UserPlus, color: "text-emerald-600" },
  { label: "Inactive", value: "2", icon: UserMinus, color: "text-slate-500" },
  { label: "Admins", value: "3", icon: Shield, color: "text-brand-600" },
];

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(null);

  const filtered = useMemo(() => {
    let list: UserRecord[] = allUsers;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }
    if (roleFilter) {
      list = list.filter((u) => u.role === roleFilter);
    }
    return list;
  }, [debouncedSearch, roleFilter]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Reset to page 1 when filters change
  function handleRoleChange(value: RoleFilter) {
    setRoleFilter(value);
    setPage(1);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Users"
        description="Manage team members and their permissions."
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" />
            Invite User
          </Button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {summaryStats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-muted p-2.5">
                  <Icon className={`size-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* User table */}
      <Card className="mb-8 mt-6">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>{filtered.length} users found</CardDescription>
            </div>
            <TableToolbar>
              <TableToolbar.Search
                value={search}
                onChange={(v) => {
                  setSearch(v);
                  setPage(1);
                }}
                placeholder="Search users…"
              />
              <TableToolbar.FilterPills
                options={ROLE_FILTERS}
                value={roleFilter}
                onChange={handleRoleChange}
              />
            </TableToolbar>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!filtered.length ? (
            <DataTableEmptyState
              title="No users found"
              description="Try adjusting your search or filter."
              action={{
                label: "Clear filters",
                onClick: () => {
                  setSearch("");
                  setRoleFilter(null);
                },
              }}
            />
          ) : (
            <DataTableShell className="rounded-none border-0 shadow-none">
              <DataTableScrollRegion className="min-w-[700px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="hidden md:table-cell">Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Last Active</TableHead>
                      <TableHead className="hidden sm:table-cell">Joined</TableHead>
                      <TableHead className="w-[80px] text-right">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {u.name
                                .split(" ")
                                .map((w) => w[0])
                                .join("")}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium">{u.name}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${roleColors[u.role]}`}
                          >
                            {u.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[u.status]}>
                            {u.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground lg:table-cell">
                          {u.lastActive}
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground sm:table-cell">
                          {u.joined}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreHorizontal className="size-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Change role</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DataTableScrollRegion>
              <PaginationBar
                page={page}
                pageSize={pageSize}
                totalItems={filtered.length}
                onPageChange={setPage}
                onPageSizeChange={(n) => {
                  setPageSize(n);
                  setPage(1);
                }}
              />
            </DataTableShell>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
