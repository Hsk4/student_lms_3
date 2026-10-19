"use server";

import { auth } from "@clerk/nextjs/server";
import { clerk } from "@/lib/auth/guards";
import { isRole, type Role } from "@/lib/auth/roles";

const SELF_ASSIGNABLE_ROLES = ["teacher", "student"] as const;
type SelfAssignableRole = (typeof SELF_ASSIGNABLE_ROLES)[number];

function isSelfAssignableRole(value: unknown): value is SelfAssignableRole {
  return (
    typeof value === "string" &&
    (SELF_ASSIGNABLE_ROLES as readonly string[]).includes(value)
  );
}

type RoleResult = { role: Role | null; error?: string };

/**
 * Assigns the user's role exactly ONCE and only to a non-privileged role.
 * - The role is written to publicMetadata (server-only writable).
 * - If a role already exists it is returned untouched (no self-promotion).
 *
 * NOTE: Phase 2 replaces this flow with admin approval; until then it keeps the
 * existing single-school behaviour without any Clerk Organization plumbing.
 */
async function assignInitialRole(
  userId: string,
  requested: unknown,
): Promise<Role | null> {
  try {
    const user = await clerk.users.getUser(userId);

    const existing = (user.publicMetadata as { role?: unknown }).role;
    if (isRole(existing)) return existing;

    if (!isSelfAssignableRole(requested)) return null;

    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: { role: requested, status: "active" },
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
    const message =
      error instanceof Error ? error.message : "Failed to sync role";
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

    if (!isSelfAssignableRole(role)) {      return { role: null, error: "Invalid role" };
    }

    const assigned = await assignInitialRole(userId, role);
    if (!assigned) {
      return { role: null, error: "Could not assign role" };
    }
    return { role: assigned };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to set role";
    console.error("setUserRole error:", message);
    return { role: null, error: message };
  }
}
