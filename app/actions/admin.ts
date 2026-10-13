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

// 1. Assign User (Teacher or Student) to Course
export async function assignUserToCourse(data: {
  userId: string;
  courseId: string;
  role: "teacher" | "student";
}) {
  const { userId, orgId } = await requirePermission(ORG_PERMISSIONS.memberManage, {
    fresh: true,
    requireOrg: true,
  });
  const membership = await assertUserInOrg(orgId!, data.userId);

  if (!roleMatches(membership.role as never, toClerkOrgRole(data.role))) {
    throw new AuthError("FORBIDDEN", 403);
  }

  const target = await clerk.users.getUser(data.userId);
  if (target.banned) throw new AuthError("FORBIDDEN", 403);

  await connectToDatabase();
  if (!(await Course.exists({ _id: data.courseId, orgId }))) {
    throw new AuthError("NOT_FOUND", 404);
  }

  const enrollment = await Enrollment.findOneAndUpdate(
    { orgId, userId: data.userId, courseId: data.courseId },
    { ...data, orgId, assignedBy: userId, status: "approved" },
    { upsert: true, new: true }
  );

  revalidatePath("/admin/users");
  return { success: true, enrollmentId: enrollment._id.toString() };
}

// 2. Create Assignment (Admin & Teachers)
export async function createAssignment(data: {
  title: string;
  description: string;
  courseId: string;
  subject: string;
  dueDate: Date;
  starterSnippetId?: string;
}) {
  const { userId, orgId } = await requirePermission(ORG_PERMISSIONS.courseManage, {
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
  return { success: true, assignmentId: assignment._id.toString() };
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
}) {
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
  return { success: true, mockId: mock._id.toString() };
}

// Shared checks for admin actions that modify another user.
async function requireManageableTarget(targetUserId: string) {
  const ctx = await requirePermission(ORG_PERMISSIONS.memberManage, {
    fresh: true,
    requireOrg: true,
  });
  if (targetUserId === ctx.userId) {
    throw new AuthError("Forbidden: you cannot modify your own account.", 403);
  }
  const membership = await assertUserInOrg(ctx.orgId!, targetUserId);

  const target = await clerk.users.getUser(targetUserId);
  if (membership.role === "org:admin") {
    throw new AuthError("Forbidden: admin accounts can't be modified here.", 403);
  }
  return { ctx, target, membership };
}

// 4. Assign Role to Pending User (from accounts panel)
export async function assignRoleToUser(targetUserId: string, role: "student" | "teacher") {
  const { ctx, target, membership } = await requireManageableTarget(targetUserId);

  // Update user's public metadata with the assigned role
  await clerk.users.updateUserMetadata(target.id, {
    publicMetadata: {
      role: role,
      status: "active",
    },
  });

  // Update Clerk organization membership role
  await clerk.organizations.updateOrganizationMembership({
    organizationId: ctx.orgId!,
    userId: target.id,
    role: toClerkOrgRole(role),
  });

  revalidatePath("/admin/accounts");
  return { success: true, role };
}

// 5. Approve User (mark as active from pending)
export async function approveUser(targetUserId: string) {
  const { target } = await requireManageableTarget(targetUserId);

  if (target.banned) {
    await clerk.users.unbanUser(target.id);
  }

  revalidatePath("/admin/users");
  return { success: true, status: "active" };
}

// 5. Toggle User Activation Status
export async function toggleUserStatus(targetUserId: string) {
  const { target } = await requireManageableTarget(targetUserId);

  const newStatus = target.banned ? "active" : "deactivated";
  if (target.banned) await clerk.users.unbanUser(target.id);
  else await clerk.users.banUser(target.id);

  revalidatePath("/admin/users");
  return { success: true, newStatus };
}

// 6. Change User Role (teacher <-> student only; admins are granted out-of-band)
export async function updateUserRole(targetUserId: string, newRole: "teacher" | "student") {
  const { ctx, target } = await requireManageableTarget(targetUserId);
  await updateOrganizationMemberRole(ctx.orgId!, target.id, newRole);

  // Old per-course teacher/student enrollments no longer match the new role.
  await connectToDatabase();
  await Enrollment.deleteMany({ orgId: ctx.orgId, userId: target.id });

  revalidatePath("/admin/users");
  return { success: true };
}
