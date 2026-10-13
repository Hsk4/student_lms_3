# Clerk Implementation — Fastly LMS

## Overview

Clerk provides authentication and multi-tenant organization management. The app uses Clerk's B2B features with organization-scoped roles stored in `publicMetadata`.

## Configuration

### Middleware (`middleware.ts`)

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/", "/sign-in(.*)", "/sign-up(.*)", "/auth/pending", "/api/webhook(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});
```

### Root Layout (`app/layout.tsx`)

```ts
import { ClerkProvider } from "@clerk/nextjs";

<ClerkProvider>
  <html lang="en">
    <body className="dark">{children}</body>
  </html>
</ClerkProvider>
```

## B2B Organization Model

### Multi-Tenancy

- Each school/institution = one Clerk Organization
- Users join organizations via memberships
- `orgId` is derived from `await auth()` and passed to all database queries
- Users can belong to multiple organizations (select via `/select-org`)

### Organization Permissions (`lib/auth/roles.ts`)

```ts
export const ORG_PERMISSIONS = {
  memberManage: "org:members:manage",
  courseCreate: "org:course:create",
  courseAssign: "org:course:assign",
  submissionReview: "org:submission:review",
  submissionViewOwn: "org:submission:view_own",
} as const;
```

### Permission Matrix

```ts
const permissionMatrix: Record<Role, string[]> = {
  admin: [
    ORG_PERMISSIONS.memberManage,
    ORG_PERMISSIONS.courseCreate,
    ORG_PERMISSIONS.courseAssign,
    ORG_PERMISSIONS.submissionReview,
    ORG_PERMISSIONS.submissionViewOwn,
  ],
  teacher: [
    ORG_PERMISSIONS.submissionReview,
    ORG_PERMISSIONS.submissionViewOwn,
  ],
  student: [
    ORG_PERMISSIONS.submissionViewOwn,
  ],
};
```

## Role System

### TypeScript Types

```ts
export const ROLES = ["admin", "teacher", "student"] as const;
export type Role = (typeof ROLES)[number];

// Clerk publicMetadata shape
interface ClerkPublicMetadata {
  role?: Role;
}
```

### Role Storage

Roles are stored in Clerk's `publicMetadata` on the User object:

```ts
// Setting a role (via admin action)
await clerkClient.users.updateUser(userId, {
  publicMetadata: { role: "student" },
});

// Reading a role (in guards)
const role = sessionClaims?.metadata?.role ?? user.publicMetadata?.role;
```

### Role Assignment Flow

1. User signs up → `publicMetadata.role` is `undefined`
2. User lands on `/auth/pending` (polls every 5s)
3. Admin visits `/admin/accounts` → sees pending users
4. Admin assigns role → calls `assignRoleToUser` server action
5. Server action updates Clerk `publicMetadata`
6. User's next poll detects role → redirects to dashboard

## Auth Guards (`lib/auth/guards.ts`)

### Guard Chain

```ts
// Level 1: Authentication
await requireAuth()  →  returns { userId, orgId, role }

// Level 2: Role check
await requireRole(["admin", "teacher"])  →  returns { userId, orgId, role }

// Level 3: Org requirement
await requireRole(["admin"], { requireOrg: true })  →  orgId guaranteed non-null

// Level 4: Permission check
await requirePermission(ORG_PERMISSIONS.memberManage)  →  verified against matrix
```

### Page-Level Guards

```ts
// For server components (pages)
const { userId, orgId, role } = await requirePageRole(["admin"], { requireOrg: true });

// With permission check
await requirePagePermission(ORG_PERMISSIONS.memberManage, { fresh: true, requireOrg: true });
```

### Server Action Guards

```ts
// Basic role check
const { userId, orgId } = await requireRole(["admin"], { requireOrg: true });

// Permission-based
await requirePermission(ORG_PERMISSIONS.courseCreate);
```

### Error Handling

Guards throw `AuthError` with specific codes:

```ts
class AuthError extends Error {
  code: "UNAUTHORIZED" | "FORBIDDEN" | "NO_ORG" | "ORG_MISMATCH";
  statusCode: 401 | 403;
}
```

- `UNAUTHORIZED` (401): Not signed in
- `FORBIDDEN` (403): Signed in but wrong role/permission
- `NO_ORG` (403): Requires org but user has none
- `ORG_MISMATCH` (403): Resource belongs to different org

## Clerk Client Usage

### Server Components

```ts
import { auth } from "@clerk/nextjs/server";
const { userId, orgId, sessionClaims } = await auth();
```

### Server Actions

```ts
import { requireRole } from "@/lib/auth/guards";
const { userId, orgId } = await requireRole(["admin"], { requireOrg: true });
```

### Client Components

```ts
import { useUser, useOrganization } from "@clerk/nextjs";
const { user } = useUser();
const { organization } = useOrganization();
```

### Clerk Admin API

```ts
import { createClerkClient } from "@clerk/nextjs/server";
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// List org members
const memberships = await clerkClient.organizations.getOrganizationMembershipList({
  organizationId: orgId,
});

// Get user details
const user = await clerkClient.users.getUser(userId);

// Update user metadata
await clerkClient.users.updateUser(userId, {
  publicMetadata: { role: "student" },
});
```

## Webhook Integration

The webhook route (`/api/webhook`) handles Clerk events:

- `organization.created` → sync org to MongoDB
- `organizationMembership.created` → assign default role
- `user.created` → create user record

Webhook secret: `CLERK_WEBHOOK_SECRET` env var.

## Environment Variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```