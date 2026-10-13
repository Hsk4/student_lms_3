"use server";

import { AuthError, requireCourseAccess, requirePermission } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db";
import { Submission } from "@/app/models/Submission";
import { Assignment } from "@/app/models/Assignment";
import { revalidatePath } from "next/cache";
import { ORG_PERMISSIONS } from "@/lib/auth/roles";

// Grade and Review a Student Submission
export async function gradeSubmission(data: {
  submissionId: string;
  grade: string;
  feedback: string;
  status: "graded" | "resubmit_required";
}) {
  const { orgId } = await requirePermission(ORG_PERMISSIONS.gradeWrite, { requireOrg: true });

  if (!["graded", "resubmit_required"].includes(data.status)) {
    throw new Error("Invalid status");
  }

  await connectToDatabase();

  const submission = await Submission.findOne({ _id: data.submissionId, orgId }).lean();
  if (!submission) throw new AuthError("NOT_FOUND", 404);

  const assignment = await Assignment.findOne({
    _id: submission.assignmentId,
    orgId,
  }).lean();
  if (!assignment) throw new AuthError("NOT_FOUND", 404);

  await requireCourseAccess(assignment.courseId.toString(), "manage");

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
