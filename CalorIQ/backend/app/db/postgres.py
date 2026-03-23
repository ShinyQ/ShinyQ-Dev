import asyncpg
import logging
from decimal import Decimal
from typing import Optional, AsyncGenerator
from contextlib import asynccontextmanager

from app.core.config import settings

_pool: Optional[asyncpg.Pool] = None
logger = logging.getLogger(__name__)


async def _init_connection(conn: asyncpg.Connection) -> None:
    """Initialize each connection: register custom type codecs."""
    # Convert PostgreSQL numeric/decimal to Python float automatically
    await conn.set_type_codec(
        "numeric",
        encoder=str,
        decoder=lambda v: float(Decimal(v)),
        schema="pg_catalog",
    )


async def init_pool() -> asyncpg.Pool:
    global _pool
    logger.info("db_pool_init_begin")
    try:
        _pool = await asyncpg.create_pool(
            dsn=settings.DATABASE_URL,
            min_size=2,
            max_size=10,
            command_timeout=30,
            init=_init_connection,
        )
        logger.info("db_pool_init_success")
        return _pool
    except Exception:  # noqa: BLE001
        logger.exception("db_pool_init_failed")
        raise


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        logger.info("db_pool_close_begin")
        await _pool.close()
        _pool = None
        logger.info("db_pool_close_success")


def get_pool() -> asyncpg.Pool:
    if _pool is None:
        logger.error("db_pool_uninitialized")
        raise RuntimeError("Database pool not initialized. Call init_pool() first.")
    return _pool


@asynccontextmanager
async def get_db() -> AsyncGenerator[asyncpg.Connection, None]:
    pool = get_pool()
    async with pool.acquire() as conn:
        yield conn
