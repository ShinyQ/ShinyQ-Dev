# Development Guide

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **[Bun](https://bun.sh)** 1.2+ (Recommended runtime)
- **Python** 3.11+ (For the FastAPI backend)
- **[uv](https://docs.astral.sh/uv/)** (Python package & project manager)

---

## Local Setup

### 1. Clone & Install Frontend Dependencies

```bash
bun install
```

### 2. Configure Environment Variables

Copy the example environment file and update it with your local settings.

```bash
cp .env.example .env.local
```

Key variables securely validated on startup (via `lib/config/env.ts`):

- `INTERNAL_API_URL`: The URL of your local FastAPI service (defaults to `http://127.0.0.1:8000`).
- `NEXT_PUBLIC_APP_URL`: The public URL of the application.
- `SESSION_SECRET`: A random string for session encryption mapping to Auth.

### 3. Setup Backend (FastAPI)

Navigate to the backend directory and synchronize the Python environment.

```bash
cd services/api
uv sync
cp .env.example .env
```

---

## Running the Application

### 1. Start Frontend

From the project root:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You will be redirected to the login page.

### 2. Start Backend

From the `services/api` directory:

```bash
uv run uvicorn main:app --reload --port 8000
```

The backend API will be available at `http://127.0.0.1:8000`.

---

## Common Development Commands

| Command                | Action                           |
| :--------------------- | :------------------------------- |
| `bun run dev`          | Start Next.js development server |
| `bun run build`        | Build Next.js for production     |
| `bun run lint`         | Run ESLint for the frontend      |
| `bun run format`       | Format code using Prettier       |
| `bun run typecheck`    | Run TypeScript compiler check    |
| `uv run ruff check .`  | Run Ruff linter for the backend  |
| `uv run ruff format .` | Format backend code using Ruff   |

---

## Authentication Demo

The template includes a "Demo Login" flow. On the `/login` page, you can click **Continue** to set a mock session cookie. This allows you to explore the authenticated routes (`/home`, `/analytics`, `/example`) without a real authentication provider configured.

## Adding New Features

1. **Define the UI:** Create components in `components/` and routes in `app/(authenticated)/`.
2. **Add Navigation:** Update `lib/nav/static-menu.ts` to include your new route.
3. **Implement Logic:** Use Server Actions in `lib/actions/` for mutations.
4. **Extend Backend:** Add new routers and services in `services/api/`.
