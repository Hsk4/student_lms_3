import { auth, createClerkClient } from "@clerk/nextjs/server";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { redirect } from "next/navigation";
import { isRole, type Role } from "@/lib/auth/roles";

export const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export class AuthError extends Error {
    constructor(
        message: string,
        public status: 401 | 403,
    ) {
        super(message);
        this.name = "AuthError";
    }
}

/**
 * Single-school deployment: every user belongs to this one Clerk organization.
 * Data is scoped by it, so students/teachers don't need an "active org" in
 * their session. Unset => fall back to the session's active org (multi-tenant).
 */
export function schoolOrgId(): string | null {
    return process.env.SCHOOL_ORG_ID?.trim() || null;
}

type GuardOptions = {
    /**
     * Re-read role/status from Clerk's backend instead of trusting the session
     * token (which can be up to ~60s stale). Use for destructive/admin actions
     * so a demoted or deactivated admin loses access immediately.
     */
    fresh?: boolean;
    /** Require an organization (data is scoped per org). */
    requireOrg?: boolean;
};

export type AuthContext = { userId: string; orgId: string | null; role: Role };

async function resolve(allowed: readonly Role[], opts: GuardOptions): Promise<AuthContext> {
    const { userId, orgId: activeOrgId, sessionClaims } = await auth();
    if (!userId) throw new AuthError("Unauthorized", 401);

    let role: unknown = sessionClaims?.metadata?.role;
    let status: unknown = sessionClaims?.metadata?.status;

    if (opts.fresh) {
        const user = await clerk.users.getUser(userId);
        role = (user.publicMetadata as { role?: unknown }).role;
        status = (user.publicMetadata as { status?: unknown }).status;
    }

    if (status === "deactivated") throw new AuthError("Account deactivated", 403);
    if (status === "pending") throw new AuthError("Account awaiting admin approval", 403);
    if (!isRole(role) || !allowed.includes(role)) {
        throw new AuthError("Forbidden: insufficient role", 403);
    }

    const orgId = schoolOrgId() ?? activeOrgId ?? null;
    if (opts.requireOrg && !orgId) {
        throw new AuthError("Forbidden: no organization configured", 403);
    }
    // Sensitive (fresh) calls also prove the caller really is in that org.
    if (opts.fresh && orgId) await assertUserInOrg(orgId, userId);

    return { userId, orgId, role };
}

/** For server actions / route handlers: throws AuthError when not allowed. */
export async function requireRole(
    allowed: readonly Role[],
    opts: GuardOptions = {},
): Promise<AuthContext> {
    return resolve(allowed, opts);
}

/** For pages / layouts: redirects instead of throwing. */
export async function requirePageRole(
    allowed: readonly Role[],
    opts: GuardOptions = {},
): Promise<AuthContext> {
    try {
        return await resolve(allowed, opts);
    } catch (e) {
        if (e instanceof AuthError) redirect(e.status === 401 ? "/sign-in" : "/");
        throw e;
    }
}

/** Tenant check: the target user must belong to the given organization. */
export async function assertUserInOrg(orgId: string, targetUserId: string) {
    const memberships = await clerk.organizations.getOrganizationMembershipList({
        organizationId: orgId,
        userId: [targetUserId],
        limit: 1,
    });
    if (memberships.data.length === 0) {
        throw new AuthError("Forbidden: user is not in your organization", 403);
    }
}

/** Idempotently adds a user to the school org (no-op when SCHOOL_ORG_ID is unset). */
export async function addToSchoolOrg(userId: string) {
    const organizationId = schoolOrgId();
    if (!organizationId) return;
    try {
        await clerk.organizations.createOrganizationMembership({
            organizationId,
            userId,
            role: "org:member",
        });
    } catch (e) {
        if (
            isClerkAPIResponseError(e) &&
            e.errors.some((x) => x.code === "already_a_member_in_organization")
        ) {
            return;
        }
        throw e;
    }
}
