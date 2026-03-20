from fastapi import APIRouter

from app.db.postgres import get_pool
from app.core.redis import get_redis

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    status = {"status": "ok", "database": "unknown", "redis": "unknown"}

    try:
        pool = get_pool()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        status["database"] = "connected"
    except Exception as e:
        status["database"] = f"error: {e}"
        status["status"] = "degraded"

    try:
        r = get_redis()
        await r.ping()
        status["redis"] = "connected"
    except Exception as e:
        status["redis"] = f"error: {e}"
        status["status"] = "degraded"

    return status
