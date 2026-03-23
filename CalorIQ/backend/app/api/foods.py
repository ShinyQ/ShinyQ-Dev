import logging
import json
import uuid
from datetime import datetime, timedelta
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import JSONResponse

from app.core.deps import get_current_user
from app.db.postgres import get_pool
from app.models.food import FoodLogRequest, FoodLogResponse, RecentFoodItem
from app.services.cache import NutritionCache, SummaryCache
from app.services.ai_nutrition import (
    AIServiceError,
    analyze_food,
    check_rate_limit,
    get_retry_after_seconds,
)

router = APIRouter(prefix="/api/v1/foods", tags=["foods"])
logger = logging.getLogger(__name__)

MAX_IMAGE_BYTES = 10 * 1024 * 1024


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


def _error_response(
    status_code: int,
    error_code: str,
    detail: str,
    *,
    retry_after: int | None = None,
    headers: dict[str, str] | None = None,
) -> JSONResponse:
    payload: dict[str, str | int | bool] = {
        "error": error_code,
        "detail": detail,
    }
    if retry_after is not None:
        payload["retry_after"] = retry_after

    return JSONResponse(
        status_code=status_code,
        content=payload,
        headers=headers,
    )


def _image_payload_size(image_base64: str) -> int:
    payload = image_base64.strip()
    if payload.startswith("data:"):
        payload = payload.split(",", 1)[1] if "," in payload else ""
    return (len(payload) * 3) // 4


