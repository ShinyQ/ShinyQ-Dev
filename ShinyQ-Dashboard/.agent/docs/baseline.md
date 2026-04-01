# AI-ME Dashboard Template — Implementation Specification

**Version:** 1.4 (general template; execution-ready)  
**Purpose:** Single source of truth for building this repo as a reusable **Next.js (App Router) + FastAPI** dashboard. Follow sections in order for greenfield implementation; use **§12** only for historical context.

**How to use this doc**

- Treat **`MUST` / `SHOULD` / `MAY`** as requirement levels ([RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) sense).
- **§10 Implementation phases** lists concrete deliverables; copy checkboxes into issues/PRs.
- **§11** is the pre-ship verification list.
- **§9** defines TypeScript-aligned contracts so generated code stays consistent.
- **§4.2** defines **company default colors** — primary **`#027DC7`** and full palette.

---

## 1. Goals and non-goals

### 1.1 Goals

- One **authenticated app shell**: sidebar, scrollable main, **mobile drawer + top bar** by default.
- One **design-token-driven** UI (shadcn/Radix-friendly) with **swappable brand presets**.
- One **error and list contract** from FastAPI → BFF → browser and → Server Actions.
- **Server Actions** for mutations with a typed **`ActionResult<T>`** and optional RBAC wrapper.
- **Versioned BFF** (`/api/v1/*`) so the browser never calls the Python host directly.
- Documented patterns for **long-running jobs** (SSE + polling fallback).

### 1.2 Non-goals

- Prescribing a specific auth vendor (NextAuth, custom JWT cookie, etc.) beyond the **session interface** in §6.2.
- Bundling a particular feature domain (fraud, content, etc.) — only **shell + examples**.
- Mandating TanStack Query; **MAY** add when justified.

---

## 2. Normative layout and shell (`AppShell`)

### 2.1 Structural MUST

| Element                          | Requirement                                                              |
| -------------------------------- | ------------------------------------------------------------------------ |
| Root                             | `flex h-screen overflow-hidden` on the authenticated wrapper             |
| Sidebar width                    | **280px** expanded, **64px** (`w-16`) collapsed                          |
| Main                             | `flex-1 min-h-0 overflow-y-auto overscroll-none` — **only main scrolls** |
| Breakpoint for “desktop sidebar” | **`lg` (1024px)** unless product overrides                               |

### 2.2 Mobile MUST (`lg` and below)

- Fixed **top bar** with: menu toggle, product/logo slot, short title.
- **Drawer sidebar**: `fixed inset-y-0 left-0 z-50`, width **280px**, `translate-x` transition.
- **Backdrop** over content: semi-opaque + **MAY** use `backdrop-blur-sm`.
- **`body` scroll lock** when drawer open; **cleanup on unmount**.
- **Close drawer on route change** (`pathname` in `useEffect`).
- Main content **MUST** offset top bar height (e.g. `pt-14 lg:pt-0`) so content is not hidden.

### 2.3 Desktop MAY

- Sidebar **light** or **dark** rail — controlled by **theme preset** (§4.4), not ad-hoc hex in pages.

---

## 3. Navigation model

### 3.1 Menu item contract (implement as `types/nav.ts`)

Each item **SHOULD** expose:

```ts
type NavItem = {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
  /** If false, render disabled styling and no navigation */
  enabled?: boolean;
  /** Optional RBAC: required roles/scopes */
  requiredAccess?: NavAccessRule[];
};
```

### 3.2 Active route rule MUST

```text
active = pathname === item.href || pathname.startsWith(item.href + "/")
```

Exception: **`href === "/"`** — use exact match only to avoid everything being “home”.

### 3.3 Menu sources

- **Static config** (`lib/nav/static-menu.ts`) — simplest.
- **Dynamic resolver** (`lib/nav/resolve-menu.ts`) — filter by session claims; **SHOULD** centralize here, not inside JSX.

---

## 4. Design tokens and styling

### 4.1 CSS variables MUST (shadcn-compatible)

Define in `app/globals.css` under `:root` (and `.dark` if dark mode is **MAY**):

- `--background`, `--foreground`, `--card`, `--card-foreground`
- `--primary`, `--primary-foreground`, `--destructive`, `--destructive-foreground`
- `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground`
- `--border`, `--input`, `--ring`, `--radius`

**Template default:** `--radius: 0.5rem`. Products **MAY** use `0.75rem`.

### 4.2 Company brand palette (default for this template)

