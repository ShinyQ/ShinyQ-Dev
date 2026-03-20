"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { api } from "src/lib/api";
import { generateMockFoodLog, generateMockRecentFoods } from "src/lib/mock";
import type { FoodLogResponse, MealType, RecentFood } from "src/lib/types";
import { Send, Loader2, Clock, Utensils, Camera, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

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
  const [recentFoods, setRecentFoods] = useState<RecentFood[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRecentFoods = useCallback(async () => {
    try {
      const data = await api.getRecentFoods(10);
      setRecentFoods(data);
    } catch {
      // Fallback to mock recent foods
      setRecentFoods(generateMockRecentFoods());
    } finally {
      setLoadingRecent(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentFoods();
  }, [fetchRecentFoods]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
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
    if (!description.trim() && !photoFile) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await api.logFood({
        description: description.trim() || "Food from photo",
        meal_type: mealType,
      });
      setResult(data);
      setDescription("");
      removePhoto();
      toast.success("Food logged successfully!");
      fetchRecentFoods();
    } catch {
      // Fallback to mock data when backend is unavailable
      const mockDescription = description.trim() || "Chicken breast with rice and vegetables";
      const data = generateMockFoodLog(mockDescription, mealType);
      setResult(data);
      setDescription("");
      removePhoto();
      toast.success("Food logged! (demo mode)");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLog = (food: RecentFood) => {
    setDescription(food.name);
  };

  const canSubmit = description.trim() || photoFile;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">Log Food</h1>
        <p className="text-[13px] text-zinc-400">
          Describe what you ate or snap a photo
        </p>
      </div>

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

        <Button
          type="submit"
          disabled={loading || !canSubmit}
          className="h-11 w-full rounded-lg bg-orange-500 text-sm font-semibold shadow-sm hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
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
        <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-100">
                <Utensils className="h-3 w-3 text-orange-600" />
              </div>
              <span className="text-sm font-semibold text-orange-900">Logged!</span>
            </div>
            <span className="text-xs font-bold tabular-nums text-orange-700">
              {Math.round(result.totals.calories)} cal
            </span>
          </div>
          <div className="divide-y divide-orange-100/50">
            {result.entries.map((entry) => (
              <FoodItem key={entry.id} food={entry} compact />
            ))}
          </div>
          {/* Macro summary */}
          <div className="mt-3 flex items-center gap-3 border-t border-orange-100 pt-3">
            <span className="text-[11px] font-medium text-orange-700/70">
              P {Math.round(result.totals.protein_g)}g
            </span>
            <span className="text-[11px] font-medium text-orange-700/70">
              C {Math.round(result.totals.carbohydrates_total_g)}g
            </span>
            <span className="text-[11px] font-medium text-orange-700/70">
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
