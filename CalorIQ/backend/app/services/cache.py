import json
from datetime import date
from uuid import UUID

from app.core.redis import get_redis

DAILY_TTL = 3600  # 1 hour
WEEKLY_TTL = 3600
MONTHLY_TTL = 3600
CALENDAR_TTL = 3600
RECENT_FOODS_TTL = 1800  # 30 minutes


def _daily_key(user_id: UUID, d: date) -> str:
    return f"summary:daily:{user_id}:{d.isoformat()}"


def _weekly_key(user_id: UUID, d: date) -> str:
    return f"summary:weekly:{user_id}:{d.isocalendar()[1]}:{d.year}"


def _monthly_key(user_id: UUID, d: date) -> str:
    return f"summary:monthly:{user_id}:{d.year}-{d.month:02d}"


def _calendar_key(user_id: UUID, d: date) -> str:
    return f"summary:calendar:{user_id}:{d.year}-{d.month:02d}"


def _recent_foods_key(user_id: UUID) -> str:
    return f"foods:recent:{user_id}"


class SummaryCache:
    """Cache for daily/weekly/monthly/calendar summaries."""

    @staticmethod
    async def get_daily(user_id: UUID, d: date) -> dict | None:
        r = get_redis()
        data = await r.get(_daily_key(user_id, d))
        return json.loads(data) if data else None

    @staticmethod
    async def set_daily(user_id: UUID, d: date, value: dict) -> None:
        r = get_redis()
        await r.set(_daily_key(user_id, d), json.dumps(value, default=str), ex=DAILY_TTL)

    @staticmethod
    async def invalidate_for_date(user_id: UUID, d: date) -> None:
        """Invalidate all summary caches that might be affected by a date change."""
        r = get_redis()
        keys_to_delete = [
            _daily_key(user_id, d),
            _weekly_key(user_id, d),
            _monthly_key(user_id, d),
            _calendar_key(user_id, d),
            _recent_foods_key(user_id),
        ]
        for key in keys_to_delete:
            await r.delete(key)

    @staticmethod
    async def invalidate_all_for_user(user_id: UUID) -> None:
        """Invalidate all summary/cache keys for a user (used after profile updates)."""
        r = get_redis()
        patterns = [
            f"summary:daily:{user_id}:*",
            f"summary:weekly:{user_id}:*",
            f"summary:monthly:{user_id}:*",
            f"summary:calendar:{user_id}:*",
            _recent_foods_key(user_id),
        ]
        for pattern in patterns:
            if "*" in pattern:
                async for key in r.scan_iter(match=pattern, count=100):
                    await r.delete(key)
            else:
                await r.delete(pattern)


class NutritionCache:
    """Cache for recent foods."""

    @staticmethod
    async def get_recent_foods(user_id: UUID) -> list[dict] | None:
        r = get_redis()
        data = await r.get(_recent_foods_key(user_id))
        return json.loads(data) if data else None

    @staticmethod
    async def set_recent_foods(user_id: UUID, foods: list[dict]) -> None:
        r = get_redis()
        await r.set(
            _recent_foods_key(user_id),
            json.dumps(foods, default=str),
            ex=RECENT_FOODS_TTL,
        )