**Primary (canonical hex):** **`#027DC7`** — company blue; use for CTAs, links, key metrics, active nav, focus rings, and `bg-primary` / `text-primary` via tokens.

**shadcn `:root` mapping (HSL components, space-separated — no `hsl()` wrapper):**

| Token                  | HSL values        | Notes                                                                        |
| ---------------------- | ----------------- | ---------------------------------------------------------------------------- |
| `--primary`            | **`202 98% 39%`** | Matches `#027DC7`                                                            |
| `--primary-foreground` | **`0 0% 100%`**   | Text/icons on primary buttons                                                |
| `--ring`               | **`202 98% 39%`** | Focus ring; **MAY** lighten to `202 85% 45%` for visibility on dark surfaces |

**Extended brand scale** — add to Tailwind `theme.extend.colors` as **`brand`** (or mirror in CSS variables). **MUST** use this scale for tints and hover states instead of arbitrary blues.

| Token       | Hex           | Typical use                       |
| ----------- | ------------- | --------------------------------- |
| `brand-50`  | `#e8f5fc`     | Page tint, sidebar hover wash     |
| `brand-100` | `#c5e7f7`     | Selected row, badge soft          |
| `brand-200` | `#9ed6f1`     | Borders, dividers on brand tint   |
| `brand-300` | `#76c4ea`     | Decorative, charts (light)        |
| `brand-400` | `#4eb1e2`     | Icons on white                    |
| `brand-500` | **`#027DC7`** | **Primary** — same as `--primary` |
| `brand-600` | `#0269ad`     | **Button hover** (darken ~8%)     |
| `brand-700` | `#015592`     | **Button active** / emphasis text |
| `brand-800` | `#014470`     | Headings on tinted backgrounds    |
| `brand-900` | `#012f4f`     | High-contrast brand text          |

**Semantic colors** (status, badges, alerts) — **SHOULD** stay consistent app-wide:

| Role            | Hex       | HSL (for `--success` etc. if defined) | Use                                                  |
| --------------- | --------- | ------------------------------------- | ---------------------------------------------------- |
| **Success**     | `#059669` | `160 84% 39%`                         | Completed, published, healthy                        |
| **Warning**     | `#d97706` | `32 95% 44%`                          | Pending review, rate limits                          |
| **Destructive** | `#dc2626` | `0 84% 60%`                           | Errors, delete, blocked (`--destructive` in shadcn)  |
| **Info**        | `#027DC7` | same as primary                       | Neutral informational (optional; or use `brand-500`) |

**Light-mode neutrals (surfaces)** — pair with company primary:

| Role           | Suggested hex | Tailwind analog |
| -------------- | ------------- | --------------- |
| App background | `#f8fafc`     | `slate-50`      |
| Card / panel   | `#ffffff`     | white           |
| Foreground     | `#0f172a`     | `slate-900`     |
| Muted text     | `#64748b`     | `slate-500`     |
| Border / input | `#e2e8f0`     | `slate-200`     |

**Sidebar (light rail, default company preset):**

| Token           | Hex / rule                                                               |
| --------------- | ------------------------------------------------------------------------ |
| Background      | `#f8fafc` or white                                                       |
| Foreground      | `#1e293b`                                                                |
| **Active item** | Background `brand-50`, text `brand-700`, **MAY** left border `brand-500` |
| Inactive hover  | Background `slate-100`                                                   |

**Implementation MUST**

- Expose **`#027DC7`** only through **`primary` / `brand-*` tokens** in components — **MUST NOT** scatter raw hex in feature code.
- Set **`--destructive`** / **`--destructive-foreground`** to the semantic **Destructive** row above (or equivalent shadcn defaults).

### 4.3 Semantic extensions SHOULD

- `--success`, `--warning`, `--info` (optional; if absent, map to badge variants in code using §4.2 semantic table)
- `--sidebar`, `--sidebar-foreground`, `--sidebar-accent`, `--sidebar-primary`, `--sidebar-ring` (for rail contrast; align with §4.2 sidebar table)

### 4.4 Brand presets (pick one per deployment)

Implement as **data attribute** or class on `<html>` or layout root. **Default for AI-ME Template Dashboard:** **`data-brand="company"`** (§4.2).

| Preset        | Intent                                                        |
| ------------- | ------------------------------------------------------------- |
| **`company`** | **Default** — primary **`#027DC7`**, palette §4.2             |
| `neutral`     | Gray/slate shell, primary derived from slate (no brand scale) |
| `corp-green`  | Light sidebar, green primary (legacy reference preset)        |
| `corp-red`    | Dark sidebar option + red primary (legacy reference preset)   |

