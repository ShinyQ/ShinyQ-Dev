from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.redis import init_redis, close_redis
from app.db.postgres import init_pool, close_pool
from app.api import foods, summary, users, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_pool()
    await init_redis()
    yield
    # Shutdown
    await close_redis()
    await close_pool()


app = FastAPI(
    title="CalorIQ API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(users.router)
app.include_router(foods.router)
app.include_router(summary.router)
