import uuid
from datetime import date

from app.db.postgres import get_pool
from app.services.cache import SummaryCache


async def get_daily_summary(user_id: uuid.UUID, target_date: date) -> dict:
    """Get daily food summary for a user, grouped by meal type."""
    cached = await SummaryCache.get_daily(user_id, target_date)
    if cached is not None:
        return cached

    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                id, name, calories, protein_g, carbohydrates_total_g,
                fat_total_g, fat_saturated_g, fiber_g, sugar_g,
                sodium_mg, potassium_mg, cholesterol_mg,
                serving_size_g, quantity_text, meal_type, logged_at, source
            FROM food_entries
            WHERE user_id = $1
              AND logged_at::date = $2
            ORDER BY logged_at ASC
            """,
            user_id,
            target_date,
        )

        profile = await conn.fetchrow(
            "SELECT daily_calorie_target FROM user_profiles WHERE user_id = $1",
            user_id,
        )

    calorie_target = (profile["daily_calorie_target"] if profile else None) or 2000

    meals: dict[str, list[dict]] = {}
    totals = {
        "calories": 0.0,
        "protein_g": 0.0,
        "carbohydrates_total_g": 0.0,
        "fat_total_g": 0.0,
        "fat_saturated_g": 0.0,
        "fiber_g": 0.0,
        "sugar_g": 0.0,
        "sodium_mg": 0.0,
        "potassium_mg": 0.0,
        "cholesterol_mg": 0.0,
    }

    for row in rows:
        meal = row["meal_type"]
        entry = {
            "id": str(row["id"]),
            "name": row["name"],
            "calories": row["calories"],
            "protein_g": row["protein_g"],
            "carbohydrates_total_g": row["carbohydrates_total_g"],
            "fat_total_g": row["fat_total_g"],
            "fat_saturated_g": row["fat_saturated_g"],
            "fiber_g": row["fiber_g"],
            "sugar_g": row["sugar_g"],
            "sodium_mg": row["sodium_mg"],
            "potassium_mg": row["potassium_mg"],
            "cholesterol_mg": row["cholesterol_mg"],
            "serving_size_g": row["serving_size_g"],
            "quantity_text": row["quantity_text"],
            "meal_type": meal,
            "logged_at": row["logged_at"].isoformat(),
            "source": row["source"],
        }

        meals.setdefault(meal, []).append(entry)

        for key in totals:
            totals[key] += row[key]

    totals = {k: round(v, 1) for k, v in totals.items()}

    remaining = round(calorie_target - totals["calories"], 1)
    if totals["calories"] <= calorie_target:
        status = "within"
    elif totals["calories"] <= calorie_target * 1.1:
        status = "slightly_over"
    else:
        status = "over"

    result = {
        "date": target_date.isoformat(),
        "meals": meals,
        "totals": totals,
        "calorie_target": calorie_target,
        "remaining_calories": remaining,
        "status": status,
        "entry_count": len(rows),
    }

    await SummaryCache.set_daily(user_id, target_date, result)
    return result
