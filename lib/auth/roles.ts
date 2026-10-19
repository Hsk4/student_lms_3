 // Pure helpers – safe to import from proxy, server, and client code.

export const ROLES = ["super_admin", "admin", "teacher", "student", "parent"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ["pending", "active", "rejected", "suspended"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const PERMISSIONS = {
    userManage: "user:manage",
    adminManage: "admin:manage",
    auditView: "audit:view",
    courseCreate: "course:create",
    courseManage: "course:manage",
    courseView: "course:view",
    gradeWrite: "grade:write",
    billingManage: "billing:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Parent permissions are added with their dashboard in Phase 7. */
const PERMISSIONS_BY_ROLE: Record<Role, readonly Permission[]> = {
    super_admin: [
        PERMISSIONS.userManage,
        PERMISSIONS.adminManage,
        PERMISSIONS.auditView,
        PERMISSIONS.courseCreate,
        PERMISSIONS.courseManage,
        PERMISSIONS.courseView,
        PERMISSIONS.gradeWrite,
        PERMISSIONS.billingManage,
    ],
    admin: [
        PERMISSIONS.userManage,
        PERMISSIONS.auditView,
        PERMISSIONS.courseCreate,
        PERMISSIONS.courseManage,
        PERMISSIONS.courseView,
        PERMISSIONS.gradeWrite,
        PERMISSIONS.billingManage,
    ],
    teacher: [
        PERMISSIONS.courseCreate,
        PERMISSIONS.courseManage,
        PERMISSIONS.courseView,
        PERMISSIONS.gradeWrite,
    ],
    student: [PERMISSIONS.courseView],
    parent: [],
};

/** Roles an admin (or super admin) may assign through approval. */
export const ASSIGNABLE_ROLES = ["teacher", "student", "parent"] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export function isRole(value: unknown): value is Role {
    return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function isUserStatus(value: unknown): value is UserStatus {
    return typeof value === "string" && (USER_STATUSES as readonly string[]).includes(value);
}

export function isAssignableRole(value: unknown): value is AssignableRole {
    return (
        typeof value === "string" &&
        (ASSIGNABLE_ROLES as readonly string[]).includes(value)
    );
}

/** Both admin tiers can open the admin area; super admin has extra powers. */
export function isAdminRole(role: Role | null | undefined): boolean {
    return role === "admin" || role === "super_admin";
}

export function permissionsForRole(role: Role | null | undefined): readonly Permission[] {
    return role ? PERMISSIONS_BY_ROLE[role] : [];
}

export function canRoleAccessPermission(
    role: Role | null | undefined,
    permission: Permission,
): boolean {
    if (!role) return false;
    return permissionsForRole(role).includes(permission);
}

export function roleMatches(currentRole: Role | null | undefined, expectedRole: Role): boolean {
    return currentRole === expectedRole;
}

export function homePathForRole(role?: Role | null): string {
    switch (role) {
        case "super_admin":
        case "admin":
            return "/admin";
        case "teacher":
            return "/teacher";
        case "student":
            return "/student";
        case "parent":
            return "/parent";
        default:
            return "/pending";
    }
}
