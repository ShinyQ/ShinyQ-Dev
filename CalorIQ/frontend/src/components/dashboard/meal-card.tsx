"use client";

import { FoodItem } from "src/components/food/food-item";
import { Coffee, Sun, Sunset, Cookie } from "lucide-react";
import type { MealType, FoodEntry } from "src/lib/types";
import { cn } from "src/lib/utils";

interface MealCardProps {
  mealType: MealType;
  foods: FoodEntry[];
  totalCalories: number;
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

export function MealCard({ mealType, foods, totalCalories }: MealCardProps) {
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
              <FoodItem key={food.id} food={food} compact />
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
