"use server";

import { connectToDatabase } from "@/lib/db";
import { Enrollment } from "@/app/models/Enrollment";
import { Assignment } from "@/app/models/Assignment";
import { MockPaper } from "@/app/models/MockPaper";
import { Course } from "@/app/models/course";
import { AuditLog } from "@/app/models/AuditLog";
import { User } from "@/app/models/User";
import { revalidatePath } from "next/cache";
import {
  AuthError,
  clerk,
  requireCourseAccess,
  requirePermission,
  requireRole,
} from "@/lib/auth/guards";
import {
  isAssignableRole,
  isRole,
  isUserStatus,
  type AssignableRole,
  type Role,
  type UserStatus,
} from "@/lib/auth/roles";

type ActionResult<T> = { success: true; data?: T } | { success: false; error: string };

type Actor = { userId: string; role: Role };

function toMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function metadataOf(input: unknown): { role?: unknown; status?: unknown; onboarded?: unknown } {
  return (input ?? {}) as { role?: unknown; status?: unknown; onboarded?: unknown };
}

function targetEmail(user: { emailAddresses: { emailAddress: string }[]; id: string }) {
  return user.emailAddresses?.[0]?.emailAddress ?? user.id;
}

/** Append-only audit entry. Never throws into the caller's flow. */
async function writeAudit(input: {
  actor: Actor;
  action: string;
  targetId?: string;
  targetEmail?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await AuditLog.create({
      actorId: input.actor.userId,
      actorRole: input.actor.role,
      action: input.action,
      targetId: input.targetId,
      targetEmail: input.targetEmail,
      metadata: input.metadata,
    });
  } catch (error) {
    console.error("[audit] failed to write entry", input.action, error);
  }
}

/* -------------------------------------------------------------------------- */
/*  User administration (role / status)                                        */
/* -------------------------------------------------------------------------- */

/**
 * Resolves the caller as a `user:manage` holder and loads the target.
 * Rules: no self-modification; admins cannot touch other admins or super
 * admins; only a super admin can modify a super admin.
 */
async function requireManageableTarget(targetUserId: string) {
  const ctx = await requirePermission("user:manage", { fresh: true });
  if (!ctx.role) throw new AuthError("FORBIDDEN", 403);

  if (targetUserId === ctx.userId) {
    throw new AuthError("You cannot modify your own account", 403);
  }

  const target = await clerk.users.getUser(targetUserId);
  const targetMetadata = metadataOf(target.publicMetadata);
  const targetRole = isRole(targetMetadata.role) ? targetMetadata.role : null;

  const isSuper = ctx.role === "super_admin";
  if ((targetRole === "admin" || targetRole === "super_admin") && !isSuper) {
    throw new AuthError("Admin accounts cannot be modified here", 403);
  }
  if (targetRole === "super_admin") {
    throw new AuthError("The super admin account cannot be modified", 403);
  }

  return { ctx: { ...ctx, role: ctx.role }, target, targetRole, actor: { userId: ctx.userId, role: ctx.role } };
}

/** Pending → active, and assigns the role in the same write. */
export async function approveUser(
  targetUserId: string,
  role: AssignableRole
): Promise<ActionResult<null>> {
  try {
    if (!isAssignableRole(role)) {
      throw new AuthError("Invalid role", 403);
    }
    const { actor, target, targetRole } = await requireManageableTarget(targetUserId);

    await clerk.users.updateUserMetadata(target.id, {
      publicMetadata: { role, status: "active" },
    });

    await connectToDatabase();
    await User.updateOne(
      { clerkId: target.id },
      { $set: { role, status: "active" } },
      { upsert: true }
    );

    await writeAudit({
      actor,
      action: "user.approve",
      targetId: target.id,
      targetEmail: targetEmail(target),
      metadata: { previousRole: targetRole, role },
    });

    revalidatePath("/admin/requests");
    revalidatePath("/admin/accounts");
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    const message = toMessage(error, "Failed to approve user");
    console.error("approveUser error:", message);
    return { success: false, error: message };
  }
}

