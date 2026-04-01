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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "@/components/ui/tag-input";
import { TextareaList } from "@/components/ui/textarea-list";
import { toast } from "@/hooks/use-toast";
import {
  createTimelineAction,
  updateTimelineAction,
} from "@/lib/actions/portfolio/portfolio.actions";
import type {
  TimelineFormData,
  TimelineItem,
  TimelineType,
} from "@/lib/actions/portfolio/portfolio.types";
import { generateUploadUrlAction } from "@/lib/actions/storage/upload.actions";
import { Upload } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: TimelineItem | null;
  onSuccess: () => void;
};

const TIMELINE_TYPES: TimelineType[] = [
  "Full-Time",
  "Part-Time",
  "Education",
  "Certification",
  "Competition",
];

const emptyForm: TimelineFormData = {
  startDate: "",
  endDate: "",
  title: "",
  subtitle: "",
  caption: "",
  description: [],
  tools: [],
  logo: "",
  type: "Full-Time",
};

export function ExperienceFormDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: Props) {
  const isEdit = !!item;
  const [form, setForm] = useState<TimelineFormData>(emptyForm);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      if (item) {
        setForm({
          ...emptyForm,
          startDate: item.startDate,
          endDate: item.endDate,
          title: item.title,
          subtitle: item.subtitle,
          caption: item.caption,
          description: item.description,
          tools: item.tools,
          logo: item.logo,
          type: item.type,
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, item]);

  function set<K extends keyof TimelineFormData>(key: K, val: TimelineFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleImageUpload(file: File) {
    toast({ title: "Uploading image..." });
    try {
      const result = await generateUploadUrlAction(file.name, file.type, "company");
      if (!result.ok) throw new Error(result.error.message);

      const { uploadUrl, finalKey } = result.data;
      const res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!res.ok) throw new Error("Failed pushing to storage");

      set("logo", finalKey);
      toast({ title: "Image uploaded successfully", variant: "success" });
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  }

  function handleSubmit() {
    if (!form.title.trim()) {
      toast({ variant: "destructive", title: "Title is required" });
      return;
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateTimelineAction(item!.slug, form)
        : await createTimelineAction(form);

      if (result.ok) {
        toast({
          title: isEdit ? "Experience updated" : "Experience created",
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
            {isEdit ? "Edit Experience" : "Add Experience"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the experience details below."
              : "Add a new experience, education, or achievement."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Type */}
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select
              value={form.type}
              onValueChange={(val) => set("type", val as TimelineType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMELINE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="exp-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="exp-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Company or institution name"
            />
          </div>

          {/* Subtitle */}
          <div className="grid gap-2">
            <Label htmlFor="exp-subtitle">Subtitle</Label>
            <Input
              id="exp-subtitle"
              value={form.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              placeholder="Job title, degree, or achievement"
            />
          </div>

          {/* Caption */}
          <div className="grid gap-2">
            <Label htmlFor="exp-caption">Caption</Label>
            <Input
              id="exp-caption"
              value={form.caption ?? ""}
              onChange={(e) => set("caption", e.target.value)}
              placeholder="Short context (e.g. organized by…)"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="exp-start">Start Date</Label>
              <Input
                id="exp-start"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                placeholder="YYYY-MM"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="exp-end">End Date</Label>
              <Input
                id="exp-end"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                placeholder="YYYY-MM or Present"
              />
            </div>
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label>Description / Bullet Points</Label>
            <TextareaList
              value={form.description ?? []}
              onChange={(desc) => set("description", desc)}
              placeholder="Describe an achievement…"
              addLabel="Add bullet point"
            />
          </div>

          {/* Tools */}
          <div className="grid gap-2">
            <Label>Tools & Technologies</Label>
            <TagInput
              value={form.tools ?? []}
              onChange={(tools) => set("tools", tools)}
              placeholder="Add tool and press Enter…"
            />
          </div>

          {/* Logo */}
          <div className="grid gap-2">
            <Label htmlFor="exp-logo">Logo Path</Label>
            <div className="flex flex-1 gap-2">
              <Input
                id="exp-logo"
                value={form.logo ?? ""}
                onChange={(e) => set("logo", e.target.value)}
                placeholder="/company/logo.png"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                disabled={pending}
                onClick={() => document.getElementById("exp-logo-upload")?.click()}
              >
                <Upload className="size-4" />
              </Button>
              <input
                type="file"
                id="exp-logo-upload"
                className="hidden"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    await handleImageUpload(file);
                  }
                }}
              />
            </div>
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
          <Button onClick={handleSubmit} disabled={pending}>
            {pending ? "Saving…" : isEdit ? "Save Changes" : "Add Experience"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
