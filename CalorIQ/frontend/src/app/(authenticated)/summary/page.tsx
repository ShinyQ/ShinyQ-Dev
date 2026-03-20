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
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { Button } from "src/components/ui/button";
import { Progress } from "src/components/ui/progress";
import { FoodItem } from "src/components/food/food-item";
import { api } from "src/lib/api";
import { generateMockDailySummary } from "src/lib/mock";
import type { DailySummary, MealType } from "src/lib/types";
import { cn } from "src/lib/utils";

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

  // Fetch a single day's summary
  const fetchDay = useCallback(async (dateStr: string): Promise<DailySummary> => {
    try {
      return await api.getDailySummary(dateStr);
    } catch {
      return generateMockDailySummary(dateStr);
    }
  }, []);

  // Fetch and cache a day
  const fetchAndCache = useCallback(
    async (dateStr: string) => {
      if (dailyCache[dateStr]) return dailyCache[dateStr];
      const data = await fetchDay(dateStr);
      setDailyCache((prev) => ({ ...prev, [dateStr]: data }));
      return data;
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

  // Prefetch visible month for calendar
  useEffect(() => {
    if (viewMode !== "monthly" && viewMode !== "weekly") return;

    const start = viewMode === "weekly"
      ? startOfWeek(selectedDate, { weekStartsOn: 0 })
      : startOfMonth(currentMonth);
    const end = viewMode === "weekly"
      ? endOfWeek(selectedDate, { weekStartsOn: 0 })
      : endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    days.forEach((d) => {
      const ds = format(d, "yyyy-MM-dd");
      if (!dailyCache[ds] && !isFuture(d)) {
        fetchAndCache(ds);
      }
    });
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
    return eachDayOfInterval({ start: weekStart, end: endOfWeek(selectedDate, { weekStartsOn: 0 }) });
  }, [selectedDate]);

  // Aggregates for weekly view
  const weeklyStats = useMemo(() => {
    let totalCal = 0, totalP = 0, totalC = 0, totalF = 0, daysWithData = 0;
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
    let totalCal = 0, totalP = 0, totalC = 0, totalF = 0, daysWithData = 0;
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

  const totalCalories = Math.round(summary?.totals?.calories ?? 0);
  const calorieTarget = summary?.calorie_target ?? 2000;

  const statusTextColor = (status?: string) => {
    switch (status) {
      case "within": return "text-orange-600";
      case "slightly_over": return "text-yellow-600";
      case "over": return "text-red-600";
      default: return "text-zinc-600";
    }
  };

  const progressBarColor = (status?: string) => {
    switch (status) {
      case "within": return "[&>div]:bg-orange-500";
      case "slightly_over": return "[&>div]:bg-yellow-500";
      case "over": return "[&>div]:bg-red-500";
      default: return "[&>div]:bg-orange-500";
    }
  };

  // Get dot color for calendar cell
  const getDayIndicator = (day: Date): { color: string; calories: number } | null => {
    const ds = format(day, "yyyy-MM-dd");
    const s = dailyCache[ds];
    if (!s || s.entry_count === 0) return null;
    const ratio = s.totals.calories / (s.calorie_target || 2000);
    if (ratio > 1.15) return { color: "bg-red-400", calories: Math.round(s.totals.calories) };
    if (ratio > 1.0) return { color: "bg-yellow-400", calories: Math.round(s.totals.calories) };
    if (ratio > 0.5) return { color: "bg-orange-400", calories: Math.round(s.totals.calories) };
    return { color: "bg-orange-300", calories: Math.round(s.totals.calories) };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <h1 className="text-xl font-bold tracking-tight text-zinc-900">Summary</h1>

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
              <div key={d} className="text-center text-[11px] font-medium text-zinc-400">
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
                    !isSelected && !future && isCurrentMonth && "hover:bg-zinc-50"
                  )}
                >
                  <span className={cn(
                    "font-medium tabular-nums",
                    isSelected && "font-bold"
                  )}>
                    {format(day, "d")}
                  </span>
                  {/* Calorie indicator dot */}
                  {indicator && !isSelected && (
                    <div className={cn("mt-0.5 h-1 w-1 rounded-full", indicator.color)} />
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
          <div className="flex items-end justify-between gap-1" style={{ height: 120 }}>
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
                  <div className="relative w-full flex items-end justify-center" style={{ height: 80 }}>
                    <div
                      className={cn(
                        "w-full max-w-[28px] rounded-t-md transition-all duration-300",
                        cal > 0 ? barColor : "bg-zinc-100",
                        isSelected && "ring-2 ring-orange-500 ring-offset-1"
                      )}
                      style={{ height: cal > 0 ? `${Math.max(pct * 0.8, 4)}%` : "4px" }}
                    />
                  </div>
                  <span className={cn(
                    "text-[11px] font-medium",
                    today ? "text-orange-600" : "text-zinc-500"
                  )}>
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
              const stats = viewMode === "weekly" ? weeklyStats : monthlyStats;
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
                    <MacroStat label="Protein" value={stats.totalP} unit="g" color="text-blue-600" />
                    <MacroStat label="Carbs" value={stats.totalC} unit="g" color="text-amber-600" />
                    <MacroStat label="Fat" value={stats.totalF} unit="g" color="text-rose-500" />
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
                  <span className="text-xs font-medium text-zinc-500">Calories</span>
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
                  value={Math.min((totalCalories / calorieTarget) * 100, 100)}
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
                            <FoodItem key={food.id} food={food} compact />
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
          className={cn("h-full rounded-full transition-all duration-500", color)}
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
        <span className="ml-0.5 text-[10px] font-normal text-zinc-400">{unit}</span>
      </p>
    </div>
  );
}
