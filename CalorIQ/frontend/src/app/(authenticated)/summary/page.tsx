"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  format,
  addDays,
  subDays,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday as isDateToday,
  isFuture,
} from "date-fns";
import { ChevronLeft, ChevronRight, Flame, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "src/components/ui/button";
import { Progress } from "src/components/ui/progress";
import { FoodItem } from "src/components/food/food-item";
import { ConfirmDialog } from "src/components/common/confirm-dialog";
import { api } from "src/lib/api";
import type { DailySummary, MealType, UserProfile } from "src/lib/types";
import { cn } from "src/lib/utils";
import { toast } from "sonner";

type ViewMode = "daily" | "weekly" | "monthly";

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};
const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snacks"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SummaryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dailyCache, setDailyCache] = useState<Record<string, DailySummary>>({});
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<string | null>(null);
  const [pendingDeleteEntryId, setPendingDeleteEntryId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fetch a single day's summary
  const fetchDay = useCallback(async (dateStr: string): Promise<DailySummary> => {
    return api.getDailySummary(dateStr);
  }, []);

  // Fetch a date range using batch endpoint
  const fetchRange = useCallback(
    async (start: string, end: string) => {
      try {
        const data = await api.getDateRangeSummaries(start, end);
        setDailyCache((prev) => ({ ...prev, ...data }));
      } catch {
        setLoadError("Unable to load summary range.");
      }
    },
    []
  );

  // Fetch and cache a single day
  const fetchAndCache = useCallback(
    async (dateStr: string) => {
      if (dailyCache[dateStr]) return dailyCache[dateStr];
      try {
        const data = await fetchDay(dateStr);
        setDailyCache((prev) => ({ ...prev, [dateStr]: data }));
        return data;
      } catch {
        setLoadError("Unable to load summary data.");
        return null;
      }
    },
    [dailyCache, fetchDay]
  );

  // Selected day summary
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const summary = dailyCache[selectedDateStr] ?? null;

  // Load selected date
  useEffect(() => {
    setLoading(true);
    fetchAndCache(selectedDateStr).finally(() => setLoading(false));
  }, [selectedDateStr]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loadError) {
      toast.error(loadError);
    }
  }, [loadError]);

  useEffect(() => {
    let mounted = true;
    api
      .getMe()
      .then((data) => {
        if (mounted) setUser(data);
      })
      .catch(() => {
        if (mounted) setUser(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Batch-fetch visible range for calendar/weekly views
  useEffect(() => {
    if (viewMode === "daily") return;

    const today = new Date();
    let start: Date, end: Date;

    if (viewMode === "weekly") {
      start = startOfWeek(selectedDate, { weekStartsOn: 0 });
      end = endOfWeek(selectedDate, { weekStartsOn: 0 });
    } else {
      start = startOfMonth(currentMonth);
      end = endOfMonth(currentMonth);
    }

    // Don't fetch future dates
    if (isFuture(start)) return;
    if (isFuture(end)) end = today;

    const startStr = format(start, "yyyy-MM-dd");
    const endStr = format(end, "yyyy-MM-dd");

    // Check if we already have all days cached
    const days = eachDayOfInterval({ start, end });
    const allCached = days.every(
      (d) => isFuture(d) || dailyCache[format(d, "yyyy-MM-dd")]
    );
    if (!allCached) {
      fetchRange(startStr, endStr);
    }
  }, [viewMode, currentMonth, selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Calendar grid for monthly view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  // Week days for weekly view
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
    return eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(selectedDate, { weekStartsOn: 0 }),
    });
  }, [selectedDate]);

  // Aggregates for weekly view
  const weeklyStats = useMemo(() => {
    let totalCal = 0,
      totalP = 0,
      totalC = 0,
      totalF = 0,
      daysWithData = 0;
    weekDays.forEach((d) => {
      const ds = format(d, "yyyy-MM-dd");
      const s = dailyCache[ds];
      if (s && s.entry_count > 0) {
        totalCal += s.totals.calories;
        totalP += s.totals.protein_g;
        totalC += s.totals.carbohydrates_total_g;
        totalF += s.totals.fat_total_g;
        daysWithData++;
      }
    });
    return {
      totalCal: Math.round(totalCal),
      avgCal: daysWithData > 0 ? Math.round(totalCal / daysWithData) : 0,
      totalP: Math.round(totalP),
      totalC: Math.round(totalC),
      totalF: Math.round(totalF),
      daysWithData,
    };
  }, [weekDays, dailyCache]);

  // Aggregates for monthly view
  const monthlyStats = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    let totalCal = 0,
      totalP = 0,
      totalC = 0,
      totalF = 0,
      daysWithData = 0;
    days.forEach((d) => {
      const ds = format(d, "yyyy-MM-dd");
      const s = dailyCache[ds];
      if (s && s.entry_count > 0) {
        totalCal += s.totals.calories;
        totalP += s.totals.protein_g;
        totalC += s.totals.carbohydrates_total_g;
        totalF += s.totals.fat_total_g;
        daysWithData++;
      }
    });
    return {
      totalCal: Math.round(totalCal),
      avgCal: daysWithData > 0 ? Math.round(totalCal / daysWithData) : 0,
      totalP: Math.round(totalP),
      totalC: Math.round(totalC),
      totalF: Math.round(totalF),
      daysWithData,
      totalDays: days.length,
    };
  }, [currentMonth, dailyCache]);

  const handleDayClick = (day: Date) => {
    if (isFuture(day)) return;
    setSelectedDate(day);
    setViewMode("daily");
  };

  const handleDeleteEntry = async (entryId: string) => {
    setDeletingEntry(entryId);
    try {
      await api.deleteFoodEntry(entryId);
      // Invalidate cached summary for this date and refetch
      setDailyCache((prev) => {
        const updated = { ...prev };
        delete updated[selectedDateStr];
        return updated;
      });
      // Refetch the day
      const refreshed = await fetchDay(selectedDateStr);
      setDailyCache((prev) => ({ ...prev, [selectedDateStr]: refreshed }));
      toast.success("Entry deleted");
    } catch {
      toast.error("Failed to delete entry");
    } finally {
      setDeletingEntry(null);
    }
  };

  const requestDeleteEntry = (entryId: string) => {
    setPendingDeleteEntryId(entryId);
  };

  const closeDeleteConfirm = (open: boolean) => {
    if (!open) setPendingDeleteEntryId(null);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteEntryId) return;
    await handleDeleteEntry(pendingDeleteEntryId);
    setPendingDeleteEntryId(null);
  };

  const handlePrevNav = () => {
    if (viewMode === "daily") setSelectedDate((d) => subDays(d, 1));
    else if (viewMode === "weekly") setSelectedDate((d) => subDays(d, 7));
    else setCurrentMonth((d) => subMonths(d, 1));
  };

  const handleNextNav = () => {
    if (viewMode === "daily") {
      if (!isDateToday(selectedDate)) setSelectedDate((d) => addDays(d, 1));
    } else if (viewMode === "weekly") {
      setSelectedDate((d) => addDays(d, 7));
    } else {
      setCurrentMonth((d) => addMonths(d, 1));
    }
  };

  const navLabel = () => {
    if (viewMode === "daily") {
      const today = isDateToday(selectedDate);
      return {
        main: today ? "Today" : format(selectedDate, "EEEE"),
        sub: format(selectedDate, "MMMM d, yyyy"),
      };
    }
    if (viewMode === "weekly") {
      const ws = startOfWeek(selectedDate, { weekStartsOn: 0 });
      const we = endOfWeek(selectedDate, { weekStartsOn: 0 });
      return {
        main: `${format(ws, "MMM d")} - ${format(we, "MMM d")}`,
        sub: format(ws, "yyyy"),
      };
    }
    return {
      main: format(currentMonth, "MMMM"),
      sub: format(currentMonth, "yyyy"),
    };
  };

  const isNextDisabled = viewMode === "daily" && isDateToday(selectedDate);
  const label = navLabel();

  const profileReady = Boolean(
    user?.profile?.weight_kg &&
      user?.profile?.height_cm &&
      user?.profile?.age &&
      user?.profile?.gender &&
      user?.profile?.activity_level &&
      user?.profile?.goal &&
      user?.profile?.daily_calorie_target
  );

  const totalCalories = Math.round(summary?.totals?.calories ?? 0);
  const profileTarget = user?.profile?.daily_calorie_target;
  const targetFromSummary = summary?.calorie_target;
  const calorieTarget =
    targetFromSummary === 2000 && profileTarget && profileTarget !== 2000
      ? profileTarget
      : (targetFromSummary ?? profileTarget ?? 2000);

  const statusTextColor = (status?: string) => {
    switch (status) {
      case "within":
        return "text-orange-600";
      case "slightly_over":
        return "text-yellow-600";
      case "over":
        return "text-red-600";
      default:
        return "text-zinc-600";
    }
  };

  const progressBarColor = (status?: string) => {
    switch (status) {
      case "within":
        return "[&>div]:bg-orange-500";
      case "slightly_over":
        return "[&>div]:bg-yellow-500";
      case "over":
        return "[&>div]:bg-red-500";
      default:
        return "[&>div]:bg-orange-500";
    }
  };

  // Get dot color for calendar cell
  const getDayIndicator = (
    day: Date
  ): { color: string; calories: number } | null => {
    const ds = format(day, "yyyy-MM-dd");
    const s = dailyCache[ds];
    if (!s || s.entry_count === 0) return null;
    const ratio = s.totals.calories / (s.calorie_target || 2000);
    if (ratio > 1.15)
      return { color: "bg-red-400", calories: Math.round(s.totals.calories) };
    if (ratio > 1.0)
      return { color: "bg-yellow-400", calories: Math.round(s.totals.calories) };
    if (ratio > 0.5)
      return { color: "bg-orange-400", calories: Math.round(s.totals.calories) };
    return { color: "bg-orange-300", calories: Math.round(s.totals.calories) };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <h1 className="text-xl font-bold tracking-tight text-zinc-900">Summary</h1>

      {!profileReady && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-medium text-amber-900">
            Complete your profile to unlock accurate targets
          </p>
          <p className="mt-1 text-xs text-amber-800/80">
            Summary uses your estimated daily calorie target from profile.
          </p>
          <Link
            href="/profile"
            className="mt-2 inline-block text-xs font-semibold text-amber-900 underline underline-offset-2"
          >
            Go to Profile
          </Link>
        </div>
      )}

      {/* View Mode Tabs */}
      <div className="flex rounded-xl border border-zinc-100 bg-white p-1 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        {(["daily", "weekly", "monthly"] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={cn(
              "flex-1 rounded-lg py-2 text-[13px] font-semibold transition-all",
              viewMode === mode
                ? "bg-orange-500 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white px-1.5 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg text-zinc-500 hover:text-zinc-900"
          onClick={handlePrevNav}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <p className="text-sm font-semibold text-zinc-900">{label.main}</p>
          <p className="text-[11px] text-zinc-400">{label.sub}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg text-zinc-500 hover:text-zinc-900"
          onClick={handleNextNav}
          disabled={isNextDisabled}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Monthly Calendar Grid */}
      {viewMode === "monthly" && (
        <div className="rounded-xl border border-zinc-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-zinc-50 px-2 py-2">
            {DAY_NAMES.map((d) => (
              <div
                key={d}
                className="text-center text-[11px] font-medium text-zinc-400"
              >
                {d}
              </div>
            ))}
          </div>
          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-px p-2">
            {calendarDays.map((day) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = isSameDay(day, selectedDate);
              const today = isDateToday(day);
              const future = isFuture(day);
              const indicator = getDayIndicator(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  disabled={future}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-lg py-1.5 text-[13px] transition-all",
                    isCurrentMonth ? "text-zinc-800" : "text-zinc-300",
                    future && "cursor-not-allowed opacity-40",
                    isSelected && "bg-orange-500 text-white",
                    !isSelected && today && "ring-1 ring-orange-300",
                    !isSelected &&
                      !future &&
                      isCurrentMonth &&
                      "hover:bg-zinc-50"
                  )}
                >
                  <span
                    className={cn(
                      "font-medium tabular-nums",
                      isSelected && "font-bold"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {/* Calorie indicator dot */}
                  {indicator && !isSelected && (
                    <div
                      className={cn(
                        "mt-0.5 h-1 w-1 rounded-full",
                        indicator.color
                      )}
                    />
                  )}
                  {indicator && isSelected && (
                    <div className="mt-0.5 h-1 w-1 rounded-full bg-white/80" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Weekly Bar Chart */}
      {viewMode === "weekly" && (
        <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div
            className="flex items-end justify-between gap-1"
            style={{ height: 120 }}
          >
            {weekDays.map((day) => {
              const ds = format(day, "yyyy-MM-dd");
              const s = dailyCache[ds];
              const cal = s?.totals?.calories ?? 0;
              const target = s?.calorie_target ?? 2000;
              const pct = Math.min((cal / target) * 100, 120);
              const isSelected = isSameDay(day, selectedDate);
              const today = isDateToday(day);
              const future = isFuture(day);

              let barColor = "bg-orange-400";
              if (cal > target * 1.15) barColor = "bg-red-400";
              else if (cal > target) barColor = "bg-yellow-400";

              return (
                <button
                  key={ds}
                  onClick={() => handleDayClick(day)}
                  disabled={future}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1",
                    future && "opacity-30"
                  )}
                >
                  <span className="text-[10px] font-medium tabular-nums text-zinc-400">
                    {cal > 0 ? Math.round(cal) : ""}
                  </span>
                  <div
                    className="relative flex w-full items-end justify-center"
                    style={{ height: 80 }}
                  >
                    <div
                      className={cn(
                        "w-full max-w-[28px] rounded-t-md transition-all duration-300",
                        cal > 0 ? barColor : "bg-zinc-100",
                        isSelected && "ring-2 ring-orange-500 ring-offset-1"
                      )}
                      style={{
                        height:
                          cal > 0 ? `${Math.max(pct * 0.8, 4)}%` : "4px",
                      }}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-medium",
                      today ? "text-orange-600" : "text-zinc-500"
                    )}
                  >
                    {format(day, "EEE")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Aggregate Stats (Weekly/Monthly) */}
      {(viewMode === "weekly" || viewMode === "monthly") && (
        <div className="rounded-xl border border-zinc-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="border-b border-zinc-50 px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-900">
              {viewMode === "weekly" ? "Week" : "Month"} Overview
            </h2>
          </div>
          <div className="p-4">
            {(() => {
              const stats =
                viewMode === "weekly" ? weeklyStats : monthlyStats;
              return (
                <div className="space-y-3">
                  {/* Calorie summary */}
                  <div className="flex items-center gap-3 rounded-lg bg-orange-50/60 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                      <Flame className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between">
                        <p className="text-xs font-medium text-orange-800/70">
                          Avg. daily
                        </p>
                        <p className="text-lg font-bold tabular-nums text-orange-700">
                          {stats.avgCal.toLocaleString()} cal
                        </p>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <p className="text-xs font-medium text-orange-800/50">
                          Total ({stats.daysWithData} days tracked)
                        </p>
                        <p className="text-sm font-semibold tabular-nums text-orange-600">
                          {stats.totalCal.toLocaleString()} cal
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Macro totals */}
                  <div className="grid grid-cols-3 gap-2">
                    <MacroStat
                      label="Protein"
                      value={stats.totalP}
                      unit="g"
                      color="text-blue-600"
                    />
                    <MacroStat
                      label="Carbs"
                      value={stats.totalC}
                      unit="g"
                      color="text-amber-600"
                    />
                    <MacroStat
                      label="Fat"
                      value={stats.totalF}
                      unit="g"
                      color="text-rose-500"
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Daily Detail */}
      {viewMode === "daily" && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-orange-500 border-t-transparent" />
            </div>
          ) : summary && summary.entry_count > 0 ? (
            <div className="space-y-4">
              {/* Calorie Bar */}
              <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">
                    Calories
                  </span>
                  <span
                    className={cn(
                      "text-xs font-semibold tabular-nums",
                      statusTextColor(summary.status)
                    )}
                  >
                    {totalCalories} / {calorieTarget}
                  </span>
                </div>
                <Progress
                  value={Math.min(
                    (totalCalories / calorieTarget) * 100,
                    100
                  )}
                  className={cn(
                    "h-2.5 rounded-full bg-zinc-100",
                    progressBarColor(summary.status)
                  )}
                />
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-2.5">
                <MacroBar
                  label="Protein"
                  value={Math.round(summary.totals.protein_g)}
                  color="bg-blue-500"
                  trackColor="bg-blue-100"
                />
                <MacroBar
                  label="Carbs"
                  value={Math.round(summary.totals.carbohydrates_total_g)}
                  color="bg-amber-500"
                  trackColor="bg-amber-100"
                />
                <MacroBar
                  label="Fat"
                  value={Math.round(summary.totals.fat_total_g)}
                  color="bg-rose-400"
                  trackColor="bg-rose-100"
                />
              </div>

              {/* Meals */}
              <section className="space-y-2.5">
                <h2 className="text-sm font-semibold text-zinc-900">
                  Meal Breakdown
                </h2>
                {MEAL_ORDER.map((mealType) => {
                  const foods = summary.meals?.[mealType] ?? [];
                  if (foods.length === 0) return null;
                  const mealCalories = Math.round(
                    foods.reduce((sum, f) => sum + (f.calories ?? 0), 0)
                  );
                  return (
                    <div
                      key={mealType}
                      className="rounded-xl border border-zinc-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                    >
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm font-semibold text-zinc-900">
                          {MEAL_LABELS[mealType]}
                        </span>
                        <span className="text-xs font-semibold tabular-nums text-zinc-500">
                          {mealCalories} cal
                        </span>
                      </div>
                      <div className="border-t border-zinc-50 px-4 py-2">
                        <div className="divide-y divide-zinc-50">
                          {foods.map((food) => (
                            <div
                              key={food.id}
                              className="group flex items-center gap-1"
                            >
                              <div className="flex-1">
                                <FoodItem food={food} compact />
                              </div>
                              <button
                                type="button"
                                onClick={() => requestDeleteEntry(food.id)}
                                disabled={deletingEntry === food.id}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 disabled:opacity-50"
                                title="Delete entry"
                              >
                                {deletingEntry === food.id ? (
                                  <div className="h-3 w-3 animate-spin rounded-full border-[2px] border-red-400 border-t-transparent" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                <span className="text-lg text-zinc-400">-</span>
              </div>
              <p className="text-sm text-zinc-400">No data for this day</p>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDeleteEntryId)}
        onOpenChange={closeDeleteConfirm}
        title="Delete meal entry?"
        description="This action will remove the selected food log entry."
        confirmLabel="Delete"
        loading={Boolean(deletingEntry)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function MacroBar({
  label,
  value,
  color,
  trackColor,
}: {
  label: string;
  value: number;
  color: string;
  trackColor: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <p className="mb-1 text-[11px] font-medium text-zinc-400">{label}</p>
      <p className="text-base font-bold tabular-nums text-zinc-900">
        {value}
        <span className="ml-0.5 text-[11px] font-normal text-zinc-400">g</span>
      </p>
      <div className={cn("mt-2 h-1 w-full rounded-full", trackColor)}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            color
          )}
          style={{ width: `${Math.min((value / 150) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

function MacroStat({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div className="rounded-lg bg-zinc-50 p-2.5 text-center">
      <p className="text-[11px] font-medium text-zinc-400">{label}</p>
      <p className={cn("text-sm font-bold tabular-nums", color)}>
        {value.toLocaleString()}
        <span className="ml-0.5 text-[10px] font-normal text-zinc-400">
          {unit}
        </span>
      </p>
    </div>
  );
}
