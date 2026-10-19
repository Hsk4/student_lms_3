"use server";

import { AuthError, requirePermission } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db";
import { Submission } from "@/app/models/Submission";
import { Assignment } from "@/app/models/Assignment";
import { Enrollment } from "@/app/models/Enrollment";
import { revalidatePath } from "next/cache";

/**
 * Grade and review a student submission.
 * Numeric scores only (0–100), capped at the assignment's maxScore. The
 * caller must teach a course the student is enrolled in; admins may grade any.
 */
export async function gradeSubmission(data: {
  submissionId: string;
  score: number;
  feedback?: string;
  status: "graded" | "resubmit_required";
}) {
  const { userId, role } = await requirePermission("grade:write");

  if (!["graded", "resubmit_required"].includes(data.status)) {
    throw new Error("Invalid status");
  }
  if (!Number.isFinite(data.score) || data.score < 0 || data.score > 100) {
    throw new Error("Score must be between 0 and 100");
  }

  await connectToDatabase();

  const submission = await Submission.findById(data.submissionId).lean();
  if (!submission) throw new AuthError("NOT_FOUND", 404);

  const assignment = await Assignment.findById(submission.assignmentId).lean();
  if (!assignment) throw new AuthError("NOT_FOUND", 404);

  if (role !== "admin" && role !== "super_admin") {
    const teaches = await Enrollment.exists({
      userId,
      courseId: assignment.courseId,
      role: "teacher",
      status: "approved",
    });
    if (!teaches) throw new AuthError("FORBIDDEN", 403);
  }

  const maxScore = assignment.maxScore ?? 100;
  if (data.score > maxScore) {
    throw new Error(`Score cannot exceed ${maxScore}`);
  }

  const gradedAt = new Date();
  const updated = await Submission.findByIdAndUpdate(
    data.submissionId,
    {
      score: data.status === "graded" ? data.score : undefined,
      maxScore,
      feedback: data.feedback?.trim() || undefined,
      status: data.status,
      gradedBy: userId,
      gradedAt,
    },
    { new: true },
  );

  if (!updated) {
    throw new Error("Submission not found");
  }

  revalidatePath("/student/assignments");
  revalidatePath("/student");
  revalidatePath("/teacher");
  return { success: true, submissionId: updated._id.toString() };
}
