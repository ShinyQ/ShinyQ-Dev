from uuid import UUID
from typing import Sequence
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.portfolio import TechItem as TechModel
from app.schemas.portfolio import TechItem, TechItemCreate

router = APIRouter()

@router.get("/", response_model=list[TechItem])
async def list_tech_stack(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TechModel))
    return result.scalars().all()

@router.get("/{id}", response_model=TechItem)
async def get_tech_stack(id: UUID, db: AsyncSession = Depends(get_db)):
    item = await db.get(TechModel, id)
    if not item:
        raise HTTPException(status_code=404, detail="Tech item not found")
    return item

@router.post("/", response_model=TechItem, status_code=status.HTTP_201_CREATED)
async def create_tech_stack(item_in: TechItemCreate, db: AsyncSession = Depends(get_db)):
    # Check if a tech item with this name already exists
    result = await db.execute(select(TechModel).where(TechModel.name == item_in.name))
    if result.scalar():
        raise HTTPException(status_code=400, detail="Tech item with this name already exists")
        
    item = TechModel(**item_in.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item

@router.put("/{id}", response_model=TechItem)
async def update_tech_stack(id: UUID, item_in: TechItemCreate, db: AsyncSession = Depends(get_db)):
    item = await db.get(TechModel, id)
    if not item:
        raise HTTPException(status_code=404, detail="Tech item not found")
        
    # Check if the new name is taken by another item
    if item_in.name != item.name:
        result = await db.execute(select(TechModel).where(TechModel.name == item_in.name))
        if result.scalar():
            raise HTTPException(status_code=400, detail="Name already taken")

    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
        
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tech_stack(id: UUID, db: AsyncSession = Depends(get_db)):
    item = await db.get(TechModel, id)
    if not item:
        raise HTTPException(status_code=404, detail="Tech item not found")
    await db.delete(item)
    await db.commit()
