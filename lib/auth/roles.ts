// Pure helpers – safe to import from middleware, server and client code.

export const ROLES = ["admin", "teacher", "student"] as const;
export type Role = (typeof ROLES)[number];

export const STATUSES = ["active", "pending", "deactivated"] as const;
export type Status = (typeof STATUSES)[number];

/**
 * Roles a user may pick for themselves at sign-up. "admin" is deliberately
 * NOT here: it can only be granted through the Clerk dashboard / backend API.
 */
export const SELF_ASSIGNABLE_ROLES = ["teacher", "student"] as const;
export type SelfAssignableRole = (typeof SELF_ASSIGNABLE_ROLES)[number];

export function isRole(value: unknown): value is Role {
    return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function isSelfAssignableRole(value: unknown): value is SelfAssignableRole {
    return (
        typeof value === "string" &&
        (SELF_ASSIGNABLE_ROLES as readonly string[]).includes(value)
    );
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
            return "/";
    }
}
