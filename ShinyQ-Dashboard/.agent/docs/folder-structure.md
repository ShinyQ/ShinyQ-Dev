# Folder Structure

## Repository Tree

```text
AI-ME-Template-Dashboard/
├── .agent/                      # Agent configuration & documentation
│   └── docs/                   # Technical documentation
│       ├── baseline.md         # Detailed implementation spec
│       ├── overview.md         # Application summary
│       ├── tech-stack.md       # Frameworks & dependencies
│       ├── folder-structure.md # This file
│       ├── architecture.md     # System & logical architecture
│       ├── development.md      # Setup & commands
│       ├── backend.md          # FastAPI integration / Python
│       ├── server-actions.md   # Next.js Server Actions & mutations
│       ├── authentication.md   # Session mapping & RBAC
│       └── brand-guidelines.md # UI tokens and styling constraints
│
├── app/                         # Next.js App Router
│   ├── (authenticated)/        # Authenticated dashboard pages
│   │   ├── analytics/          # /analytics — charts & metrics
│   │   ├── example/            # /example — design system demo
│   │   ├── home/               # /home — landing view
│   │   ├── logs/               # /logs — job/system logs
│   │   ├── models/             # /models — AI model management
│   │   ├── playground/         # /playground — AI testing
│   │   ├── users/              # /users — user management
│   │   ├── authenticated-shell.tsx # Client boundary (DashboardProvider + AppShell)
│   │   ├── error.tsx           # Dashboard-scoped error boundary
│   │   ├── layout.tsx          # RSC layout (server-side getSession)
│   │   ├── loading.tsx         # Dashboard skeleton loading state
│   │   └── not-found.tsx       # Dashboard-scoped 404
│   ├── (public)/               # Public pages (e.g., /login)
│   ├── api/                    # BFF (Backend-for-Frontend) routes
│   │   └── v1/                 # Versioned API proxy to FastAPI
│   ├── error.tsx               # Global error boundary
│   ├── globals.css             # Tailwind directives & CSS tokens
│   └── layout.tsx              # Root layout (HTML/Body, Meta)
│
├── components/                  # Shared React components
│   ├── dashboard/              # AppShell, PageHeader, Sidebar
│   ├── data/                   # DataTable shell, Pagination
│   ├── feedback/               # EmptyState, Error/Success messages
│   └── ui/                     # UI primitives (shadcn/Radix)
│
├── features/                    # Large-scale UI feature modules
│   └── _example/               # Reference feature (widgets, server action demo)
│
├── hooks/                      # Global React hooks (useToast)
│
├── lib/                        # Core logic, types, and helpers
│   ├── actions/                # Vertical Slice Architecture (see below)
│   │   ├── action-result.ts    # ActionResult<T> type and utilities (shared)
│   │   ├── middleware.actions.ts # withActionResult, withRequiredScopes (shared)
│   │   ├── index.ts            # Barrel export for shared infrastructure
│   │   ├── auth/               # Auth domain slice
│   │   │   ├── auth.actions.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   └── auth.types.ts
│   │   ├── jobs/               # Jobs domain slice
│   │   │   ├── jobs.actions.ts
│   │   │   ├── jobs.service.ts
│   │   │   ├── jobs.repository.ts
│   │   │   └── jobs.types.ts
│   │   ├── example/            # Example domain slice (reference)
│   │   │   ├── example.actions.ts
│   │   │   ├── example.service.ts
│   │   │   └── example.types.ts
│   │   ├── analytics/          # Analytics domain slice
│   │   ├── logs/               # Logs domain slice
│   │   ├── models/             # Models domain slice
│   │   ├── playground/         # Playground domain slice
│   │   └── users/              # Users domain slice
│   ├── api-client/            # Server-side fetch to FastAPI
│   ├── auth/                  # Server-only session helper (delegates to auth slice)
│   ├── config/                # App/environment config with validation
│   ├── hooks/                 # Domain hooks (useJobStream)
│   ├── nav/                   # Navigation & menu resolvers
│   ├── types/                 # Shared TypeScript interfaces (API envelopes)
│   └── utils.ts               # Tailwind class utility (cn)
│
├── services/                    # Backend services
│   └── api/                    # FastAPI service (Python)
│       ├── app/
│       │   ├── api/v1/         # Route handlers (thin dispatchers)
│       │   ├── core/           # Configuration (Settings) & security
│       │   ├── repositories/   # Data access abstractions (ItemRepository)
│       │   ├── schemas/        # Pydantic models (API contract)
│       │   └── services/       # Business services (HelloService)
│       ├── main.py             # FastAPI entry point
│       └── pyproject.toml      # Python dependencies (uv)
│
├── middleware.ts                # Edge auth guard + request ID + security headers
├── public/                      # Static assets
├── bun.lock                     # Bun lockfile
├── next.config.ts               # Next.js configuration (security headers)
├── package.json                 # Project metadata
├── tailwind.config.ts           # Tailwind configuration
└── tsconfig.json                # TypeScript configuration
```

