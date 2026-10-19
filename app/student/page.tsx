import { Suspense } from "react";
import { requirePageRole } from "@/lib/auth/guards";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { BookOpen, FileCheck2, TrendingUp, Calendar, ArrowRight, Zap, Clock, Users } from "lucide-react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { Enrollment } from "@/app/models/Enrollment";
import { mockAssignments, mockTimetable } from "@/data/mock-data";

export const instant = false;

async function StudentDashboardContent({ userId, orgId }: { userId: string; orgId: string }) {
  let enrolledCourses = [];
  
  try {
    await connectToDatabase();
    
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

  const activeAssignments = mockAssignments.filter((a) => a.status === "pending");
  const todayClasses = mockTimetable.slice(0, 3);

  const stats = [
    { icon: BookOpen, label: "Enrolled Courses", value: enrolledCourses.length.toString(), color: "teal" },
    { icon: FileCheck2, label: "Pending Tasks", value: activeAssignments.length.toString(), color: "cyan" },
    { icon: TrendingUp, label: "Average Score", value: "85%", color: "emerald" },
    { icon: Calendar, label: "Attendance", value: "92%", color: "amber" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={cn(glassTheme.bg.tealPremium, "rounded-2xl p-8 mb-8", glassTheme.shadow.glowLarge)}>
        <div className="max-w-2xl">
          <h1 className={cn("text-4xl font-black mb-2", glassTheme.text.primary)}>Welcome back! 👋</h1>
          <p className={cn("text-lg", glassTheme.text.secondary)}>
            You have {activeAssignments.length} pending assignments and {todayClasses.length} classes today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} icon={stat.icon} label={stat.label} value={stat.value} color={stat.color as any} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courses - 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={cn("text-2xl font-bold flex items-center gap-2", glassTheme.text.primary)}>
              <BookOpen className="w-6 h-6 text-teal-400" />
              My Courses
            </h2>
            <Link href="/student/courses">
              <button className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                glassTheme.button.primary
              )}>
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {enrolledCourses.length === 0 ? (
            <GlassCard variant="default" className="text-center py-12">
              <p className={glassTheme.text.secondary}>No courses enrolled yet</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrolledCourses.map((course: any) => (
                <GlassCard key={course._id} variant="default" className={glassTheme.hover.tealCard}>
                  <div className="mb-3">
                    <h3 className={cn("font-bold", glassTheme.text.primary)}>{course.levelOrGrade}</h3>
                    <p className={cn("text-sm", glassTheme.text.secondary)}>{course.board}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.subjects?.map((subject: string) => (
                      <span key={subject} className={cn(
                        "text-xs px-2 py-1 rounded-lg",
                        "bg-teal-500/20 border border-teal-400/30 text-teal-300"
                      )}>
                        {subject}
                      </span>
                    ))}
                  </div>
                  <div className="h-2 rounded-full bg-teal-900/30 overflow-hidden border border-teal-500/20">
                    <div className="h-full bg-gradient-to-r from-teal-400 to-teal-600" style={{ width: "60%" }} />
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar - Schedule & Quick Links */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <div className="space-y-4">
            <h2 className={cn("text-xl font-bold flex items-center gap-2", glassTheme.text.primary)}>
              <Clock className="w-5 h-5 text-teal-400" />
              Today's Classes
            </h2>

            <div className="space-y-3">
              {todayClasses.map((item) => (
                <GlassCard key={item.id} variant="default" className={glassTheme.hover.tealCard}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={cn("font-semibold text-sm", glassTheme.text.primary)}>
                        {item.course}
                      </p>
                      <p className={cn("text-xs", glassTheme.text.secondary)}>
                        {item.room}
                      </p>
                    </div>
                    <span className={cn("text-sm font-bold", glassTheme.text.accent)}>
                      {item.time.split(" - ")[0]}
                    </span>
                  </div>
                </GlassCard>
              ))}
            </div>

            <Link href="/student/timetable">
              <button className={cn(
                "w-full px-4 py-2 rounded-lg text-sm font-medium transition-all",
                glassTheme.button.glass
              )}>
                View Full Timetable
              </button>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className={cn("text-lg font-bold", glassTheme.text.primary)}>Quick Links</h3>
            <div className="space-y-2">
              <Link href="/student/assignments">
                <button className={cn(
                  "w-full px-4 py-2 rounded-lg text-sm font-medium transition-all text-left flex items-center gap-2",
                  glassTheme.bg.teal, glassTheme.hover.teal
                )}>
                  <FileCheck2 className="w-4 h-4 text-teal-400" />
                  Assignments ({activeAssignments.length})
                </button>
              </Link>
              <Link href="/student/results">
                <button className={cn(
                  "w-full px-4 py-2 rounded-lg text-sm font-medium transition-all text-left flex items-center gap-2",
                  glassTheme.bg.teal, glassTheme.hover.teal
                )}>
                  <TrendingUp className="w-4 h-4 text-teal-400" />
                  My Results
                </button>
              </Link>
              <Link href="/student/profile">
                <button className={cn(
                  "w-full px-4 py-2 rounded-lg text-sm font-medium transition-all text-left flex items-center gap-2",
                  glassTheme.bg.teal, glassTheme.hover.teal
                )}>
                  <Users className="w-4 h-4 text-teal-400" />
                  My Profile
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Assignments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={cn("text-2xl font-bold flex items-center gap-2", glassTheme.text.primary)}>
            <Zap className="w-6 h-6 text-teal-400" />
            Pending Assignments
          </h2>
          <Link href="/student/assignments">
            <button className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              glassTheme.button.primary
            )}>
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {activeAssignments.length === 0 ? (
          <GlassCard variant="default" className="text-center py-12">
            <p className={glassTheme.text.secondary}>No pending assignments!</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeAssignments.slice(0, 3).map((assignment) => (
              <GlassCard key={assignment.id} variant="default">
                <div className="mb-3">
                  <h3 className={cn("font-bold", glassTheme.text.primary)}>{assignment.title}</h3>
                  <p className={cn("text-sm", glassTheme.text.secondary)}>{assignment.course}</p>
                </div>
                <p className={cn("text-xs mb-3", glassTheme.text.muted)}>
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
                <div className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold text-center",
                  "bg-amber-500/20 border border-amber-400/30 text-amber-300"
                )}>
                  Pending Submission
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function StudentPage() {
  const { userId, orgId } = await requirePageRole(["student"], { requireOrg: true });

  return (
    <div className="space-y-6">
      <GlassPageHeader 
        title="My Learning Dashboard" 
        subtitle="Student Portal"
        description="Track your progress, manage your courses and assignments."
        icon={<BookOpen className="w-6 h-6 text-teal-400" />}
      />

      <Suspense fallback={
        <GlassCard variant="default" className="py-12 text-center">
          <p className={glassTheme.text.secondary}>Loading your dashboard...</p>
        </GlassCard>
      }>
        <StudentDashboardContent userId={userId} orgId={orgId!} />
      </Suspense>
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
