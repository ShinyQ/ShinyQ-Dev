import asyncio
import json
import logging
import time
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import UUID

from openai import AsyncAzureOpenAI

from app.core.config import settings
from app.core.redis import get_redis

logger = logging.getLogger(__name__)

_client: AsyncAzureOpenAI | None = None
_MAX_IMAGE_BYTES = 10 * 1024 * 1024

SYSTEM_PROMPT = """
You are a precise nutrition analyst.

You can understand multiple languages, including Bahasa Indonesia.
Always return the food names in Bahasa Indonesia (natural, common Indonesian names).
Use realistic nutritional estimates with USDA-style references.
For portion hints:
- 1 plate cooked rice is usually around 250-300g
- 1 bowl is usually around 200-250g
- Typical calibration examples per 100g:
  rice: 130 kcal, chicken breast: 165 kcal, egg: 155 kcal

Multimodal estimation rules:
1) When an image is provided, identify ALL clearly visible components, including toppings, side items, sauces, oils, and garnishes.
2) Estimate grams per component from visual cues (container size, plate coverage, thickness, count).
3) Infer hidden/common components for Indonesian foods when likely (for example: mie ayam often includes noodles, chicken topping, oil/seasoning, and may include meatballs if visible).
4) If text and image are both provided, combine them.
5) Text input is the primary source of truth for explicit quantity/count/portion.
6) Use image to refine or fill missing details from text (component breakdown, gram estimates, extra items).
7) If text and image conflict, trust explicit text quantity but keep image-based component detection.
8) Do not collapse a complex meal into one generic item when multiple components are visible or described.

Return STRICT JSON only in this shape:
{
  "items": [
    {
      "name": "Nama Makanan (Bahasa Indonesia)",
      "quantity_text": "deskripsi jumlah, contoh: 2 butir telur",
      "serving_size_g": 100,
      "calories": 0,
      "protein_g": 0,
      "carbohydrates_total_g": 0,
      "fat_total_g": 0,
      "fat_saturated_g": 0,
      "fiber_g": 0,
      "sugar_g": 0,
      "sodium_mg": 0,
      "potassium_mg": 0,
      "cholesterol_mg": 0
    }
  ],
  "confidence": 0.0
}

Rules:
- confidence must be a number from 0 to 1.
- items must have at least one food item.
- numeric values must be non-negative.
- keep estimates realistic and consistent.
- Use quantity_text that is user-facing and specific (for example: "1 mangkuk mie ayam + 3 bakso", "2 potong ayam goreng").
- Ensure serving_size_g reflects the estimated edible grams for each item/component.
""".strip()


class AIServiceError(Exception):
    """Raised when Azure OpenAI nutrition analysis fails."""


def _get_client() -> AsyncAzureOpenAI:
    global _client
    if _client is None:
        if not settings.AZURE_OPENAI_ENDPOINT or not settings.AZURE_OPENAI_API_KEY:
            raise AIServiceError("Azure OpenAI is not configured")
        _client = AsyncAzureOpenAI(
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_key=settings.AZURE_OPENAI_API_KEY,
            api_version=settings.AZURE_OPENAI_API_VERSION,
        )
    return _client


def _coerce_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _coerce_non_negative_float(value: Any, default: float = 0.0) -> float:
    return max(0.0, round(_coerce_float(value, default), 2))


def _normalize_item(item: dict[str, Any]) -> dict[str, Any]:
    name = str(item.get("name", "")).strip()
    if not name:
        raise AIServiceError("AI response item missing name")
    quantity_text = str(item.get("quantity_text", "")).strip() or "1 porsi"

    return {
        "name": name,
        "quantity_text": quantity_text,
        "calories": _coerce_non_negative_float(item.get("calories")),
        "protein_g": _coerce_non_negative_float(item.get("protein_g")),
        "carbohydrates_total_g": _coerce_non_negative_float(
            item.get("carbohydrates_total_g")
        ),
        "fat_total_g": _coerce_non_negative_float(item.get("fat_total_g")),
        "fat_saturated_g": _coerce_non_negative_float(item.get("fat_saturated_g")),
        "fiber_g": _coerce_non_negative_float(item.get("fiber_g")),
        "sugar_g": _coerce_non_negative_float(item.get("sugar_g")),
        "sodium_mg": _coerce_non_negative_float(item.get("sodium_mg")),
        "potassium_mg": _coerce_non_negative_float(item.get("potassium_mg")),
        "cholesterol_mg": _coerce_non_negative_float(item.get("cholesterol_mg")),
        "serving_size_g": _coerce_non_negative_float(item.get("serving_size_g"), 100.0),
        "source": "azure_openai",
    }


def _extract_base64_payload(image_base64: str) -> str:
    image = image_base64.strip()
    if image.startswith("data:"):
        parts = image.split(",", 1)
        if len(parts) != 2 or not parts[1]:
            raise AIServiceError("Invalid image payload")
        return parts[1]
    return image