## Vertical Slice Architecture (`lib/actions/`)

Each business domain is self-contained within its own folder. All logic, data access, and types related to a specific feature are co-located.

```text
lib/actions/{domain}/
├── {domain}.actions.ts      # Server Actions (public API) — "use server"
├── {domain}.service.ts      # Business logic & orchestration
├── {domain}.repository.ts   # Data access (DB, API, in-memory)
├── {domain}.types.ts        # Domain-specific types
└── {domain}.helpers.ts      # Pure utilities (optional)
```

### Separation of Concerns

- **Actions** — The public interface. Handles validation, RBAC checks, and wraps results in `ActionResult<T>`. Must be valid Server Actions (`"use server"`).
- **Service** — Business logic and orchestration. Calls the repository layer. No framework imports.
- **Repository** — Direct data access (API calls, database, in-memory stores). Returns typed DTOs.
- **Types** — Domain-specific interfaces and type aliases.
- **Helpers** — Pure functions for validation, formatting, or transformation.

### Shared Infrastructure

Files at the root of `lib/actions/` are shared across all slices:

- `action-result.ts` — `ActionResult<T>` type, error codes, and utility functions
- `middleware.actions.ts` — `withActionResult()` and `withRequiredScopes()` wrappers
- `index.ts` — Barrel export for convenient imports

## Module Purposes

### `app/`

The Next.js App Router directory. The `(authenticated)/` group implements the dashboard shell. The layout is a React Server Component that calls `getSession()` server-side and passes the user to a client boundary. Error boundaries and loading states handle failures gracefully.

### `components/`

A flat organization of reusable components:

- **`dashboard/`** — Core layout components (Shell, Header, Sidebar).
- **`ui/`** — Low-level Radix/shadcn primitives.
- **`data/`** — Components for displaying large datasets (Table shell, Empty states).

### `lib/`

Houses the application's domain logic and utility functions.

- **`actions/`** — Vertical slices for each business domain (auth, jobs, analytics, etc.).
- **`api-client/`** — Server-only fetch wrapper for FastAPI with request ID propagation.
- **`config/`** — Environment validation (fails fast in production if vars are missing).
- **`nav/`** — Static menu items and role-based menu resolution.

### `services/api/`

The Python FastAPI backend. Route handlers are thin dispatchers that inject services and repositories via `Depends()`. Business logic lives in `services/`, data access in `repositories/`.

### `features/`

Used for complex UI feature modules that involve multiple components, hooks, and visual logic. The `_example` feature provides a reference implementation. Domain logic (actions, services, types) lives in `lib/actions/` slices, not here.

### `middleware.ts`

Edge-level request handling:

- Auth guard: redirects unauthenticated users, returns 401 for protected API routes
- Request ID: generates or propagates `x-request-id` for distributed tracing
- Matcher excludes: `_next`, static assets, `/login`, `/api/v1/auth/*`
