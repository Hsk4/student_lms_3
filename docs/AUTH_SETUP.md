# Auth & roles (Clerk)

## Model
| Role    | How it's granted                                   | Can access                    |
|---------|----------------------------------------------------|-------------------------------|
| admin   | **Only** via Clerk dashboard or `scripts/grant-admin.ts` | `/admin`, `/teacher`, `/student` |
| teacher | Automatically, from `/sign-up/teacher`             | `/teacher`                    |
| student | Automatically, from `/sign-up/student`             | `/student`                    |

- Role lives in Clerk **public metadata** (`role`, `status`) – writable only from the backend.
- The sign-up forms send the chosen role in `unsafeMetadata` (client-writable), so it's only a *request*.
  `/auth/complete` → `syncRoleFromSignup()` validates it server-side, accepts `teacher`/`student` only,
  and assigns it **once** (a role can never be changed by the user afterwards).
- Clerk Organization membership no longer grants admin (anyone could create an org and become `org:admin`).
  Orgs are still used to scope data (`orgId`).
- Every server action calls `requireRole(...)`; admin mutations re-check against Clerk (`fresh: true`).

## One-time Clerk dashboard setup
1. **Sessions → Customize session token** → `{ "metadata": "{{user.public_metadata}}" }`
2. **Organizations → Settings** → turn **off** "Allow new users to create organizations".
   Create the school org yourself in the dashboard and add your admin account to it.
3. Create your first admin: sign up normally, then either
   - Dashboard → Users → your user → **Public metadata** → `{ "role": "admin", "status": "active" }`, or
   - `CLERK_SECRET_KEY=sk_... bun scripts/grant-admin.ts you@example.com`
4. Enable email verification, and MFA (Configure → User & authentication) – at least for admins.
5. Sign out and back in so the new token carries the role.
