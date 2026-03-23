"use client";

import type { FoodEntry, RecentFood } from "src/lib/types";
import { cn } from "src/lib/utils";

interface FoodItemProps {
  food: FoodEntry | RecentFood;
  compact?: boolean;
  onClick?: () => void;
}

export function FoodItem({ food, compact = false, onClick }: FoodItemProps) {
  const quantityText =
    "quantity_text" in food && food.quantity_text
      ? food.quantity_text
      : `${Math.round(food.serving_size_g)} g`;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 transition-colors",
        compact ? "py-2" : "rounded-xl border border-zinc-100 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        onClick && "cursor-pointer active:bg-zinc-50"
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate font-medium text-zinc-900",
            compact ? "text-[13px]" : "text-sm"
          )}
        >
          {food.name}
        </p>
        <p className="mt-0.5 text-[11px] text-zinc-500">{quantityText}</p>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] tabular-nums text-zinc-400">
          <span>
            P <span className="text-zinc-500">{food.protein_g}g</span>
          </span>
          <span className="text-zinc-200">|</span>
          <span>
            C <span className="text-zinc-500">{food.carbohydrates_total_g}g</span>
          </span>
          <span className="text-zinc-200">|</span>
          <span>
            F <span className="text-zinc-500">{food.fat_total_g}g</span>
          </span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <span
          className={cn(
            "font-semibold tabular-nums text-zinc-900",
            compact ? "text-[13px]" : "text-sm"
          )}
        >
          {food.calories}
        </span>
        <span className="ml-0.5 text-[11px] text-zinc-400">cal</span>
      </div>
    </div>
  );
}
