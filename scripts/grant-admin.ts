/**
 * Grants the "admin" role to an existing Clerk user. Run locally by an operator:
 *
 *   CLERK_SECRET_KEY=sk_... bun scripts/grant-admin.ts someone@example.com
 *
 * This is the ONLY code path that can create an admin besides editing the
 * user's public metadata in the Clerk dashboard. The user must have signed up
 * first (and have a verified email).
 */
import { createClerkClient } from "@clerk/nextjs/server";

const email = process.argv[2]?.trim().toLowerCase();
const secretKey = process.env.CLERK_SECRET_KEY;

if (!email || !secretKey) {
  console.error("Usage: CLERK_SECRET_KEY=sk_... bun scripts/grant-admin.ts <email>");
  process.exit(1);
}

const clerk = createClerkClient({ secretKey });
const { data: users } = await clerk.users.getUserList({ emailAddress: [email] });

if (users.length !== 1) {
  console.error(`Expected exactly 1 user for ${email}, found ${users.length}.`);
  process.exit(1);
}

const user = users[0];
const verified = user.emailAddresses.some(
  (e) => e.emailAddress.toLowerCase() === email && e.verification?.status === "verified",
);
if (!verified) {
  console.error("Refusing: that email address is not verified in Clerk.");
  process.exit(1);
}

await clerk.users.updateUserMetadata(user.id, {
  publicMetadata: { role: "admin", status: "active" },
});
console.log(`✔ ${email} (${user.id}) is now an admin. They must sign out and back in.`);