async def _has_completed_profile(user_id: uuid.UUID) -> bool:
    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT weight_kg, height_cm, age, gender, activity_level, goal,
                   daily_calorie_target
            FROM user_profiles
            WHERE user_id = $1
            """,
            user_id,
        )

    if not row:
        return False

    required_keys = (
        "weight_kg",
        "height_cm",
        "age",
        "gender",
        "activity_level",
        "goal",
        "daily_calorie_target",
    )
    return all(row[key] is not None for key in required_keys)


@router.post("/log", response_model=FoodLogResponse)
async def log_food(
    body: FoodLogRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
    response: Response,
):
    user_id: uuid.UUID = current_user["user_id"]
    description = (body.description or "").strip()
    image_base64 = (body.image_base64 or "").strip()
    logger.info(
        "food_log_begin user_id=%s has_description=%s has_image=%s",
        user_id,
        bool(description),
        bool(image_base64),
    )

    if not description and not image_base64:
        return _error_response(
            status_code=422,
            error_code="input_required",
            detail="Please describe your food or upload a photo",
        )

    if image_base64 and _image_payload_size(image_base64) > MAX_IMAGE_BYTES:
        return _error_response(
            status_code=413,
            error_code="image_too_large",
            detail="Image must be under 10MB",
        )

    if not await _has_completed_profile(user_id):
        logger.warning("food_log_profile_required user_id=%s", user_id)
        return _error_response(
            status_code=403,
            error_code="profile_required",
            detail="Complete your profile before logging food.",
        )

    allowed, remaining = await check_rate_limit(user_id)
    if allowed:
        response.headers["X-AI-Remaining"] = str(remaining)
    else:
        retry_after = await get_retry_after_seconds(user_id)
        logger.warning(
            "food_log_rate_limited user_id=%s retry_after=%s",
            user_id,
            retry_after,
        )
        return _error_response(
            status_code=429,
            error_code="rate_limit_exceeded",
            detail="Daily AI limit reached",
            retry_after=retry_after,
            headers={
                "Retry-After": str(retry_after),
                "X-AI-Remaining": "0",
            },
        )

    if body.logged_at:
        try:
            logged_at = datetime.fromisoformat(body.logged_at)
        except ValueError:
            return _error_response(
                status_code=422,
                error_code="input_required",
                detail="Invalid logged_at. Use ISO 8601 datetime format.",
            )
    else:
        logged_at = datetime.now()

    today = datetime.now().date()
    earliest_allowed_date = today - timedelta(days=29)
    if logged_at.date() < earliest_allowed_date or logged_at.date() > today:
        logger.warning(
            "food_log_logged_at_out_of_range user_id=%s logged_at=%s allowed_start=%s allowed_end=%s",
            user_id,
            logged_at.isoformat(),
            earliest_allowed_date.isoformat(),
            today.isoformat(),
        )
        return _error_response(
            status_code=422,
            error_code="logged_at_out_of_range",
            detail=(
                "logged_at must be within the last 30 days "
                f"({earliest_allowed_date.isoformat()} to {today.isoformat()})."
            ),
        )

    meal_type = body.meal_type or _auto_meal_type(logged_at)
    input_type = (
        "image_text" if description and image_base64 else "image" if image_base64 else "text"
    )

    source = "azure_openai"
    confidence = 0.0
    raw_response: dict = {}
    try:
        nutrition_items, raw_response, confidence = await analyze_food(
            description=description or None,
            image_base64=image_base64 or None,
        )
    except AIServiceError as exc:
        error_msg = str(exc)
        if error_msg == "image_too_large":
            return _error_response(
                status_code=413,
                error_code="image_too_large",
                detail="Image must be under 10MB",
            )
        if error_msg == "input_required":
            return _error_response(
                status_code=422,
                error_code="input_required",
                detail="Please describe your food or upload a photo",
            )
        if error_msg == "Invalid image payload":
            return _error_response(
                status_code=422,
                error_code="input_required",
                detail="Invalid image payload",
            )

        logger.exception("AI nutrition service failed")
        return _error_response(
            status_code=503,
            error_code="ai_unavailable",
            detail="AI nutrition service is unavailable. Please try again.",
        )
    except Exception:  # noqa: BLE001
        logger.exception("Unexpected error while analyzing food")
        return _error_response(
            status_code=500,
            error_code="service_error",
            detail="Unexpected server error",
        )

    if not nutrition_items:
        return _error_response(
            status_code=500,
            error_code="service_error",
            detail="Unable to estimate nutrition",
        )

    ai_extracted_text = ", ".join(item["name"] for item in nutrition_items)
    normalized_query = (description or ai_extracted_text).lower().strip()
    cache_query = normalized_query or description or ai_extracted_text or "unknown"
    serialized_raw_response = json.dumps(raw_response, default=str)
    logger.info(
        "food_log_ai_success user_id=%s items=%s confidence=%.2f",
        user_id,
        len(nutrition_items),
        confidence,
    )

    pool = get_pool()
    try:
        async with pool.acquire() as conn:
            async with conn.transaction():
                food_log_id = uuid.uuid4()
                await conn.execute(
                    """
                    INSERT INTO food_logs
                        (id, user_id, input_type, original_input, normalized_query,
                         image_url, ai_extracted_text, ai_confidence, logged_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    """,
                    food_log_id,
                    user_id,
                    input_type,
                    description or None,
                    normalized_query or None,
                    None,  # Images are not persisted.
                    ai_extracted_text,
                    confidence,
                    logged_at,
                )

                entries = []
                for item in nutrition_items:
                    entry_id = uuid.uuid4()
                    item_source = item.get("source", source)
                    await conn.execute(
                        """
                        INSERT INTO food_entries
                            (id, food_log_id, user_id, name, calories,
                             protein_g, carbohydrates_total_g, fat_total_g,
                             fat_saturated_g, fiber_g, sugar_g,
                             sodium_mg, potassium_mg, cholesterol_mg,
                             serving_size_g, quantity_text, meal_type, logged_at, source,
                             raw_api_response)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                                $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
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
                        item.get("quantity_text"),
                        meal_type,
                        logged_at,
                        item_source,
                        serialized_raw_response,
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
                            "quantity_text": item.get("quantity_text"),
                            "meal_type": meal_type,
                            "logged_at": logged_at.isoformat(),
                            "source": item_source,
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
                        cache_query,
                        item["calories"],
                        item["protein_g"],
                        item["carbohydrates_total_g"],
                        item["fat_total_g"],
                        item["serving_size_g"],
                        logged_at,
                    )
    except Exception:  # noqa: BLE001
        logger.exception("food_log_db_write_failed user_id=%s", user_id)
        return _error_response(
            status_code=500,
            error_code="service_error",
            detail="Failed to save food log",
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
    logger.info(
        "food_log_success user_id=%s food_log_id=%s entries=%s",
        user_id,
        food_log_id,
        len(entries),
    )

    return {
        "food_log_id": str(food_log_id),
        "entries": entries,
        "totals": totals,
        "meal_type": meal_type,
        "logged_at": logged_at.isoformat(),
        "source": source,
        "ai_confidence": confidence,
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


@router.delete("/entry/{entry_id}")
async def delete_food_entry(
    entry_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Delete a single food entry by ID. Also cleans up parent food_log if empty."""
    user_id: uuid.UUID = current_user["user_id"]
    entry_uuid = uuid.UUID(entry_id)

    pool = get_pool()
    async with pool.acquire() as conn:
        # Verify ownership and get logged_at for cache invalidation
        row = await conn.fetchrow(
            """
            SELECT id, food_log_id, logged_at
            FROM food_entries
            WHERE id = $1 AND user_id = $2
            """,
            entry_uuid,
            user_id,
        )

        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Food entry not found",
            )

        food_log_id = row["food_log_id"]
        logged_at = row["logged_at"]

        async with conn.transaction():
            # Delete the entry
            await conn.execute(
                "DELETE FROM food_entries WHERE id = $1",
                entry_uuid,
            )

            # Check if the parent food_log has remaining entries
            remaining = await conn.fetchval(
                "SELECT COUNT(*) FROM food_entries WHERE food_log_id = $1",
                food_log_id,
            )

            # If no entries left, delete the parent food_log too
            if remaining == 0:
                await conn.execute(
                    "DELETE FROM food_logs WHERE id = $1",
                    food_log_id,
                )

    # Invalidate caches for that date
    await SummaryCache.invalidate_for_date(user_id, logged_at.date())

    return {"status": "deleted", "id": entry_id}