Presets **only** swap token values — **MUST NOT** fork components per brand.

### 4.5 Typography SHOULD

- **Page titles:** responsive scale `text-xl md:text-2xl` (default) or `text-2xl md:text-3xl` via `PageHeader` `size` prop.
- **Body:** system stack by default; **MAY** load corporate fonts via `@font-face` in `globals.css`.

### 4.6 Page padding MUST

Use responsive horizontal padding on page chrome:

`px-4 md:px-6 lg:px-8` inside `PageContainer` (not per-page ad hoc).

### 4.7 Tailwind SHOULD

- Include **`tailwindcss-animate`** if using Radix animations patterns.
- Include **`@tailwindcss/typography`** only if markdown/prose surfaces exist.

---

## 5. Core components (normative names + responsibilities)

### 5.1 `AppShell`

**Props (illustrative):**

```tsx
type AppShellProps = {
  sidebar: ReactNode;
  mobileTopBar?: ReactNode; // logo + title + menu
  children: ReactNode;
  className?: string;
};
```

**MUST** implement desktop sidebar + mobile drawer behavior per §2.

### 5.2 `Sidebar`

**Props:**

```tsx
type SidebarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  items: NavItem[];
  header: ReactNode;
  footer?: ReactNode;
  /** Mobile: always expanded width, close on navigate */
  isMobile?: boolean;
  onMobileClose?: () => void;
};
```

### 5.3 `PageContainer`

- Optional `max-w-*` + **`mx-auto`**
- Applies §4.6 padding

### 5.4 `PageHeader`

**Props:**

```tsx
type PageHeaderProps = {
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  className?: string;
};
```

**MUST** replace one-off “tab header” copies; typography **only** via `size` + tokens.

### 5.5 `StickyToolbar` (optional)

- Sticky below header or below shell chrome
- Slots: `start` (tabs/filters), `end` (meta actions)

### 5.6 Data display

| Component               | Responsibility                                                               |
| ----------------------- | ---------------------------------------------------------------------------- |
| `DataTableShell`        | Card-like container: rounded border, shadow, `overflow-hidden`               |
| `DataTableScrollRegion` | `overflow-x-auto`; inner **MAY** set `min-w-[720px]` or product-specific min |
| `DataTableEmptyState`   | Title, description, optional CTA — **MUST** be overridable via props         |
| `PaginationBar`         | Page size, counts, prev/next; uses shared `Button`                           |

**MUST NOT** create a second parallel table system for the same density; use **column definitions** + `density: "comfortable" | "compact"` if needed.

### 5.7 `Button` MUST

- **CVA** variants: at minimum `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- Support **`asChild`** via Radix `Slot` where polymorphism is needed

### 5.8 Feedback MUST

- **Toasts:** Radix Toast (or equivalent) + provider in root layout; **MUST** map server errors to user-visible toasts for async mutations unless inline error is explicitly better (forms).
- **Inline alerts** for field-level or section-level validation.
- **Skeletons** for list/detail first load; **MUST** match final layout width to avoid CLS.

### 5.9 Long-running jobs SHOULD

Provide **`useJobStream`** (or equivalent) that:

1. Opens SSE (or NDJSON stream) to BFF.
2. On disconnect or error, **falls back** to polling `GET /api/v1/jobs/:id` (or product path) until terminal state.
3. Exposes: `status`, `progress`, `log[]`, `result`, `error`.

**MUST NOT** fail silently on user-visible actions (downloads, delete, submit) — toast or inline error required.

---

## 6. Frontend architecture (Next.js)

### 6.1 Folder structure MUST

```text
app/
  (public)/login/
  (authenticated)/
    layout.tsx
    page.tsx
  api/v1/…/route.ts
  layout.tsx
  globals.css
components/
  ui/              # primitives only
  dashboard/       # AppShell, PageHeader, Sidebar wrapper
  data/            # table shell, pagination
  feedback/        # empty state, job progress
lib/
  actions/
    action-result.ts
    middleware.actions.ts   # withActionResult + RBAC (optional)
  api-client/     # server-only fetch to FastAPI
  auth/           # getSession for RSC + route handlers
  nav/
features/
  _example/       # optional reference feature; remove in product forks
