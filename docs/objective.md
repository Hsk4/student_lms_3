# Objective — Fastly LMS (single school)

Repo: `Hsk4/student_lms_3` · Stack: Next.js 16 (App Router) · Clerk · MongoDB/Mongoose · shadcn · bun

## 1. Goal

Turn the current multi-tenant, 3-role prototype into a **single-school LMS with five roles**
(`super_admin`, `admin`, `teacher`, `student`, `parent`) where **nobody picks their own role**:
every new user lands in `pending`, an admin approves and assigns a role, and all data access is
scoped by ownership (teacher → their students, parent → their children, student → themselves).

### Success criteria (the whole plan is done when all of these are true)

- [ ] No user can obtain any role except through admin approval (super admin is seeded by script only)
- [ ] No Clerk Organizations, no `orgId` anywhere in code or data, no `/select-org` step
- [ ] Boards, levels, subjects, courses and books are admin-managed data, not hard-coded enums
- [ ] Student flow works end to end: request → approval → parent details → pick teacher → teacher accepts → class or one-on-one
- [ ] Parent sees only linked children; teacher sees only their own students (enforced server-side, not just hidden in the UI)
- [ ] Every admin action that changes a role, teacher or board is written to an audit log
- [ ] `bun run build` and `bun run lint` pass with zero dead files and zero mock data
- [ ] One accurate `docs/ARCHITECTURE.md` replaces the stale docs

## 2. Decisions already made

| Topic | Decision |
|---|---|
| Tenancy | One school. Drop Clerk Organizations entirely |
| Source of truth for role/status | Clerk `publicMetadata` (`role`, `status`, `onboarded`), exposed to the proxy through session claims. Mirrored into a Mongo `User` collection by webhook |
| Roles | `super_admin` > `admin`, `teacher`, `student`, `parent`. One role per user |
| User status | `pending`, `active`, `rejected`, `suspended` |
| Boards | Real exam boards (Sindh, Aga Khan, ...). Admin-managed collection |
| Courses | One course = board + level + subject (+ optional medium) |
| Books | Recommended courseware only. Students buy them themselves. No prices or payments |
| Payments | Tuition invoices only |
| Parents | Join by invite token sent by the student, not by admin approval |
| Mongoose models | The set in `models.ts` from the architecture discussion (`User`, `AccessRequest`, `Enrollment`, `Class`, `Invoice`, ...) |

## 3. What is wrong today (verified by reading the repo)

| # | Finding | Where |
|---|---|---|
| 1 | Users can **self-assign** teacher/student via `unsafeMetadata.role`; students are activated instantly | `app/actions/role.ts`, `app/sign-up/teacher`, `app/sign-up/student` |
| 2 | Every protected route needs an active Clerk Organization; `orgId` is on every model and query | `proxy.ts`, `lib/auth/guards.ts`, all models and actions |
| 3 | Boards are a hard-coded enum that also contains qualifications (O Levels, BCOM, ...) | `app/models/course.ts` |
| 4 | `Course` holds `subjects[]`, so a teacher can't be matched per subject | `app/models/course.ts` |
| 5 | `Enrollment` mixes teacher assignment and student enrollment in one `{userId, courseId, role}` row | `app/models/Enrollment.ts` |
| 6 | `updateUserRole` runs `Enrollment.deleteMany` with no audit trail | `app/actions/admin.ts` |
| 7 | **Bug:** `submitAssignment` calls `Assignment.findOne(...)` without `await`, so the null check never fires and `requireCourseAccess` receives a Query object | `app/actions/student.ts` |
| 8 | `gradeSubmission` revalidates a path that does not exist (`/dashboard/teacher/submissions`); `approveUser` does nothing except unban | `app/actions/teacher.ts`, `app/actions/admin.ts` |
| 9 | Users exist only in Clerk, so admin lists call the Clerk API every time (slow, rate-limited) | `app/api/admin/users/route.ts`, `lib/admin-dashboard.ts` |
| 10 | `/api/webhooks(.*)` is a public route in the proxy but no handler exists | `proxy.ts` |
| 11 | `app/dashboard/*` is a legacy student dashboard on **mock data**: it imports `@/data/mock-data`, which is not in the repo, and `@/components/ui/Card` / `Button` while the files are lowercase (`card.tsx`, `button.tsx`). It has no role gate beyond "has an org role" | `app/dashboard/**` |
| 12 | Heritage from a code-snippet platform: `Snippet` model, `starterSnippetId`, `codeSnippet` on submissions | `app/models/*` |
| 13 | Docs and README describe a different system ("Production Ready", multi-tenant, different permission names) | `README.md`, `docs/*`, `PENDING_USERS_SYSTEM.md` |

## 4. Delete list

Delete in the phase shown, one commit per phase, and run `bun run build` after each. "Verify" means
grep for remaining imports first.

### Phase 0 (dead code, no behaviour change)

