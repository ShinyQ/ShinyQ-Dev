from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user
from app.models.user import ProfileRequest, ProfileResponse, UserResponse
from app.services.user import get_user_with_profile, upsert_profile

router = APIRouter(prefix="/api/v1/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: Annotated[dict, Depends(get_current_user)],
):
    user = await get_user_with_profile(current_user["user_id"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.post("/profile", response_model=ProfileResponse)
async def update_profile(
    body: ProfileRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    profile = await upsert_profile(
        user_id=current_user["user_id"],
        weight_kg=body.weight_kg,
        height_cm=body.height_cm,
        age=body.age,
        gender=body.gender,
        activity_level=body.activity_level,
        goal=body.goal,
    )
    return profile
