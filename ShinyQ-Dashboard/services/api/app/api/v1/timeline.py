from uuid import UUID
from typing import Sequence
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.portfolio import TimelineItem as TimelineModel
from app.schemas.portfolio import TimelineItem, TimelineItemCreate

router = APIRouter()

@router.get("/", response_model=list[TimelineItem])
async def list_timeline(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TimelineModel))
    return result.scalars().all()

@router.get("/{id}", response_model=TimelineItem)
async def get_timeline(id: UUID, db: AsyncSession = Depends(get_db)):
    item = await db.get(TimelineModel, id)
    if not item:
        raise HTTPException(status_code=404, detail="Timeline item not found")
    return item

@router.post("/", response_model=TimelineItem, status_code=status.HTTP_201_CREATED)
async def create_timeline(item_in: TimelineItemCreate, db: AsyncSession = Depends(get_db)):
    # Check if a timeline item with this slug already exists
    result = await db.execute(select(TimelineModel).where(TimelineModel.slug == item_in.slug))
    if result.scalar():
        raise HTTPException(status_code=400, detail="Timeline item with this slug already exists")
        
    item = TimelineModel(**item_in.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item

@router.put("/{id}", response_model=TimelineItem)
async def update_timeline(id: UUID, item_in: TimelineItemCreate, db: AsyncSession = Depends(get_db)):
    item = await db.get(TimelineModel, id)
    if not item:
        raise HTTPException(status_code=404, detail="Timeline item not found")
        
    # Check if the new slug is taken by another item
    if item_in.slug != item.slug:
        result = await db.execute(select(TimelineModel).where(TimelineModel.slug == item_in.slug))
        if result.scalar():
            raise HTTPException(status_code=400, detail="Slug already taken")

    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
        
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_timeline(id: UUID, db: AsyncSession = Depends(get_db)):
    item = await db.get(TimelineModel, id)
    if not item:
        raise HTTPException(status_code=404, detail="Timeline item not found")
    await db.delete(item)
    await db.commit()
