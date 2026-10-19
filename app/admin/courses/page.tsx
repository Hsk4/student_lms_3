import { requirePagePermission } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db";
import { Course } from "@/app/models/course";
import { Board } from "@/app/models/Board";
import { Level } from "@/app/models/Level";
import { Subject } from "@/app/models/Subject";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import { CourseForm } from "./course-form";
import { CourseRows } from "./course-rows";

export const instant = false;

export default async function AdminCoursesPage() {
  await requirePagePermission("course:manage", { fresh: true });

  await connectToDatabase();
  const [courses, boards, levels, subjects] = await Promise.all([
    Course.find({})
      .populate("boardId", "name")
      .populate("levelId", "name order")
      .populate("subjectId", "name")
      .sort({ createdAt: -1 })
      .lean(),
    Board.find({ isActive: true }).select("name").sort({ name: 1 }).lean(),
    Level.find({ isActive: true })
      .select("name order")
      .sort({ order: 1, name: 1 })
      .lean(),
    Subject.find({ isActive: true }).select("name").sort({ name: 1 }).lean(),
  ]);

  const missingCatalog =
    boards.length === 0 || levels.length === 0 || subjects.length === 0;

  const rows = courses.map((c: any) => ({
    id: String(c._id),
    board: c.boardId?.name ?? "—",
    level: c.levelId?.name ?? "—",
    subject: c.subjectId?.name ?? "—",
    medium: c.medium ?? "",
    isActive: Boolean(c.isActive),
  }));

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="Courses"
        subtitle="Catalog"
        description="One course = board + level + subject (+ optional medium). Teachers are matched per course."
        icon={<BookOpen className="w-6 h-6 text-teal-400" />}
      />

      {missingCatalog ? (
        <GlassCard variant="default" className="py-12 text-center">
          <p className={glassTheme.text.secondary}>
            Add at least one board, level and subject before creating a course.
          </p>
        </GlassCard>
      ) : (
        <CourseForm
          boards={boards.map((b) => ({ id: String(b._id), name: b.name }))}
          levels={levels.map((l) => ({ id: String(l._id), name: l.name }))}
          subjects={subjects.map((s) => ({ id: String(s._id), name: s.name }))}
        />
      )}

      <CourseRows rows={rows} />
    </div>
  );
}
