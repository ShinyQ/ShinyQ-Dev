from uuid import UUID
from typing import Sequence
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.portfolio import Project as ProjectModel
from app.schemas.portfolio import Project, ProjectCreate

router = APIRouter()

@router.get("/", response_model=list[Project])
async def list_projects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProjectModel))
    return result.scalars().all()

@router.get("/{id}", response_model=Project)
async def get_project(id: UUID, db: AsyncSession = Depends(get_db)):
    project = await db.get(ProjectModel, id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_project(project_in: ProjectCreate, db: AsyncSession = Depends(get_db)):
    # Check if a project with this slug already exists
    result = await db.execute(select(ProjectModel).where(ProjectModel.slug == project_in.slug))
    if result.scalar():
        raise HTTPException(status_code=400, detail="Project with this slug already exists")
    
    project = ProjectModel(**project_in.model_dump())
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project

@router.put("/{id}", response_model=Project)
async def update_project(id: UUID, project_in: ProjectCreate, db: AsyncSession = Depends(get_db)):
    project = await db.get(ProjectModel, id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if the new slug is taken by another project
    if project_in.slug != project.slug:
        result = await db.execute(select(ProjectModel).where(ProjectModel.slug == project_in.slug))
        if result.scalar():
            raise HTTPException(status_code=400, detail="Slug already taken")

    update_data = project_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(id: UUID, db: AsyncSession = Depends(get_db)):
    project = await db.get(ProjectModel, id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(project)
    await db.commit()
