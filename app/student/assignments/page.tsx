import { Suspense } from "react";
import { requirePageRole } from "@/lib/auth/guards";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { FileCheck2 } from "lucide-react";
import { connectToDatabase } from "@/lib/db";
import { Enrollment } from "@/app/models/Enrollment";
import { Assignment } from "@/app/models/Assignment";
import { Submission } from "@/app/models/Submission";
import { StudentAssignmentsList } from "./assignments-list";

type StudentAssignment = {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  status: string;
  score: string | null;
  feedback: string | null;
};

export const instant = false;

async function StudentAssignmentsContent({ userId }: { userId: string }) {
  let items: StudentAssignment[] = [];

  try {
    await connectToDatabase();

    const enrollments = await Enrollment.find({
      userId,
      role: "student",
      status: "approved",
    })
      .select("courseId")
      .lean();

    const courseIds = enrollments.map((e) => e.courseId);

    if (courseIds.length > 0) {
      const [assignments, submissions] = await Promise.all([
        Assignment.find({ courseId: { $in: courseIds } })
          .populate("courseId", "levelOrGrade board")
          .sort({ dueDate: 1 })
          .lean(),
        Submission.find({ studentId: userId }).lean(),
      ]);

      const byAssignment = new Map(
        submissions.map((s) => [String(s.assignmentId), s])
      );

      items = assignments.map((a) => {
        const sub = byAssignment.get(String(a._id));
        const course = a.courseId as unknown as { levelOrGrade?: string; board?: string } | null;
        const status = !sub ? "pending" : sub.status === "graded" ? "graded" : "submitted";
        return {
          id: String(a._id),
          title: a.title,
          course: course?.levelOrGrade ?? "Course",
          dueDate: a.dueDate.toISOString(),
          status,
          score: sub?.grade ?? null,
          feedback: sub?.feedback ?? null,
        };
      });
    }
  } catch (error) {
    console.error("Error loading student assignments:", error);
  }

  return <StudentAssignmentsList assignments={items} />;
}

export default async function StudentAssignmentsPage() {
  const { userId } = await requirePageRole(["student"]);

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="Assignments & Submissions"
        subtitle="Task Management"
        description="Track your assignments, submissions, and grades."
        icon={<FileCheck2 className="w-6 h-6 text-teal-400" />}
      />

      <Suspense
        fallback={
          <GlassCard variant="default" className="py-12 text-center">
            <p className={glassTheme.text.secondary}>Loading your assignments...</p>
          </GlassCard>
        }
      >
        <StudentAssignmentsContent userId={userId} />
      </Suspense>
    </div>
  );
}
