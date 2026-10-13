# Architecture — Fastly LMS (Corrected & Completed)

## 1. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js (App Router, React 19) |
| Language | TypeScript |
| Auth | Clerk Organizations (Single organization, multi-role) |
| Database | MongoDB via Mongoose |
| Validation | Zod (all server action / API inputs) |
| Styling | Tailwind CSS + custom glass theme + shadcn/ui |
| DnD | @dnd-kit/core + sortable |
| Webhooks | Clerk webhooks verified with `svix` |

---

## 2. Project Structure

```
├── app/
│   ├── page.tsx                      # Landing (signed-out) / redirect (signed-in)
│   ├── layout.tsx                    # Root layout (ClerkProvider)
│   ├── sign-in/[[...sign-in]]/       # Sign in
│   ├── sign-up/
│   │   ├── [[...sign-up]]/           # Default signup
│   │   ├── student/                  # Student signup (stores requestedRole hint)
│   │   └── teacher/                  # Teacher signup (stores requestedRole hint)
│   ├── auth/
│   │   ├── pending/                  # Waiting for approval
│   │   └── complete/                 # Post sign-in router: setActive(org) → role dashboard
│   ├── select-org/                   # Organization selector (removed - single org only)
│   ├── unauthorized/                 # 403 page
│   ├── admin/
│   │   ├── layout.tsx                # Admin shell (sidebar + header)
│   │   ├── page.tsx                  # Bento dashboard
│   │   ├── accounts/                 # Pending access requests (approve / reject)
│   │   ├── users/                    # Users & faculty management
│   │   ├── courses/                  # Course management
│   │   │   ├── new/                  # Create course
│   │   │   └── [courseId]/           # Edit, assign teachers, manage enrollments
│   │   ├── analytics/                # Performance metrics
│   │   └── settings/                 # Org settings
│   ├── teacher/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Teacher dashboard
│   │   ├── courses/[courseId]/       # Assigned course: lessons, assignments
│   │   └── submissions/              # Review queue + grading
│   ├── student/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Student dashboard
│   │   ├── courses/[courseId]/       # Lessons, progress
│   │   ├── assignments/[id]/         # View + submit
│   │   └── grades/                   # Own grades & feedback
│   └── api/
│       └── webhooks/clerk/route.ts   # user / org / membership sync (public, signature-verified)
├── lib/
│   ├── actions/                      # Server Actions (moved out of /app)
│   │   ├── admin.ts
│   │   ├── courses.ts
│   │   ├── enrollments.ts
│   │   ├── assignments.ts
│   │   ├── student.ts
│   │   ├── teacher.ts
│   │   └── access-requests.ts        # Approve / reject (replaces role.ts)
│   ├── models/                       # Mongoose models (moved out of /app)
│   │   ├── Course.ts
│   │   ├── Lesson.ts
│   │   ├── Assignment.ts
│   │   ├── Enrollment.ts
│   │   ├── Submission.ts
│   │   ├── AccessRequest.ts
│   │   ├── UserProfile.ts
│   │   └── DashboardLayout.ts
│   ├── auth/
│   │   ├── guards.ts                 # Server-side guards
│   │   ├── roles.ts                  # Role types, permission map, helpers
│   │   └── redirects.ts              # roleHome(role) → path
│   ├── validators/                   # Zod schemas
│   ├── theme/glass.ts                # Design tokens
│   ├── admin-dashboard.ts            # Dashboard data aggregation
│   ├── db.ts                         # Cached MongoDB connection
│   └── utils.ts                      # cn()
├── components/
│   ├── admin/ (admin-sidebar.tsx, dashboard/{bento-card,bento-grid,widgets}.tsx)
│   ├── glass/ (draggable-grid, glass-card, glass-page-header)
│   ├── auth/role-selection.tsx
│   └── ui/                           # shadcn primitives
├── middleware.ts
└── docs/
```

