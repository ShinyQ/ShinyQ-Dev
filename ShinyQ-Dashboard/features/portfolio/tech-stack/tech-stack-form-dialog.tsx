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
import { toast } from "@/hooks/use-toast";
import {
  createTechItemAction,
  updateTechItemAction,
} from "@/lib/actions/portfolio/portfolio.actions";
import type { TechItem, TechItemFormData, TechStackType } from "@/lib/actions/portfolio/portfolio.types";
import { generateUploadUrlAction } from "@/lib/actions/storage/upload.actions";
import { Upload } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: TechItem | null;
  onSuccess: () => void;
};

const TECH_TYPES: TechStackType[] = ["backend", "frontend", "other"];

const emptyForm: TechItemFormData = {
  name: "",
  icon: "",
  type: "backend",
  site: "",
};

export function TechStackFormDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: Props) {
  const isEdit = !!item;
  const [form, setForm] = useState<TechItemFormData>(emptyForm);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setForm(item ? { ...emptyForm, ...item } : emptyForm);
    }
  }, [open, item]);

  function set<K extends keyof TechItemFormData>(key: K, val: TechItemFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleImageUpload(file: File) {
    toast({ title: "Uploading icon..." });
    try {
      const result = await generateUploadUrlAction(file.name, file.type, "icons");
      if (!result.ok) throw new Error(result.error.message);

      const { uploadUrl, finalKey } = result.data;
      const res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!res.ok) throw new Error("Failed pushing to storage");

      set("icon", finalKey);
      toast({ title: "Icon uploaded successfully", variant: "success" });
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      toast({ variant: "destructive", title: "Name is required" });
      return;
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateTechItemAction(item!.name, form)
        : await createTechItemAction(form);

      if (result.ok) {
        toast({
          title: isEdit ? "Tech item updated" : "Tech item created",
          description: `"${result.data.name}" has been saved.`,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Tech Item" : "Add Tech Item"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the technology details."
              : "Add a new technology to your stack."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="tech-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tech-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. React"
              disabled={isEdit}
            />
          </div>

          <div className="grid gap-2">
            <Label>Type</Label>
            <Select
              value={form.type ?? "other"}
              onValueChange={(val) => set("type", val as TechStackType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TECH_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tech-icon">Icon Path</Label>
            <div className="flex flex-1 gap-2">
              <Input
                id="tech-icon"
                value={form.icon}
                onChange={(e) => set("icon", e.target.value)}
                placeholder="/icons/react.webp"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                disabled={pending}
                onClick={() => document.getElementById("tech-icon-upload")?.click()}
              >
                <Upload className="size-4" />
              </Button>
              <input
                type="file"
                id="tech-icon-upload"
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

          <div className="grid gap-2">
            <Label htmlFor="tech-site">Website</Label>
            <Input
              id="tech-site"
              type="url"
              value={form.site ?? ""}
              onChange={(e) => set("site", e.target.value)}
              placeholder="https://react.dev/"
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
          <Button onClick={handleSubmit} disabled={pending}>
            {pending ? "Saving…" : isEdit ? "Save Changes" : "Add Tech"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
