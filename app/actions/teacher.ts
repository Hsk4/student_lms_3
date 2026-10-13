"use server";

import { requireRole } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db";
import { Submission } from "@/app/models/Submission";
import { Assignment } from "@/app/models/Assignment";
import { revalidatePath } from "next/cache";

// Grade and Review a Student Submission
export async function gradeSubmission(data: {
  submissionId: string;
  grade: string;
  feedback: string;
  status: "graded" | "resubmit_required";
}) {
  const { userId, orgId, role } = await requireRole(["teacher", "admin"], { requireOrg: true });

  if (!["graded", "resubmit_required"].includes(data.status)) {
    throw new Error("Invalid status");
  }

  await connectToDatabase();

  // Everyone (admins included) may only touch submissions of their own org;
  // teachers additionally only for assignments they created.
  const submission = await Submission.findById(data.submissionId).lean();
  const assignment = submission
    ? await Assignment.findOne({ _id: submission.assignmentId, orgId }).lean()
    : null;
  if (!assignment) throw new Error("Submission not found");
  if (role === "teacher" && assignment.createdBy !== userId) {
    throw new Error("Forbidden: you can only grade your own assignments.");
  }

  const updated = await Submission.findByIdAndUpdate(
    data.submissionId,
    {
      grade: data.grade,
      feedback: data.feedback,
      status: data.status,
    },
    { new: true }
  );

  if (!updated) {
    throw new Error("Submission not found");
  }

  revalidatePath("/dashboard/teacher/submissions");
  return { success: true, submissionId: updated._id.toString() };
}
