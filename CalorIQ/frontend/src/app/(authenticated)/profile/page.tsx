"use client";

import { useState, useEffect, useCallback } from "react";
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
import { api } from "src/lib/api";
import type { UserProfile } from "src/lib/types";
import { Save, Loader2, Flame } from "lucide-react";
import { toast } from "sonner";

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Sedentary (little or no exercise)",
  light: "Lightly Active (1-3 days/week)",
  moderate: "Moderately Active (3-5 days/week)",
  active: "Very Active (6-7 days/week)",
  very_active: "Extra Active (intense daily exercise)",
};

const GOAL_LABELS: Record<string, string> = {
  lose: "Lose Weight",
  maintain: "Maintain Weight",
  gain: "Gain Weight",
};

function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: string
): number {
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

function calculateTDEE(bmr: number, activityLevel: string): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.2));
}

function calculateTarget(tdee: number, goal: string): number {
  switch (goal) {
    case "lose": return tdee - 500;
    case "gain": return tdee + 300;
    default: return tdee;
  }
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    weight_kg: "",
    height_cm: "",
    age: "",
    gender: "male" as string,
    activity_level: "moderate" as string,
    goal: "maintain" as string,
  });

  const fetchProfile = useCallback(async () => {
    try {
      const user = await api.getMe();
      const p = user.profile;
      if (p) {
        setForm({
          weight_kg: p.weight_kg?.toString() ?? "",
          height_cm: p.height_cm?.toString() ?? "",
          age: p.age?.toString() ?? "",
          gender: p.gender ?? "male",
          activity_level: p.activity_level ?? "moderate",
          goal: p.goal ?? "maintain",
        });
      }
    } catch {
      // Profile may not exist yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const estimatedTarget = (() => {
    const w = parseFloat(form.weight_kg);
    const h = parseFloat(form.height_cm);
    const a = parseInt(form.age);
    if (!w || !h || !a) return null;
    const bmr = calculateBMR(w, h, a, form.gender);
    const tdee = calculateTDEE(bmr, form.activity_level);
    return calculateTarget(tdee, form.goal);
  })();

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile({
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : undefined,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : undefined,
        age: form.age ? parseInt(form.age) : undefined,
        gender: form.gender as UserProfile["gender"],
        activity_level: form.activity_level as UserProfile["activity_level"],
        goal: form.goal as UserProfile["goal"],
      });
      toast.success("Profile saved successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">Profile</h1>
        <p className="text-[13px] text-zinc-400">
          Set your details for accurate calorie targets
        </p>
      </div>

      {/* Body Stats */}
      <section className="rounded-xl border border-zinc-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="border-b border-zinc-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-900">Body Stats</h2>
        </div>
        <div className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="weight" className="text-xs font-medium text-zinc-500">
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                placeholder="70"
                value={form.weight_kg}
                onChange={(e) =>
                  setForm((f) => ({ ...f, weight_kg: e.target.value }))
                }
                className="h-11 rounded-lg border-zinc-200 bg-white text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="height" className="text-xs font-medium text-zinc-500">
                Height (cm)
              </Label>
              <Input
                id="height"
                type="number"
                placeholder="175"
                value={form.height_cm}
                onChange={(e) =>
                  setForm((f) => ({ ...f, height_cm: e.target.value }))
                }
                className="h-11 rounded-lg border-zinc-200 bg-white text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="age" className="text-xs font-medium text-zinc-500">
                Age
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="30"
                value={form.age}
                onChange={(e) =>
                  setForm((f) => ({ ...f, age: e.target.value }))
                }
                className="h-11 rounded-lg border-zinc-200 bg-white text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gender" className="text-xs font-medium text-zinc-500">
                Gender
              </Label>
              <Select
                value={form.gender}
                onValueChange={(v) => setForm((f) => ({ ...f, gender: v }))}
              >
                <SelectTrigger
                  id="gender"
                  className="h-11 rounded-lg border-zinc-200 bg-white text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Activity & Goals */}
      <section className="rounded-xl border border-zinc-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="border-b border-zinc-50 px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-900">Activity & Goals</h2>
        </div>
        <div className="space-y-3 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="activity" className="text-xs font-medium text-zinc-500">
              Activity Level
            </Label>
            <Select
              value={form.activity_level}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, activity_level: v }))
              }
            >
              <SelectTrigger
                id="activity"
                className="h-11 rounded-lg border-zinc-200 bg-white text-sm"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goal" className="text-xs font-medium text-zinc-500">
              Goal
            </Label>
            <Select
              value={form.goal}
              onValueChange={(v) => setForm((f) => ({ ...f, goal: v }))}
            >
              <SelectTrigger
                id="goal"
                className="h-11 rounded-lg border-zinc-200 bg-white text-sm"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GOAL_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Estimated Target */}
      {estimatedTarget && (
        <div className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50/60 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100">
            <Flame className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-orange-800/80">
              Estimated daily target
            </p>
            <p className="text-lg font-bold tabular-nums text-orange-700">
              {estimatedTarget.toLocaleString()} cal
            </p>
          </div>
        </div>
      )}

      {/* Save */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="h-11 w-full rounded-lg bg-orange-500 text-sm font-semibold shadow-sm hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save Profile
          </>
        )}
      </Button>
    </div>
  );
}
