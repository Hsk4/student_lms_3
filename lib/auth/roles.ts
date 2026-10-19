// Pure helpers – safe to import from proxy, server, and client code.

export const ROLES = ["admin", "teacher", "student"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ["pending", "active", "rejected", "suspended"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const PERMISSIONS = {
    userManage: "user:manage",
    courseCreate: "course:create",
    courseManage: "course:manage",
    courseView: "course:view",
    gradeWrite: "grade:write",
    billingManage: "billing:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const PERMISSIONS_BY_ROLE: Record<Role, readonly Permission[]> = {
    admin: [
        PERMISSIONS.userManage,
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
};

export function isRole(value: unknown): value is Role {
    return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function isUserStatus(value: unknown): value is UserStatus {
    return typeof value === "string" && (USER_STATUSES as readonly string[]).includes(value);
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
        case "admin":
            return "/admin";
        case "teacher":
            return "/teacher";
        case "student":
            return "/student";
        default:
            return "/auth/pending";
    }
}
