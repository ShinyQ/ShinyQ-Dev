from pydantic import BaseModel, Field
from typing import Optional


class FoodLogRequest(BaseModel):
    description: str = Field(..., min_length=1, max_length=1000)
    meal_type: Optional[str] = Field(
        None, pattern="^(breakfast|lunch|dinner|snacks)$"
    )
    logged_at: Optional[str] = Field(
        None,
        description="ISO 8601 datetime string. Defaults to now.",
    )


class FoodEntryResponse(BaseModel):
    id: str
    name: str
    calories: float
    protein_g: float
    carbohydrates_total_g: float
    fat_total_g: float
    fat_saturated_g: float
    fiber_g: float
    sugar_g: float
    sodium_mg: float
    potassium_mg: float
    cholesterol_mg: float
    serving_size_g: float
    meal_type: str
    logged_at: str
    source: str


class FoodLogTotals(BaseModel):
    calories: float
    protein_g: float
    carbohydrates_total_g: float
    fat_total_g: float


class FoodLogResponse(BaseModel):
    food_log_id: str
    entries: list[FoodEntryResponse]
    totals: FoodLogTotals
    meal_type: str
    logged_at: str


class RecentFoodItem(BaseModel):
    id: str
    name: str
    calories: float
    protein_g: float
    carbohydrates_total_g: float
    fat_total_g: float
    serving_size_g: float
    times_logged: int
    last_logged_at: str