| Path | Why |
|---|---|
| `app/dashboard/**` | Legacy mock student dashboard (finding 11). The real student area is `app/student` |
| `components/stddashboard/**` | Only used by `app/dashboard` |
| `components/UI_std/**` | Zero importers |
| `components/layout/**` | Zero importers (Header, Sidebar, MobileNav, BackgroundGlow) |
| `components/assistant/**` and `app/assistant/**` | Duplicate mock chat UIs; rebuild as the AI quiz UI in Phase 8 |
| `components/auth/role-selection.tsx` | Self-assign UI, zero importers |
| `components/auth/deactivation-message.tsx` | Zero importers |
| `app/test-courses/**` | Test page |
| `types/std_dashboard.ts`, `lib/std_db.ts`, `lib/std_utils.ts` | Only served the legacy dashboard (verify) |
| `.idea/` and `docs/bun.lock` | Editor and stray files; add `.idea/` to `.gitignore` |
| `PENDING_USERS_SYSTEM.md` | Status log, not documentation |

**Keep:** `components/glass/*` (`draggable-grid.tsx` has no importer yet, but it is your bento-dashboard goal), `lib/theme/glass.ts`,
`components/ui/input.tsx` and `label.tsx` (needed for forms), `components/admin/*`, `docs/AGENTS.md`.

### Phase 1 (Organizations)

| Path / symbol | Why |
|---|---|
| `app/select-org/**` | No orgs |
| `SCHOOL_ORG_ID`, `addToSchoolOrg`, `getFreshOrgRole`, `assertUserInOrg`, `updateOrganizationMemberRole`, `requireOrgContext` in `lib/auth/guards.ts` | Org plumbing |
| `CLERK_ORG_ROLES`, `toClerkOrgRole`, `appRoleFromClerkRole`, `org:*` permission strings in `lib/auth/roles.ts` | Replace with plain `Role` and `Permission` names |
| `orgId` field, index and filter in every model, action and page | Single tenant |
| Org checks in `proxy.ts` | Replaced by role/status checks |

### Phase 2 (self-assign)

| Path / symbol | Why |
|---|---|
| `app/actions/role.ts` (`syncRoleFromSignup`, `setUserRole`, `assignInitialRole`) | Replaced by the webhook + admin approval |
| `app/sign-up/teacher/**`, `app/sign-up/student/**` | One sign-up, then a landing request form |
| `app/auth/complete/**`, duplicate `app/pending/**` | Likely call the self-assign flow (verify); keep one `/pending` |
| `TEACHER_AUTO_APPROVE` env var | No auto-approval |
| `app/api/admin/users/route.ts` | Replace with server components reading the Mongo `User` collection |

### Phase 3 (data model)

| Path | Why |
|---|---|
| `app/models/snippet.ts`, `Assignment.starterSnippetId`, `Submission.codeSnippet` | Wrong domain; submissions become `text` + `fileUrl` |
| `app/models/MockPaper.ts`, `createMockPaper`, `getMockPapers`, its use in `lib/admin-dashboard.ts` | Not in the spec. Remove unless you want past papers; if so, re-add as a `Material` type on a course |
| Old `Course` and `Enrollment` shapes | Replaced by the new models |

### Cleanup candidates to verify

- `cn` in `package.json`: you import `cn` from `@/lib/utils`, so the npm package `cn` is probably accidental. Remove if `grep -rn "from 'cn'"` is empty
- `shadcn` is a CLI and normally not a runtime dependency (move to `devDependencies` or use `bunx`)
- `@base-ui/react`: remove if unused

## 5. Target auth design

```
Clerk publicMetadata: { role, status, onboarded }
Session token claim:   { "metadata": "{{user.public_metadata}}" }   // set once in the Clerk dashboard

proxy.ts (coarse, per request):
  no user                      -> public routes only
  status = suspended           -> /?error=account_suspended
  status = rejected            -> /rejected
  status = pending             -> only /pending and /request (landing form)
  role = student, !onboarded   -> only /onboarding/parent
  /admin/**                    -> admin, super_admin
  /admin/admins/**             -> super_admin only
  /teacher/** /student/** /parent/** -> matching role only

server actions / pages (fine-grained, always re-check):
  requireRole([...])           -> role gate
  requireTeacherOf(studentId)  -> an Enrollment exists for this teacher and student
  requireParentOf(studentId)   -> studentId is in the parent's children
  requireEnrollmentAccess(id)  -> student, their teacher, their parent, or admin
```

Rule: **proxy gates the area, server code gates the row.** Never rely on the proxy alone.