/** Alias used by the accounts panel. */
export async function assignRole(
  targetUserId: string,
  role: AssignableRole
): Promise<ActionResult<AssignableRole>> {
  const result = await approveUser(targetUserId, role);
  return result.success ? { success: true, data: role } : result;
}

/** Rejection is final for now (see objective §7: re-apply after 30 days is TAB). */
export async function rejectUser(
  targetUserId: string,
  reason?: string
): Promise<ActionResult<null>> {
  try {
    const { actor, target, targetRole } = await requireManageableTarget(targetUserId);

    if (!reason?.trim()) {
      throw new AuthError("A rejection reason is required", 403);
    }

    await clerk.users.updateUserMetadata(target.id, {
      publicMetadata: { status: "rejected", rejectedReason: reason.trim() },
    });

    await connectToDatabase();
    await User.updateOne(
      { clerkId: target.id },
      { $set: { status: "rejected" } },
      { upsert: true }
    );

    await writeAudit({
      actor,
      action: "user.reject",
      targetId: target.id,
      targetEmail: targetEmail(target),
      metadata: { previousRole: targetRole, reason: reason.trim() },
    });

    revalidatePath("/admin/requests");
    revalidatePath("/admin/accounts");
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    const message = toMessage(error, "Failed to reject user");
    console.error("rejectUser error:", message);
    return { success: false, error: message };
  }
}

export async function suspendUser(
  targetUserId: string,
  reason?: string
): Promise<ActionResult<null>> {
  return setUserStatus(targetUserId, "suspended", reason);
}

export async function reactivateUser(targetUserId: string): Promise<ActionResult<null>> {
  return setUserStatus(targetUserId, "active");
}

async function setUserStatus(
  targetUserId: string,
  status: Extract<UserStatus, "active" | "suspended" | "rejected">,
  reason?: string
): Promise<ActionResult<null>> {
  const action = status === "suspended" ? "user.suspend" : "user.reactivate";
  try {
    if (!isUserStatus(status)) throw new AuthError("Invalid status", 403);
    const { actor, target, targetRole } = await requireManageableTarget(targetUserId);

    await clerk.users.updateUserMetadata(target.id, {
      publicMetadata: { status },
    });

    await connectToDatabase();
    await User.updateOne(
      { clerkId: target.id },
      { $set: { status } },
      { upsert: true }
    );

    await writeAudit({
      actor,
      action,
      targetId: target.id,
      targetEmail: targetEmail(target),
      metadata: { previousRole: targetRole, status, reason: reason?.trim() || undefined },
    });

    revalidatePath("/admin/requests");
    revalidatePath("/admin/accounts");
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    const message = toMessage(error, `Failed: ${action}`);
    console.error(`${action} error:`, message);
    return { success: false, error: message };
  }
}

