from datetime import date, datetime, timedelta
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


@router.get("/range")
async def date_range_summary(
    current_user: Annotated[dict, Depends(get_current_user)],
    start: str = Query(..., description="Start date YYYY-MM-DD"),
    end: str = Query(..., description="End date YYYY-MM-DD"),
):
    """Get summaries for a date range. Max 31 days.

    Returns a dict mapping date strings to summary objects.
    Useful for calendar/weekly/monthly views to batch-fetch data.
    """
    start_date = date.fromisoformat(start)
    end_date = date.fromisoformat(end)

    # Cap at 31 days to prevent abuse
    if (end_date - start_date).days > 31:
        end_date = start_date + timedelta(days=31)

    # Don't return future dates
    today = datetime.now().date()
    if end_date > today:
        end_date = today

    user_id = current_user["user_id"]
    results: dict[str, dict] = {}
    current = start_date

    while current <= end_date:
        summary = await get_daily_summary(user_id, current)
        results[current.isoformat()] = summary
        current += timedelta(days=1)

    return results
