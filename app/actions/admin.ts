"use server";

import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { Enrollment } from "@/models/Enrollment";
import { Assignment } from "@/models/Assignment";
import { MockPaper } from "@/models/MockPaper";
import { revalidatePath } from "next/cache";

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