"use client";

import { useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  createProjectAction,
  updateProjectAction,
} from "@/lib/actions/portfolio/portfolio.actions";
import { ProjectGalleryManager } from "@/features/portfolio/projects/project-gallery-manager";
import type { Project, ProjectFormData } from "@/lib/actions/portfolio/portfolio.types";
import { generateUploadUrlAction } from "@/lib/actions/storage/upload.actions";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { getImageUrl } from "@/lib/utils/image";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSuccess: () => void;
};

const emptyForm: ProjectFormData = {
  title: "",
  description: "",
  coverImage: "",
  tags: [],
  role: "",
  techStack: [],
  githubUrl: "",
  liveUrl: "",
  docUrl: "",
  docPpt: "",
};

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onSuccess,
}: Props) {
  const isEdit = !!project;
  const [form, setForm] = useState<ProjectFormData>(emptyForm);
  const [pending, startTransition] = useTransition();
  const [coverUploading, setCoverUploading] = useState(false);

  useEffect(() => {
    if (open) {
      if (project) {
        setForm({
          ...emptyForm,
          title: project.title,
          description: project.description,
          coverImage: project.coverImage,
          tags: project.tags,
          role: project.role,
          techStack: project.techStack,
          githubUrl: project.githubUrl,
          liveUrl: project.liveUrl,
          docUrl: project.docUrl,
          docPpt: project.docPpt,
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, project]);

  function set<K extends keyof ProjectFormData>(key: K, val: ProjectFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleImageUpload(file: File) {
    setCoverUploading(true);
    try {
      const result = await generateUploadUrlAction(file.name, file.type, "projects");
      if (!result.ok) throw new Error(result.error.message);

      const { uploadUrl, finalKey } = result.data;
      const res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!res.ok) throw new Error("Failed pushing to storage");

      set("coverImage", finalKey);
      toast({ title: "Cover image updated", variant: "success" });
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setCoverUploading(false);
    }
  }

  function handleSubmit() {
    if (!form.title.trim()) {
      toast({ variant: "destructive", title: "Title is required" });
      return;
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateProjectAction(project!.id, form)
        : await createProjectAction(form);

      if (result.ok) {
        toast({
          title: isEdit ? "Project updated" : "Project created",
          description: `"${result.data.title}" has been saved.`,
          variant: "success",
        });
        onOpenChange(false);
        onSuccess();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error.message,
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Project" : "Add New Project"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the project details below."
              : "Fill in the details for a new project."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="project-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="project-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Project name"
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the project…"
              rows={4}
            />
          </div>

          {/* Role */}
          <div className="grid gap-2">
            <Label htmlFor="project-role">Role</Label>
            <Input
              id="project-role"
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              placeholder="e.g. Full Stack Developer"
            />
          </div>

          {/* Cover Image */}
          <div className="grid gap-2">
            <Label>Cover Image</Label>
            {form.coverImage ? (
              <div className="group relative h-44 w-full overflow-hidden rounded-lg border bg-muted">
                <img
                  src={getImageUrl(form.coverImage)}
                  alt="Cover"
                  className="size-full object-cover"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="gap-1.5"
                    disabled={pending || coverUploading}
                    onClick={() => document.getElementById("project-cover-upload")?.click()}
                  >
                    {coverUploading ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Upload className="size-3.5" />
                    )}
                    {coverUploading ? "Uploading…" : "Replace"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="gap-1.5"
                    disabled={pending || coverUploading}
                    onClick={() => set("coverImage", "")}
                  >
                    <Trash2 className="size-3.5" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="flex h-44 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={pending || coverUploading}
                onClick={() => document.getElementById("project-cover-upload")?.click()}
              >
                {coverUploading ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <ImageIcon className="size-6" />
                )}
                <span>{coverUploading ? "Uploading…" : "Click to upload cover image"}</span>
              </button>
            )}
            <input
              type="file"
              id="project-cover-upload"
              className="hidden"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) await handleImageUpload(file);
                e.target.value = "";
              }}
            />
          </div>

          {/* Tags */}
          <div className="grid gap-2">
            <Label>Tags</Label>
            <TagInput
              value={form.tags}
              onChange={(tags) => set("tags", tags)}
              placeholder="Add tag and press Enter…"
            />
          </div>

          {/* Tech Stack */}
          <div className="grid gap-2">
            <Label>Tech Stack</Label>
            <TagInput
              value={form.techStack}
              onChange={(stack) => set("techStack", stack)}
              placeholder="Add technology and press Enter…"
            />
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="project-github">GitHub URL</Label>
              <Input
                id="project-github"
                type="url"
                value={form.githubUrl}
                onChange={(e) => set("githubUrl", e.target.value)}
                placeholder="https://github.com/…"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-live">Live URL</Label>
              <Input
                id="project-live"
                type="url"
                value={form.liveUrl}
                onChange={(e) => set("liveUrl", e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-doc">Documentation URL</Label>
              <Input
                id="project-doc"
                type="url"
                value={form.docUrl}
                onChange={(e) => set("docUrl", e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-docppt">Presentation URL</Label>
              <Input
                id="project-docppt"
                type="url"
                value={form.docPpt}
                onChange={(e) => set("docPpt", e.target.value)}
                placeholder="https://…"
              />
            </div>
          </div>

          {/* Gallery Manager */}
          <div className="grid gap-2">
            <Label>Gallery Images</Label>
            <ProjectGalleryManager
              projectId={isEdit ? project!.id : ""}
              disabled={pending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button className="mb-3" onClick={handleSubmit} disabled={pending}>
            {pending
              ? "Saving…"
              : isEdit
                ? "Save Changes"
                : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
