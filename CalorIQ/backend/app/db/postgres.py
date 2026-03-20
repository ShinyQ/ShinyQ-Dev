import asyncpg
from typing import Optional, AsyncGenerator
from contextlib import asynccontextmanager

from app.core.config import settings

_pool: Optional[asyncpg.Pool] = None


async def init_pool() -> asyncpg.Pool:
    global _pool
    _pool = await asyncpg.create_pool(
        dsn=settings.DATABASE_URL,
        min_size=2,
        max_size=10,
        command_timeout=30,
    )
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


def get_pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("Database pool not initialized. Call init_pool() first.")
    return _pool


@asynccontextmanager
async def get_db() -> AsyncGenerator[asyncpg.Connection, None]:
    pool = get_pool()
    async with pool.acquire() as conn:
        yield conn
