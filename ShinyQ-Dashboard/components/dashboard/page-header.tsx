import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type PageHeaderProps = {
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  className?: string;
};

const titleSize = {
  sm: "text-lg md:text-xl font-semibold tracking-tight",
  md: "text-xl md:text-2xl font-semibold tracking-tight",
  lg: "text-2xl md:text-3xl font-semibold tracking-tight",
} as const;

export function PageHeader({
  title,
  description,
  size = "md",
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 pb-6 pt-6 sm:flex-row sm:items-center sm:justify-between md:pt-8",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        {breadcrumbs}
        <h1 className={cn("text-foreground", titleSize[size])}>{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
    </div>
  );
}
