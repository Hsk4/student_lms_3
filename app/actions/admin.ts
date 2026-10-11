"use server";

import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { Enrollment } from "@/app/models/Enrollment";
import { Assignment } from "@/app/models/Assignment";
import { MockPaper } from "@/app/models/MockPaper";
import { revalidatePath } from "next/cache";
import { createClerkClient } from "@clerk/nextjs/server";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// 1. Assign User (Teacher or Student) to Course
export async function assignUserToCourse(data: {
  userId: string;
  courseId: string;
  role: "teacher" | "student";
}) {
  const { userId, has } = await auth();
  if (!userId || !has({ role: "org:admin" })) {
    throw new Error("Forbidden: Admin privileges required.");
  }

  await connectToDatabase();
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
  const { userId, orgId } = await auth();
  if (!userId || !orgId) throw new Error("Unauthorized");

  await connectToDatabase();
  const assignment = await Assignment.create({
    ...data,
    createdBy: userId,
    orgId,
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
  const { userId, orgId, has } = await auth();
  if (!userId || !orgId || !has({ role: "org:admin" })) {
    throw new Error("Forbidden: Admin privileges required.");
  }

  await connectToDatabase();
  const mock = await MockPaper.create({
    ...data,
    createdBy: userId,
    orgId,
  });

  revalidatePath("/dashboard/mock-papers");
  return { success: true, mockId: mock._id.toString() };
}

// 4. Toggle User Activation Status
export async function toggleUserStatus(targetUserId: string, currentStatus: string) {
  const { userId, has } = await auth();
  if (!userId || !has({ role: "org:admin" })) {
    throw new Error("Forbidden: Admin privileges required.");
  }

  const newStatus = currentStatus === "deactivated" ? "active" : "deactivated";

  await clerkClient.users.updateUser(targetUserId, {
    publicMetadata: { status: newStatus },
  });

  revalidatePath("/admin/users");
  return { success: true, newStatus };
}

// 5. Change User Role
export async function updateUserRole(targetUserId: string, newRole: "teacher" | "student" | "admin") {
    const { userId, has, orgId } = await auth();
    if (!userId || !orgId || !has({ role: "org:admin" })) {
        throw new Error("Forbidden: Admin privileges required.");
    }

    // Update Clerk Metadata (for UI/Middleware convenience)
    await clerkClient.users.updateUser(targetUserId, {
        publicMetadata: { role: newRole },
    });

    // If it's a B2B role change within the organization, we might need to use memberships API
    // but for simplicity we are using publicMetadata as a source of truth for app logic
    // and Clerk B2B roles for the /admin route protection.

    revalidatePath("/admin/users");
    return { success: true };
}