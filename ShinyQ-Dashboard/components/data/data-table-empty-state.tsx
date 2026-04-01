import type { ReactNode } from "react";

import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DataTableEmptyState({
  title = "No data",
  description = "Try adjusting filters or create a new item.",
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  className?: string;
}) {
  let actionNode: ReactNode = null;
  if (action?.href) {
    actionNode = (
      <Button asChild variant="default" size="sm">
        <a href={action.href}>{action.label}</a>
      </Button>
    );
  } else if (action?.onClick) {
    actionNode = (
      <Button
        variant="default"
        size="sm"
        type="button"
        onClick={action.onClick}
      >
        {action.label}
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-20 text-center",
        className,
      )}
    >
      <div className="mb-4 rounded-full bg-muted p-4">
        <Inbox className="size-8 text-muted-foreground/60" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">
        {description}
      </p>
      {actionNode ? <div className="mt-4">{actionNode}</div> : null}
    </div>
  );
}
