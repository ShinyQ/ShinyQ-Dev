# Authentication & Authorization

The AI-ME Template Dashboard provides an authenticated app shell out of the box. While the template is agnostic to the specific Authentication provider (e.g., NextAuth.js, pure JWT, Azure AD), it enforces a strict **Session Interface** that the rest of the app relies upon.

## The Session Interface Contract

Any chosen authentication system must map its user payload into the following shape (`lib/auth/get-session.ts` or `lib/types/auth.ts`):

```typescript
type SessionUser = {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  /** Product-specific claims for Role-Based Access Control */
  roles?: Array<{ groupId: string; role: string }>;
  scopes?: string[];
};
```

This interface ensures that the top-level `<AppShell />`, the `<Sidebar />`, and the Server Actions all have a predictable object to check when resolving user permissions.

## Route Protection Constraints

1. **Public vs. Authenticated:**
   - Public pages go in the `app/(public)/` route group (e.g., `/login`).
   - Private pages go in the `app/(authenticated)/` route group.
2. **Layout Gating:** The `layout.tsx` inside `(authenticated)` acts as the primary gate. It fetches the session using `getSession()` and redirects the user to `/login` if no valid session is found.

## Role-Based Access Control (RBAC)

RBAC controls what elements a user can see and what actions they can perform.

### 1. Navigation Scoping

Navigation items define required permissions using `requiredAccess`. The dynamic menu resolver (`lib/nav/resolve-menu.ts`) loops through these constraints against the `SessionUser` and hides menu items the user is not allowed to access.

### 2. Action Scoping

UI hiding is not security. Server Actions (`lib/actions/*`) should be wrapped with RBAC middleware that explicitly reads the server-side `SessionUser` and validates `roles` or `scopes` before hitting the database or the FastAPI backend layer.

## The Demo Login

Out of the box, the template includes a fake auth provider for development purposes. Visiting `/login` and clicking "Continue" writes a signed cookie containing dummy `SessionUser` data.

**To implement real auth:**

- Replace the `/login` logic with your provider's redirect trigger or credentials form.
- Update `getSession()` to read the real JWT or NextAuth session wrapper.
