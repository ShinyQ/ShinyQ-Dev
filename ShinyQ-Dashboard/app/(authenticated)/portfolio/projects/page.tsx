"use client";

import { useState } from "react";

import { Plus } from "lucide-react";

import { PageContainer } from "@/components/dashboard/page-container";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { ProjectDeleteDialog } from "@/features/portfolio/projects/project-delete-dialog";
import { ProjectFormDialog } from "@/features/portfolio/projects/project-form-dialog";
import { ProjectTable } from "@/features/portfolio/projects/project-table";
import type { Project } from "@/lib/actions/portfolio/portfolio.types";

export default function ProjectsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  function handleEdit(project: Project) {
    setEditProject(project);
    setFormOpen(true);
  }

  function handleCreate() {
    setEditProject(null);
    setFormOpen(true);
  }

  return (
    <PageContainer>
      <PageHeader
        title="Projects"
        description="Manage your portfolio projects — add, edit, or remove project showcases."
        actions={
          <Button onClick={handleCreate} className="gap-1.5">
            <Plus className="size-4" />
            Add Project
          </Button>
        }
      />

      <ProjectTable
        onEdit={handleEdit}
        onDelete={setDeleteProject}
        onCreate={handleCreate}
        refreshKey={refreshKey}
      />

      <ProjectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        project={editProject}
        onSuccess={refresh}
      />

      <ProjectDeleteDialog
        open={!!deleteProject}
        onOpenChange={(open) => {
          if (!open) setDeleteProject(null);
        }}
        project={deleteProject}
        onSuccess={refresh}
      />
    </PageContainer>
  );
}
