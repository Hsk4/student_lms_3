# Student LMS - Route Guide

## Public Routes

| Route | Description | Theme |
|-------|-------------|-------|
| `/` | Landing page | Teal glassmorphism |
| `/sign-in` | Clerk sign-in | Teal glassmorphism |
| `/sign-up` | Clerk sign-up (role selector) | Teal glassmorphism |
| `/sign-up/student` | Sign up as student | Teal glassmorphism |
| `/sign-up/teacher` | Sign up as teacher | Teal glassmorphism |

## Protected Routes (Authenticated)

| Route | Role | Description | Theme |
|-------|------|-------------|-------|
| `/select-org` | All | Choose organization | Teal glassmorphism |
| `/auth/pending` | All (no role yet) | Wait for admin role assignment | Teal glassmorphism |

## Admin Routes (`/admin/*`)

All require **admin** role.

| Route | Description | Theme |
|-------|-------------|-------|
| `/admin` | Dashboard overview | Teal glassmorphism |
| `/admin/accounts` | Pending users & role assignment | Teal glassmorphism |
| `/admin/courses` | List/create/delete courses | Teal glassmorphism |
| `/admin/courses/new` | Create new course | Teal glassmorphism |
| `/admin/users` | View org members & roles | Teal glassmorphism |
| `/admin/analytics` | Performance metrics | Teal glassmorphism |
| `/admin/settings` | Organization settings | Teal glassmorphism |

## Teacher Routes (`/teacher/*`)

All require **teacher** or **admin** role.

| Route | Description | Theme |
|-------|-------------|-------|
| `/teacher` | Teacher dashboard (shows assigned courses) | Teal glassmorphism |

## Student Routes (`/student/*`)

All require **student** role (admins can also access).

| Route | Description | Theme |
|-------|-------------|-------|
| `/student` | Main dashboard | Teal glassmorphism |
| `/student/assignments` | View assignments with filters | Teal glassmorphism |
| `/student/courses` | Browse enrolled courses | Teal glassmorphism |
| `/student/timetable` | Weekly class schedule | Teal glassmorphism |
| `/student/results` | Exam scores & grades | Teal glassmorphism |
| `/student/profile` | Edit personal info | Teal glassmorphism |

## Legacy Routes (Disabled)

All `/dashboard/*` routes redirect to `/student/*`:
- `/dashboard` → `/student`
- `/dashboard/assignments` → `/student/assignments`
- `/dashboard/courses` → `/student/courses`
- `/dashboard/profile` → `/student/profile`
- `/dashboard/results` → `/student/results`
- `/dashboard/timetable` → `/student/timetable`

## Authorization Logic

Enforced in `proxy.ts` (middleware):

1. **Unauthenticated** → Redirect to `/sign-in`
2. **No organization** → Redirect to `/select-org`
3. **No role** → Redirect to `/unauthorized`
4. **Admin** → Can access `/admin`, `/teacher`, `/student`
5. **Teacher** → Can access `/teacher`, `/student`
6. **Student** → Can access `/student` only

## Theme Consistency

✅ All routes use **Teal Glassmorphism Theme**:
- Primary: Teal-400/500
- Accent: Cyan-300/400
- Background: Dark with glass effect
- Text: White (never black)
- Borders: Teal-400/30 with backdrop blur

---

**Status**: All routes implemented and theme-consistent ✅
