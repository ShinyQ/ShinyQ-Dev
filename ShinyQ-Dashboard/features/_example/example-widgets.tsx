"use client";

import { useMemo, useState } from "react";

import {
  DataTableScrollRegion,
  DataTableShell,
} from "@/components/data/data-table-shell";
import { PaginationBar } from "@/components/data/pagination-bar";
import { JobProgressPanel } from "@/components/feedback/job-progress-panel";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MOCK_TOTAL = 42;

export function ExampleWidgets() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const rows = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, MOCK_TOTAL);
    const list: { id: string; name: string; category: string }[] = [];
    const categories = ["Design", "Backend", "DevOps", "Frontend", "QA"];
    for (let i = start; i < end; i++) {
      list.push({
        id: String(i + 1).padStart(3, "0"),
        name: `Item ${i + 1}`,
        category: categories[i % categories.length],
      });
    }
    return list;
  }, [page, pageSize]);

  return (
    <div className="space-y-6 pb-10 pt-6">
      {/* Dialogs & menus */}
      <Card>
        <CardHeader>
          <CardTitle>Dialogs & Menus</CardTitle>
          <CardDescription>
            Interactive overlay patterns — dialogs, confirmations, and dropdown
            menus.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Example Dialog</DialogTitle>
                <DialogDescription>
                  Focus is trapped inside. Press Escape or click outside to
                  close.
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                Dialog content goes here. Use for forms, confirmations, or
                detailed views.
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="secondary">Confirm Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  selected item and remove it from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Dropdown</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Edit item</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Archive</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Badge showcase */}
          <div className="flex flex-wrap items-center gap-2 border-l border-border pl-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Error</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Paginated table */}
      <Card>
        <CardHeader>
          <CardTitle>Paginated Table</CardTitle>
          <CardDescription>
            Client-side pagination of {MOCK_TOTAL} items with configurable page
            sizes.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DataTableShell className="rounded-none border-0 shadow-none">
            <DataTableScrollRegion className="min-w-[520px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Tag</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs font-medium">
                        #{r.id}
                      </TableCell>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.category}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">
                          {r.category.toLowerCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DataTableScrollRegion>
            <PaginationBar
              page={page}
              pageSize={pageSize}
              totalItems={MOCK_TOTAL}
              onPageChange={setPage}
              onPageSizeChange={(n) => {
                setPageSize(n);
                setPage(1);
              }}
            />
          </DataTableShell>
        </CardContent>
      </Card>

      {/* Job progress */}
      <JobProgressPanel />
    </div>
  );
}
