# AI-ME Template API (FastAPI)

Python stack: **[uv](https://docs.astral.sh/uv/)** for environments and lockfile, **[ruff](https://docs.astral.sh/ruff/)** for lint (and format, if you enable it).

## Setup

```bash
cd services/api
uv sync                    # creates .venv and installs deps + dev (ruff)
cp .env.example .env
```

## Run

```bash
uv run uvicorn main:app --reload --port 8000
```

## HTTP

| Path                | Notes                                                 |
| ------------------- | ----------------------------------------------------- |
| `GET /health`       | Unversioned probe                                     |
| `GET /api/v1/hello` | Sample envelope with `data` + `meta.requestId`        |
| `GET /api/v1/items` | Paged list (`page`, `pageSize`) per baseline **§8.1** |

## Lint

```bash
uv run ruff check .
uv run ruff format .       # optional; formatter is disabled in pyproject by default — add if desired
```

## Lockfile

- **`uv.lock`** — commit this; reproduce installs with `uv sync --frozen` in CI.
