from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://caloriq:caloriq@localhost:5432/caloriq"
    REDIS_URL: str = "redis://localhost:6379/1"
    CLERK_ISSUER: str = ""
    CLERK_AUDIENCE: Optional[str] = None
    CORS_ORIGINS: list[str] = ["http://localhost:3001"]
    APP_ENV: str = "development"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()
