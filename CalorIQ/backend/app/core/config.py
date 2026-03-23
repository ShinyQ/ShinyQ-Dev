from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://caloriq:caloriq@localhost:5432/caloriq"
    REDIS_URL: str = "redis://localhost:6379/1"
    CLERK_ISSUER: str = ""
    CLERK_AUDIENCE: Optional[str] = None
    CLERK_SECRET_KEY: str = ""
    CORS_ORIGINS: list[str] = ["http://localhost:3001", "http://localhost:4000"]
    APP_ENV: str = "development"
    AZURE_OPENAI_ENDPOINT: str = ""
    AZURE_OPENAI_API_KEY: str = ""
    AZURE_OPENAI_DEPLOYMENT: str = "gpt-4o-mini"
    AZURE_OPENAI_API_VERSION: str = "2024-12-01-preview"
    AI_RATE_LIMIT_PER_DAY: int = 50
    LOG_LEVEL: str = "INFO"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


settings = Settings()
