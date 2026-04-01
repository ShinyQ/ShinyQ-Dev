import logging
from functools import lru_cache

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables / .env file.

    Required in production:
        CORS_ORIGINS  — comma-separated list of allowed origins
        APP_ENV       — must be "production"

    Optional (defaults shown):
        APP_PORT      — 8000
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = "development"
    app_port: int = 8000
    cors_origins: str = "http://localhost:3000"
    database_url: str = "postgresql+asyncpg://shinyq:shinyq@localhost:5432/shinyq"

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @model_validator(mode="after")
    def _validate_production_settings(self) -> "Settings":
        if self.is_production and self.cors_origins == "http://localhost:3000":
            raise ValueError(
                "CORS_ORIGINS is still set to localhost default in production. "
                "Set it to your actual frontend origin(s)."
            )
        if not self.is_production and self.cors_origins == "http://localhost:3000":
            logger.warning(
                "CORS_ORIGINS is using the default localhost value. "
                "Set CORS_ORIGINS in .env for non-local environments."
            )
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
