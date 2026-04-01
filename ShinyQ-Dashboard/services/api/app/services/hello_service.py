"""
Hello service — demonstrates the service layer pattern.

Services encapsulate business logic and are injected into route handlers
via FastAPI's Depends(). This keeps handlers thin (< 10 lines) and makes
business logic independently testable.

To add dependencies (DB session, cache client, external API):
  1. Accept them in __init__
  2. Update the get_hello_service() factory to wire them via Depends()
"""


class HelloService:
    def get_greeting(self, request_id: str) -> dict:
        return {
            "data": {"message": "Hello from FastAPI"},
            "meta": {"requestId": request_id},
        }


def get_hello_service() -> HelloService:
    """FastAPI dependency factory — swap or extend for testing/production."""
    return HelloService()
