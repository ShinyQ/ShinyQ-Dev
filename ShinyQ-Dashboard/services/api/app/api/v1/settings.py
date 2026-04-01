from typing import Sequence
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.portfolio import Setting as SettingModel
from app.schemas.portfolio import Setting, SettingCreate, AboutInfo

router = APIRouter()

@router.get("/", response_model=list[Setting])
async def list_settings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SettingModel))
    return result.scalars().all()

@router.get("/{key}", response_model=Setting)
async def get_setting(key: str, db: AsyncSession = Depends(get_db)):
    setting = await db.get(SettingModel, key)
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting

@router.post("/", response_model=Setting, status_code=status.HTTP_201_CREATED)
async def create_setting(setting_in: SettingCreate, db: AsyncSession = Depends(get_db)):
    setting = await db.get(SettingModel, setting_in.key)
    if setting:
        raise HTTPException(status_code=400, detail="Setting already exists")
    setting = SettingModel(**setting_in.model_dump())
    db.add(setting)
    await db.commit()
    await db.refresh(setting)
    return setting

@router.put("/{key}", response_model=Setting)
async def update_setting(key: str, setting_in: SettingCreate, db: AsyncSession = Depends(get_db)):
    setting = await db.get(SettingModel, key)
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    update_data = setting_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(setting, field, value)
    db.add(setting)
    await db.commit()
    await db.refresh(setting)
    return setting

@router.delete("/{key}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_setting(key: str, db: AsyncSession = Depends(get_db)):
    setting = await db.get(SettingModel, key)
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    await db.delete(setting)
    await db.commit()

# Specific shortcut for AboutInfo
@router.get("/app/about", response_model=AboutInfo)
async def get_about_info(db: AsyncSession = Depends(get_db)):
    setting = await db.get(SettingModel, "aboutInfo")
    if not setting:
        raise HTTPException(status_code=404, detail="AboutInfo setting not found")
    return AboutInfo(**setting.value)

@router.put("/app/about", response_model=AboutInfo)
async def update_about_info(about_in: AboutInfo, db: AsyncSession = Depends(get_db)):
    setting = await db.get(SettingModel, "aboutInfo")
    if not setting:
        setting = SettingModel(key="aboutInfo", value=about_in.model_dump())
    else:
        setting.value = about_in.model_dump()
    db.add(setting)
    await db.commit()
    await db.refresh(setting)
    return AboutInfo(**setting.value)
