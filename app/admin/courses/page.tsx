import { requirePagePermission } from "@/lib/auth/guards";
import { ORG_PERMISSIONS } from "@/lib/auth/roles";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { BookOpen, Plus, Trash2, Edit3 } from "lucide-react";
import Link from "next/link";

export default async function AdminCoursesPage() {
  const ctx = await requirePagePermission(ORG_PERMISSIONS.courseManage, { fresh: true, requireOrg: true });
  const orgId = ctx.orgId!;

  // Get courses from database
  const courses = await getCourses(orgId);

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="Courses & Boards"
        subtitle="Curriculum Management"
        description="Manage all courses, boards, and subjects for your organization."
        icon={<BookOpen className="w-6 h-6 text-emerald-300" />}
        cta={
          <Link href="/admin/courses/new">
            <button className={cn(
              "px-6 py-2 rounded-lg font-semibold flex items-center gap-2",
              glassTheme.button.primary
            )}>
              <Plus className="w-4 h-4" />
              New Course
            </button>
          </Link>
        }
      />

      {courses.length === 0 ? (
        <GlassCard variant="premium" className="text-center py-16">
          <div className={cn(
            "mx-auto w-16 h-16 rounded-xl flex items-center justify-center mb-4",
            "bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-400/30 w-fit mx-auto"
          )}>
            <BookOpen className="w-8 h-8 text-emerald-300" />
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <GlassCard key={course.id} variant="default" hover="interactive">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={cn(glassTheme.typography.h4, glassTheme.text.primary)}>{course.levelOrGrade}</h3>
                  <p className={cn("text-xs mt-1", glassTheme.text.muted)}>
                    <span className={cn("inline-block px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300")}>
                      {course.board}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/courses/${course.id}/edit`}>
                    <button className={cn(
                      "p-2 rounded-lg backdrop-blur-md transition-all",
                      glassTheme.bg.glass,
                      "hover:bg-white/20 text-white/70 hover:text-white"
                    )}>
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className={cn(
                      "p-2 rounded-lg backdrop-blur-md transition-all",
                      "bg-red-500/20 border border-red-400/30 hover:bg-red-500/30",
                      "text-red-300 hover:text-red-200"
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
                Created {new Date(course.createdAt).toLocaleDateString()}
              </p>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

async function getCourses(orgId: string) {
  try {
    // Hardcoded courses for display
    return [
      {
        id: "1",
        title: "Mathematics 101",
        board: "Sindh",
        levelOrGrade: "Grade 9",
        subjects: ["Algebra", "Geometry", "Trigonometry"],
        createdAt: new Date("2024-01-15"),
      },
      {
        id: "2",
        title: "Physics Fundamentals",
        board: "Aga Khan",
        levelOrGrade: "Grade 10",
        subjects: ["Mechanics", "Thermodynamics", "Waves"],
        createdAt: new Date("2024-01-20"),
      },
      {
        id: "3",
        title: "English Literature",
        board: "O/A Level",
        levelOrGrade: "A-Level",
        subjects: ["Prose", "Poetry", "Drama"],
        createdAt: new Date("2024-02-01"),
      },
      {
        id: "4",
        title: "Chemistry Advanced",
        board: "Sindh",
        levelOrGrade: "Grade 11",
        subjects: ["Organic", "Inorganic", "Physical"],
        createdAt: new Date("2024-02-05"),
      },
      {
        id: "5",
        title: "Computer Science",
        board: "Aga Khan",
        levelOrGrade: "Grade 12",
        subjects: ["Programming", "Data Structures", "Algorithms"],
        createdAt: new Date("2024-02-10"),
      },
      {
        id: "6",
        title: "Biology Advanced",
        board: "O/A Level",
        levelOrGrade: "A-Level",
        subjects: ["Genetics", "Ecology", "Anatomy"],
        createdAt: new Date("2024-02-15"),
      },
    ];
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
}

async function handleDeleteCourse(courseId: string) {
  // Placeholder - implement actual deletion
  console.log("Delete course:", courseId);
}