def _extract_text_content(raw_response: dict[str, Any]) -> str:
    choices = raw_response.get("choices")
    if not isinstance(choices, list) or not choices:
        raise AIServiceError("AI response missing choices")

    message = choices[0].get("message", {})
    content = message.get("content")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for part in content:
            if isinstance(part, dict) and isinstance(part.get("text"), str):
                parts.append(part["text"])
        if parts:
            return "".join(parts)
    raise AIServiceError("AI response missing message content")


async def _call_openai(messages: list[dict[str, Any]]) -> dict[str, Any]:
    client = _get_client()
    backoff_seconds = [1, 2]
    last_error: Exception | None = None

    for attempt in range(3):
        started_at = time.perf_counter()
        try:
            logger.info("ai_call_attempt attempt=%s", attempt + 1)
            response = await client.chat.completions.create(
                model=settings.AZURE_OPENAI_DEPLOYMENT,
                messages=messages,
                temperature=0.3,
                max_tokens=2048,
                response_format={"type": "json_object"},
            )
            duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
            logger.info(
                "ai_call_success attempt=%s duration_ms=%.2f",
                attempt + 1,
                duration_ms,
            )
            return response.model_dump(mode="json")
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
            logger.warning(
                "ai_call_attempt_failed attempt=%s duration_ms=%.2f error=%s",
                attempt + 1,
                duration_ms,
                str(exc),
            )
            if attempt < len(backoff_seconds):
                await asyncio.sleep(backoff_seconds[attempt])

    logger.error("ai_call_failed_after_retries")
    raise AIServiceError("Azure OpenAI call failed") from last_error


async def analyze_food(
    description: str | None,
    image_base64: str | None,
) -> tuple[list[dict[str, Any]], dict[str, Any], float]:
    logger.info(
        "ai_analyze_begin has_description=%s has_image=%s",
        bool(description),
        bool(image_base64),
    )
    user_content: list[dict[str, Any]] = []

    if description:
        user_content.append(
            {
                "type": "text",
                "text": f"User food description: {description.strip()}",
            }
        )

    if image_base64:
        image_payload = _extract_base64_payload(image_base64)
        approx_bytes = (len(image_payload) * 3) // 4
        if approx_bytes > _MAX_IMAGE_BYTES:
            raise AIServiceError("image_too_large")
        user_content.append(
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{image_payload}",
                    "detail": "low",
                },
            }
        )

    if not user_content:
        raise AIServiceError("input_required")

    user_content.append(
        {
            "type": "text",
            "text": "Return only strict JSON object with items and confidence.",
        }
    )

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]

    raw_response = await _call_openai(messages)
    content_text = _extract_text_content(raw_response)

    try:
        parsed = json.loads(content_text)
    except json.JSONDecodeError as exc:
        raise AIServiceError("AI returned invalid JSON") from exc

    items = parsed.get("items")
    if not isinstance(items, list) or len(items) == 0:
        raise AIServiceError("AI returned empty items list")

    normalized_items = [_normalize_item(item) for item in items if isinstance(item, dict)]
    if len(normalized_items) == 0:
        raise AIServiceError("AI returned invalid items")

    confidence = _coerce_float(parsed.get("confidence"), 0.0)
    confidence = min(1.0, max(0.0, round(confidence, 2)))

    logger.info(
        "ai_analyze_success items=%s confidence=%.2f",
        len(normalized_items),
        confidence,
    )
    return normalized_items, raw_response, confidence


def _rate_limit_key(user_id: UUID, now_utc: datetime) -> str:
    return f"ai_ratelimit:{user_id}:{now_utc.date().isoformat()}"


def _seconds_until_utc_midnight(now_utc: datetime) -> int:
    next_midnight = (now_utc + timedelta(days=1)).replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )
    return max(1, int((next_midnight - now_utc).total_seconds()))


async def check_rate_limit(user_id: UUID) -> tuple[bool, int]:
    """Returns (is_allowed, remaining_count). Fail-open if Redis is unavailable."""
    try:
        now_utc = datetime.now(timezone.utc)
        key = _rate_limit_key(user_id, now_utc)
        redis = get_redis()

        current_count = int(await redis.incr(key))
        if current_count == 1:
            await redis.expire(key, _seconds_until_utc_midnight(now_utc))

        remaining = max(settings.AI_RATE_LIMIT_PER_DAY - current_count, 0)
        logger.info(
            "ai_rate_limit_checked user_id=%s current_count=%s remaining=%s",
            user_id,
            current_count,
            remaining,
        )
        return current_count <= settings.AI_RATE_LIMIT_PER_DAY, remaining
    except Exception:  # noqa: BLE001
        logger.exception("Rate limit check failed, allowing request")
        return True, settings.AI_RATE_LIMIT_PER_DAY


async def get_retry_after_seconds(user_id: UUID) -> int:
    try:
        now_utc = datetime.now(timezone.utc)
        key = _rate_limit_key(user_id, now_utc)
        redis = get_redis()
        ttl = await redis.ttl(key)
        if ttl is None or ttl < 1:
            return _seconds_until_utc_midnight(now_utc)
        return int(ttl)
    except Exception:  # noqa: BLE001
        now_utc = datetime.now(timezone.utc)
        return _seconds_until_utc_midnight(now_utc)
