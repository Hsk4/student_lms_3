"use server";

import { auth } from "@clerk/nextjs/server";
import { addToSchoolOrg, clerk } from "@/lib/auth/guards";
import { isRole, isSelfAssignableRole, type Role } from "@/lib/auth/roles";

// Teachers can self-register, so by default they wait for admin approval.
// Set TEACHER_AUTO_APPROVE=true to skip that.
const teachersNeedApproval = () => process.env.TEACHER_AUTO_APPROVE !== "true";

/**
 * Assigns the user's role exactly ONCE and only to a non-privileged role.
 * - The role is written to publicMetadata (server-only writable).
 * - If a role already exists it is returned untouched (no self-promotion,
 *   no switching teacher <-> student by editing unsafeMetadata later).
 * - The user joins the school org BEFORE the role is written, so a failure
 *   leaves them role-less and the flow simply retries.
 */
async function assignInitialRole(userId: string, requested: unknown): Promise<Role | null> {
    const user = await clerk.users.getUser(userId);

    const existing = (user.publicMetadata as { role?: unknown }).role;
    if (isRole(existing)) return existing;

    if (!isSelfAssignableRole(requested)) return null;

    await addToSchoolOrg(userId);

    const status = requested === "teacher" && teachersNeedApproval() ? "pending" : "active";
    await clerk.users.updateUserMetadata(userId, {
        publicMetadata: { role: requested, status },
    });
    return requested;
}

/** Called right after sign-up: applies the role chosen on the sign-up form. */
export async function syncRoleFromSignup(): Promise<{ role: Role | null }> {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await clerk.users.getUser(userId);
    const requested = (user.unsafeMetadata as { role?: unknown }).role;
    return { role: await assignInitialRole(userId, requested) };
}

/** Fallback picker for users who signed up without a role (e.g. generic /sign-up). */
export async function setUserRole(role: unknown): Promise<{ role: Role }> {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Runtime validation: server action arguments come from the client.
    if (!isSelfAssignableRole(role)) throw new Error("Invalid role");

    const assigned = await assignInitialRole(userId, role);
    if (!assigned) throw new Error("Could not assign role");
    return { role: assigned };
}
