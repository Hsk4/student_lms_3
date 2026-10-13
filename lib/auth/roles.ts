// Pure helpers – safe to import from proxy, server, and client code.

export const ROLES = ["admin", "teacher", "student"] as const;
export type Role = (typeof ROLES)[number];
export const SELF_ASSIGNABLE_ROLES = ["teacher", "student"] as const;
export type SelfAssignableRole = (typeof SELF_ASSIGNABLE_ROLES)[number];

export const CLERK_ORG_ROLES = ["org:admin", "org:teacher", "org:student"] as const;
export type ClerkOrgRole = (typeof CLERK_ORG_ROLES)[number];

export const ORG_PERMISSIONS = {
    courseCreate: "org:course:create",
    courseManage: "org:course:manage",
    courseView: "org:course:view",
    gradeWrite: "org:grade:write",
    memberManage: "org:member:manage",
    billingManage: "org:billing:manage",
} as const;

export type OrgPermission = (typeof ORG_PERMISSIONS)[keyof typeof ORG_PERMISSIONS];

const ROLE_TO_CLERK_ROLE: Record<Role, ClerkOrgRole> = {
    admin: "org:admin",
    teacher: "org:teacher",
    student: "org:student",
};

const CLERK_ROLE_TO_ROLE: Record<ClerkOrgRole, Role> = {
    "org:admin": "admin",
    "org:teacher": "teacher",
    "org:student": "student",
};

const PERMISSIONS_BY_ROLE: Record<Role, readonly OrgPermission[]> = {
    admin: [
        ORG_PERMISSIONS.courseCreate,
        ORG_PERMISSIONS.courseManage,
        ORG_PERMISSIONS.courseView,
        ORG_PERMISSIONS.gradeWrite,
        ORG_PERMISSIONS.memberManage,
        ORG_PERMISSIONS.billingManage,
    ],
    teacher: [
        ORG_PERMISSIONS.courseCreate,
        ORG_PERMISSIONS.courseManage,
        ORG_PERMISSIONS.courseView,
        ORG_PERMISSIONS.gradeWrite,
    ],
    student: [ORG_PERMISSIONS.courseView],
};

export function isRole(value: unknown): value is Role {
    return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function isSelfAssignableRole(value: unknown): value is SelfAssignableRole {
    return typeof value === "string" && (SELF_ASSIGNABLE_ROLES as readonly string[]).includes(value);
}

export function isClerkOrgRole(value: unknown): value is ClerkOrgRole {
    return typeof value === "string" && (CLERK_ORG_ROLES as readonly string[]).includes(value);
}

export function toClerkOrgRole(role: Role): ClerkOrgRole {
    return ROLE_TO_CLERK_ROLE[role];
}

export function appRoleFromClerkRole(role: unknown): Role | null {
    if (!isClerkOrgRole(role)) return null;
    return CLERK_ROLE_TO_ROLE[role];
}

export function permissionsForRole(role: Role | null | undefined): readonly OrgPermission[] {
    return role ? PERMISSIONS_BY_ROLE[role] : [];
}

export function canRoleAccessPermission(
    role: ClerkOrgRole | Role | null | undefined,
    permission: OrgPermission,
): boolean {
    const appRole = isRole(role) ? role : appRoleFromClerkRole(role);
    if (!appRole) return false;
    return permissionsForRole(appRole).includes(permission);
}

export function roleMatches(
    currentRole: ClerkOrgRole | Role | null | undefined,
    expectedRole: ClerkOrgRole | Role,
): boolean {
    const normalizedCurrent = isRole(currentRole)
        ? toClerkOrgRole(currentRole)
        : currentRole;
    const normalizedExpected = isRole(expectedRole)
        ? toClerkOrgRole(expectedRole)
        : expectedRole;
    return normalizedCurrent === normalizedExpected;
}

export function homePathForRole(role?: Role | null): string {
    switch (role) {
        case "admin":
            return "/admin";
        case "teacher":
            return "/teacher";
        case "student":
            return "/student";
        default:
            return "/select-org";
    }
}
