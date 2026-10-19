import { requirePageRole } from "@/lib/auth/guards";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { BarChart3, BookOpen, Users, Clock } from "lucide-react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { Course } from "@/app/models/course";
import { Enrollment } from "@/app/models/Enrollment";

export const instant = false;

export default async function TeacherPage() {
  const { role, userId } = await requirePageRole(["teacher", "admin"]);

  if (role === "admin" || role === "super_admin") {
    return (
      <div className="space-y-6">
        <GlassPageHeader
          title="Teacher Dashboard"
          subtitle="Restricted Area"
          description="Admin users should access the Admin Panel instead."
          icon={<BookOpen className="w-6 h-6 text-teal-400" />}
        />
        <div className={cn(glassTheme.bg.tealPremium, "rounded-xl text-center py-16")}>
          <p className={cn("text-lg mb-4", glassTheme.text.primary)}>
            You are an Admin. Access the Admin Panel for full controls.
          </p>
          <Link href="/admin">
            <button className={cn(glassTheme.button.primary, "px-6 py-2 rounded-lg font-semibold")}>
              Go to Admin Panel
            </button>
          </Link>
        </div>
      </div>
    );
  }

  let courses = [];
  let studentCount = 0;
  let pendingReviews = 0;

  try {
    await connectToDatabase();

    const enrollments = await Enrollment.find({
      userId,
      role: "teacher",
      status: "approved",
    }).populate("courseId").lean();

    courses = enrollments.map((e: any) => e.courseId).filter(Boolean);

    const courseIds = courses.map((c: any) => c._id);
    if (courseIds.length > 0) {
      const studentEnrollments = await Enrollment.countDocuments({
        courseId: { $in: courseIds },
        role: "student",
        status: "approved",
      });
      studentCount = studentEnrollments;
      pendingReviews = 0;
    }
  } catch (error) {
    console.error("Error loading teacher courses:", error);
  }

  const stats = [
    { icon: BookOpen, label: "Active Courses", value: courses.length.toString(), color: "teal" },
    { icon: Users, label: "Total Students", value: studentCount.toString(), color: "cyan" },
    { icon: Clock, label: "Pending Reviews", value: pendingReviews.toString(), color: "amber" },
    { icon: BarChart3, label: "Avg Score", value: "—", color: "emerald" },
  ];

  return (
    <div className="space-y-6">
      <GlassPageHeader 
        title="Teacher Dashboard" 
        subtitle="Classroom Management"
        description="Manage your courses, assignments, and student progress."
        icon={<BookOpen className="w-6 h-6 text-teal-400" />}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} icon={stat.icon} label={stat.label} value={stat.value} color={stat.color as any} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={cn(glassTheme.bg.tealCard, glassTheme.hover.tealCard, "lg:col-span-2 rounded-xl p-6")}>
          <h3 className={cn(glassTheme.typography.h4, glassTheme.text.primary, "mb-4 flex items-center gap-2")}>
            <BookOpen className="w-5 h-5 text-teal-400" />
            My Courses
          </h3>
          
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <p className={glassTheme.text.secondary}>No courses assigned yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course: any) => (
                <div key={course._id} className={cn("p-4 rounded-lg border transition-all", glassTheme.bg.teal, glassTheme.hover.teal)}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={glassTheme.text.primary}>{course.levelOrGrade} - {course.board}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {course.subjects?.map((subject: string) => (
                      <span key={subject} className={cn("text-xs px-2 py-1 rounded-lg", "bg-teal-500/20 border border-teal-400/20 text-teal-300")}>
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={cn(glassTheme.bg.tealCard, glassTheme.hover.tealCard, "rounded-xl p-6")}>
          <h3 className={cn(glassTheme.typography.h4, glassTheme.text.primary, "mb-4 flex items-center gap-2")}>
            <BarChart3 className="w-5 h-5 text-teal-400" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className={cn("w-full px-4 py-2 rounded-lg transition-all text-sm font-medium", glassTheme.bg.teal, glassTheme.hover.teal, glassTheme.text.accent)}>
              Create Assignment
            </button>
            <button className={cn("w-full px-4 py-2 rounded-lg transition-all text-sm font-medium", glassTheme.bg.teal, glassTheme.hover.teal, glassTheme.text.accent)}>
              Grade Submissions
            </button>
            <button className={cn("w-full px-4 py-2 rounded-lg transition-all text-sm font-medium", glassTheme.bg.teal, glassTheme.hover.teal, glassTheme.text.accent)}>
              View Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Class Performance */}
      <div className={cn(glassTheme.bg.tealCard, glassTheme.hover.tealCard, "rounded-xl p-6")}>
        <h3 className={cn(glassTheme.typography.h4, glassTheme.text.primary, "mb-4 flex items-center gap-2")}>
          <BarChart3 className="w-5 h-5 text-teal-400" />
          Class Performance
        </h3>
        <div className="h-64 flex items-center justify-center rounded-lg bg-teal-900/10 border border-teal-500/20">
          <p className={glassTheme.text.muted}>Chart placeholder</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: "teal" | "cyan" | "amber" | "emerald";
}) {
  const colorMap = {
    teal: "bg-teal-500/20 text-teal-300 border-teal-400/30",
    cyan: "bg-cyan-500/20 text-cyan-300 border-cyan-400/30",
    amber: "bg-amber-500/20 text-amber-300 border-amber-400/30",
    emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  };

  return (
    <div className={cn(glassTheme.bg.tealCard, glassTheme.hover.tealCard, "rounded-xl p-6")}>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn("text-sm", glassTheme.text.secondary)}>{label}</p>
          <p className={cn("text-3xl font-bold mt-2", glassTheme.text.primary)}>{value}</p>
        </div>
        <div className={cn("p-3 rounded-lg border", colorMap[color])}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}
