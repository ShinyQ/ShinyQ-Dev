from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class Meta(BaseModel):
    request_id: str = Field(validation_alias="requestId")


class Pagination(BaseModel):
    page: int
    page_size: int = Field(validation_alias="pageSize")
    total_items: int = Field(validation_alias="totalItems")
    total_pages: int = Field(validation_alias="totalPages")


class ErrorBody(BaseModel):
    code: str
    message: str
    details: str | None = None
    field_errors: dict[str, list[str]] | None = Field(default=None, validation_alias="fieldErrors")
    request_id: str | None = Field(default=None, validation_alias="requestId")


class ErrorEnvelope(BaseModel):
    error: ErrorBody


class DataEnvelope(BaseModel, Generic[T]):
    data: T
    meta: Meta | None = None
    pagination: Pagination | None = None
