from pydantic import BaseModel, Field
from typing import Optional


class ProfileRequest(BaseModel):
    weight_kg: float = Field(..., gt=0, le=500)
    height_cm: float = Field(..., gt=0, le=300)
    age: int = Field(..., gt=0, le=150)
    gender: str = Field(..., pattern="^(male|female)$")
    activity_level: str = Field(
        ...,
        pattern="^(sedentary|light|moderate|active|very_active)$",
    )
    goal: str = Field(..., pattern="^(lose|maintain|gain)$")


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
