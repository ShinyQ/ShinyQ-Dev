import json
import uuid
from datetime import datetime
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query

from app.core.deps import get_current_user
from app.db.postgres import get_pool
from app.models.food import FoodLogRequest, FoodLogResponse, RecentFoodItem
from app.services.cache import NutritionCache, SummaryCache
from app.services.nutrition import get_nutrition_for_description

router = APIRouter(prefix="/api/v1/foods", tags=["foods"])


def _auto_meal_type(dt: datetime) -> str:
    """Auto-assign meal type based on hour of day."""
    hour = dt.hour
    if 5 <= hour < 10:
        return "breakfast"
    elif 10 <= hour < 14:
        return "lunch"
    elif 14 <= hour < 17:
        return "snacks"
    elif 17 <= hour < 22:
        return "dinner"
    else:
        return "snacks"


@router.post("/log", response_model=FoodLogResponse)
async def log_food(
    body: FoodLogRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    user_id: uuid.UUID = current_user["user_id"]

    if body.logged_at:
        logged_at = datetime.fromisoformat(body.logged_at)
    else:
        logged_at = datetime.now()

    meal_type = body.meal_type or _auto_meal_type(logged_at)

    nutrition_items = get_nutrition_for_description(body.description)

    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            food_log_id = uuid.uuid4()
            await conn.execute(
                """
                INSERT INTO food_logs
                    (id, user_id, input_type, original_input, normalized_query, logged_at)
                VALUES ($1, $2, $3, $4, $5, $6)
                """,
                food_log_id,
                user_id,
                "text",
                body.description,
                body.description.lower().strip(),
                logged_at,
            )

            entries = []
            for item in nutrition_items:
                entry_id = uuid.uuid4()
                await conn.execute(
                    """
                    INSERT INTO food_entries
                        (id, food_log_id, user_id, name, calories,
                         protein_g, carbohydrates_total_g, fat_total_g,
                         fat_saturated_g, fiber_g, sugar_g,
                         sodium_mg, potassium_mg, cholesterol_mg,
                         serving_size_g, meal_type, logged_at, source,
                         raw_api_response)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                            $11, $12, $13, $14, $15, $16, $17, $18, $19)
                    """,
                    entry_id,
                    food_log_id,
                    user_id,
                    item["name"],
                    item["calories"],
                    item["protein_g"],
                    item["carbohydrates_total_g"],
                    item["fat_total_g"],
                    item["fat_saturated_g"],
                    item["fiber_g"],
                    item["sugar_g"],
                    item["sodium_mg"],
                    item["potassium_mg"],
                    item["cholesterol_mg"],
                    item["serving_size_g"],
                    meal_type,
                    logged_at,
                    item["source"],
                    json.dumps(item),
                )

                entries.append(
                    {
                        "id": str(entry_id),
                        "name": item["name"],
                        "calories": item["calories"],
                        "protein_g": item["protein_g"],
                        "carbohydrates_total_g": item["carbohydrates_total_g"],
                        "fat_total_g": item["fat_total_g"],
                        "fat_saturated_g": item["fat_saturated_g"],
                        "fiber_g": item["fiber_g"],
                        "sugar_g": item["sugar_g"],
                        "sodium_mg": item["sodium_mg"],
                        "potassium_mg": item["potassium_mg"],
                        "cholesterol_mg": item["cholesterol_mg"],
                        "serving_size_g": item["serving_size_g"],
                        "meal_type": meal_type,
                        "logged_at": logged_at.isoformat(),
                        "source": item["source"],
                    }
                )

                # Upsert food_cache
                cache_id = uuid.uuid4()
                await conn.execute(
                    """
                    INSERT INTO food_cache
                        (id, user_id, name, original_query, calories,
                         protein_g, carbohydrates_total_g, fat_total_g,
                         serving_size_g, times_logged, last_logged_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1, $10)
                    ON CONFLICT (user_id, name) DO UPDATE SET
                        calories = $5,
                        protein_g = $6,
                        carbohydrates_total_g = $7,
                        fat_total_g = $8,
                        serving_size_g = $9,
                        times_logged = food_cache.times_logged + 1,
                        last_logged_at = $10
                    """,
                    cache_id,
                    user_id,
                    item["name"],
                    body.description.lower().strip(),
                    item["calories"],
                    item["protein_g"],
                    item["carbohydrates_total_g"],
                    item["fat_total_g"],
                    item["serving_size_g"],
                    logged_at,
                )

    # Invalidate Redis caches
    await SummaryCache.invalidate_for_date(user_id, logged_at.date())

    totals = {
        "calories": round(sum(e["calories"] for e in entries), 1),
        "protein_g": round(sum(e["protein_g"] for e in entries), 1),
        "carbohydrates_total_g": round(
            sum(e["carbohydrates_total_g"] for e in entries), 1
        ),
        "fat_total_g": round(sum(e["fat_total_g"] for e in entries), 1),
    }

    return {
        "food_log_id": str(food_log_id),
        "entries": entries,
        "totals": totals,
        "meal_type": meal_type,
        "logged_at": logged_at.isoformat(),
    }


@router.get("/recent", response_model=list[RecentFoodItem])
async def get_recent_foods(
    current_user: Annotated[dict, Depends(get_current_user)],
    limit: Optional[int] = Query(20, ge=1, le=100),
):
    user_id: uuid.UUID = current_user["user_id"]

    cached = await NutritionCache.get_recent_foods(user_id)
    if cached is not None:
        return cached[:limit]

    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, name, calories, protein_g, carbohydrates_total_g,
                   fat_total_g, serving_size_g, times_logged, last_logged_at
            FROM food_cache
            WHERE user_id = $1
            ORDER BY last_logged_at DESC
            LIMIT $2
            """,
            user_id,
            limit,
        )

    foods = [
        {
            "id": str(row["id"]),
            "name": row["name"],
            "calories": row["calories"],
            "protein_g": row["protein_g"],
            "carbohydrates_total_g": row["carbohydrates_total_g"],
            "fat_total_g": row["fat_total_g"],
            "serving_size_g": row["serving_size_g"],
            "times_logged": row["times_logged"],
            "last_logged_at": row["last_logged_at"].isoformat(),
        }
        for row in rows
    ]

    await NutritionCache.set_recent_foods(user_id, foods)
    return foods
