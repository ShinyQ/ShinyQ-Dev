"use client";

import { useState } from "react";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { useTableData } from "@/hooks/use-table-data";
import { listTechStackAction } from "@/lib/actions/portfolio/portfolio.actions";
import type { TechItem } from "@/lib/actions/portfolio/portfolio.types";
import { getImageUrl } from "@/lib/utils/image";

const typeVariant: Record<string, "default" | "secondary" | "outline"> = {
  backend: "default",
  frontend: "secondary",
  other: "outline",
};

type Props = {
  onEdit: (item: TechItem) => void;
  onDelete: (item: TechItem) => void;
  onCreate: () => void;
  refreshKey: number;
};

export function TechStackTable({ onEdit, onDelete, onCreate, refreshKey }: Props) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const { items, total, page, pageSize, loading, setPage, setPageSize } =
    useTableData<TechItem, { search?: string }>({
      fetchAction: listTechStackAction,
      filters: { search: debouncedSearch || undefined },
      refreshKey,
      errorTitle: "Failed to load tech stack",
    });

  if (loading && items.length === 0) {
    return (
      <div className="space-y-4">
        <TableToolbar>
          <TableToolbar.Search value={search} onChange={setSearch} placeholder="Search tech stack…" />
        </TableToolbar>
        <DataTableShell>
          <div className="space-y-3 p-6">
            {Array.from({ length: pageSize }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </DataTableShell>
      </div>
    );
  }

  if (!loading && items.length === 0) {
    const hasFilters = !!debouncedSearch;
    return (
      <div className="space-y-4">
        <TableToolbar>
          <TableToolbar.Search value={search} onChange={setSearch} placeholder="Search tech stack…" />
        </TableToolbar>
        <DataTableShell>
          <DataTableEmptyState
            title={hasFilters ? "No tech found" : "No tech stack yet"}
            description={
              hasFilters
                ? "Try adjusting your search query."
                : "Add your first technology to get started."
            }
            action={
              hasFilters
                ? { label: "Clear search", onClick: () => setSearch("") }
                : { label: "Add Technology", onClick: onCreate }
            }
          />
        </DataTableShell>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TableToolbar>
        <TableToolbar.Search value={search} onChange={setSearch} placeholder="Search tech stack…" />
      </TableToolbar>

      <DataTableShell>
        <DataTableScrollRegion className="min-w-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]"></TableHead>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden lg:table-cell">Website</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={loading ? "opacity-60" : undefined}>
              {items.map((item) => (
                <TableRow key={item.name}>
                  <TableCell>
                    {item.icon ? (
                      <img
                        src={getImageUrl(item.icon)}
                        alt={item.name}
                        className="size-8 object-contain"
                      />
                    ) : (
                      <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-xs font-medium">{item.name[0]}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    {item.type ? (
                      <Badge variant={typeVariant[item.type] ?? "outline"}>
                        {item.type}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {item.site ? (
                      <a
                        href={item.site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {new URL(item.site).hostname}
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
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
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                          <Pencil className="mr-2 size-3.5" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onDelete(item)}
                        >
                          <Trash2 className="mr-2 size-3.5" />
                          Delete
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
          totalItems={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </DataTableShell>
    </div>
  );
}