> **Why move `models/` and `actions/` out of `app/`?** `app/` is for routes. Keeping non-route code in `lib/` avoids accidental route conventions and keeps imports consistent. Model filenames are now PascalCase everywhere (`course.ts` → `Course.ts`).

---

## 3. Roles & Source of Truth

- **Role lives on the Clerk organization membership** (`org:admin`, `org:teacher`, `org:student`), not on user `publicMetadata`. A user can be a teacher in one org and a student in another, so the role must be per-org.
- Read it server-side with `const { userId, orgId, orgRole } = await auth()`.
- `unsafeMetadata.requestedRole` / `requestedOrgId` set at sign-up are **hints only** (users can edit them). Never use them for authorization.
- The first user who creates an organization becomes `org:admin` (bootstrap path).

---

## 4. Auth Flow

### 4.1 Sign Up → Approval → Dashboard

```
User visits /sign-up/student or /sign-up/teacher (org-aware: ?org=<slug> or invite link)
  │
  ├─ Clerk creates account
  │    └─ unsafeMetadata = { requestedRole, requestedOrgId }   (hint only)
  │
  ├─ Webhook user.created → create UserProfile + AccessRequest { status: "pending" }
  │
  └─ Redirect → /auth/pending   (user has NO org membership yet)
       │
       ├─ Page re-checks every 5s via useOrganizationList().userMemberships.revalidate()
       │
       └─ Admin opens /admin/accounts (reads AccessRequest where status = "pending")
            │
            ├─ Approve → server action:
            │     1. requirePermission("member:manage")
            │     2. Clerk createOrganizationMembership({ role: "org:student" | "org:teacher" })
            │     3. AccessRequest.status = "approved", reviewedBy, reviewedAt
            │
            ├─ Reject → AccessRequest.status = "rejected" (user sees rejection state on /auth/pending)
            │
            └─ Pending page detects membership
                 → /auth/complete → setActive({ organization }) → redirect by role
```

### 4.2 `/auth/complete` (role router)

```
signed in?        no  → /sign-in
has membership?   no  → /auth/pending
>1 membership and no active org → /select-org
else → roleHome(orgRole):
         org:admin   → /admin
         org:teacher → /teacher
         org:student → /student
```

### 4.3 Middleware Pipeline (coarse checks only)

```
Request → clerkMiddleware()
  │
  ├─ Public: "/", /sign-in(.*), /sign-up(.*), /unauthorized, /api/webhooks(.*)
  │     └─ "/" — signed-out sees landing; signed-in → /auth/complete
  │
  ├─ Everything else:
  │   ├─ Not signed in → page: redirect to /sign-in   |   API: 401 JSON
  │   ├─ Signed in, no org membership → allow ONLY /auth/pending and /select-org
  │   │                                 (everything else → /auth/pending)
  │   ├─ Has membership, no active org → /select-org
  │   └─ Pass through (role checks happen in guards, not middleware)
```

> Middleware is **not** a security boundary on its own. Always re-check in server components and server actions.

### 4.4 Guard Hierarchy (outer → inner, in call order)

```
requireAuth()                  ← userId exists, else redirect /sign-in
  └─ requireOrg()              ← orgId exists, else redirect /select-org
       └─ requireRole(roles)   ← orgRole in roles, else redirect /unauthorized
            └─ requirePermission(perm) ← permission map check (finer-grained)
```

Each guard returns `{ userId, orgId, role }` so callers never re-fetch it.
Pages use `requirePageRole([...])` (redirects); actions/APIs use `requireRole([...])` (throws / returns `{ success: false }`).

### 4.5 Permission Matrix

