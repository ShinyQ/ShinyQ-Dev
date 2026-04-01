"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import { ImagePlus, Loader2, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  addGalleryImageAction,
  deleteGalleryImageAction,
  listGalleryImagesAction,
  uploadGalleryImageAction,
} from "@/lib/actions/storage/gallery.actions";
import type { GalleryImage } from "@/lib/actions/portfolio/portfolio.types";
import { getImageUrl } from "@/lib/utils/image";

type Props = {
  /** The project ID (from DB). Required to manage gallery entries. */
  projectId: string;
  disabled?: boolean;
};

export function ProjectGalleryManager({ projectId, disabled }: Props) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, startLoading] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null);
  const [deleting, startDeleting] = useTransition();

  const fetchImages = useCallback(() => {
    if (!projectId) {
      setImages([]);
      return;
    }
    startLoading(async () => {
      const result = await listGalleryImagesAction(projectId);
      if (result.ok) {
        setImages(result.data);
      } else {
        toast({
          variant: "destructive",
          title: "Failed to load gallery",
          description: result.error.message,
        });
      }
    });
  }, [projectId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    e.target.value = "";

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
      try {
        // 1. Get presigned upload URL
        const urlResult = await uploadGalleryImageAction(
          projectId,
          file.name,
          file.type,
        );
        if (!urlResult.ok) throw new Error(urlResult.error.message);

        // 2. Upload file to R2
        const res = await fetch(urlResult.data.uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!res.ok) throw new Error("Upload to storage failed");

        // 3. Register in DB
        const addResult = await addGalleryImageAction(projectId, urlResult.data.finalKey);
        if (!addResult.ok) throw new Error(addResult.error.message);

        successCount++;
      } catch {
        failCount++;
      }
    }

    setUploading(false);

    if (successCount > 0) {
      toast({
        title: `${successCount} image${successCount > 1 ? "s" : ""} uploaded`,
        variant: "success",
      });
    }
    if (failCount > 0) {
      toast({
        title: `${failCount} upload${failCount > 1 ? "s" : ""} failed`,
        variant: "destructive",
      });
    }

    fetchImages();
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startDeleting(async () => {
      const result = await deleteGalleryImageAction(projectId, deleteTarget.id);
      if (result.ok) {
        toast({
          title: "Image deleted",
          description: deleteTarget.image_key.split("/").pop(),
          variant: "success",
        });
        setDeleteTarget(null);
        fetchImages();
      } else {
        toast({
          variant: "destructive",
          title: "Delete failed",
          description: result.error.message,
        });
      }
    });
  }

  if (!projectId) {
    return (
      <div className="flex h-24 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        Save the project first to manage gallery images.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Loading gallery…"
            : `${images.length} image${images.length !== 1 ? "s" : ""} in gallery`}
        </p>
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={disabled || uploading}
            onClick={() =>
              document.getElementById("gallery-upload-input")?.click()
            }
          >
            {uploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ImagePlus className="size-3.5" />
            )}
            {uploading ? "Uploading…" : "Add Images"}
          </Button>
          <input
            type="file"
            id="gallery-upload-input"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleUpload}
          />
        </div>
      </div>

      {/* Image grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video animate-pulse rounded-md bg-muted"
            />
          ))}
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-video overflow-hidden rounded-md border bg-muted"
            >
              <img
                src={getImageUrl(img.image_key)}
                alt={img.image_key.split("/").pop() ?? "Gallery image"}
                className="size-full object-cover"
              />
              <button
                type="button"
                className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-destructive/90 text-white opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => setDeleteTarget(img)}
                disabled={disabled}
                title="Delete image"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-24 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          No images yet — click &ldquo;Add Images&rdquo; to upload.
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete gallery image?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold text-foreground">
                &quot;{deleteTarget?.image_key.split("/").pop()}&quot;
              </span>{" "}
              from the gallery. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
