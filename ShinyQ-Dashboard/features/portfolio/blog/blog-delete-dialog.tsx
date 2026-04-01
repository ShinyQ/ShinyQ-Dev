"use client";

import { useTransition } from "react";

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
import { toast } from "@/hooks/use-toast";
import { deleteBlogAction } from "@/lib/actions/portfolio/portfolio.actions";
import type { BlogPost } from "@/lib/actions/portfolio/portfolio.types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blog: BlogPost | null;
  onSuccess: () => void;
};

export function BlogDeleteDialog({
  open,
  onOpenChange,
  blog,
  onSuccess,
}: Props) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!blog) return;
    startTransition(async () => {
      const result = await deleteBlogAction(blog.slug);
      if (result.ok) {
        toast({
          title: "Blog post deleted",
          description: `"${blog.title}" has been permanently removed.`,
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete blog post?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the post{" "}
            <span className="font-semibold text-foreground">
              &quot;{blog?.title}&quot;
            </span>
            . This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? "Deleting…" : "Yes, delete post"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
