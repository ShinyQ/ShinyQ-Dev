import type { FoodEntry, FoodLogResponse, MealType, DailySummary, RecentFood } from "./types";

const MOCK_FOODS: Array<{ name: string; calories: number; protein_g: number; carbohydrates_total_g: number; fat_total_g: number; serving_size_g: number }> = [
  { name: "Scrambled Eggs (2)", calories: 182, protein_g: 12.6, carbohydrates_total_g: 1.6, fat_total_g: 13.4, serving_size_g: 120 },
  { name: "Whole Wheat Toast", calories: 69, protein_g: 3.6, carbohydrates_total_g: 12.3, fat_total_g: 1.1, serving_size_g: 30 },
  { name: "Grilled Chicken Breast", calories: 284, protein_g: 53.4, carbohydrates_total_g: 0, fat_total_g: 6.2, serving_size_g: 200 },
  { name: "Brown Rice (1 cup)", calories: 216, protein_g: 5.0, carbohydrates_total_g: 44.8, fat_total_g: 1.8, serving_size_g: 195 },
  { name: "Caesar Salad", calories: 190, protein_g: 7.2, carbohydrates_total_g: 8.5, fat_total_g: 14.8, serving_size_g: 150 },
  { name: "Banana", calories: 105, protein_g: 1.3, carbohydrates_total_g: 27.0, fat_total_g: 0.4, serving_size_g: 118 },
  { name: "Greek Yogurt", calories: 130, protein_g: 12.0, carbohydrates_total_g: 8.0, fat_total_g: 5.0, serving_size_g: 170 },
  { name: "Salmon Fillet", calories: 367, protein_g: 34.0, carbohydrates_total_g: 0, fat_total_g: 22.0, serving_size_g: 170 },
  { name: "Pasta with Marinara", calories: 380, protein_g: 12.0, carbohydrates_total_g: 62.0, fat_total_g: 8.5, serving_size_g: 250 },
  { name: "Apple", calories: 95, protein_g: 0.5, carbohydrates_total_g: 25.0, fat_total_g: 0.3, serving_size_g: 182 },
  { name: "Avocado Toast", calories: 250, protein_g: 6.0, carbohydrates_total_g: 26.0, fat_total_g: 14.0, serving_size_g: 140 },
  { name: "Protein Shake", calories: 180, protein_g: 25.0, carbohydrates_total_g: 12.0, fat_total_g: 3.0, serving_size_g: 350 },
  { name: "Mixed Nuts (handful)", calories: 170, protein_g: 5.0, carbohydrates_total_g: 7.0, fat_total_g: 15.0, serving_size_g: 30 },
  { name: "Oatmeal with Berries", calories: 220, protein_g: 6.0, carbohydrates_total_g: 38.0, fat_total_g: 5.0, serving_size_g: 250 },
  { name: "Steak (6oz)", calories: 414, protein_g: 46.0, carbohydrates_total_g: 0, fat_total_g: 24.0, serving_size_g: 170 },
  { name: "Steamed Broccoli", calories: 55, protein_g: 3.7, carbohydrates_total_g: 11.0, fat_total_g: 0.6, serving_size_g: 160 },
];

let mockIdCounter = 1000;

function randomId(): string {
  return `mock-${++mockIdCounter}-${Date.now()}`;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function parseDescription(description: string): Array<typeof MOCK_FOODS[number]> {
  const lower = description.toLowerCase();

  // Try to match known foods
  const matched = MOCK_FOODS.filter((f) =>
    lower.includes(f.name.toLowerCase().split(" ")[0].toLowerCase()) ||
    lower.includes(f.name.toLowerCase().split("(")[0].trim().toLowerCase())
  );

  if (matched.length > 0) return matched;

  // If no match, generate 1-2 random items
  const count = Math.random() > 0.5 ? 2 : 1;
  return pickRandom(MOCK_FOODS, count);
}

export function generateMockFoodLog(
  description: string,
  mealType: MealType
): FoodLogResponse {
  const foods = parseDescription(description);
  const now = new Date().toISOString();

  const entries: FoodEntry[] = foods.map((f) => ({
    id: randomId(),
    name: f.name,
    calories: f.calories,
    protein_g: f.protein_g,
    carbohydrates_total_g: f.carbohydrates_total_g,
    fat_total_g: f.fat_total_g,
    fat_saturated_g: Math.round(f.fat_total_g * 0.3 * 10) / 10,
    fiber_g: Math.round(Math.random() * 5 * 10) / 10,
    sugar_g: Math.round(Math.random() * 10 * 10) / 10,
    sodium_mg: Math.round(Math.random() * 500),
    potassium_mg: Math.round(Math.random() * 400),
    cholesterol_mg: Math.round(Math.random() * 80),
    serving_size_g: f.serving_size_g,
    meal_type: mealType,
    logged_at: now,
    source: "mock",
  }));

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein_g: acc.protein_g + e.protein_g,
      carbohydrates_total_g: acc.carbohydrates_total_g + e.carbohydrates_total_g,
      fat_total_g: acc.fat_total_g + e.fat_total_g,
    }),
    { calories: 0, protein_g: 0, carbohydrates_total_g: 0, fat_total_g: 0 }
  );

  return {
    food_log_id: randomId(),
    entries,
    totals,
    meal_type: mealType,
    logged_at: now,
  };
}

