"""
Base repository pattern — demonstrates data access abstraction.

Repositories handle all data access (DB queries, external storage, in-memory stores).
Business logic lives in services; repositories only know how to read/write data.

To plug in a real database:
  1. Create a concrete repository (e.g., PostgresItemRepository)
  2. Accept a DB session in __init__ (injected via Depends())
  3. Update the Depends() factory to provide the real implementation
"""

from abc import ABC, abstractmethod


class ItemRepository(ABC):
    """Abstract interface for item data access."""

    @abstractmethod
    def list_items(self, page: int, page_size: int) -> tuple[list[dict], int]:
        """Return (items, total_count) for the given page."""
        ...


class InMemoryItemRepository(ItemRepository):
    """In-memory implementation for demo/development."""

    TOTAL_ITEMS = 42

    def list_items(self, page: int, page_size: int) -> tuple[list[dict], int]:
        start = (page - 1) * page_size
        end = min(start + page_size, self.TOTAL_ITEMS)
        items = [
            {"id": str(i + 1), "name": f"Item {i + 1}"}
            for i in range(start, end)
        ]
        return items, self.TOTAL_ITEMS


def get_item_repository() -> ItemRepository:
    """FastAPI dependency factory — swap for a DB-backed implementation."""
    return InMemoryItemRepository()
