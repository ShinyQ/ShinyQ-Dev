# AI-ME Template Dashboard

A production-ready fullstack starter for building **AI-powered platforms** — a Next.js dashboard shell backed by a FastAPI service, wired together through a secure Backend-for-Frontend (BFF) pattern.

> **Quick start:** `bun install && bun run dev` → [http://localhost:3000](http://localhost:3000)

---

## Overview

This template gives engineering teams a solid, opinionated foundation so they can focus on product logic rather than plumbing. It ships with:

- A responsive, authenticated dashboard UI built on Next.js App Router
- A FastAPI service (`services/api/`) with a versioned JSON contract
- A BFF layer (`/api/v1/*`) that keeps credentials and backend URLs server-side
- Patterns for long-running and streaming AI workloads (SSE + polling fallback)
- Role-based access control hooks for navigation and server actions

The authoritative implementation spec lives in [`.agent/docs/baseline.md`](.agent/docs/baseline.md).

---

## Tech Stack

| Layer              | Technology                                                              |
| :----------------- | :---------------------------------------------------------------------- |
| Frontend framework | Next.js 16 (App Router)                                                 |
| UI / styling       | Tailwind CSS v3 + shadcn/ui                                             |
| Backend framework  | FastAPI (Python 3.11+)                                                  |
| Frontend runtime   | [Bun](https://bun.sh) 1.2+                                              |
| Python tooling     | [uv](https://docs.astral.sh/uv/) + [ruff](https://docs.astral.sh/ruff/) |
| Language           | TypeScript 5.7+ (strict) / Python 3.11+                                 |

---

## Prerequisites

- **[Bun](https://bun.sh)** 1.2+ — used for all frontend tasks (`bun install`, `bun run dev`, etc.)
- **Python** 3.11+ and **[uv](https://docs.astral.sh/uv/)** — for the FastAPI backend in `services/api/`

---

## Getting Started

### 1. Frontend

```bash
cp .env.example .env.local   # configure environment variables
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login`. Click **Continue** to set a demo session cookie, then explore the dashboard pages (`/home`, `/analytics`, `/playground`, etc.).

### 2. Backend (optional)

The dashboard works standalone. To connect the FastAPI backend:

```bash
cd services/api
uv sync
cp .env.example .env
uv run uvicorn main:app --reload --port 8000
```

Then set `INTERNAL_API_URL=http://127.0.0.1:8000` in `.env.local` and restart the frontend.

**Key backend endpoints:**

| Endpoint                      | Description                                               |
| :---------------------------- | :-------------------------------------------------------- |
| `GET /api/v1/health`          | Health check (`backendReachable: true` when Python is up) |
| `GET /api/v1/hello`           | Proxied hello from FastAPI                                |
| `GET /api/v1/items`           | Paginated item list (`page`, `pageSize`)                  |
| `POST /api/v1/jobs`           | Submit a demo async job                                   |
| `GET /api/v1/jobs/:id`        | Poll job status                                           |
| `GET /api/v1/jobs/:id/stream` | SSE stream for job progress                               |

---

## Project Structure

```
AI-ME-Template-Dashboard/
├── app/
│   ├── (authenticated)/        # Dashboard pages (home, analytics, logs, models, playground, users)
│   ├── (public)/               # Public pages (login)
│   └── api/v1/                 # BFF routes — proxy to FastAPI
├── components/
│   ├── dashboard/              # AppShell, Sidebar, PageHeader
│   ├── ui/                     # shadcn/Radix primitives
│   ├── data/                   # DataTable, Pagination, EmptyState
│   └── feedback/               # Job progress indicators
├── features/
│   └── _example/               # Reference feature implementation
├── lib/
│   ├── actions/                # Server Actions (ActionResult<T> pattern)
│   ├── api-client/             # Server-only fetch wrapper to FastAPI
│   ├── auth/                   # getSession() helper (RSC-safe)
│   ├── nav/                    # Static menu + role-based resolver
│   └── types/                  # Shared TypeScript types and API envelopes
├── hooks/                      # React hooks (useToast, job stream)
├── services/
│   └── api/                    # FastAPI service (Python)
│       ├── api/v1/             # Route definitions
│       ├── core/               # Config and security
│       ├── schemas/            # Pydantic models (API contract)
│       ├── services/           # Business logic layer
│       ├── repositories/       # Data access layer
│       └── main.py             # Uvicorn entry point
└── .agent/docs/                # Technical documentation
```

---

## Frontend Commands

| Command                | Description                  |
| :--------------------- | :--------------------------- |
| `bun run dev`          | Start the development server |
| `bun run build`        | Build for production         |
| `bun run start`        | Serve the production build   |
| `bun run lint`         | Run ESLint                   |
| `bun run format`       | Format code with Prettier    |
| `bun run format:check` | Check formatting (CI)        |
| `bun run typecheck`    | Run TypeScript type checking |

## Backend Commands

| Command                                        | Description                      |
| :--------------------------------------------- | :------------------------------- |
| `uv sync`                                      | Install/sync Python dependencies |
| `uv run uvicorn main:app --reload --port 8000` | Start FastAPI with hot reload    |
| `uv run ruff check .`                          | Lint Python code                 |
| `uv run ruff format .`                         | Format Python code               |

---

## Architecture

```
Browser → Next.js (UI + RSC + Server Actions + /api/v1 BFF) → FastAPI (/api/v1)
```

- **No direct browser calls** to the FastAPI origin — secrets stay server-side
- **Versioned contract** — unified JSON error envelopes and pagination across BFF and FastAPI
- **`ActionResult<T>`** — typed mutation pattern for all Server Actions
- **RBAC hooks** — navigation and server actions support role/scope filtering

See [`.agent/docs/architecture.md`](.agent/docs/architecture.md) for the full system diagram.

---

## Documentation

| Document                                                 | Description                                                             |
| :------------------------------------------------------- | :---------------------------------------------------------------------- |
| [`baseline.md`](.agent/docs/baseline.md)                 | Full implementation spec (requirements, phases, verification checklist) |
| [`overview.md`](.agent/docs/overview.md)                 | Application summary and feature list                                    |
| [`architecture.md`](.agent/docs/architecture.md)         | System architecture and BFF patterns                                    |
| [`backend.md`](.agent/docs/backend.md)                   | FastAPI integration contract and folder layout                          |
| [`server-actions.md`](.agent/docs/server-actions.md)     | `ActionResult<T>` pattern with examples                                 |
| [`authentication.md`](.agent/docs/authentication.md)     | Session interface, route protection, and RBAC                           |
| [`tech-stack.md`](.agent/docs/tech-stack.md)             | Full dependency reference                                               |
| [`development.md`](.agent/docs/development.md)           | Local setup and workflow guide                                          |
| [`folder-structure.md`](.agent/docs/folder-structure.md) | Annotated repository tree                                               |
| [`brand-guidelines.md`](.agent/docs/brand-guidelines.md) | Design tokens, color palette, and typography                            |

---

## Extending the Template

1. **Add a page** — Create a route under `app/(authenticated)/your-feature/`
2. **Add navigation** — Register it in `lib/nav/static-menu.ts`
3. **Add a server action** — Create a `*ResultAction` function in `lib/actions/`
4. **Add a backend endpoint** — Add a router in `services/api/api/v1/` and a corresponding BFF route in `app/api/v1/`
5. **Replace demo auth** — Update `getSession()` in `lib/auth/get-session.ts` and the `/login` route

---

## Contributing

- Keep **`baseline.md`** as the single source of truth for spec decisions; append a row to **§13 Document change log** for any spec change.
- Keep this README aligned when adding new services, environment variables, or run scripts.

---

## License

_Unspecified — set per your organization's policy (e.g., internal-only or MIT)._