Webhook (`/api/webhooks/clerk`, verified with Clerk's signing secret): `user.created` creates a `User` with
`status: pending` and no role; `user.updated` and `user.deleted` keep the mirror in sync.

## 6. Phases

Each phase ends with a passing build and a manual check. Update the checkboxes as you go.

### Phase 0, Safety net and dead-code removal — COMPLETE
- [x] Create branch `refactor/single-school`; confirm `bun run build` state first (note any existing failures)
- [x] Delete the Phase 0 list above, then grep for broken imports
- [x] Add `.env.example` (`MONGODB_URI`, Clerk keys, webhook secret, no `SCHOOL_ORG_ID`)
- [x] Remove `/dashboard` from navigation and links
- **Done when:** build passes and no file in the repo imports `@/data/mock-data` — **COMPLETE**

### Phase 1, Remove Clerk Organizations — COMPLETE
- [x] Rewrite `lib/auth/roles.ts` (plain roles and permissions, no `org:` strings)
- [x] Rewrite `lib/auth/guards.ts` (no org helpers; read role/status from session claims, `fresh` option reads Clerk user metadata)
- [x] Rewrite `proxy.ts` per section 5 (temporary: only `admin|teacher|student` until Phase 2)
- [x] Remove `orgId` from models, actions, pages, `lib/admin-dashboard.ts`
- [x] Migrate existing users: copy their org role into `publicMetadata.role` — `scripts/migrate-org-roles.ts`
- [x] Turn Organizations off in the Clerk dashboard; remove `SCHOOL_ORG_ID`
- **Done when:** a signed-in user reaches their dashboard with no org selection, and `grep -rn orgId` returns nothing — **COMPLETE** (only `docs/` prose mentions it; `app/select-org` deleted)

### Phase 2, Roles, status and the User mirror — COMPLETE
- [ ] Add `super_admin` and `parent` to roles, permissions and proxy
- [ ] Add `User` model and `/api/webhooks/clerk` (create, update, delete)
- [ ] Remove self-assign (Phase 2 delete list); every sign-up becomes `pending`
- [ ] `scripts/grant-admin.ts` becomes `scripts/seed-super-admin.ts` (keeps the verified-email check)
- [ ] Admin actions rewritten: `assignRole`, `rejectUser`, `suspendUser`, each with an `AuditLog` write; admins cannot touch `super_admin` or other admins
- [ ] Replace `approveUser` (currently a no-op) with the real `pending → active` transition
- **Done when:** a fresh sign-up cannot reach any dashboard until an admin assigns a role, and the audit log shows the change

### Phase 3, Catalog and data migration
- [ ] Models: `Board`, `Level`, `Subject`, `Course` (board+level+subject+medium), `Book`, `Material`
- [ ] Admin pages: boards, courses and books lists plus detail pages, each with its own sidebar entry
- [ ] Migration script: split old `Course.subjects[]` into one `Course` per subject; if the data is only test data, drop the collections instead
- [ ] Rewrite `Assignment` and `Submission` (`text` + `fileUrl`, numeric or string grade decided once)
- **Done when:** admin can create a board, a level, a subject, a course and recommended books with no code change

### Phase 4, Onboarding flow
- [ ] `AccessRequest` model and a landing form (name, email, board, level, desired subjects)
- [ ] `/pending` page with polling (reuse the existing 5 s poll)
- [ ] Admin approval queue at `/admin/requests` (assign role, reject with reason)
- [ ] Student `/onboarding/parent`: parent name and email, creates `ParentInvite`, then sets `publicMetadata.onboarded = true`
- [ ] Invite acceptance: token page, parent signs up, `role: parent`, `status: active`, linked through `guardianIds`
- **Done when:** the full request → approval → parent linked path works with two test accounts

### Phase 5, Teacher matching and classes
- [ ] Teacher profile: courses they teach (`teacher.courseIds`), editable by admin
- [ ] Student teacher picker filtered by their board and level
- [ ] `Enrollment` lifecycle: requested → accepted/declined → active; teacher accepts into a `Class` or leaves one-on-one
- [ ] Admin reassignment (cancels old enrollment, creates new, audits, in one transaction; add `withTransaction` to `lib/db.ts`)
- [ ] Admin can change a student's board and books; warns and cancels mismatched enrollments
- **Done when:** a student gets a teacher, in a class or one-on-one, and admin can move them to another teacher

### Phase 6, Teaching tools
- [ ] Fix `submitAssignment` (`await`, validate via enrollment, not via mock course access)
- [ ] Assignments for a class or an enrollment; submissions; grading; correct revalidate paths
- [ ] Attendance and current/previous batches view for teachers
- **Done when:** teacher publishes, student submits, teacher grades, and the student sees the result

### Phase 7, Parent, tuition, meetings, support
- [ ] `/parent`: children list and per-child progress (read-only)
- [ ] `Invoice` (tuition only): admin creates and marks paid; student and parent see dues
- [ ] `Meeting`: parent requests, teacher confirms or reschedules
- [ ] `SupportTicket` for student and teacher to admin, escalatable to super admin
- **Done when:** a parent can see only their own children's data (test with a second parent account)

### Phase 8, AI quizzes, analytics, hardening
- [ ] Materials upload; quiz generation scoped to the student's enrolled courses
- [ ] Admin analytics rebuilt from Mongo (not the Clerk API)
- [ ] Rate limits on webhook and AI endpoints; authorization tests for the four row-level guards
- [ ] Replace `README.md` and all `docs/*` with one accurate `docs/ARCHITECTURE.md`
- **Done when:** all success criteria in section 1 are checked

## 7. Open questions (defaults in bold)

1. Mock papers: **delete**, or keep as a `Material` type under courses?
2. Existing data: **wipe dev data** and re-seed, or migrate users and courses?
3. Grades: **numeric (0 to 100)** or free text like "A+"?
4. Rejected users: **can re-apply after 30 days** or are blocked permanently?
