from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.portfolio import Project as ProjectModel, ProjectGallery as GalleryModel
from app.schemas.portfolio import ProjectGallery, ProjectGalleryCreate

router = APIRouter()


@router.get("/{project_id}", response_model=list[ProjectGallery])
async def list_galleries(project_id: UUID, db: AsyncSession = Depends(get_db)):
    project = await db.get(ProjectModel, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    result = await db.execute(
        select(GalleryModel)
        .where(GalleryModel.project_id == project_id)
        .order_by(GalleryModel.order)
    )
    return result.scalars().all()


@router.post("/{project_id}", response_model=ProjectGallery, status_code=status.HTTP_201_CREATED)
async def add_gallery_image(
    project_id: UUID,
    gallery_in: ProjectGalleryCreate,
    db: AsyncSession = Depends(get_db),
):
    project = await db.get(ProjectModel, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Auto-assign order: max existing order + 1
    result = await db.execute(
        select(func.coalesce(func.max(GalleryModel.order), -1))
        .where(GalleryModel.project_id == project_id)
    )
    next_order = result.scalar() + 1

    gallery = GalleryModel(
        project_id=project_id,
        image_key=gallery_in.image_key,
        order=gallery_in.order if gallery_in.order > 0 else next_order,
    )
    db.add(gallery)
    await db.commit()
    await db.refresh(gallery)
    return gallery


@router.delete("/{project_id}/{gallery_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gallery_image(
    project_id: UUID,
    gallery_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    gallery = await db.get(GalleryModel, gallery_id)
    if not gallery or gallery.project_id != project_id:
        raise HTTPException(status_code=404, detail="Gallery image not found")

    await db.delete(gallery)
    await db.commit()
