from fastapi import APIRouter, Depends, Query, Request

from app.repositories.base import ItemRepository, get_item_repository

router = APIRouter()


@router.get("/items")
def list_items(
    request: Request,
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100, alias="pageSize"),
    repo: ItemRepository = Depends(get_item_repository),
):
    """Paged list sample — wire format matches baseline §8.1 (camelCase aliases)."""
    items, total_items = repo.list_items(page, page_size)
    total_pages = max(1, (total_items + page_size - 1) // page_size)
    return {
        "data": items,
        "pagination": {
            "page": page,
            "pageSize": page_size,
            "totalItems": total_items,
            "totalPages": total_pages,
        },
        "meta": {"requestId": request.state.request_id},
    }
