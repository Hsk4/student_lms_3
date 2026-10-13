"use server";

import { AuthError, requireCourseAccess, requirePermission, requireRole } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db";
import { Enrollment } from "@/app/models/Enrollment";
import { Assignment } from "@/app/models/Assignment";
import { MockPaper } from "@/app/models/MockPaper";
import { Submission } from "@/app/models/Submission";
import { revalidatePath } from "next/cache";
import { ORG_PERMISSIONS } from "@/lib/auth/roles";

// 1. Get Courses Enrolled by Current Student
export async function getStudentEnrolledCourses() {
  const { userId, orgId } = await requireRole(["student"], { requireOrg: true });

  await connectToDatabase();
  const enrollments = await Enrollment.find({ orgId, userId, role: "student", status: "approved" })
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
  const courseId = Assignment.findOne({ _id: data.assignmentId, orgId }).select("courseId").lean() as any;
  if (!courseId) throw new AuthError("NOT_FOUND", 404);
  await requireCourseAccess(courseId, "read");


  const submission = await Submission.create({
    orgId: orgId!,
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

// 3. Fetch Mock Papers for Board / Level (scoped to the caller's org)
export async function getMockPapers(board?: string | null, levelOrGrade?: string | null) {
  const { orgId } = await requirePermission(ORG_PERMISSIONS.courseView, { requireOrg: true });
  await connectToDatabase();
  
  const query: any = { orgId };
  if (board) query.board = board;
  if (levelOrGrade) query.levelOrGrade = levelOrGrade;
  
  const mocks = await MockPaper.find(query).sort({ year: -1 }).lean();
  return JSON.parse(JSON.stringify(mocks));
}
