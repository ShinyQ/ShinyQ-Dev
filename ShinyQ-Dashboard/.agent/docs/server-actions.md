# Server Actions & Mutations

## The `ActionResult<T>` Pattern

To ensure type safety and consistent error handling across the network boundary, the AI-ME Template Dashboard uses a standardized `ActionResult<T>` pattern for all Next.js Server Actions.

This approach prevents stack traces from leaking to the client, enforces standardized error codes, and makes UI error handling predictable.

### The Contract

Defined in `lib/actions/action-result.ts`:

```typescript
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

## Vertical Slice Architecture

Server actions are organized using **Vertical Slices** — each business domain is self-contained within its own folder under `lib/actions/`.

### Slice Structure

```text
lib/actions/{domain}/
├── {domain}.actions.ts      # Server Actions — public API ("use server")
├── {domain}.service.ts      # Business logic & orchestration
├── {domain}.repository.ts   # Data access (DB, API, in-memory)
├── {domain}.types.ts        # Domain-specific types
└── {domain}.helpers.ts      # Pure utilities (optional)
```

### Separation of Concerns

| Layer          | File              | Responsibility                                                                                               |
| :------------- | :---------------- | :----------------------------------------------------------------------------------------------------------- |
| **Actions**    | `*.actions.ts`    | Public interface. Input validation, RBAC checks, wraps in `ActionResult<T>`. Must start with `"use server"`. |
| **Service**    | `*.service.ts`    | Business logic and orchestration. Calls the repository. No framework imports.                                |
| **Repository** | `*.repository.ts` | Direct data access (API calls, database, in-memory). Returns typed DTOs.                                     |
| **Types**      | `*.types.ts`      | Domain-specific interfaces and type aliases.                                                                 |
| **Helpers**    | `*.helpers.ts`    | Pure functions for validation, formatting, or transformation.                                                |

### Current Domain Slices

| Slice         | Status   | Description                                       |
| :------------ | :------- | :------------------------------------------------ |
| `auth/`       | Wired    | Session read/write, login, logout                 |
| `jobs/`       | Wired    | Demo job creation, status tracking, SSE streaming |
| `example/`    | Wired    | Reference implementation (welcome message)        |
| `analytics/`  | Skeleton | API metrics, model usage (mock data)              |
| `logs/`       | Skeleton | Conversation logs, search/filter (mock data)      |
| `models/`     | Skeleton | Model registry, status tracking (mock data)       |
| `playground/` | Skeleton | Chat inference, message handling (mock data)      |
| `users/`      | Skeleton | User management, search/filter (mock data)        |

## Creating a Server Action

1. **Location:** Create a new folder under `lib/actions/{domain}/`.
2. **Types first:** Define domain types in `{domain}.types.ts`.
3. **Repository:** Create data access functions in `{domain}.repository.ts`.
4. **Service:** Create business logic in `{domain}.service.ts`.
5. **Actions:** Create the public API in `{domain}.actions.ts` with `"use server"`.
6. **Naming:** Exported action functions must end with `ResultAction`.

### Example: Full Vertical Slice

**Types** (`lib/actions/reports/reports.types.ts`):

```typescript
export type Report = {
  id: string;
  title: string;
  createdAt: string;
};
```

**Repository** (`lib/actions/reports/reports.repository.ts`):

```typescript
import "server-only";

import { internalJson } from "@/lib/api-client";

export async function fetchReports(page: number) {
  const { json } = await internalJson(`/api/v1/reports?page=${page}`);
  return json;
}
```

**Service** (`lib/actions/reports/reports.service.ts`):

```typescript
import { fetchReports } from "./reports.repository";
import type { Report } from "./reports.types";

export async function listReports(page: number): Promise<Report[]> {
  const data = await fetchReports(page);
  return data.data;
}
```

**Actions** (`lib/actions/reports/reports.actions.ts`):

```typescript
"use server";

import { withActionResult } from "@/lib/actions/middleware.actions";

import { listReports } from "./reports.service";

export type { Report } from "./reports.types";

export async function listReportsResultAction(page: number) {
  return withActionResult(() => listReports(page));
}
```

## Consuming Server Actions in the UI

On the client side, never assume an action succeeded. Always branch on `result.ok` to show success messages, inline field errors, or toasts.

```tsx
"use client";

import { useTransition } from "react";

import { useToast } from "@/hooks/use-toast";
import { listReportsResultAction } from "@/lib/actions/reports/reports.actions";

export function ReportList() {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function load() {
    startTransition(async () => {
      const result = await listReportsResultAction(1);
      if (result.ok) {
        // handle result.data
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error.message,
        });
      }
    });
  }

  return (
    <button onClick={load} disabled={pending}>
      Load Reports
    </button>
  );
}
```

## Role-Based Access Control (RBAC) Wrappers

Actions can use `withRequiredScopes()` from `lib/actions/middleware.actions.ts` to enforce that the calling user possesses specific scopes before executing business logic:

```typescript
"use server";

import { withRequiredScopes } from "@/lib/actions/middleware.actions";
import { getSession } from "@/lib/auth/get-session";

import { deleteReport } from "./reports.service";

export async function deleteReportResultAction(id: string) {
  const user = await getSession();
  return withRequiredScopes(user, ["reports:delete"], () => deleteReport(id));
}
```
