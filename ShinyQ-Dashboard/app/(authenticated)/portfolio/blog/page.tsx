"use client";

import { useState } from "react";
import Link from "next/link";

import { Plus } from "lucide-react";

import { PageContainer } from "@/components/dashboard/page-container";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { BlogDeleteDialog } from "@/features/portfolio/blog/blog-delete-dialog";
import { BlogTable } from "@/features/portfolio/blog/blog-table";
import type { BlogPost } from "@/lib/actions/portfolio/portfolio.types";

export default function BlogListPage() {
  const [deleteBlog, setDeleteBlog] = useState<BlogPost | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Blog Posts"
        description="Manage your markdown-based blog articles, drafts, and configurations."
        actions={
          <Button asChild className="gap-1.5">
            <Link href="/portfolio/blog/create">
              <Plus className="size-4" />
              Write Post
            </Link>
          </Button>
        }
      />

      <BlogTable onDelete={setDeleteBlog} refreshKey={refreshKey} />

      <BlogDeleteDialog
        open={!!deleteBlog}
        onOpenChange={(open) => {
          if (!open) setDeleteBlog(null);
        }}
        blog={deleteBlog}
        onSuccess={refresh}
      />
    </PageContainer>
  );
}
