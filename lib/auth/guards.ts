import { auth, createClerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { connectToDatabase } from "@/lib/db";
import { Course } from "@/app/models/course";
import { Enrollment } from "@/app/models/Enrollment";
import {
  canRoleAccessPermission,
  isRole,
  isUserStatus,
  type Permission,
  type Role,
  type UserStatus,
} from "@/lib/auth/roles";

export const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

type HasParams = { role?: Role; permission?: Permission };
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
  /** Read role/status from the Clerk user record instead of the session token. */
  fresh?: boolean;
};

export type AuthContext = {
  userId: string;
  role: Role | null;
  status: UserStatus | null;
  has: HasFn;
};

function createHas(role: Role | null): HasFn {
  return ({ role: wantedRole, permission }) => {
    if (!role) return false;
    if (wantedRole) return role === wantedRole;
    if (permission) return canRoleAccessPermission(role, permission);
    return false;
  };
}

type SessionMetadata = { role?: unknown; status?: unknown };

function readMetadata(input: unknown): {
  role: Role | null;
  status: UserStatus | null;
} {
  const meta = (input ?? {}) as SessionMetadata;
  return {
    role: isRole(meta.role) ? meta.role : null,
    status: isUserStatus(meta.status) ? meta.status : null,
  };
}

async function getFreshMetadata(userId: string) {
  try {
    const user = await clerk.users.getUser(userId);
    return readMetadata(user.publicMetadata);
  } catch (error) {
    console.error("Error fetching fresh user metadata:", error);
    return { role: null, status: null };
  }
}

async function resolveContext(opts: GuardOptions = {}): Promise<AuthContext> {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new AuthError("UNAUTHENTICATED", 401);

  const { role, status } = opts.fresh
    ? await getFreshMetadata(userId)
    : readMetadata(sessionClaims?.metadata);

  return { userId, role, status, has: createHas(role) };
}

export async function requireUser(
  opts: GuardOptions = {},
): Promise<AuthContext> {
  const ctx = await resolveContext(opts);
  if (ctx.status !== "active") throw new AuthError("ACCOUNT_NOT_ACTIVE", 403);
  return ctx;
}

export async function requirePermission(
  permission: Permission,
  opts: GuardOptions = {},
): Promise<AuthContext> {
  const ctx = await resolveContext(opts);
  if (ctx.status !== "active" || !ctx.has({ permission })) {
    throw new AuthError("FORBIDDEN", 403);
  }
  return ctx;
}

export async function requireRole(
  allowed: readonly Role[],
  opts: GuardOptions = {},
): Promise<AuthContext> {
  const ctx = await resolveContext(opts);
  if (ctx.status !== "active" || !ctx.role || !allowed.includes(ctx.role)) {
    throw new AuthError("FORBIDDEN", 403);
  }
  return ctx;
}

function redirectForAuthError(error: AuthError): never {
  if (error.status === 401) redirect("/sign-in");
  if (error.message === "ACCOUNT_NOT_ACTIVE") redirect("/auth/pending");
  redirect("/unauthorized");
}

function redirectWithStatus(message: string): never {
  if (message === "rejected") redirect("/rejected");
  if (message === "suspended") redirect("/?error=account_suspended");
  redirect("/auth/pending");
}

export async function requirePageRole(
  allowed: readonly Role[],
  opts: GuardOptions = {},
): Promise<AuthContext> {
  try {
    return await requireRole(allowed, opts);
  } catch (error) {
    if (error instanceof AuthError) {
      redirectForAuthError(error);
    }
    throw error;
  }
}

export async function requirePagePermission(
  permission: Permission,
  opts: GuardOptions = {},
): Promise<AuthContext> {
  try {
    return await requirePermission(permission, opts);
  } catch (error) {
    if (error instanceof AuthError) {
      redirectForAuthError(error);
    }
    throw error;
  }
}

/** Page variant of {@link requireUser} that also routes non-active accounts. */
export async function requireActiveUserPage(
  opts: GuardOptions = {},
): Promise<AuthContext> {
  const ctx = await resolveContext(opts);
  if (ctx.status !== "active") {
    redirectWithStatus(ctx.status ?? "pending");
  }
  return ctx;
}

/**
 * Row-level access to a course. Admin can read/manage any course; teachers can
 * manage courses they own or are assigned to; students can read courses they
 * are enrolled in.
 */
export async function requireCourseAccess(
  courseId: string,
  mode: "read" | "manage",
) {
  const ctx = await requireUser();
  await connectToDatabase();

  const course = await Course.findOne({ _id: courseId }).lean();
  if (!course) throw new AuthError("NOT_FOUND", 404);

  if (ctx.role === "admin") return { ...ctx, course };

  const teacherAssignment = await Enrollment.exists({
    userId: ctx.userId,
    courseId: course._id,
    role: "teacher",
    status: "approved",
  });

  if (mode === "manage") {
      if (!ctx.has({ permission: "course:manage" })) {
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
    userId: ctx.userId,
    courseId: course._id,
    role: "student",
    status: "approved",
  });

  if (!enrolled) throw new AuthError("FORBIDDEN", 403);
  return { ...ctx, course };
}