```

### 6.2 Session interface SHOULD

Expose a small stable shape to UI and actions:

```ts
type SessionUser = {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  /** Product-specific claims */
  roles?: Array<{ groupId: string; role: string }>;
  scopes?: string[];
};
```

Auth implementation (NextAuth, custom JWT, etc.) **MAY** vary; **MUST** map into this shape at the boundary.

### 6.3 Data fetching rules MUST

| Case                | Pattern                                            |
| ------------------- | -------------------------------------------------- |
| Initial list/detail | **Server Component** + pass serializable props     |
| Mutation            | **Server Action** → returns **`ActionResult<T>`**  |
| Client live filters | `fetch('/api/v1/...')` or TanStack Query (**MAY**) |
| Upload / stream     | **Route Handler** (BFF)                            |

Browser **MUST NOT** read `process.env` backend URLs for FastAPI; BFF uses server env.

### 6.4 Server Actions MUST

- File-level `"use server"`.
- Named exports end with **`ResultAction`** when returning `ActionResult`.
- Use **`unwrapActionResult`** only on server or in trusted server utilities — client **MUST** branch on `result.ok`.

---

## 7. Backend architecture (FastAPI)

### 7.1 Layout MUST

```text
app/
  main.py
  api/
    deps.py
    v1/
      router.py
      health.py
      example.py       # replace with domain routers
  core/
    config.py
    security.py
  schemas/
    common.py
  services/
  repositories/
```

### 7.2 Versioning MUST

- All JSON APIs under **`/api/v1`**
- **`GET /health`** unversioned for probes

### 7.3 Layering MUST

- Routers: parse/validate, call service, map to response models
- Services: business rules, orchestration
- Repositories: DB/blob/external IO — **no** business rules

### 7.4 Error mapping MUST

Raise domain errors that map to **§8.2** JSON. **MUST** log internal failures with **`requestId`**.

### 7.5 Python tooling SHOULD

- **Package / env:** **[uv](https://docs.astral.sh/uv/)** — `pyproject.toml`, **`uv.lock`** committed, `uv sync` for installs, `uv run …` for commands (avoid ad-hoc `pip install` + loose `requirements.txt` as the source of truth).
- **Lint / format:** **[ruff](https://docs.astral.sh/ruff/)** — `ruff check`, optionally `ruff format`; configure in `pyproject.toml` under `[tool.ruff]`.

---

## 8. Integration contract (BFF + FastAPI)

### 8.1 Success envelope SHOULD

Single resource:

```json
{
  "data": {},
  "meta": { "requestId": "550e8400-e29b-41d4-a716-446655440000" }
}
```

List + pagination (**MUST** for paged lists):

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 15,
    "totalItems": 200,
    "totalPages": 14
  },
  "meta": { "requestId": "…" }
}
```

### 8.2 Error body MUST

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

**Codes** (align Server Action + HTTP): `VALIDATION`, `NOT_FOUND`, `CONFLICT`, `FORBIDDEN`, `INTERNAL`.

HTTP mapping **SHOULD**:

| Code         | HTTP |
| ------------ | ---- |
| `VALIDATION` | 400  |
| `NOT_FOUND`  | 404  |
| `CONFLICT`   | 409  |
| `FORBIDDEN`  | 403  |
| `INTERNAL`   | 500  |

### 8.3 Query parameters MUST (lists)

| Param         | Spec                                                             |
| ------------- | ---------------------------------------------------------------- |
| `page`        | integer ≥ 1, default **1**                                       |
| `pageSize`    | integer, default **15**, max **e.g. 100**                        |
| `sort`        | field name; **leading `-` means descending** (e.g. `-createdAt`) |
| `q`           | global search (**pick `q` OR `search` per product, not both**)   |
| Array filters | repeat key: `tag=a&tag=b`                                        |

### 8.4 BFF responsibilities MUST

- Authenticate request (session/JWT)
- Forward to FastAPI with service or user credential
- **Normalize** upstream errors to §8.2 before responding to browser

### 8.5 Type alignment SHOULD

Mirror §8.1–8.2 in:

- `lib/types/api.ts` (TypeScript)
- `schemas/common.py` (Pydantic `ErrorEnvelope`, `PagedResponse[T]`)

---

## 9. `ActionResult` (Server Action) contract MUST

```ts
export type ActionErrorCode =
  | "VALIDATION"
  | "NOT_FOUND"
  | "CONFLICT"
  | "FORBIDDEN"
  | "INTERNAL";

export type ActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: {
        message: string;
        code: ActionErrorCode;
        referenceId?: string;
        fieldErrors?: Record<string, string[]>;
      };
    };
```

**MUST** map HTTP **8.2** errors from BFF into `ok: false` payloads in server actions **without** leaking stack traces to the client.

---

## 10. Implementation phases (execute in order)

