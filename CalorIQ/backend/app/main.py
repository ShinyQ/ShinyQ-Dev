import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import configure_logging
from app.core.redis import init_redis, close_redis
from app.db.postgres import init_pool, close_pool
from app.api import foods, summary, users, health

configure_logging(settings.LOG_LEVEL)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("startup_begin")
    await init_pool()
    await init_redis()
    logger.info("startup_completed")
    yield
    # Shutdown
    logger.info("shutdown_begin")
    await close_redis()
    await close_pool()
    logger.info("shutdown_completed")


app = FastAPI(
    title="CalorIQ API",
    version="1.0.0",
    lifespan=lifespan,
)


@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(
    request: Request, exc: RequestValidationError
):
    logger.warning(
        "request_validation_error path=%s errors=%s",
        request.url.path,
        exc.errors(),
    )
    if request.url.path == "/api/v1/foods/log":
        has_required_input_error = any(
            "Either description or image_base64 is required" in str(error.get("msg", ""))
            for error in exc.errors()
        )
        if has_required_input_error:
            return JSONResponse(
                status_code=422,
                content={
                    "error": "input_required",
                    "detail": "Please describe your food or upload a photo",
                },
            )
        return JSONResponse(
            status_code=422,
            content={
                "error": "input_required",
                "detail": "Invalid input payload",
            },
        )

    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    started_at = time.perf_counter()
    method = request.method
    path = request.url.path
    client_ip = request.client.host if request.client else "unknown"

    try:
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
        logger.info(
            "request_completed method=%s path=%s status=%s duration_ms=%.2f client_ip=%s",
            method,
            path,
            response.status_code,
            duration_ms,
            client_ip,
        )
        return response
    except Exception:  # noqa: BLE001
        duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
        logger.exception(
            "request_failed method=%s path=%s duration_ms=%.2f client_ip=%s",
            method,
            path,
            duration_ms,
            client_ip,
        )
        raise


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
