"use client";

import { useState } from "react";

import { Plus } from "lucide-react";

import { PageContainer } from "@/components/dashboard/page-container";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { TechStackDeleteDialog } from "@/features/portfolio/tech-stack/tech-stack-delete-dialog";
import { TechStackFormDialog } from "@/features/portfolio/tech-stack/tech-stack-form-dialog";
import { TechStackTable } from "@/features/portfolio/tech-stack/tech-stack-table";
import type { TechItem } from "@/lib/actions/portfolio/portfolio.types";

export default function TechStackPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<TechItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<TechItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  function handleEdit(item: TechItem) {
    setEditItem(item);
    setFormOpen(true);
  }

  function handleCreate() {
    setEditItem(null);
    setFormOpen(true);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Tech Stack"
        description="Manage the technologies displayed on your portfolio."
        actions={
          <Button onClick={handleCreate} className="gap-1.5">
            <Plus className="size-4" />
            Add Technology
          </Button>
        }
      />

      <TechStackTable
        onEdit={handleEdit}
        onDelete={setDeleteItem}
        onCreate={handleCreate}
        refreshKey={refreshKey}
      />

      <TechStackFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        item={editItem}
        onSuccess={refresh}
      />

      <TechStackDeleteDialog
        open={!!deleteItem}
        onOpenChange={(open) => {
          if (!open) setDeleteItem(null);
        }}
        item={deleteItem}
        onSuccess={refresh}
      />
    </PageContainer>
  );
}
