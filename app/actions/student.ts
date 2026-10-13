"use server";

import { requireRole } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db";
import { Enrollment } from "@/app/models/Enrollment";
import { Assignment } from "@/app/models/Assignment";
import { MockPaper } from "@/app/models/MockPaper";
import { Submission } from "@/app/models/Submission";
import { revalidatePath } from "next/cache";

// 1. Get Courses Enrolled by Current Student
export async function getStudentEnrolledCourses() {
  const { userId } = await requireRole(["student"]);

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
  const { userId, orgId } = await requireRole(["student"], { requireOrg: true });

  await connectToDatabase();

  // Students may only submit to assignments of courses they're enrolled in.
  const assignment = await Assignment.findOne({ _id: data.assignmentId, orgId }).lean();
  const enrolled = assignment
    ? await Enrollment.exists({ userId, courseId: assignment.courseId, status: "approved" })
    : null;
  if (!enrolled) throw new Error("Forbidden: you are not enrolled in this course.");

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

// 3. Fetch Mock Papers for Board / Level (scoped to the caller's org)
export async function getMockPapers(board: string, levelOrGrade: string) {
  const { orgId } = await requireRole(["student", "teacher", "admin"], { requireOrg: true });
  await connectToDatabase();
  const mocks = await MockPaper.find({ orgId, board, levelOrGrade }).sort({ year: -1 }).lean();
  return JSON.parse(JSON.stringify(mocks));
}