| Permission | Admin | Teacher | Student |
|---|:-:|:-:|:-:|
| `member:manage` (approve, remove, change role) | ✓ | ✗ | ✗ |
| `org:settings` | ✓ | ✗ | ✗ |
| `analytics:view` | ✓ | own courses | ✗ |
| `course:create` | ✓ | ✗ | ✗ |
| `course:update` | ✓ | assigned only | ✗ |
| `course:assign` (assign teachers) | ✓ | ✗ | ✗ |
| `course:view` | ✓ | assigned | enrolled |
| `enrollment:manage` | ✓ | ✗ | ✗ |
| `assignment:manage` | ✓ | assigned courses | ✗ |
| `submission:create` | ✗ | ✗ | ✓ (enrolled) |
| `submission:view_own` | ✗ | ✗ | ✓ |
| `submission:review` | ✓ | assigned courses | ✗ |
| `grade:view_own` | ✗ | ✗ | ✓ |

"Assigned" / "enrolled" are **resource-level** checks done in the action after the permission check (e.g. `course.teacherIds.includes(userId)`).

---

## 5. Data Model (MongoDB)

Every document has `orgId` (string, indexed). Every unique index is **compound with `orgId`**.

| Model | Key fields | Indexes |
|---|---|---|
| **UserProfile** | `clerkUserId`, `email`, `name`, `avatarUrl` | `{ clerkUserId }` unique |
| **AccessRequest** | `orgId`, `clerkUserId`, `requestedRole`, `status` (pending/approved/rejected), `reviewedBy`, `reviewedAt` | `{ orgId, status }`, `{ orgId, clerkUserId }` unique |
| **Course** | `orgId`, `title`, `slug`, `description`, `teacherIds[]`, `status` (draft/published/archived), `createdBy` | `{ orgId, slug }` unique |
| **Lesson** | `orgId`, `courseId`, `title`, `content`, `order` | `{ orgId, courseId, order }` |
| **Assignment** | `orgId`, `courseId`, `title`, `instructions`, `dueAt`, `maxScore` | `{ orgId, courseId }` |
| **Enrollment** | `orgId`, `courseId`, `studentId`, `status` (active/completed/dropped), `progress`, `enrolledAt` | `{ orgId, courseId, studentId }` unique |
| **Submission** | `orgId`, `assignmentId`, `courseId`, `studentId`, `content/fileUrl`, `status` (submitted/graded/returned), `score`, `feedback`, `gradedBy`, `submittedAt`, `gradedAt` | `{ orgId, assignmentId, studentId }` unique, `{ orgId, status }` |
| **DashboardLayout** | `orgId`, `userId`, `dashboard`, `layout[]` (bento order/sizes) | `{ orgId, userId, dashboard }` unique |

---

## 6. Core Flows

### 6.1 Course Lifecycle
```
Admin → /admin/courses/new → createCourse()        [course:create]
  └─ status = draft
Admin → assign teacher(s) → assignTeacher()        [course:assign]
Teacher → adds lessons & assignments               [course:update + assigned]
Admin/Teacher → publish → status = published
```

### 6.2 Enrollment
```
Admin → /admin/courses/[id] → enrollStudents()     [enrollment:manage]
  └─ creates Enrollment { status: active } (idempotent via unique index)
Student → /student sees only courses where an active Enrollment exists
```

### 6.3 Submission → Review → Grade
```
Student → /student/assignments/[id]
  └─ submitAssignment()   [submission:create]
       checks: enrolled, not past dueAt (or marked late), no duplicate
       → Submission { status: submitted }
Teacher → /teacher/submissions (queue filtered to assigned courses)
  └─ gradeSubmission()    [submission:review + assigned]
       → score ≤ maxScore, feedback, status = graded, gradedBy
Student → /student/grades
  └─ sees score + feedback (own submissions only)
```

### 6.4 Analytics
Admin: org-wide (enrollments, completion rate, avg score, submission volume). Teacher: same, scoped to assigned courses. Computed with Mongo aggregation in `lib/admin-dashboard.ts`, always starting with `$match: { orgId }`.

### 6.5 Webhooks (`/api/webhooks/clerk`)
Verify the `svix` signature first; reject otherwise. Handle:

