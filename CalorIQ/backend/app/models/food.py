from pydantic import BaseModel, Field, model_validator
from typing import Optional


class FoodLogRequest(BaseModel):
    description: Optional[str] = Field(None, max_length=1000)
    image_base64: Optional[str] = Field(None)
    meal_type: Optional[str] = Field(
        None, pattern="^(breakfast|lunch|dinner|snacks)$"
    )
    logged_at: Optional[str] = Field(
        None,
        description="ISO 8601 datetime string. Defaults to now.",
    )

    @model_validator(mode="after")
    def require_input(self):
        description = (self.description or "").strip()
        image_base64 = (self.image_base64 or "").strip()
        if not description and not image_base64:
            raise ValueError("Either description or image_base64 is required")

        self.description = description or None
        self.image_base64 = image_base64 or None
        return self


class FoodEntryResponse(BaseModel):
    id: str
    name: str
    quantity_text: Optional[str] = None
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
    source: Optional[str] = None
    ai_confidence: Optional[float] = None


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
