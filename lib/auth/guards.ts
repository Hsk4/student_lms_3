import { auth, createClerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { connectToDatabase } from "@/lib/db";
import { Course } from "@/app/models/course";
import { Enrollment } from "@/app/models/Enrollment";
import {
    appRoleFromClerkRole,
    canRoleAccessPermission,
    ORG_PERMISSIONS,
    roleMatches,
    type SelfAssignableRole,
    toClerkOrgRole,
    type ClerkOrgRole,
    type OrgPermission,
    type Role,
} from "@/lib/auth/roles";

export const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
export const SCHOOL_ORG_ID = process.env.SCHOOL_ORG_ID;

type HasParams = { role?: ClerkOrgRole; permission?: OrgPermission };
type HasFn = (params: HasParams) => boolean;

export class AuthError extends Error {
    constructor(
        message: string,
        public status: 401 | 403 | 404,
    ) {
        super(message);
        this.name = "AuthError";
    }
}

type GuardOptions = {
    fresh?: boolean;
    requireOrg?: boolean;
};

export type AuthContext = {
    userId: string;
    orgId: string | null;
    role: Role | null;
    orgRole: ClerkOrgRole | null;
    has: HasFn;
};

function createHas(orgRole: ClerkOrgRole | null): HasFn {
    return ({ role, permission }) => {
        if (!orgRole) return false;
        if (role) return roleMatches(orgRole, role);
        if (permission) return canRoleAccessPermission(orgRole, permission);
        return false;
    };
}

export async function addToSchoolOrg(userId: string, role: SelfAssignableRole) {
    if (!SCHOOL_ORG_ID) {
        throw new Error("SCHOOL_ORG_ID is not configured");
    }

    const desiredRole = toClerkOrgRole(role);
    const memberships = await clerk.organizations.getOrganizationMembershipList({
        organizationId: SCHOOL_ORG_ID,
        userId: [userId],
        limit: 1,
    });
    const existingMembership = memberships.data[0];

    if (!existingMembership) {
        return clerk.organizations.createOrganizationMembership({
            organizationId: SCHOOL_ORG_ID,
            userId,
            role: desiredRole,
        });
    }

    if (existingMembership.role !== desiredRole) {
        return clerk.organizations.updateOrganizationMembership({
            organizationId: SCHOOL_ORG_ID,
            userId,
            role: desiredRole,
        });
    }

    return existingMembership;
}

async function getFreshOrgRole(orgId: string, userId: string): Promise<ClerkOrgRole | null> {
    'use cache';
    const memberships = await clerk.organizations.getOrganizationMembershipList({
        organizationId: orgId,
        userId: [userId],
        limit: 1,
    });
    return (memberships.data[0]?.role as ClerkOrgRole | undefined) ?? null;
}
async function resolveContext(opts: GuardOptions = {}): Promise<AuthContext> {
    const { userId, orgId: activeOrgId, orgRole: tokenOrgRole } = await auth();
    if (!userId) throw new AuthError("UNAUTHENTICATED", 401);

    const orgId = activeOrgId ?? null;
    if (opts.requireOrg && !orgId) throw new AuthError("NO_ACTIVE_ORG", 403);

    const orgRole = opts.fresh && orgId
        ? await getFreshOrgRole(orgId, userId)
        : ((tokenOrgRole as ClerkOrgRole | null | undefined) ?? null);

    return {
        userId,
        orgId,
        role: appRoleFromClerkRole(orgRole),
        orgRole,
        has: createHas(orgRole),
    };
}

export async function requireOrgContext(opts: GuardOptions = {}): Promise<AuthContext> {
    const ctx = await resolveContext({ requireOrg: true, ...opts });
    if (!ctx.orgId) throw new AuthError("NO_ACTIVE_ORG", 403);
    return ctx;
}

export async function requirePermission(
    permission: OrgPermission,
    opts: GuardOptions = {},
): Promise<AuthContext> {
    const ctx = await requireOrgContext(opts);
    if (!ctx.has({ permission })) throw new AuthError("FORBIDDEN", 403);
    return ctx;
}

/** For existing app code: role checks backed by Clerk organization roles. */
export async function requireRole(
    allowed: readonly Role[],
    opts: GuardOptions = {},
): Promise<AuthContext> {
    const ctx = await requireOrgContext(opts);
    if (!ctx.role || !allowed.includes(ctx.role)) {
        throw new AuthError("FORBIDDEN", 403);
    }
    return ctx;
}

export async function requirePageRole(
    allowed: readonly Role[],
    opts: GuardOptions = {},
): Promise<AuthContext> {
    try {
        return await requireRole(allowed, opts);
    } catch (error) {
        if (error instanceof AuthError) {
            if (error.status === 401) redirect("/sign-in");
            if (error.message === "NO_ACTIVE_ORG") redirect("/select-org");
            redirect("/unauthorized");
        }
        throw error;
    }
}

export async function requirePagePermission(
    permission: OrgPermission,
    opts: GuardOptions = {},
): Promise<AuthContext> {
    try {
        return await requirePermission(permission, opts);
    } catch (error) {
        if (error instanceof AuthError) {
            if (error.status === 401) redirect("/sign-in");
            if (error.message === "NO_ACTIVE_ORG") redirect("/select-org");
            redirect("/unauthorized");
        }
        throw error;
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
        throw new AuthError("FORBIDDEN", 403);
    }
    return memberships.data[0];
}

export async function updateOrganizationMemberRole(
    orgId: string,
    targetUserId: string,
    role: Role,
) {
    await assertUserInOrg(orgId, targetUserId);
    return clerk.organizations.updateOrganizationMembership({
        organizationId: orgId,
        userId: targetUserId,
        role: toClerkOrgRole(role),
    });
}

export async function requireCourseAccess(courseId: string, mode: "read" | "manage") {
    const ctx = await requireOrgContext();
    await connectToDatabase();

    const course = await Course.findOne({ _id: courseId, orgId: ctx.orgId }).lean();
    if (!course) throw new AuthError("NOT_FOUND", 404);

    if (ctx.has({ role: "org:admin" })) return { ...ctx, course };

    const teacherAssignment = await Enrollment.exists({
        orgId: ctx.orgId,
        userId: ctx.userId,
        courseId: course._id,
        role: "teacher",
        status: "approved",
    });

    if (mode === "manage") {
        if (!ctx.has({ permission: ORG_PERMISSIONS.courseManage })) {
            throw new AuthError("FORBIDDEN", 403);
        }
        if (course.createdBy !== ctx.userId && !teacherAssignment) {
            throw new AuthError("FORBIDDEN", 403);
        }
        return { ...ctx, course };
    }

    if (course.createdBy === ctx.userId || teacherAssignment) {
        return { ...ctx, course };
    }

    const enrolled = await Enrollment.exists({
        orgId: ctx.orgId,
        userId: ctx.userId,
        courseId: course._id,
        role: "student",
        status: "approved",
    });

    if (!enrolled) throw new AuthError("FORBIDDEN", 403);
    return { ...ctx, course };
}
