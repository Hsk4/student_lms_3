import { BookOpen, Plus, Edit3 } from "lucide-react";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { Course } from "@/app/models/course";
import { DeleteCourseButton } from "./delete-course-button";

export async function CoursesList({ orgId }: { orgId: string }) {
  let courses = [];
  let error = null;

  try {
    await connectToDatabase();
    const courseDocs = await Course.find({ orgId }).sort({ createdAt: -1 }).lean();
    courses = JSON.parse(JSON.stringify(courseDocs));
  } catch (err) {
    console.error("Error fetching courses:", err);
    error = err instanceof Error ? err.message : "Failed to load courses";
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4 text-red-300">
        <p className="font-semibold mb-1">Error loading courses:</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <GlassCard variant="premium" className="text-center py-16">
        <div className={cn(
          "mx-auto w-16 h-16 rounded-xl flex items-center justify-center mb-4",
          "bg-gradient-to-br from-teal-500/20 to-teal-600/20 border border-teal-400/40"
        )}>
          <BookOpen className="w-8 h-8 text-teal-400" />
        </div>
        <h3 className={cn(glassTheme.typography.h3, glassTheme.text.primary, "mb-2")}>No courses yet</h3>
        <p className={cn("mb-6", glassTheme.text.secondary)}>Create your first course to get started</p>
        <Link href="/admin/courses/new">
          <button className={cn(
            "px-6 py-2 rounded-lg font-semibold inline-flex items-center gap-2",
            glassTheme.button.primary
          )}>
            <Plus className="w-4 h-4" />
            Create First Course
          </button>
        </Link>
      </GlassCard>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course: any) => (
        <GlassCard key={course._id} variant="default">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className={cn(glassTheme.typography.h4, glassTheme.text.primary)}>{course.levelOrGrade}</h3>
              <p className={cn("text-xs mt-1", glassTheme.text.muted)}>
                <span className={cn("inline-block px-2 py-1 rounded-lg bg-teal-500/20 border border-teal-400/30 text-teal-300")}>
                  {course.board}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/courses/${course._id}/edit`}>
                <button className={cn(
                  "p-2 rounded-lg backdrop-blur-md transition-all",
                  glassTheme.bg.glass,
                  "hover:bg-white/20 text-white/70 hover:text-white"
                )}>
                  <Edit3 className="w-4 h-4" />
                </button>
              </Link>
              <DeleteCourseButton courseId={course._id.toString()} />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {course.subjects?.map((subject: string) => (
              <span key={subject} className={cn(
                "text-xs px-2 py-1 rounded-lg backdrop-blur-md",
                "bg-white/5 border border-white/10 text-white/70"
              )}>
                {subject}
              </span>
            ))}
          </div>

          <p className={cn("text-xs", glassTheme.text.muted)}>
            Created {new Date(course.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
        </GlassCard>
      ))}
    </div>
  );
}
