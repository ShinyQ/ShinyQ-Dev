from pydantic import BaseModel, Field
from typing import Optional


class ProfileRequest(BaseModel):
    weight_kg: Optional[float] = Field(None, gt=0, le=500)
    height_cm: Optional[float] = Field(None, gt=0, le=300)
    age: Optional[int] = Field(None, gt=0, le=150)
    gender: Optional[str] = Field(None, pattern="^(male|female)$")
    activity_level: Optional[str] = Field(
        None,
        pattern="^(sedentary|light|moderate|active|very_active)$",
    )
    goal: Optional[str] = Field(None, pattern="^(lose|maintain|gain)$")


class ProfileResponse(BaseModel):
    weight_kg: float
    height_cm: float
    age: int
    gender: str
    activity_level: str
    goal: str
    daily_calorie_target: int


class UserResponse(BaseModel):
    id: str
    clerk_id: str
    email: Optional[str]
    name: Optional[str]
    timezone: str
    created_at: Optional[str]
    updated_at: Optional[str]
    profile: Optional[ProfileResponse]
