"use server";

import { connectToDatabase } from "@/lib/db";
import { Enrollment } from "@/app/models/Enrollment";
import { Assignment } from "@/app/models/Assignment";
import { MockPaper } from "@/app/models/MockPaper";
import { Course } from "@/app/models/course";
import { revalidatePath } from "next/cache";
import {
  AuthError,
  assertUserInOrg,
  clerk,
  requireCourseAccess,
  requirePermission,
  updateOrganizationMemberRole,
} from "@/lib/auth/guards";
import { ORG_PERMISSIONS, roleMatches, toClerkOrgRole } from "@/lib/auth/roles";

type ActionResult<T> = { success: true; data?: T } | { success: false; error: string };

// 1. Assign User (Teacher or Student) to Course
export async function assignUserToCourse(data: {
  userId: string;
  courseId: string;
  role: "teacher" | "student";
}): Promise<ActionResult<string>> {
  try {
    const { userId, orgId } = await requirePermission(ORG_PERMISSIONS.memberManage, {
      fresh: true,
      requireOrg: true,
    });

    const membership = await assertUserInOrg(orgId!, data.userId);

    if (!roleMatches(membership.role as never, toClerkOrgRole(data.role))) {
      throw new AuthError("User role does not match requested course role", 403);
    }

    const target = await clerk.users.getUser(data.userId);
    if (target.banned) {
      throw new AuthError("Target user is banned", 403);
    }

    await connectToDatabase();
    if (!(await Course.exists({ _id: data.courseId, orgId }))) {
      throw new AuthError("Course not found", 404);
    }

    const enrollment = await Enrollment.findOneAndUpdate(
      { orgId, userId: data.userId, courseId: data.courseId },
      { ...data, orgId, assignedBy: userId, status: "approved" },
      { upsert: true, new: true }
    );

    revalidatePath("/admin/users");
    revalidatePath("/teacher");
    revalidatePath("/student");
    return { success: true, data: enrollment._id.toString() };
  } catch (error) {
    const message = error instanceof AuthError 
      ? error.message 
      : error instanceof Error 
      ? error.message 
      : "Failed to assign user to course";
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
    const { userId, orgId } = await requirePermission(ORG_PERMISSIONS.courseManage, {
      fresh: true,
      requireOrg: true,
    });

    await connectToDatabase();
    await requireCourseAccess(data.courseId, "manage");

    const assignment = await Assignment.create({
      ...data,
      createdBy: userId,
      orgId: orgId!,
    });

    revalidatePath("/dashboard/assignments");
    return { success: true, data: assignment._id.toString() };
  } catch (error) {
    const message = error instanceof AuthError 
      ? error.message 
      : error instanceof Error 
      ? error.message 
      : "Failed to create assignment";
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
    const { userId, orgId } = await requirePermission(ORG_PERMISSIONS.courseManage, {
      fresh: true,
      requireOrg: true,
    });

    await connectToDatabase();
    const mock = await MockPaper.create({
      ...data,
      createdBy: userId,
      orgId: orgId!,
    });

    revalidatePath("/dashboard/mock-papers");
    return { success: true, data: mock._id.toString() };
  } catch (error) {
    const message = error instanceof AuthError 
      ? error.message 
      : error instanceof Error 
      ? error.message 
      : "Failed to create mock paper";
    console.error("createMockPaper error:", message);
    return { success: false, error: message };
  }
}

// Shared checks for admin actions that modify another user.
async function requireManageableTarget(targetUserId: string) {
  const ctx = await requirePermission(ORG_PERMISSIONS.memberManage, {
    fresh: true,
    requireOrg: true,
  });

  if (targetUserId === ctx.userId) {
    throw new AuthError("You cannot modify your own account", 403);
  }

  const membership = await assertUserInOrg(ctx.orgId!, targetUserId);
  const target = await clerk.users.getUser(targetUserId);

  if (membership.role === "org:admin") {
    throw new AuthError("Admin accounts cannot be modified here", 403);
  }

  return { ctx, target, membership };
}

// 4. Assign Role to Pending User (from accounts panel)
export async function assignRoleToUser(
  targetUserId: string,
  role: "student" | "teacher"
): Promise<ActionResult<string>> {
  try {
    const { ctx, target } = await requireManageableTarget(targetUserId);

    await clerk.users.updateUserMetadata(target.id, {
      publicMetadata: {
        role: role,
        status: "active",
      },
    });

    await clerk.organizations.updateOrganizationMembership({
      organizationId: ctx.orgId!,
      userId: target.id,
      role: toClerkOrgRole(role),
    });

    revalidatePath("/admin/accounts");
    return { success: true, data: role };
  } catch (error) {
    const message = error instanceof AuthError 
      ? error.message 
      : error instanceof Error 
      ? error.message 
      : "Failed to assign role";
    console.error("assignRoleToUser error:", message);
    return { success: false, error: message };
  }
}

// 5. Approve User (mark as active from pending)
export async function approveUser(targetUserId: string): Promise<ActionResult<null>> {
  try {
    const { target } = await requireManageableTarget(targetUserId);

    if (target.banned) {
      await clerk.users.unbanUser(target.id);
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    const message = error instanceof AuthError 
      ? error.message 
      : error instanceof Error 
      ? error.message 
      : "Failed to approve user";
    console.error("approveUser error:", message);
    return { success: false, error: message };
  }
}

// 6. Toggle User Activation Status
export async function toggleUserStatus(targetUserId: string): Promise<ActionResult<string>> {
  try {
    const { target } = await requireManageableTarget(targetUserId);

    if (target.banned) {
      await clerk.users.unbanUser(target.id);
    } else {
      await clerk.users.banUser(target.id);
    }

    const newStatus = target.banned ? "active" : "deactivated";
    revalidatePath("/admin/users");
    return { success: true, data: newStatus };
  } catch (error) {
    const message = error instanceof AuthError 
      ? error.message 
      : error instanceof Error 
      ? error.message 
      : "Failed to toggle user status";
    console.error("toggleUserStatus error:", message);
    return { success: false, error: message };
  }
}

// 7. Change User Role (teacher <-> student only; admins are granted out-of-band)
export async function updateUserRole(
  targetUserId: string,
  newRole: "teacher" | "student"
): Promise<ActionResult<null>> {
  try {
    const { ctx, target } = await requireManageableTarget(targetUserId);
    await updateOrganizationMemberRole(ctx.orgId!, target.id, newRole);

    await connectToDatabase();
    await Enrollment.deleteMany({ orgId: ctx.orgId, userId: target.id });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    const message = error instanceof AuthError 
      ? error.message 
      : error instanceof Error 
      ? error.message 
      : "Failed to update user role";
    console.error("updateUserRole error:", message);
    return { success: false, error: message };
  }
}
