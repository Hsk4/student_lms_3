"use server";

import { AuthError, requireCourseAccess, requireRole } from "@/lib/auth/guards";
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
  const enrollments = await Enrollment.find({ userId, role: "student", status: "approved" })
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
  const { userId } = await requireRole(["student"]);

  await connectToDatabase();

  // Students may only submit to assignments of courses they're enrolled in.
  const assignment = await Assignment.findOne({ _id: data.assignmentId })
    .select("courseId")
    .lean();
  if (!assignment) throw new AuthError("NOT_FOUND", 404);
  await requireCourseAccess(assignment.courseId.toString(), "read");


  const submission = await Submission.create({
    assignmentId: data.assignmentId,
    studentId: userId,
    codeSnippet: data.codeSnippet,
    notes: data.notes,
    status: "submitted",
  });

  try {
    revalidatePath("/student");
  } catch (e) {
    // Revalidation may fail in some contexts
  }

  const submissionId = (submission as any)?._id?.toString?.() || "";
  return { success: true, submissionId };
}

// 3. Fetch Mock Papers for Board / Level
export async function getMockPapers(board?: string | null, levelOrGrade?: string | null) {
  await requireRole(["student", "teacher", "admin"]);
  await connectToDatabase();

  const query: Record<string, unknown> = {};
  if (board) query.board = board;
  if (levelOrGrade) query.levelOrGrade = levelOrGrade;
  
  const mocks = await MockPaper.find(query).sort({ year: -1 }).lean();
  return JSON.parse(JSON.stringify(mocks));
}