| Event | Action |
|---|---|
| `user.created` / `user.updated` | upsert `UserProfile`; create `AccessRequest` if new |
| `user.deleted` | anonymize profile; keep submissions for records |
| `organizationMembership.created` / `updated` / `deleted` | keep Enrollment/teacher assignments consistent (e.g. deactivate on removal) |
| `organization.deleted` | schedule org data cleanup |

Handlers must be **idempotent** (Clerk retries).

---

## 7. Data Flow Rules

### Server Components (default)
- Start with `requirePageRole([...])`.
- Fetch with Mongoose directly; use `.lean()` and convert `_id`/dates to plain values before passing to client components.
- Loading states are **not automatic**: add `loading.tsx` or wrap slow sections in `<Suspense>` with a skeleton.
- Add `error.tsx` per section for error boundaries.

### Server Actions (`"use server"`)
1. Auth guard (`requireRole` / `requirePermission`)
2. Validate input with Zod
3. Resource-level check (ownership / assigned / enrolled)
4. DB write scoped by `orgId`
5. `revalidatePath` / `revalidateTag`
6. Return `{ success: true, data } | { success: false, error, fieldErrors? }`

### Client Components
- `"use client"`; call actions for mutations, handle pending/error locally (`useTransition`, optimistic updates where helpful).
- Never trust client-supplied `orgId` or `userId`; the server derives them from the session.

---

## 8. Multi-Tenancy Rules

```ts
// ✅ orgId from the session, never from the request body
const { orgId, userId } = await requireRole(["admin", "teacher"]);

// ✅ list
const courses = await Course.find({ orgId }).lean();

// ✅ by id — ALWAYS include orgId (prevents cross-tenant access by guessing ids)
const course = await Course.findOne({ _id: courseId, orgId });

// ✅ student-owned data — also scope by owner
const sub = await Submission.findOne({ _id: id, orgId, studentId: userId });

// ❌ never
await Course.findById(courseId);
```

Consider a Mongoose plugin that injects `orgId` into every query and rejects queries without it.

---

## 9. Security Checklist

- Re-verify auth in every page and action (middleware is not enough).
- Zod-validate all inputs; sanitize any rich-text lesson content before rendering.
- Webhook signature verification; webhook route excluded from auth middleware only.
- File uploads (submissions): size/type limits, signed upload URLs, private storage.
- Rate-limit sensitive actions (submit, sign-up, approve).
- Never expose `CLERK_SECRET_KEY`, `MONGODB_URI`, or `CLERK_WEBHOOK_SECRET` to the client (only `NEXT_PUBLIC_*`).
- Audit fields (`createdBy`, `reviewedBy`, `gradedBy`) on privileged writes.

---

## 10. Environment Variables

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/auth/complete
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/auth/pending

# Database
MONGODB_URI=mongodb+srv://...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 11. Error & Edge Cases

| Case | Behavior |
|---|---|
| Signed in, no org | `/auth/pending` |
| Access request rejected | `/auth/pending` shows rejected state + contact admin |
| Role changed while signed in | Next request reflects the new `orgRole`; guards redirect if no longer allowed |
| Member removed from org | Webhook deactivates enrollments / unassigns teacher; user returns to `/auth/pending` |
| Wrong-role route (e.g. student → `/admin`) | `/unauthorized` |
| Resource from another org | Treated as not found (`notFound()`), not 403, to avoid leaking existence |
| Duplicate enrollment / submission | Blocked by unique index; action returns friendly error |
| DB connection in serverless | Cached connection in `lib/db.ts` (`global._mongoose`) |

---

## 12. Suggested Build Order

1. Clerk org setup, middleware, guards, `roles.ts` permission map
2. Webhook + `UserProfile` + `AccessRequest`
3. Pending → approve → complete flow
4. Course CRUD + teacher assignment
5. Enrollment
6. Lessons & assignments
7. Submission → grading → grades page
8. Analytics + persisted bento layouts
9. Hardening: validation, rate limits, tests (guards and tenant-isolation tests first)