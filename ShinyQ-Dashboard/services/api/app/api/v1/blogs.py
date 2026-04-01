from uuid import UUID
from typing import Sequence
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.portfolio import BlogPost as BlogModel
from app.schemas.portfolio import BlogPost, BlogPostCreate

router = APIRouter()

@router.get("/", response_model=list[BlogPost])
async def list_blogs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BlogModel))
    return result.scalars().all()

@router.get("/{id}", response_model=BlogPost)
async def get_blog(id: UUID, db: AsyncSession = Depends(get_db)):
    blog = await db.get(BlogModel, id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return blog

@router.post("/", response_model=BlogPost, status_code=status.HTTP_201_CREATED)
async def create_blog(blog_in: BlogPostCreate, db: AsyncSession = Depends(get_db)):
    # Check if a blog with this slug already exists
    result = await db.execute(select(BlogModel).where(BlogModel.slug == blog_in.slug))
    if result.scalar():
        raise HTTPException(status_code=400, detail="Blog post with this slug already exists")
        
    blog = BlogModel(**blog_in.model_dump())
    db.add(blog)
    await db.commit()
    await db.refresh(blog)
    return blog

@router.put("/{id}", response_model=BlogPost)
async def update_blog(id: UUID, blog_in: BlogPostCreate, db: AsyncSession = Depends(get_db)):
    blog = await db.get(BlogModel, id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog post not found")
        
    # Check if the new slug is taken by another blog
    if blog_in.slug != blog.slug:
        result = await db.execute(select(BlogModel).where(BlogModel.slug == blog_in.slug))
        if result.scalar():
            raise HTTPException(status_code=400, detail="Slug already taken")

    update_data = blog_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(blog, field, value)
        
    db.add(blog)
    await db.commit()
    await db.refresh(blog)
    return blog

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog(id: UUID, db: AsyncSession = Depends(get_db)):
    blog = await db.get(BlogModel, id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog post not found")
    await db.delete(blog)
    await db.commit()
