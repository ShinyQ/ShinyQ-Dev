import redis.asyncio as aioredis
from typing import Optional

from app.core.config import settings

_redis: Optional[aioredis.Redis] = None


async def init_redis() -> aioredis.Redis:
    global _redis
    _redis = aioredis.from_url(
        settings.REDIS_URL,
        decode_responses=True,
    )
    await _redis.ping()
    return _redis


async def close_redis() -> None:
    global _redis
    if _redis is not None:
        await _redis.close()
        _redis = None


def get_redis() -> aioredis.Redis:
    if _redis is None:
        raise RuntimeError("Redis not initialized. Call init_redis() first.")
    return _redis
