"""Shared FastAPI dependencies (DB sessions, request id, current user, …)."""

from typing import Annotated

from fastapi import Header


def request_id_header(
    x_request_id: Annotated[str | None, Header(alias="X-Request-Id")] = None,
) -> str:
    import uuid

    return x_request_id or str(uuid.uuid4())
