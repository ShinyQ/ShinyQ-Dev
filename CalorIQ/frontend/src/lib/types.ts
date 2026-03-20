export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein_g: number;
  carbohydrates_total_g: number;
  fat_total_g: number;
  fat_saturated_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  potassium_mg: number;
  cholesterol_mg: number;
  serving_size_g: number;
  meal_type: MealType;
  logged_at: string;
  source: string;
}

export interface FoodLogTotals {
  calories: number;
  protein_g: number;
  carbohydrates_total_g: number;
  fat_total_g: number;
}

export interface FoodLogResponse {
  food_log_id: string;
  entries: FoodEntry[];
  totals: FoodLogTotals;
  meal_type: MealType;
  logged_at: string;
}

export interface DailySummary {
  date: string;
  meals: Record<string, FoodEntry[]>;
  totals: {
    calories: number;
    protein_g: number;
    carbohydrates_total_g: number;
    fat_total_g: number;
    fat_saturated_g: number;
    fiber_g: number;
    sugar_g: number;
    sodium_mg: number;
    potassium_mg: number;
    cholesterol_mg: number;
  };
  calorie_target: number;
  remaining_calories: number;
  status: "within" | "slightly_over" | "over";
  entry_count: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  weight_kg?: number;
  height_cm?: number;
  age?: number;
  gender?: "male" | "female";
  activity_level?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  profile?: {
    weight_kg: number;
    height_cm: number;
    age: number;
    gender: string;
    activity_level: string;
    goal: string;
    daily_calorie_target: number;
  };
  goal?: "lose" | "maintain" | "gain";
  daily_calorie_target?: number;
}

export interface RecentFood {
  id: string;
  name: string;
  calories: number;
  protein_g: number;
  carbohydrates_total_g: number;
  fat_total_g: number;
  serving_size_g: number;
  times_logged: number;
  last_logged_at: string;
}
