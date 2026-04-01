"use client";

import { useState } from "react";
import Link from "next/link";

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
import { listBlogsAction } from "@/lib/actions/portfolio/portfolio.actions";
import type { BlogPost } from "@/lib/actions/portfolio/portfolio.types";
import { getImageUrl } from "@/lib/utils/image";

type Props = {
  onDelete: (blog: BlogPost) => void;
  refreshKey: number;
};

export function BlogTable({ onDelete, refreshKey }: Props) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const { items, total, page, pageSize, loading, setPage, setPageSize } =
    useTableData<BlogPost, { search?: string }>({
      fetchAction: listBlogsAction,
      filters: { search: debouncedSearch || undefined },
      refreshKey,
      errorTitle: "Failed to load blogs",
    });

  if (loading && items.length === 0) {
    return (
      <div className="space-y-4">
        <TableToolbar>
          <TableToolbar.Search value={search} onChange={setSearch} placeholder="Search blog posts…" />
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
          <TableToolbar.Search value={search} onChange={setSearch} placeholder="Search blog posts…" />
        </TableToolbar>
        <DataTableShell>
          <DataTableEmptyState
            title={hasFilters ? "No posts found" : "No blog posts yet"}
            description={
              hasFilters
                ? "Try adjusting your search query."
                : "Create your first blog post to get started."
            }
            action={
              hasFilters
                ? { label: "Clear search", onClick: () => setSearch("") }
                : { label: "New Post", href: "/portfolio/blog/create" }
            }
          />
        </DataTableShell>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TableToolbar>
        <TableToolbar.Search value={search} onChange={setSearch} placeholder="Search blog posts…" />
      </TableToolbar>

      <DataTableShell>
        <DataTableScrollRegion className="min-w-[700px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]"></TableHead>
                <TableHead className="w-[300px]">Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden lg:table-cell">Author</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="w-[80px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={loading ? "opacity-60" : undefined}>
              {items.map((blog) => (
                <TableRow key={blog.slug}>
                  <TableCell>
                    {blog.coverImage ? (
                      <img
                        src={getImageUrl(blog.coverImage)}
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
                      <span className="font-medium">{blog.title}</span>
                      <span className="line-clamp-1 text-xs text-muted-foreground">
                        /{blog.slug}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{blog.category}</Badge>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                    {blog.date}
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {blog.author}
                  </TableCell>
                  <TableCell>
                    {blog.featured ? (
                      <Badge variant="success">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
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
                        <DropdownMenuItem asChild>
                          <Link href={`/portfolio/blog/${blog.slug}`}>
                            <Pencil className="mr-2 size-3.5" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onDelete(blog)}
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
