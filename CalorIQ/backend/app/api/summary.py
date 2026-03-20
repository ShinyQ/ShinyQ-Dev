from datetime import date, datetime
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query

from app.core.deps import get_current_user
from app.models.summary import DailySummaryResponse
from app.services.summary import get_daily_summary

router = APIRouter(prefix="/api/v1/summary", tags=["summary"])


@router.get("/daily", response_model=DailySummaryResponse)
async def daily_summary(
    current_user: Annotated[dict, Depends(get_current_user)],
    date_str: Optional[str] = Query(
        None, alias="date", description="Date in YYYY-MM-DD format"
    ),
):
    if date_str:
        target_date = date.fromisoformat(date_str)
    else:
        target_date = datetime.now().date()

    result = await get_daily_summary(current_user["user_id"], target_date)
    return result
