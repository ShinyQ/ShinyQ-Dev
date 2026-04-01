"use client";

import type { ReactNode } from "react";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Root container
// ---------------------------------------------------------------------------

export function TableToolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Search sub-component
// ---------------------------------------------------------------------------

function TableSearch({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full pl-8 text-sm sm:w-[220px]"
      />
    </div>
  );
}

TableToolbar.Search = TableSearch;

// ---------------------------------------------------------------------------
// Filter pills sub-component
// ---------------------------------------------------------------------------

export interface FilterPillOption<V = string | null> {
  label: string;
  value: V;
}

function TableFilterPills<V extends string | null>({
  options,
  value,
  onChange,
  className,
}: {
  options: FilterPillOption<V>[];
  value: V;
  onChange: (value: V) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {options.map((opt) => (
        <Button
          key={opt.label}
          variant={value === opt.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}

TableToolbar.FilterPills = TableFilterPills;
