"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type TextareaListProps = {
  value: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  className?: string;
  disabled?: boolean;
};

export function TextareaList({
  value,
  onChange,
  placeholder = "Enter an item…",
  addLabel = "Add item",
  className,
  disabled,
}: TextareaListProps) {
  function updateItem(index: number, text: string) {
    const next = [...value];
    next[index] = text;
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function addItem() {
    onChange([...value, ""]);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {value.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <Input
            value={item}
            onChange={(e) => updateItem(idx, e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => removeItem(idx)}
            disabled={disabled}
            aria-label={`Remove item ${idx + 1}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={addItem}
        disabled={disabled}
      >
        <Plus className="size-3.5" />
        {addLabel}
      </Button>
    </div>
  );
}
