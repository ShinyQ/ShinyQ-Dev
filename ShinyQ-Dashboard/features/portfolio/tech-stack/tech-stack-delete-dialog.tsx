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
import { deleteTechItemAction } from "@/lib/actions/portfolio/portfolio.actions";
import type { TechItem } from "@/lib/actions/portfolio/portfolio.types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: TechItem | null;
  onSuccess: () => void;
};

export function TechStackDeleteDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: Props) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!item) return;
    startTransition(async () => {
      const result = await deleteTechItemAction(item.name);
      if (result.ok) {
        toast({
          title: "Tech item deleted",
          description: `"${item.name}" has been removed.`,
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
          <AlertDialogTitle>Delete tech item?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove{" "}
            <span className="font-semibold text-foreground">
              &quot;{item?.name}&quot;
            </span>{" "}
            from your tech stack.
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
