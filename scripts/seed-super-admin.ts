/**
 * Seeds the single super admin. This is the ONLY way to obtain `super_admin`:
 * it is never assignable through the UI or the approval flow.
 *
 *   sourced .env.local; bun scripts/seed-super-admin.ts admin@school.edu
 *
 * The user must have signed up first (and have a verified email). Existing
 * admins are not promoted by this script — pass the account you want to own
 * the school explicitly. Re-running is idempotent.
 */
import { createClerkClient } from "@clerk/nextjs/server";

const email = process.argv[2]?.trim().toLowerCase();
const secretKey = process.env.CLERK_SECRET_KEY;

if (!email || !secretKey) {
  console.error(
    "Usage: CLERK_SECRET_KEY=sk_... bun scripts/seed-super-admin.ts <email>",
  );
  process.exit(1);
}

const clerk = createClerkClient({ secretKey });
const { data: users } = await clerk.users.getUserList({
  emailAddress: [email],
});

if (users.length !== 1) {
  console.error(`Expected exactly 1 user for ${email}, found ${users.length}.`);
  process.exit(1);
}

const user = users[0];
const verified = user.emailAddresses.some(
  (e) =>
    e.emailAddress.toLowerCase() === email &&
    e.verification?.status === "verified",
);
if (!verified) {
  console.error("Refusing: that email address is not verified in Clerk.");
  process.exit(1);
}

const existing = user.publicMetadata as { role?: unknown };
if (existing.role === "super_admin") {
  console.log(`✔ ${email} is already the super admin. Nothing to do.`);
  process.exit(0);
}
if (existing.role === "admin" && process.argv.includes("--force") === false) {
  console.error(
    "Refusing: that user is already an admin. Re-run with --force to promote them.",
  );
  process.exit(1);
}

await clerk.users.updateUserMetadata(user.id, {
  publicMetadata: { role: "super_admin", status: "active", onboarded: true },
});

console.log(
  `✔ ${email} (${user.id}) is now the super admin. They must sign out and back in.`,
);