Use as project plan; tick boxes when merged.

### Phase 0 — Repo bootstrap

- [x] Next.js App Router + TypeScript strict
- [x] Tailwind + `globals.css` tokens (**§4**)
- [x] `lib/utils.ts` (`cn`)
- [x] ESLint + Prettier (repo standards)

### Phase 1 — Shell

- [x] `AppShell` + `Sidebar` + mobile drawer (**§2**, **§5.1–5.2**)
- [x] Static nav config + active rule (**§3**)
- [x] `PageContainer`, `PageHeader` (**§5.3–5.4**)
- [x] Auth boundary: login + `(authenticated)/layout` gate

### Phase 2 — Design system pass

- [x] `Button`, `Input`, `Label`, `Card`, `Badge`, `Dialog`, `AlertDialog`, `DropdownMenu`
- [x] Toast + `Toaster` in root (**§5.8**)
- [x] `DataTableShell`, `PaginationBar`, empty state (**§5.6**)

### Phase 3 — BFF + contract

- [x] `app/api/v1/health/route.ts` (proxy or local OK)
- [x] Shared TS types for **§8**
- [x] `lib/api-client` server helper with `requestId` propagation

### Phase 4 — Server Actions

- [x] `action-result.ts` + `unwrap` / `toActionErrorPayload` (**§9**)
- [x] Optional `middleware.actions.ts` RBAC
- [x] One example `*ResultAction` + one example page consuming `result.ok`

### Phase 5 — FastAPI skeleton

- [x] FastAPI app with `/health`, `/api/v1` router
- [x] **`pyproject.toml` + `uv.lock`**; **`uv sync`**; dev deps include **ruff** (**§7.5**)
- [x] Pydantic error + paged models mirroring **§8**
- [x] Example endpoint consumed by BFF

### Phase 6 — Jobs (optional product)

- [x] SSE route + polling fallback hook (**§5.9**)
- [x] UI log/progress component

### Phase 7 — Docs and sample cleanup

- [x] `features/_example` or Storybook-style demo page
- [x] README: env vars, `BACKEND_URL`, auth notes

---

## 11. Verification checklist (pre-release)

_Checklist verified for this template repo in development; re-run before production launches._

- [x] **Layout:** Only `main` scrolls; sidebar height locked; no double scrollbars.
- [x] **Mobile:** Drawer opens/closes; backdrop tap closes; route change closes; body scroll restored.
- [x] **A11y:** Focus trap in dialogs; visible focus on keyboard nav; sidebar toggle has `aria-*`.
- [x] **Errors:** All mutation failures show toast or inline alert; **no** silent catch for user actions.
- [x] **API:** List endpoints return **`pagination`**; errors match **§8.2**.
- [x] **Security:** No FastAPI base URL in client bundle; secrets only server-side.
- [x] **Actions:** Client handles `result.ok === false` without throwing unhandled rejections.

---

## 12. Appendix — Reference lineage (informative)

Earlier internal dashboards informed defaults:

- **Light sidebar + slate surfaces + green accent** → `corp-green` preset mental model.
- **Dark sidebar + red accent + MMC typography** → `corp-red` preset mental model.
- **RBAC + `ActionResult` server actions** → §6.4, §9.
- **Mobile drawer + SSE job UI** → §2.2, §5.9.

This appendix **does not** add requirements; **§2–§9** are normative for this template.

---

## 13. Document change log

| Version | Notes                                                                                                                                                                                                                                                                                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | Baseline extracted from two production dashboards                                                                                                                                                                                                                                                                                     |
| 1.1     | Generalized template spec: RFC2119 language, phases, contracts, verification                                                                                                                                                                                                                                                          |
| 1.2     | **§4.2** company brand palette: primary `#027DC7`, `brand-50`–`900` scale, semantic colors, light neutrals, sidebar rules; preset **`company`** default in §4.4                                                                                                                                                                       |
| 1.3     | **§7.5** Python tooling: **uv** (`pyproject.toml`, `uv.lock`) + **ruff**; Phase 5 checklist updated                                                                                                                                                                                                                                   |
| 1.4     | Phase 0–7 + §11 marked satisfied in repo: Prettier; Dialog/Alert/Menu/Toast/PaginationBar; `lib/types/api`, `lib/api-client`, `lib/auth/get-session`, `lib/nav/resolve-menu`; BFF `/api/v1/hello`, `/api/v1/items`, in-memory job SSE + `useJobStream`; FastAPI `deps`, `security`, `services/`, `repositories/`, `GET /api/v1/items` |
