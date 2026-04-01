# Backend Integration (FastAPI)

The AI-ME Template Dashboard relies on a fast, type-safe Python backend built with **FastAPI** (`services/api`). The Next.js frontend acts as a Backend-for-Frontend (BFF), forwarding requests to this service.

## API Versioning

All JSON endpoints intended for the frontend must be placed under **`/api/v1/`**.
Health probes use the unversioned **`/health`** endpoint.

## The Integration Contract

To align Next.js Server Actions with the FastAPI backend, we strictly enforce single resource and paginated list response shapes.

### Success Envelopes

**1. Single Resource:**

```json
{
  "data": { "id": "123", "name": "Item" },
  "meta": { "requestId": "550e8400-e29b-41d4-a716-446655440000" }
}
```

**2. Paginated List (Required for collections):**

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 15,
    "totalItems": 200,
    "totalPages": 14
  },
  "meta": { "requestId": "..." }
}
```

_Standard query parameters for lists:_ `page`, `pageSize`, `sort` (leading `-` means descending), and `q` (for search).

### Error Envelopes

When FastAPI encounters a domain error, it must map to this exact HTTP JSON structure to be seamlessly parsed by the Next.js `ActionResult` boundary:

```json
{
  "error": {
    "code": "VALIDATION",
    "message": "Human-readable summary",
    "details": "Optional extended text",
    "fieldErrors": { "title": ["Required"] },
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Valid Error Codes:** `VALIDATION` (400), `NOT_FOUND` (404), `CONFLICT` (409), `FORBIDDEN` (403), `INTERNAL` (500).

## FastAPI Folder Layout

Located in `services/api/`:

- **`main.py`**: The application entry point (Uvicorn setup, CORS, Middleware).
- **`api/v1/`**: FastAPI routing definitions (routers map HTTP requests to services).
- **`core/`**: Centralized configuration (`config.py`) and security logic.
- **`schemas/`**: Pydantic models acting as the strong contract (e.g., `common.py` defines `ErrorEnvelope` and `PagedResponse[T]`).
- **`services/`**: The core business logic layer.
- **`repositories/`**: Abstractions for Database/Storage/IO access. No business rules live here.

## Python Tooling

The template relies on modern, fast Python tools instead of raw `pip` and `requirements.txt`:

1.  **Dependency Management: [`uv`](https://docs.astral.sh/uv/)**
    - Configuration is stored centrally in `pyproject.toml`.
    - Lockfile `uv.lock` must be committed to VC to ensure deterministic builds.
    - Run `uv sync` to install/update dependencies.
    - Use `uv run <command>` to execute tools inside the sandbox.
2.  **Linting & Formatting: [`ruff`](https://docs.astral.sh/ruff/)**
    - Extremely high-performance linter.
    - Run `uv run ruff check .` for linting.
    - Run `uv run ruff format .` for file formatting. Configured inside `pyproject.toml`.
