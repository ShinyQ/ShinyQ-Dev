from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user
from app.models.user import ProfileRequest, ProfileResponse, UserResponse
from app.services.user import get_profile, get_user_with_profile, upsert_profile

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
    existing = await get_profile(current_user["user_id"])
    merged = {
        "weight_kg": body.weight_kg if body.weight_kg is not None else (existing or {}).get("weight_kg"),
        "height_cm": body.height_cm if body.height_cm is not None else (existing or {}).get("height_cm"),
        "age": body.age if body.age is not None else (existing or {}).get("age"),
        "gender": body.gender if body.gender is not None else (existing or {}).get("gender"),
        "activity_level": (
            body.activity_level
            if body.activity_level is not None
            else (existing or {}).get("activity_level")
        ),
        "goal": body.goal if body.goal is not None else (existing or {}).get("goal"),
    }

    missing = [k for k, v in merged.items() if v is None]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": "missing_required_fields", "fields": missing},
        )

    profile = await upsert_profile(
        user_id=current_user["user_id"],
        weight_kg=merged["weight_kg"],
        height_cm=merged["height_cm"],
        age=merged["age"],
        gender=merged["gender"],
        activity_level=merged["activity_level"],
        goal=merged["goal"],
    )
    return profile
