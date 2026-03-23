"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import { FoodItem } from "src/components/food/food-item";
import { api, ApiError } from "src/lib/api";
import type { FoodLogResponse, MealType, RecentFood, UserProfile } from "src/lib/types";
import {
  Send,
  Loader2,
  Clock,
  Camera,
  X,
  ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

function formatDateTimeLocal(value: Date): string {
  const pad = (num: number) => String(num).padStart(2, "0");
  const year = value.getFullYear();
  const month = pad(value.getMonth() + 1);
  const day = pad(value.getDate());
  const hour = pad(value.getHours());
  const minute = pad(value.getMinutes());
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function hasCompletedProfile(user: UserProfile): boolean {
  const profile = user.profile;
  return Boolean(
    profile &&
      profile.weight_kg &&
      profile.height_cm &&
      profile.age &&
      profile.gender &&
      profile.activity_level &&
      profile.goal &&
      profile.daily_calorie_target
  );
}

function isWithinLast30Days(input: string): boolean {
  const selected = new Date(input);
  if (Number.isNaN(selected.getTime())) return false;

  const now = new Date();
  const max = now;
  const min = new Date(now);
  min.setDate(min.getDate() - 29);
  min.setHours(0, 0, 0, 0);

  return selected >= min && selected <= max;
}

function getDefaultMealType(): MealType {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return "breakfast";
  if (hour >= 10 && hour < 14) return "lunch";
  if (hour >= 14 && hour < 17) return "snacks";
  if (hour >= 17 && hour < 22) return "dinner";
  return "snacks";
}

export default function LogPage() {
  const [description, setDescription] = useState("");
  const [mealType, setMealType] = useState<MealType>(getDefaultMealType());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FoodLogResponse | null>(null);
  const [loadingPhase, setLoadingPhase] = useState<"analyzing" | "retrying" | null>(
    null
  );
  const [loadingText, setLoadingText] = useState("Analyzing...");
  const [recentFoods, setRecentFoods] = useState<RecentFood[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [profileReady, setProfileReady] = useState<boolean>(false);
  const [profileChecked, setProfileChecked] = useState(false);
  const [loggedAt, setLoggedAt] = useState(formatDateTimeLocal(new Date()));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRecentFoods = useCallback(async () => {
    try {
      const data = await api.getRecentFoods(10);
      setRecentFoods(data);
    } catch {
      setRecentFoods([]);
    } finally {
      setLoadingRecent(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentFoods();
  }, [fetchRecentFoods]);

  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      try {
        const user = await api.getMe();
        if (mounted) {
          setProfileReady(hasCompletedProfile(user));
        }
      } catch {
        if (mounted) {
          setProfileReady(false);
        }
      } finally {
        if (mounted) {
          setProfileChecked(true);
        }
      }
    };
    fetchUser();
    return () => {
      mounted = false;
    };
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      e.target.value = "";
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedDescription = description.trim();
    if (!normalizedDescription && !photoFile) return;
    if (!profileReady) {
      toast.error("Complete your profile before logging food.");
      return;
    }
    if (!isWithinLast30Days(loggedAt)) {
      toast.error("Log date must be within the last 30 days.");
      return;
    }

    setLoading(true);
    setResult(null);
    setLoadingPhase("analyzing");
    setLoadingText(photoFile ? "Analyzing photo..." : "Analyzing...");
    const retryTimer = window.setTimeout(() => {
      setLoadingPhase("retrying");
      setLoadingText("Still analyzing...");
    }, 4000);

    try {
      const imageBase64 = photoPreview ? photoPreview.split(",")[1] : undefined;
      const data = await api.logFood({
        description: normalizedDescription || undefined,
        image_base64: imageBase64,
        meal_type: mealType,
        logged_at: loggedAt,
      });

      setResult(data);
      setDescription("");
      removePhoto();
      toast.success("Food logged successfully!");
      await fetchRecentFoods();
    } catch (error) {
      if (error instanceof ApiError && error.code === "rate_limit_exceeded") {
        toast.error("Daily AI limit reached. Try again tomorrow.");
      } else if (error instanceof ApiError && error.code === "ai_unavailable") {
        toast.error("AI service is unavailable. Please try again.");
      } else if (error instanceof ApiError && error.code === "input_required") {
        toast.error("Please describe your food or upload a photo.");
      } else if (error instanceof ApiError && error.code === "image_too_large") {
        toast.error("Image must be under 10MB.");
      } else if (error instanceof ApiError && error.code === "profile_required") {
        toast.error("Complete your profile before logging food.");
      } else if (error instanceof ApiError && error.code === "logged_at_out_of_range") {
        toast.error("Log date must be within the last 30 days.");
      } else if (error instanceof ApiError) {
        toast.error(error.message || "Failed to log food.");
      } else {
        toast.error("Failed to log food.");
      }
    } finally {
      clearTimeout(retryTimer);
      setLoading(false);
      setLoadingPhase(null);
      setLoadingText("Analyzing...");
    }
  };

  const handleQuickLog = (food: RecentFood) => {
    setDescription(food.name);
  };

  const canSubmit =
    Boolean(description.trim() || photoFile) && profileChecked && profileReady;
  const maxLogAt = formatDateTimeLocal(new Date());
  const minLogAt = (() => {
    const min = new Date();
    min.setDate(min.getDate() - 29);
    min.setHours(0, 0, 0, 0);
    return formatDateTimeLocal(min);
  })();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">Log Food</h1>
        <p className="text-[13px] text-zinc-400">
          Describe what you ate, choose when, or snap a photo
        </p>
      </div>

      {profileChecked && !profileReady && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-medium text-amber-900">
            Complete your profile first
          </p>
          <p className="mt-1 text-xs text-amber-800/80">
            We need your estimated daily calorie target before you can add logs.
          </p>
          <Link
            href="/profile"
            className="mt-2 inline-block text-xs font-semibold text-amber-900 underline underline-offset-2"
          >
            Go to Profile
          </Link>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Photo Upload */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-zinc-500">
            Photo (optional)
          </Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelect}
            className="hidden"
          />
          {photoPreview ? (
            <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
              <img
                src={photoPreview}
                alt="Food photo"
                className="h-40 w-full object-cover"
              />
              {loadingPhase === "analyzing" && (
                <div className="absolute inset-0 animate-pulse bg-black/10" />
              )}
              <button
                type="button"
                onClick={removePhoto}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-sm">
                <ImageIcon className="h-3 w-3 text-white/80" />
                <span className="text-[11px] font-medium text-white/90">
                  {photoFile?.name}
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 py-6 transition-colors hover:border-orange-300 hover:bg-orange-50/30"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                <Camera className="h-5 w-5 text-zinc-400" />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-medium text-zinc-600">
                  Tap to upload a photo
                </p>
                <p className="text-[11px] text-zinc-400">
                  JPG, PNG up to 10MB
                </p>
              </div>
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-xs font-medium text-zinc-500">
            What did you eat?
          </Label>
          <Input
            id="description"
            placeholder='e.g., "2 scrambled eggs with toast"'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-12 rounded-lg border-zinc-200 bg-white text-sm placeholder:text-zinc-400 focus-visible:ring-orange-500"
            disabled={loading}
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="meal-type" className="text-xs font-medium text-zinc-500">
            Meal
          </Label>
          <Select
            value={mealType}
            onValueChange={(v) => setMealType(v as MealType)}
            disabled={loading}
          >
            <SelectTrigger
              id="meal-type"
              className="h-11 rounded-lg border-zinc-200 bg-white text-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
              <SelectItem value="snacks">Snacks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="logged-at" className="text-xs font-medium text-zinc-500">
            Log date & time (last 30 days)
          </Label>
          <Input
            id="logged-at"
            type="datetime-local"
            value={loggedAt}
            min={minLogAt}
            max={maxLogAt}
            onChange={(e) => setLoggedAt(e.target.value)}
            className="h-11 rounded-lg border-zinc-200 bg-white text-sm"
            disabled={loading}
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !canSubmit}
          className="h-11 w-full rounded-lg bg-orange-500 text-sm font-semibold shadow-sm hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingText}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Log Food
            </>
          )}
        </Button>
      </form>

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-emerald-900">Logged!</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                AI
              </span>
            </div>
            <span className="text-xs font-bold tabular-nums text-emerald-700">
              {Math.round(result.totals.calories)} cal
            </span>
          </div>
          <div className="divide-y divide-emerald-100/70">
            {result.entries.map((entry) => (
              <FoodItem key={entry.id} food={entry} compact />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3 border-t border-emerald-100 pt-3">
            <span className="text-[11px] font-medium text-emerald-700/80">
              P {Math.round(result.totals.protein_g)}g
            </span>
            <span className="text-[11px] font-medium text-emerald-700/80">
              C {Math.round(result.totals.carbohydrates_total_g)}g
            </span>
            <span className="text-[11px] font-medium text-emerald-700/80">
              F {Math.round(result.totals.fat_total_g)}g
            </span>
          </div>
        </div>
      )}

      {/* Recent Foods */}
      {!loadingRecent && recentFoods.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            <h2 className="text-xs font-semibold text-zinc-500">
              Quick re-log
            </h2>
          </div>
          <div className="space-y-1.5">
            {recentFoods.map((food) => (
              <FoodItem
                key={food.id}
                food={food}
                compact
                onClick={() => handleQuickLog(food)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
