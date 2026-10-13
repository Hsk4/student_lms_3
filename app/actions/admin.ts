"use server";

import { connectToDatabase } from "@/lib/db";
import { Enrollment } from "@/app/models/Enrollment";
import { Assignment } from "@/app/models/Assignment";
import { MockPaper } from "@/app/models/MockPaper";
import { Course } from "@/app/models/course";
import { revalidatePath } from "next/cache";
import { AuthError, assertUserInOrg, clerk, requireRole } from "@/lib/auth/guards";
import { isSelfAssignableRole } from "@/lib/auth/roles";

// 1. Assign User (Teacher or Student) to Course
export async function assignUserToCourse(data: {
  userId: string;
  courseId: string;
  role: "teacher" | "student";
}) {
  const { userId, orgId } = await requireRole(["admin"], { fresh: true, requireOrg: true });
  if (!isSelfAssignableRole(data.role)) throw new AuthError("Invalid role", 403);
  await assertUserInOrg(orgId!, data.userId);

  // The enrollment role must match the user's real role, otherwise a student
  // could be enrolled as a "teacher" and pass teacher-of-course checks.
  const target = await clerk.users.getUser(data.userId);
  const meta = target.publicMetadata as { role?: string; status?: string };
  if (meta.role !== data.role) throw new AuthError("User's role does not match", 403);
  if (meta.status === "pending" || meta.status === "deactivated") {
    throw new AuthError("User is not active", 403);
  }

  await connectToDatabase();
  if (!(await Course.exists({ _id: data.courseId, orgId }))) {
    throw new AuthError("Course not found in your organization", 403);
  }

  const enrollment = await Enrollment.findOneAndUpdate(
    { userId: data.userId, courseId: data.courseId },
    { ...data, assignedBy: userId, status: "approved" },
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
  const { userId, orgId, role } = await requireRole(["teacher", "admin"], { requireOrg: true });

  await connectToDatabase();

  // The course must belong to this org...
  const course = await Course.findOne({ _id: data.courseId, orgId }).lean();
  if (!course) throw new AuthError("Course not found in your organization", 403);

  // ...and a teacher must be assigned to it.
  if (role === "teacher") {
    const assigned = await Enrollment.exists({
      userId,
      courseId: data.courseId,
      role: "teacher",
      status: "approved",
    });
    if (!assigned) throw new AuthError("You are not assigned to this course", 403);
  }

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
  const { userId, orgId } = await requireRole(["admin"], { fresh: true, requireOrg: true });

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
  const ctx = await requireRole(["admin"], { fresh: true, requireOrg: true });
  if (targetUserId === ctx.userId) {
    throw new AuthError("Forbidden: you cannot modify your own account.", 403);
  }
  await assertUserInOrg(ctx.orgId!, targetUserId);

  const target = await clerk.users.getUser(targetUserId);
  const meta = target.publicMetadata as { role?: string; status?: string };
  if (meta.role === "admin") {
    throw new AuthError("Forbidden: admin accounts can't be modified here.", 403);
  }
  return { ctx, target, meta };
}

// 4. Toggle User Activation Status
export async function toggleUserStatus(targetUserId: string) {
  const { target, meta } = await requireManageableTarget(targetUserId);

  const newStatus = meta.status === "deactivated" ? "active" : "deactivated";

  // Metadata drives the UI/middleware; the ban is the real enforcement:
  // Clerk revokes sessions and blocks sign-in for banned users.
  await clerk.users.updateUserMetadata(target.id, { publicMetadata: { status: newStatus } });
  if (newStatus === "deactivated") await clerk.users.banUser(target.id);
  else await clerk.users.unbanUser(target.id);

  revalidatePath("/admin/users");
  return { success: true, newStatus };
}

// 4b. Approve a self-registered teacher (status: pending -> active)
export async function approveUser(targetUserId: string) {
  const { target, meta } = await requireManageableTarget(targetUserId);
  if (meta.status !== "pending") throw new AuthError("User is not awaiting approval", 403);

  await clerk.users.updateUserMetadata(target.id, { publicMetadata: { status: "active" } });

  revalidatePath("/admin/users");
  return { success: true };
}

// 5. Change User Role (teacher <-> student only; admins are granted out-of-band)
export async function updateUserRole(targetUserId: string, newRole: "teacher" | "student") {
  if (!isSelfAssignableRole(newRole)) throw new AuthError("Invalid role", 403);
  const { target } = await requireManageableTarget(targetUserId);

  await clerk.users.updateUserMetadata(target.id, { publicMetadata: { role: newRole } });

  // Old per-course teacher/student enrollments no longer match the new role.
  await connectToDatabase();
  await Enrollment.deleteMany({ userId: target.id });

  revalidatePath("/admin/users");
  return { success: true };
}
