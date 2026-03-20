"""SQLAlchemy models for Alembic migrations only. Queries use raw asyncpg."""

import uuid
from datetime import datetime

from sqlalchemy import (
    String,
    Text,
    Float,
    Integer,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    clerk_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    timezone: Mapped[str] = mapped_column(
        String(50), nullable=False, server_default="Asia/Jakarta"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    profile: Mapped["UserProfile"] = relationship(back_populates="user", uselist=False)
    food_logs: Mapped[list["FoodLog"]] = relationship(back_populates="user")
    food_entries: Mapped[list["FoodEntry"]] = relationship(back_populates="user")
    food_cache: Mapped[list["FoodCache"]] = relationship(back_populates="user")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    weight_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    height_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    activity_level: Mapped[str | None] = mapped_column(String(50), nullable=True)
    goal: Mapped[str | None] = mapped_column(String(50), nullable=True)
    daily_calorie_target: Mapped[int | None] = mapped_column(Integer, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(back_populates="profile")


class FoodLog(Base):
    __tablename__ = "food_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    input_type: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default="text"
    )
    original_input: Mapped[str | None] = mapped_column(Text, nullable=True)
    normalized_query: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_extracted_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    logged_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="food_logs")
    entries: Mapped[list["FoodEntry"]] = relationship(back_populates="food_log")


class FoodEntry(Base):
    __tablename__ = "food_entries"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    food_log_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("food_logs.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    calories: Mapped[float] = mapped_column(Float, nullable=False)
    protein_g: Mapped[float] = mapped_column(Float, nullable=False, server_default="0")
    carbohydrates_total_g: Mapped[float] = mapped_column(
        Float, nullable=False, server_default="0"
    )
    fat_total_g: Mapped[float] = mapped_column(
        Float, nullable=False, server_default="0"
    )
    fat_saturated_g: Mapped[float] = mapped_column(
        Float, nullable=False, server_default="0"
    )
    fiber_g: Mapped[float] = mapped_column(Float, nullable=False, server_default="0")
    sugar_g: Mapped[float] = mapped_column(Float, nullable=False, server_default="0")
    sodium_mg: Mapped[float] = mapped_column(Float, nullable=False, server_default="0")
    potassium_mg: Mapped[float] = mapped_column(
        Float, nullable=False, server_default="0"
    )
    cholesterol_mg: Mapped[float] = mapped_column(
        Float, nullable=False, server_default="0"
    )
    serving_size_g: Mapped[float] = mapped_column(
        Float, nullable=False, server_default="100"
    )
    meal_type: Mapped[str] = mapped_column(String(20), nullable=False)
    logged_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    source: Mapped[str] = mapped_column(
        String(50), nullable=False, server_default="mock"
    )
    raw_api_response: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    food_log: Mapped["FoodLog"] = relationship(back_populates="entries")
    user: Mapped["User"] = relationship(back_populates="food_entries")


class FoodCache(Base):
    __tablename__ = "food_cache"
    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_food_cache_user_name"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    original_query: Mapped[str | None] = mapped_column(Text, nullable=True)
    calories: Mapped[float] = mapped_column(Float, nullable=False)
    protein_g: Mapped[float] = mapped_column(Float, nullable=False, server_default="0")
    carbohydrates_total_g: Mapped[float] = mapped_column(
        Float, nullable=False, server_default="0"
    )
    fat_total_g: Mapped[float] = mapped_column(
        Float, nullable=False, server_default="0"
    )
    serving_size_g: Mapped[float] = mapped_column(
        Float, nullable=False, server_default="100"
    )
    times_logged: Mapped[int] = mapped_column(Integer, nullable=False, server_default="1")
    last_logged_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="food_cache")
