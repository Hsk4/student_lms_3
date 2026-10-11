"use server";

import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { Submission } from "@/app/models/Submission";
import { revalidatePath } from "next/cache";

// Grade and Review a Student Submission
export async function gradeSubmission(data: {
  submissionId: string;
  grade: string;
  feedback: string;
  status: "graded" | "resubmit_required";
}) {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!userId || (role !== "teacher" && role !== "admin")) {
    throw new Error("Forbidden: Teacher or Admin role required.");
  }

  await connectToDatabase();

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