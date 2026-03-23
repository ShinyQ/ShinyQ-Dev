"use client";

import { FoodItem } from "src/components/food/food-item";
import { Coffee, Sun, Sunset, Cookie, Trash2 } from "lucide-react";
import type { MealType, FoodEntry } from "src/lib/types";
import { cn } from "src/lib/utils";

interface MealCardProps {
  mealType: MealType;
  foods: FoodEntry[];
  totalCalories: number;
  deletingEntryId?: string | null;
  onDeleteFood?: (food: FoodEntry) => void;
}

const mealConfig: Record<
  MealType,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  breakfast: {
    label: "Breakfast",
    icon: Coffee,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  lunch: {
    label: "Lunch",
    icon: Sun,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  dinner: {
    label: "Dinner",
    icon: Sunset,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  snacks: {
    label: "Snacks",
    icon: Cookie,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
};

export function MealCard({
  mealType,
  foods,
  totalCalories,
  deletingEntryId,
  onDeleteFood,
}: MealCardProps) {
  const config = mealConfig[mealType];
  const Icon = config.icon;

  return (
    <div className="rounded-xl border border-zinc-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              config.bg
            )}
          >
            <Icon className={cn("h-[14px] w-[14px]", config.color)} />
          </div>
          <span className="text-sm font-semibold text-zinc-900">
            {config.label}
          </span>
        </div>
        <span className="text-xs font-semibold tabular-nums text-zinc-500">
          {totalCalories} cal
        </span>
      </div>

      {/* Content */}
      <div className="border-t border-zinc-50 px-4 py-2.5">
        {foods.length > 0 ? (
          <div className="divide-y divide-zinc-50">
            {foods.map((food) => (
              <div key={food.id} className="group flex items-center gap-1">
                <div className="flex-1">
                  <FoodItem food={food} compact />
                </div>
                {onDeleteFood && (
                  <button
                    type="button"
                    onClick={() => onDeleteFood(food)}
                    disabled={deletingEntryId === food.id}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 disabled:opacity-50"
                    title="Delete entry"
                  >
                    {deletingEntryId === food.id ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-[2px] border-red-400 border-t-transparent" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="py-3 text-center text-xs text-zinc-400">
            Nothing logged yet
          </p>
        )}
      </div>
    </div>
  );
}
