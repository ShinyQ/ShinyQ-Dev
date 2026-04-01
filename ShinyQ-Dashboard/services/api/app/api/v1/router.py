from fastapi import APIRouter

from .hello import router as hello_router
from .items import router as items_router
from .projects import router as projects_router
from .galleries import router as galleries_router
from .timeline import router as timeline_router
from .tech_stack import router as tech_stack_router
from .blogs import router as blogs_router
from .settings import router as settings_router

router = APIRouter()
router.include_router(hello_router)
router.include_router(items_router)
router.include_router(projects_router, prefix="/projects", tags=["projects"])
router.include_router(galleries_router, prefix="/galleries", tags=["galleries"])
router.include_router(timeline_router, prefix="/timeline", tags=["timeline"])
router.include_router(tech_stack_router, prefix="/tech-stack", tags=["tech-stack"])
router.include_router(blogs_router, prefix="/blogs", tags=["blogs"])
router.include_router(settings_router, prefix="/settings", tags=["settings"])