export function generateMockDailySummary(dateStr: string): DailySummary {
  // Seed random based on date for consistency
  const seed = dateStr.split("-").join("");
  const seededRand = (offset: number) => {
    const x = Math.sin(parseInt(seed) + offset) * 10000;
    return x - Math.floor(x);
  };

  const hasData = seededRand(0) > 0.25; // 75% of days have data

  if (!hasData) {
    return {
      date: dateStr,
      meals: {},
      totals: {
        calories: 0, protein_g: 0, carbohydrates_total_g: 0, fat_total_g: 0,
        fat_saturated_g: 0, fiber_g: 0, sugar_g: 0, sodium_mg: 0,
        potassium_mg: 0, cholesterol_mg: 0,
      },
      calorie_target: 2000,
      remaining_calories: 2000,
      status: "within",
      entry_count: 0,
    };
  }

  const meals: Record<string, FoodEntry[]> = {};
  const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snacks"];

  mealTypes.forEach((meal, i) => {
    const hasMeal = seededRand(i + 1) > 0.3;
    if (!hasMeal) return;

    const count = Math.floor(seededRand(i + 10) * 2) + 1;
    const items = pickRandom(MOCK_FOODS, count);
    meals[meal] = items.map((f) => ({
      id: randomId(),
      name: f.name,
      calories: f.calories,
      protein_g: f.protein_g,
      carbohydrates_total_g: f.carbohydrates_total_g,
      fat_total_g: f.fat_total_g,
      fat_saturated_g: Math.round(f.fat_total_g * 0.3 * 10) / 10,
      fiber_g: Math.round(seededRand(i + 20) * 5 * 10) / 10,
      sugar_g: Math.round(seededRand(i + 30) * 10 * 10) / 10,
      sodium_mg: Math.round(seededRand(i + 40) * 500),
      potassium_mg: Math.round(seededRand(i + 50) * 400),
      cholesterol_mg: Math.round(seededRand(i + 60) * 80),
      serving_size_g: f.serving_size_g,
      meal_type: meal,
      logged_at: dateStr,
      source: "mock",
    }));
  });

  const allEntries = Object.values(meals).flat();
  const totals = allEntries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein_g: acc.protein_g + e.protein_g,
      carbohydrates_total_g: acc.carbohydrates_total_g + e.carbohydrates_total_g,
      fat_total_g: acc.fat_total_g + e.fat_total_g,
      fat_saturated_g: acc.fat_saturated_g + e.fat_saturated_g,
      fiber_g: acc.fiber_g + e.fiber_g,
      sugar_g: acc.sugar_g + e.sugar_g,
      sodium_mg: acc.sodium_mg + e.sodium_mg,
      potassium_mg: acc.potassium_mg + e.potassium_mg,
      cholesterol_mg: acc.cholesterol_mg + e.cholesterol_mg,
    }),
    {
      calories: 0, protein_g: 0, carbohydrates_total_g: 0, fat_total_g: 0,
      fat_saturated_g: 0, fiber_g: 0, sugar_g: 0, sodium_mg: 0,
      potassium_mg: 0, cholesterol_mg: 0,
    }
  );

  const calorieTarget = 2000;
  const remaining = calorieTarget - totals.calories;
  let status: "within" | "slightly_over" | "over" = "within";
  if (totals.calories > calorieTarget * 1.15) status = "over";
  else if (totals.calories > calorieTarget) status = "slightly_over";

  return {
    date: dateStr,
    meals,
    totals,
    calorie_target: calorieTarget,
    remaining_calories: remaining,
    status,
    entry_count: allEntries.length,
  };
}

export function generateMockRecentFoods(): RecentFood[] {
  return pickRandom(MOCK_FOODS, 8).map((f, i) => ({
    id: `recent-${i}`,
    name: f.name,
    calories: f.calories,
    protein_g: f.protein_g,
    carbohydrates_total_g: f.carbohydrates_total_g,
    fat_total_g: f.fat_total_g,
    serving_size_g: f.serving_size_g,
    times_logged: Math.floor(Math.random() * 10) + 1,
    last_logged_at: new Date().toISOString(),
  }));
}
