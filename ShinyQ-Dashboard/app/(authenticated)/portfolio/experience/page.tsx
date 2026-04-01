"use client";

import { useState } from "react";

import { Plus } from "lucide-react";

import { PageContainer } from "@/components/dashboard/page-container";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { ExperienceDeleteDialog } from "@/features/portfolio/experience/experience-delete-dialog";
import { ExperienceFormDialog } from "@/features/portfolio/experience/experience-form-dialog";
import { ExperienceTable } from "@/features/portfolio/experience/experience-table";
import type { TimelineItem } from "@/lib/actions/portfolio/portfolio.types";

export default function ExperiencePage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<TimelineItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<TimelineItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  function handleEdit(item: TimelineItem) {
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
        title="Experience"
        description="Manage work experience, education, certifications, and achievements."
        actions={
          <Button onClick={handleCreate} className="gap-1.5">
            <Plus className="size-4" />
            Add Experience
          </Button>
        }
      />

      <ExperienceTable
        onEdit={handleEdit}
        onDelete={setDeleteItem}
        onCreate={handleCreate}
        refreshKey={refreshKey}
      />

      <ExperienceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        item={editItem}
        onSuccess={refresh}
      />

      <ExperienceDeleteDialog
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