/** Change an active user's role between the non-admin roles. */
export async function updateUserRole(
  targetUserId: string,
  newRole: AssignableRole
): Promise<ActionResult<null>> {
  try {
    if (!isAssignableRole(newRole)) throw new AuthError("Invalid role", 403);
    const { actor, target, targetRole } = await requireManageableTarget(targetUserId);

    await clerk.users.updateUserMetadata(target.id, {
      publicMetadata: { role: newRole },
    });

    await connectToDatabase();
    await User.updateOne(
      { clerkId: target.id },
      { $set: { role: newRole } },
      { upsert: true }
    );
    await Enrollment.deleteMany({ userId: target.id });

    await writeAudit({
      actor,
      action: "user.update_role",
      targetId: target.id,
      targetEmail: targetEmail(target),
      metadata: { previousRole: targetRole, role: newRole },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    const message = toMessage(error, "Failed to update user role");
    console.error("updateUserRole error:", message);
    return { success: false, error: message };
  }
}

/* -------------------------------------------------------------------------- */
/*  Courses / assignments (existing behaviour, org-free)                       */
/* -------------------------------------------------------------------------- */

// 1. Assign User (Teacher or Student) to Course
export async function assignUserToCourse(data: {
  userId: string;
  courseId: string;
  role: "teacher" | "student";
}): Promise<ActionResult<string>> {
  try {
    const { userId } = await requirePermission("user:manage", { fresh: true });

    const target = await clerk.users.getUser(data.userId);
    if (target.banned) {
      throw new AuthError("Target user is banned", 403);
    }

    const targetRole = metadataOf(target.publicMetadata).role;
    if (!isRole(targetRole) || targetRole !== data.role) {
      throw new AuthError("User role does not match requested course role", 403);
    }

    await connectToDatabase();
    if (!(await Course.exists({ _id: data.courseId }))) {
      throw new AuthError("Course not found", 404);
    }

    const enrollment = await Enrollment.findOneAndUpdate(
      { userId: data.userId, courseId: data.courseId },
      { ...data, assignedBy: userId, status: "approved" },
      { upsert: true, new: true }
    );

    revalidatePath("/admin/users");
    revalidatePath("/teacher");
    revalidatePath("/student");
    return { success: true, data: enrollment._id.toString() };
  } catch (error) {
    const message = toMessage(error, "Failed to assign user to course");
    console.error("assignUserToCourse error:", message);
    return { success: false, error: message };
  }
}

// 2. Create Assignment (Admin & Teachers)
export async function createAssignment(data: {
  title: string;
  description: string;
  courseId: string;
  subject: string;
  dueDate: Date;
  starterSnippetId?: string;
}): Promise<ActionResult<string>> {
  try {
    const { userId } = await requireRole(["admin", "super_admin", "teacher"], { fresh: true });

    await connectToDatabase();
    await requireCourseAccess(data.courseId, "manage");

    const assignment = await Assignment.create({
      ...data,
      createdBy: userId,
    });

    revalidatePath("/student/assignments");
    return { success: true, data: assignment._id.toString() };
  } catch (error) {
    const message = toMessage(error, "Failed to create assignment");
    console.error("createAssignment error:", message);
    return { success: false, error: message };
  }
}

// 3. Publish Mock Paper (Admin Only)
export async function createMockPaper(data: {
  title: string;
  board: string;
  levelOrGrade: string;
  subject: string;
  year?: number;
  fileUrl?: string;
  solutionsUrl?: string;
}): Promise<ActionResult<string>> {
  try {
    const { userId } = await requirePermission("course:manage", { fresh: true });

    await connectToDatabase();
    const mock = await MockPaper.create({
      ...data,
      createdBy: userId,
    });

    return { success: true, data: mock._id.toString() };
  } catch (error) {
    const message = toMessage(error, "Failed to create mock paper");
    console.error("createMockPaper error:", message);
    return { success: false, error: message };
  }
}

/* -------------------------------------------------------------------------- */
/*  Backwards-compatible exports for the accounts panel                        */
/* -------------------------------------------------------------------------- */

/** @deprecated use {@link assignRole} */
export const assignRoleToUser = assignRole;

/** @deprecated use {@link suspendUser} / {@link reactivateUser} */
export async function toggleUserStatus(
  targetUserId: string
): Promise<ActionResult<UserStatus>> {
  try {
    const target = await clerk.users.getUser(targetUserId);
    const current = isUserStatus(metadataOf(target.publicMetadata).status)
      ? (metadataOf(target.publicMetadata).status as UserStatus)
      : "pending";

    const result = current === "active"
      ? await suspendUser(targetUserId)
      : await reactivateUser(targetUserId);

    return result.success
      ? { success: true, data: current === "active" ? "suspended" : "active" }
      : result;
  } catch (error) {
    const message = toMessage(error, "Failed to toggle user status");
    return { success: false, error: message };
  }
}
