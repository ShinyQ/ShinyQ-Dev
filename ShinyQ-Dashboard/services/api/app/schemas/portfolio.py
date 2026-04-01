from typing import Any, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

class ProjectGalleryBase(BaseModel):
    image_key: str
    order: int = 0

class ProjectGalleryCreate(ProjectGalleryBase):
    pass

class ProjectGallery(ProjectGalleryBase):
    id: UUID
    project_id: UUID
    model_config = ConfigDict(from_attributes=True)


class ProjectBase(BaseModel):
    title: str
    description: str
    coverImage: str
    tags: list[str] = Field(default_factory=list)
    role: str
    techStack: list[str] = Field(default_factory=list)
    githubUrl: Optional[str] = None
    liveUrl: Optional[str] = None
    docUrl: Optional[str] = None
    docPpt: Optional[str] = None

class ProjectCreate(ProjectBase):
    slug: str

class Project(ProjectCreate):
    id: UUID
    galleries: list[ProjectGallery] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)

class TimelineItemBase(BaseModel):
    startDate: str
    endDate: str
    title: str
    subtitle: str
    caption: Optional[str] = None
    description: Optional[list[str]] = Field(default_factory=list)
    tools: Optional[list[str]] = Field(default_factory=list)
    logo: Optional[str] = None
    type: str

class TimelineItemCreate(TimelineItemBase):
    slug: str

class TimelineItem(TimelineItemCreate):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class TechItemBase(BaseModel):
    icon: str
    type: Optional[str] = None
    site: Optional[str] = None

class TechItemCreate(TechItemBase):
    name: str

class TechItem(TechItemCreate):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class BlogPostBase(BaseModel):
    title: str
    date: str
    coverImage: Optional[str] = None
    excerpt: Optional[str] = None
    tags: list[str] = Field(default_factory=list)
    readingTime: Optional[str] = None
    author: str
    category: str
    featured: bool = False
    content: str

class BlogPostCreate(BlogPostBase):
    slug: str

class BlogPost(BlogPostCreate):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class SettingBase(BaseModel):
    value: Any

class SettingCreate(SettingBase):
    key: str

class Setting(SettingCreate):
    model_config = ConfigDict(from_attributes=True)

class AboutInfo(BaseModel):
    intro: str
    philosophy: list[str] = Field(default_factory=list)
    workingStyle: list[str] = Field(default_factory=list)
    favoriteTech: list[str] = Field(default_factory=list)
    quote: Optional[str] = None
    profilePhoto: Optional[str] = None
