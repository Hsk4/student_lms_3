"use server";

import { AuthError, requireCourseAccess, requireRole } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db";
import { Enrollment } from "@/app/models/Enrollment";
import { Assignment } from "@/app/models/Assignment";
import { Submission } from "@/app/models/Submission";
import { Material } from "@/app/models/Material";
import { revalidatePath } from "next/cache";

// 1. Get Courses Enrolled by Current Student
export async function getStudentEnrolledCourses() {
  const { userId } = await requireRole(["student"]);

  await connectToDatabase();
  const enrollments = await Enrollment.find({
    userId,
    role: "student",
    status: "approved",
  })
    .populate("courseId")
    .lean();

  return JSON.parse(JSON.stringify(enrollments));
}

// 2. Submit an assignment: free text and/or a file link. Re-submitting before
// the teacher grades replaces the previous answer.
export async function submitAssignment(data: {
  assignmentId: string;
  text?: string;
  fileUrl?: string;
}) {
  const { userId } = await requireRole(["student"]);

  if (!data.text?.trim() && !data.fileUrl?.trim()) {
    throw new AuthError("Provide an answer or a file link", 403);
  }

  await connectToDatabase();

  const assignment = await Assignment.findById(data.assignmentId)
    .select("courseId")
    .lean();
  if (!assignment) throw new AuthError("NOT_FOUND", 404);

  // Students may only submit to assignments of courses they're enrolled in.
  await requireCourseAccess(assignment.courseId.toString(), "read");

  const existing = await Submission.findOne({
    assignmentId: data.assignmentId,
    studentId: userId,
  }).lean();
  if (existing?.status === "graded") {
    throw new AuthError("This submission has already been graded", 403);
  }

  const submission = await Submission.findOneAndUpdate(
    { assignmentId: data.assignmentId, studentId: userId },
    {
      text: data.text?.trim() || undefined,
      fileUrl: data.fileUrl?.trim() || undefined,
      submittedAt: new Date(),
      status: "submitted",
    },
    { upsert: true, new: true },
  );

  revalidatePath("/student/assignments");
  revalidatePath("/student");
  return { success: true, submissionId: submission._id.toString() };
}

// 3. Past papers for the student's courses (now a Material kind)
export async function getPastPapers(courseId?: string | null) {
  const { userId, role } = await requireRole([
    "student",
    "teacher",
    "admin",
    "super_admin",
  ]);
  await connectToDatabase();

  const courseIds = courseId
    ? [courseId]
    : await Enrollment.distinct("courseId", {
        userId,
        role: role === "teacher" ? "teacher" : "student",
        status: "approved",
      });

  const materials = await Material.find({
    courseId: { $in: courseIds },
    kind: "past_paper",
  })
    .sort({ year: -1 })
    .lean();

  return JSON.parse(JSON.stringify(materials));
}
