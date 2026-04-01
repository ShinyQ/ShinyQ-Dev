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
import { deleteTimelineAction } from "@/lib/actions/portfolio/portfolio.actions";
import type { TimelineItem } from "@/lib/actions/portfolio/portfolio.types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: TimelineItem | null;
  onSuccess: () => void;
};

export function ExperienceDeleteDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: Props) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!item) return;
    startTransition(async () => {
      const result = await deleteTimelineAction(item.slug);
      if (result.ok) {
        toast({
          title: "Experience deleted",
          description: `"${item.title}" has been removed.`,
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
          <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{" "}
            <span className="font-semibold text-foreground">
              &quot;{item?.title}&quot;
            </span>
            . This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? "Deleting…" : "Yes, delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
