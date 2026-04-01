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
import type { FilterPillOption } from "@/components/data/table-toolbar";
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
import { listTimelineAction } from "@/lib/actions/portfolio/portfolio.actions";
import type { TimelineItem, TimelineType } from "@/lib/actions/portfolio/portfolio.types";
import { getImageUrl } from "@/lib/utils/image";

const TYPE_FILTERS: FilterPillOption<string | null>[] = [
  { label: "All", value: null },
  { label: "Full-Time", value: "Full-Time" },
  { label: "Part-Time", value: "Part-Time" },
  { label: "Education", value: "Education" },
  { label: "Certification", value: "Certification" },
  { label: "Competition", value: "Competition" },
];

const typeVariant: Record<TimelineType, "default" | "secondary" | "success" | "warning" | "outline"> = {
  "Full-Time": "default",
  "Part-Time": "secondary",
  Education: "success",
  Certification: "warning",
  Competition: "outline",
};

type Props = {
  onEdit: (item: TimelineItem) => void;
  onDelete: (item: TimelineItem) => void;
  onCreate: () => void;
  refreshKey: number;
};

export function ExperienceTable({ onEdit, onDelete, onCreate, refreshKey }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search);

  const { items, total, page, pageSize, loading, setPage, setPageSize } =
    useTableData<TimelineItem, { search?: string; type?: string }>({
      fetchAction: listTimelineAction,
      filters: {
        search: debouncedSearch || undefined,
        type: typeFilter ?? undefined,
      },
      refreshKey,
      errorTitle: "Failed to load experience",
    });

  // ── Toolbar (always visible) ────────────────────────────────────────────
  const toolbar = (
    <TableToolbar>
      <TableToolbar.Search value={search} onChange={setSearch} placeholder="Search experience…" />
      <TableToolbar.FilterPills
        options={TYPE_FILTERS}
        value={typeFilter}
        onChange={setTypeFilter}
      />
    </TableToolbar>
  );

  if (loading && items.length === 0) {
    return (
      <div className="space-y-4">
        {toolbar}
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
    const hasFilters = !!debouncedSearch || !!typeFilter;
    return (
      <div className="space-y-4">
        {toolbar}
        <DataTableShell>
          <DataTableEmptyState
            title={hasFilters ? "No experience found" : "No experience yet"}
            description={
              hasFilters
                ? "Try adjusting your search or filter."
                : "Add your first experience entry to get started."
            }
            action={
              hasFilters
                ? {
                    label: "Clear filters",
                    onClick: () => {
                      setSearch("");
                      setTypeFilter(null);
                    },
                  }
                : { label: "Add Experience", onClick: onCreate }
            }
          />
        </DataTableShell>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {toolbar}

      <DataTableShell>
        <DataTableScrollRegion className="min-w-[700px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]"></TableHead>
                <TableHead className="w-[250px]">Title</TableHead>
                <TableHead>Subtitle</TableHead>
                <TableHead className="hidden md:table-cell">Date Range</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={loading ? "opacity-60" : undefined}>
              {items.map((item) => (
                <TableRow key={item.slug}>
                  <TableCell>
                    {item.logo ? (
                      <img
                        src={getImageUrl(item.logo)}
                        alt="Logo"
                        className="size-10 object-contain rounded-md bg-white p-1 border"
                      />
                    ) : (
                      <div className="size-10 rounded-md bg-muted/50 border flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">—</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{item.title}</span>
                      {item.caption ? (
                        <span className="line-clamp-1 text-xs text-muted-foreground">
                          {item.caption}
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.subtitle}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {item.startDate} — {item.endDate}
                  </TableCell>
                  <TableCell>
                    <Badge variant={typeVariant[item.type]}>{item.type}</Badge>
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
