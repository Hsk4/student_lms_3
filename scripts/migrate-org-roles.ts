/**
 * One-off migration: copies each user's Clerk Organization role into
 * `publicMetadata.role` and marks them `active`, so the app no longer needs
 * Clerk Organizations to determine a role.
 *
 *   CLERK_SECRET_KEY=sk_... bun scripts/migrate-org-roles.ts [--dry-run]
 *
 * Users with no organization membership are skipped (they stay pending).
 * Safe to re-run: users that already have a valid `publicMetadata.role` are
 * left untouched.
 */
import { createClerkClient } from "@clerk/nextjs/server";

const ORG_ROLE_TO_ROLE: Record<string, "admin" | "teacher" | "student"> = {
  "org:admin": "admin",
  "org:teacher": "teacher",
  "org:student": "student",
};
const VALID_ROLES = ["admin", "teacher", "student"];

const secretKey = process.env.CLERK_SECRET_KEY;
const dryRun = process.argv.includes("--dry-run");

if (!secretKey) {
  console.error(
    "Usage: CLERK_SECRET_KEY=sk_... bun scripts/migrate-org-roles.ts [--dry-run]",
  );
  process.exit(1);
}

const clerk = createClerkClient({ secretKey });
let scanned = 0;
let updated = 0;
let skipped = 0;

let offset = 0;
const limit = 100;

for (;;) {
  const { data: users, totalCount } = await clerk.users.getUserList({
    limit,
    offset,
  });
  if (users.length === 0) break;

  for (const user of users) {
    scanned += 1;
    const existing = (user.publicMetadata as { role?: unknown }).role;
    if (typeof existing === "string" && VALID_ROLES.includes(existing)) {
      skipped += 1;
      continue;
    }

    const memberships = await clerk.users.getOrganizationMembershipList({
      userId: user.id,
    });
    const mapped = memberships.data
      .map((m) => ORG_ROLE_TO_ROLE[m.role])
      .find(Boolean);

    if (!mapped) {
      skipped += 1;
      continue;
    }

    const email = user.emailAddresses?.[0]?.emailAddress ?? user.id;
    if (dryRun) {
      console.log(`[dry-run] ${email} -> ${mapped}`);
    } else {
      await clerk.users.updateUserMetadata(user.id, {
        publicMetadata: { role: mapped, status: "active" },
      });
      console.log(`✔ ${email} -> ${mapped}`);
    }
    updated += 1;
  }

  offset += limit;
  if (offset >= totalCount) break;
}

console.log(
  `\nScanned ${scanned}, ${dryRun ? "would update" : "updated"} ${updated}, skipped ${skipped}.`,
);
