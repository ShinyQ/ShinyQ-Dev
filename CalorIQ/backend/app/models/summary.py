from pydantic import BaseModel


class DailySummaryResponse(BaseModel):
    date: str
    meals: dict[str, list[dict]]
    totals: dict[str, float]
    calorie_target: int
    remaining_calories: float
    status: str
    entry_count: int
