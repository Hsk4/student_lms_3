import { requirePageRole } from "@/lib/auth/guards";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { BookOpen, FileCheck, TrendingUp, Calendar } from "lucide-react";
import { connectToDatabase } from "@/lib/db";
import { Enrollment } from "@/app/models/Enrollment";

export default async function StudentPage() {
  // Only students can access, admins/teachers cannot
  const { userId, orgId } = await requirePageRole(["student"], { requireOrg: true });

  let enrolledCourses = [];
  
  try {
    await connectToDatabase();
    
    // Get all courses this student is enrolled in
    const enrollments = await Enrollment.find({
      userId,
      orgId,
      role: "student",
      status: "approved",
    }).populate("courseId").lean();

    enrolledCourses = enrollments.map((e: any) => e.courseId).filter(Boolean);
  } catch (error) {
    console.error("Error loading student courses:", error);
  }

  const stats = [
    { icon: BookOpen, label: "Enrolled Courses", value: enrolledCourses.length.toString(), color: "teal" },
    { icon: FileCheck, label: "Completed Tasks", value: "0", color: "cyan" },
    { icon: TrendingUp, label: "Overall Score", value: "—", color: "emerald" },
    { icon: Calendar, label: "Days Streak", value: "0", color: "amber" },
  ];

  return (
    <div className="space-y-6">
      <GlassPageHeader 
        title="My Learning Dashboard" 
        subtitle="Student Portal"
        description="Track your progress and manage your courses."
        icon={<BookOpen className="w-6 h-6 text-teal-400" />}
      />

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} icon={stat.icon} label={stat.label} value={stat.value} color={stat.color as any} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={cn(glassTheme.bg.tealCard, "lg:col-span-2 rounded-xl p-6")}>
          <h3 className={cn(glassTheme.typography.h4, glassTheme.text.primary, "mb-4 flex items-center gap-2")}>
            <BookOpen className="w-5 h-5 text-teal-400" />
            My Courses
          </h3>
          
          {enrolledCourses.length === 0 ? (
            <div className="text-center py-8">
              <p className={glassTheme.text.secondary}>No courses enrolled yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {enrolledCourses.map((course: any) => (
                <div key={course._id} className={cn("p-4 rounded-lg border transition-all", "bg-teal-900/20 border-teal-500/30 hover:bg-teal-900/30 hover:border-teal-400/40")}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={glassTheme.text.primary}>{course.levelOrGrade} - {course.board}</p>
                    <span className={cn("text-sm text-teal-400")}>In Progress</span>
                  </div>
                  <p className={cn("text-xs mb-3", glassTheme.text.secondary)}>
                    {course.subjects?.length || 0} subjects
                  </p>
                  <div className="h-2 rounded-full bg-teal-900/30 overflow-hidden border border-teal-500/20">
                    <div
                      className="h-full bg-gradient-to-r from-teal-400 to-teal-600"
                      style={{ width: "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={cn(glassTheme.bg.tealCard, "rounded-xl p-6")}>
          <h3 className={cn(glassTheme.typography.h4, glassTheme.text.primary, "mb-4 flex items-center gap-2")}>
            <Calendar className="w-5 h-5 text-teal-400" />
            Upcoming
          </h3>
          <div className="space-y-3">
            <div className={cn("p-3 rounded-lg border", "bg-amber-500/10 border-amber-400/20")}>
              <p className="text-sm text-amber-200">No deadlines</p>
              <p className={cn("text-xs mt-1", glassTheme.text.secondary)}>Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={cn(glassTheme.bg.tealCard, "rounded-xl p-6")}>
        <h3 className={cn(glassTheme.typography.h4, glassTheme.text.primary, "mb-4 flex items-center gap-2")}>
          <TrendingUp className="w-5 h-5 text-teal-400" />
          Recent Activity
        </h3>
        <div className="space-y-2">
          <div className={cn("flex items-center justify-between p-2 rounded-lg border", "bg-teal-900/20 border-teal-500/20")}>
            <p className={cn("text-sm", glassTheme.text.secondary)}>No recent activity</p>
          </div>
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
