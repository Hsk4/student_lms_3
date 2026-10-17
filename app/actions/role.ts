"use server";

import { auth } from "@clerk/nextjs/server";
import { addToSchoolOrg, clerk, SCHOOL_ORG_ID } from "@/lib/auth/guards";
import { isRole, isSelfAssignableRole, toClerkOrgRole, type Role } from "@/lib/auth/roles";

const teachersNeedApproval = () => process.env.TEACHER_AUTO_APPROVE !== "true";

type RoleResult = { role: Role | null; error?: string };

/**
 * Assigns the user's role exactly ONCE and only to a non-privileged role.
 * - The role is written to publicMetadata (server-only writable).
 * - If a role already exists it is returned untouched (no self-promotion,
 *   no switching teacher <-> student by editing unsafeMetadata later).
 * - The user joins the school org BEFORE the role is written, so a failure
 *   leaves them role-less and the flow simply retries.
 */
async function assignInitialRole(userId: string, requested: unknown): Promise<Role | null> {
  try {
    const user = await clerk.users.getUser(userId);

    const existing = (user.publicMetadata as { role?: unknown }).role;
    if (isRole(existing)) return existing;

    if (!isSelfAssignableRole(requested)) return null;

    await addToSchoolOrg(userId, requested);

    const status = requested === "teacher" && teachersNeedApproval() ? "pending" : "active";
    const membershipRole = requested === "teacher" && teachersNeedApproval() ? "org:student" : toClerkOrgRole(requested);

    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: { role: requested, status },
    });

    await clerk.organizations.updateOrganizationMembership({
      organizationId: SCHOOL_ORG_ID!,
      userId,
      role: membershipRole,
    });

    return requested;
  } catch (error) {
    console.error("assignInitialRole error:", error);
    return null;
  }
}

/** Called right after sign-up: applies the role chosen on the sign-up form. */
export async function syncRoleFromSignup(): Promise<RoleResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { role: null, error: "Unauthorized" };
    }

    const user = await clerk.users.getUser(userId);
    const requested = (user.unsafeMetadata as { role?: unknown }).role;
    const role = await assignInitialRole(userId, requested);
    return { role };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sync role";
    console.error("syncRoleFromSignup error:", message);
    return { role: null, error: message };
  }
}

/** Fallback picker for users who signed up without a role (e.g. generic /sign-up). */
export async function setUserRole(role: unknown): Promise<RoleResult> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { role: null, error: "Unauthorized" };
    }

    if (!isSelfAssignableRole(role)) {
      return { role: null, error: "Invalid role" };
    }

    const assigned = await assignInitialRole(userId, role);
    if (!assigned) {
      return { role: null, error: "Could not assign role" };
    }
    return { role: assigned };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to set role";
    console.error("setUserRole error:", message);
    return { role: null, error: message };
  }
}
