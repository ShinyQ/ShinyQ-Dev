"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "src/components/ui/button";
import { ConfirmDialog } from "src/components/common/confirm-dialog";
import { CalorieRing } from "src/components/dashboard/calorie-ring";
import { MealCard } from "src/components/dashboard/meal-card";
import { FoodItem } from "src/components/food/food-item";
import { api } from "src/lib/api";
import type {
  DailySummary,
  RecentFood,
  MealType,
  FoodEntry,
  UserProfile,
} from "src/lib/types";
import { toast } from "sonner";

const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snacks"];

export default function DashboardPage() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [recentFoods, setRecentFoods] = useState<RecentFood[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<FoodEntry | null>(null);

  const fetchData = useCallback(async () => {
    setLoadError(null);
    try {
      const [summaryData, recentData] = await Promise.allSettled([
        api.getDailySummary(),
        api.getRecentFoods(5),
      ]);
      const userData = await api.getMe().catch(() => null);
      setUser(userData);

      if (summaryData.status === "fulfilled") {
        setSummary(summaryData.value);
      } else {
        setSummary(null);
        setLoadError("Unable to load daily summary.");
      }

      if (recentData.status === "fulfilled") {
        setRecentFoods(recentData.value);
      } else {
        setRecentFoods([]);
        setLoadError((prev) => prev ?? "Unable to load recent foods.");
      }
    } catch {
      setSummary(null);
      setRecentFoods([]);
      setLoadError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (loadError) {
      toast.error(loadError);
    }
  }, [loadError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-orange-500 border-t-transparent" />
      </div>
    );
  }

  const today = format(new Date(), "EEEE, MMMM d");
  const consumed = Math.round(summary?.totals?.calories ?? 0);
  const profileTarget = user?.profile?.daily_calorie_target;
  const profileReady = Boolean(
    user?.profile?.weight_kg &&
      user?.profile?.height_cm &&
      user?.profile?.age &&
      user?.profile?.gender &&
      user?.profile?.activity_level &&
      user?.profile?.goal &&
      user?.profile?.daily_calorie_target
  );
  const targetFromSummary = summary?.calorie_target;
  const target =
    targetFromSummary === 2000 && profileTarget && profileTarget !== 2000
      ? profileTarget
      : (targetFromSummary ?? profileTarget ?? 2000);
  const confirmDeleteOpen = Boolean(pendingDelete);

  const requestDelete = (food: FoodEntry) => {
    setPendingDelete(food);
  };

  const closeDeleteConfirm = (open: boolean) => {
    if (!open) setPendingDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeletingEntry(pendingDelete.id);
    try {
      await api.deleteFoodEntry(pendingDelete.id);
      await fetchData();
      toast.success("Entry deleted");
      setPendingDelete(null);
    } catch {
      toast.error("Failed to delete entry");
    } finally {
      setDeletingEntry(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">Today</h1>
        <p className="text-[13px] text-zinc-400">{today}</p>
      </div>

      {!profileReady && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-medium text-amber-900">
            Complete your profile to unlock accurate targets
          </p>
          <p className="mt-1 text-xs text-amber-800/80">
            Calorie target and logging rules depend on your profile.
          </p>
          <Link
            href="/profile"
            className="mt-2 inline-block text-xs font-semibold text-amber-900 underline underline-offset-2"
          >
            Go to Profile
          </Link>
        </div>
      )}

      {/* Calorie Ring */}
      <CalorieRing consumed={consumed} target={target} />

      {/* Macros */}
      {summary && (
        <div className="grid grid-cols-3 gap-2.5">
          <MacroCard
            label="Protein"
            value={Math.round(summary.totals.protein_g)}
            color="bg-blue-500"
          />
          <MacroCard
            label="Carbs"
            value={Math.round(summary.totals.carbohydrates_total_g)}
            color="bg-amber-500"
          />
          <MacroCard
            label="Fat"
            value={Math.round(summary.totals.fat_total_g)}
            color="bg-rose-400"
          />
        </div>
      )}

      {/* Meals */}
      <section className="space-y-2.5">
        <h2 className="text-sm font-semibold text-zinc-900">Meals</h2>
        {MEAL_ORDER.map((mealType) => {
          const foods = summary?.meals?.[mealType] ?? [];
          const mealCalories = Math.round(
            foods.reduce((sum, f) => sum + (f.calories ?? 0), 0)
          );
          return (
            <MealCard
              key={mealType}
              mealType={mealType}
              foods={foods}
              totalCalories={mealCalories}
              deletingEntryId={deletingEntry}
              onDeleteFood={requestDelete}
            />
          );
        })}
      </section>

      {/* Recent Foods */}
      {recentFoods.length > 0 && (
        <section className="space-y-2.5">
          <h2 className="text-sm font-semibold text-zinc-900">Recent</h2>
          <div className="space-y-2">
            {recentFoods.map((food) => (
              <FoodItem key={food.id} food={food} />
            ))}
          </div>
        </section>
      )}

      {/* FAB */}
      <Link href="/log" className="fixed bottom-[76px] right-5 z-40">
        <Button
          size="icon"
          className="h-12 w-12 rounded-xl bg-orange-500 shadow-lg shadow-orange-500/25 hover:bg-orange-600 active:bg-orange-700 hover:shadow-xl transition-all"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </Link>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={closeDeleteConfirm}
        title="Delete meal entry?"
        description={
          pendingDelete
            ? `"${pendingDelete.name}" will be removed from your daily log.`
            : "This entry will be removed from your daily log."
        }
        confirmLabel="Delete"
        loading={Boolean(deletingEntry)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function MacroCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="mb-1 flex items-center gap-1.5">
        <div className={`h-1.5 w-1.5 rounded-full ${color}`} />
        <span className="text-[11px] font-medium text-zinc-400">{label}</span>
      </div>
      <span className="text-base font-bold tabular-nums text-zinc-900">
        {value}
        <span className="text-[11px] font-normal text-zinc-400 ml-0.5">g</span>
      </span>
    </div>
  );
}
