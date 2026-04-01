# Tech Stack — AI-ME Template Dashboard

## Runtime Environment

| Component       | Technology | Version |
| :-------------- | :--------- | :------ |
| Runtime         | **Bun**    | `1.2+`  |
| Package Manager | **Bun**    | `1.2+`  |
| Node Compat     | Node.js    | `20+`   |

Bun is the primary runtime for local development (`bun install`, `bun run dev`). Node is used when tools requires it (e.g. `next start`).

## Frameworks

### Frontend (Next.js)

| Framework     | Version   | Purpose                                 |
| :------------ | :-------- | :-------------------------------------- |
| **Next.js**   | `^16.1.0` | Full-stack React framework (App Router) |
| **React**     | `^19.2.0` | UI rendering library                    |
| **React DOM** | `^19.2.0` | DOM bindings for React                  |

### Backend (FastAPI)

| Framework    | Version  | Purpose                             |
| :----------- | :------- | :---------------------------------- |
| **FastAPI**  | `0.110+` | Python-based web framework for APIs |
| **Pydantic** | `2.x`    | Data validation and settings        |
| **Uvicorn**  | `0.29+`  | ASGI server for FastAPI             |

## Language Configuration

- **Frontend:** TypeScript `^5.7.0` (strict mode: enabled)
- **Backend:** Python `3.11+`
- **Path Aliases:** `@/*` maps to project root

## Key Dependencies

### Frontend (Production)

| Package                    | Version    | Purpose                           |
| :------------------------- | :--------- | :-------------------------------- |
| `@radix-ui/react-*`        | (various)  | Accessible UI primitives (shadcn) |
| `class-variance-authority` | `^0.7.1`   | Component variant management      |
| `clsx`                     | `^2.1.1`   | Conditional CSS class utility     |
| `lucide-react`             | `^0.552.0` | Icon library                      |
| `tailwind-merge`           | `^3.5.0`   | CSS class merging                 |

### Frontend (Development)

| Package                   | Version   | Purpose                      |
| :------------------------ | :-------- | :--------------------------- |
| `tailwindcss`             | `^3.4.17` | Utility-first CSS framework  |
| `eslint`                  | `^9.0.0`  | JavaScript/TypeScript linter |
| `prettier`                | `^3.8.1`  | Code formatter               |
| `@tailwindcss/typography` | `^0.5.19` | Markdown/prose styling       |

### Backend (Development/Locking)

| Tool     | Version  | Purpose                                  |
| :------- | :------- | :--------------------------------------- |
| **uv**   | `0.1.x+` | Python package and project management    |
| **ruff** | `0.3.x+` | High-performance Python linter/formatter |

_For deep-dive routing, API design, and the Next.js `ActionResult` contract, see [Backend Integration](backend.md) and [Server Actions](server-actions.md)._

## Styling

- **Tailwind CSS v3** with CSS custom properties (HSL-based tokens).
- **shadcn/ui** component primitives customized with the company brand preset.
- **Brand Colors:** Primary `#027DC7` (company blue) with a full `brand-50`–`900` palette.

_For detailed color palettes and design constraints, see the [Brand Guidelines](brand-guidelines.md)._

## Typography

- **Primary Font:** System font stack by default (Inter/Roboto).
- **Fallback:** `sans-serif`.
- **Customization:** Corporate fonts can be loaded via `@font-face` in `app/globals.css`.
