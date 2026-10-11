"use server";

import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { Enrollment } from "@/app/models/Enrollment";
import { Assignment } from "@/app/models/Assignment";
import { MockPaper } from "@/app/models/MockPaper";
import { Submission } from "@/app/models/Submission";
import { revalidatePath } from "next/cache";

// 1. Get Courses Enrolled by Current Student
export async function getStudentEnrolledCourses() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const enrollments = await Enrollment.find({ userId, status: "approved" })
    .populate("courseId")
    .lean();

  return JSON.parse(JSON.stringify(enrollments));
}

// 2. Submit Assignment Solution
export async function submitAssignment(data: {
  assignmentId: string;
  codeSnippet: string;
  notes?: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await connectToDatabase();
  const submission = await Submission.create({
    assignmentId: data.assignmentId,
    studentId: userId,
    codeSnippet: data.codeSnippet,
    notes: data.notes,
    status: "submitted",
  });

  revalidatePath("/dashboard/assignments");
  return { success: true, submissionId: submission._id.toString() };
}

// 3. Fetch Mock Papers for Board / Level
export async function getMockPapers(board: string, levelOrGrade: string) {
  await connectToDatabase();
  const mocks = await MockPaper.find({ board, levelOrGrade }).sort({ year: -1 }).lean();
  return JSON.parse(JSON.stringify(mocks));
}