"use client";

import { useState } from "react";

import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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
import { listProjectsAction } from "@/lib/actions/portfolio/portfolio.actions";
import type { Project } from "@/lib/actions/portfolio/portfolio.types";
import { getImageUrl } from "@/lib/utils/image";

type Props = {
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onCreate: () => void;
  refreshKey: number;
};

export function ProjectTable({ onEdit, onDelete, onCreate, refreshKey }: Props) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const { items, total, page, pageSize, loading, setPage, setPageSize } =
    useTableData<Project, { search?: string }>({
      fetchAction: listProjectsAction,
      filters: { search: debouncedSearch || undefined },
      refreshKey,
      errorTitle: "Failed to load projects",
    });

  // ── Loading skeleton (first load only) ──────────────────────────────────
  if (loading && items.length === 0) {
    return (
      <div className="space-y-4">
        <TableToolbar>
          <TableToolbar.Search value={search} onChange={setSearch} placeholder="Search projects…" />
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

  // ── Empty state ─────────────────────────────────────────────────────────
  if (!loading && items.length === 0) {
    const hasFilters = !!debouncedSearch;
    return (
      <div className="space-y-4">
        <TableToolbar>
          <TableToolbar.Search value={search} onChange={setSearch} placeholder="Search projects…" />
        </TableToolbar>
        <DataTableShell>
          <DataTableEmptyState
            title={hasFilters ? "No projects found" : "No projects yet"}
            description={
              hasFilters
                ? "Try adjusting your search query."
                : "Create your first project to get started."
            }
            action={
              hasFilters
                ? { label: "Clear search", onClick: () => setSearch("") }
                : { label: "Add Project", onClick: onCreate }
            }
          />
        </DataTableShell>
      </div>
    );
  }

  // ── Table ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <TableToolbar>
        <TableToolbar.Search value={search} onChange={setSearch} placeholder="Search projects…" />
      </TableToolbar>

      <DataTableShell>
        <DataTableScrollRegion className="min-w-[700px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]"></TableHead>
                <TableHead className="w-[200px]">Title</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="hidden lg:table-cell">Tech Stack</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={loading ? "opacity-60" : undefined}>
              {items.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    {project.coverImage ? (
                      <img
                        src={getImageUrl(project.coverImage)}
                        alt="Cover"
                        className="size-10 object-cover rounded-md bg-muted border"
                      />
                    ) : (
                      <div className="size-10 rounded-md bg-muted/50 border flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">—</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{project.title}</span>
                      <span className="line-clamp-1 text-xs text-muted-foreground">
                        {project.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {project.role}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 2 ? (
                        <Badge variant="secondary" className="text-[10px]">
                          +{project.tags.length - 2}
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {project.techStack.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-[10px]">
                          {tech}
                        </Badge>
                      ))}
                      {project.techStack.length > 3 ? (
                        <Badge variant="outline" className="text-[10px]">
                          +{project.techStack.length - 3}
                        </Badge>
                      ) : null}
                    </div>
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
                        <DropdownMenuItem onClick={() => onEdit(project)}>
                          <Pencil className="mr-2 size-3.5" />
                          Edit
                        </DropdownMenuItem>
                        {project.liveUrl ? (
                          <DropdownMenuItem asChild>
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="mr-2 size-3.5" />
                              View Live
                            </a>
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onDelete(project)}
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
