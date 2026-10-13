import { requirePageRole } from "@/lib/auth/guards";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { BookOpen, FileCheck, TrendingUp, Calendar } from "lucide-react";

export default async function StudentPage() {
  // Only students can access, admins/teachers cannot
  await requirePageRole(["student"], { requireOrg: true });

  const stats = [
    { icon: BookOpen, label: "Enrolled Courses", value: "5", color: "emerald" },
    { icon: FileCheck, label: "Completed Tasks", value: "23", color: "blue" },
    { icon: TrendingUp, label: "Overall Score", value: "85%", color: "purple" },
    { icon: Calendar, label: "Days Streak", value: "12", color: "amber" },
  ];

  return (
    <div className="space-y-6">
      <GlassPageHeader 
        title="My Learning Dashboard" 
        subtitle="Student Portal"
        description="Track your progress and manage your courses."
        icon={<BookOpen className="w-6 h-6 text-emerald-300" />}
      />

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} icon={stat.icon} label={stat.label} value={stat.value} color={stat.color as any} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard variant="default" glow className="lg:col-span-2">
          <h3 className={cn(glassTheme.typography.h4, glassTheme.text.primary, "mb-4")}>My Courses</h3>
          <div className="space-y-3">
            {[
              { name: "Mathematics 101", progress: 75, instructor: "Mrs. Ahmed" },
              { name: "Physics Fundamentals", progress: 60, instructor: "Mr. Khan" },
              { name: "English Literature", progress: 90, instructor: "Ms. Ali" },
            ].map((course, i) => (
              <div key={i} className={cn("p-4 rounded-lg border transition-all", "bg-white/5 border-white/10 hover:bg-white/10")}>
                <div className="flex items-center justify-between mb-2">
                  <p className={glassTheme.text.primary}>{course.name}</p>
                  <span className={cn("text-sm", glassTheme.text.accent)}>{course.progress}%</span>
                </div>
                <p className={cn("text-xs mb-2", glassTheme.text.secondary)}>{course.instructor}</p>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard variant="default" glow>
          <h3 className={cn(glassTheme.typography.h4, glassTheme.text.primary, "mb-4")}>Upcoming</h3>
          <div className="space-y-3">
            <div className={cn("p-3 rounded-lg border", "bg-amber-500/10 border-amber-400/20")}>
              <p className="text-sm text-amber-200">Math Quiz Due</p>
              <p className={cn("text-xs mt-1", glassTheme.text.secondary)}>2 days left</p>
            </div>
            <div className={cn("p-3 rounded-lg border", "bg-blue-500/10 border-blue-400/20")}>
              <p className="text-sm text-blue-200">Essay Submission</p>
              <p className={cn("text-xs mt-1", glassTheme.text.secondary)}>5 days left</p>
            </div>
            <div className={cn("p-3 rounded-lg border", "bg-purple-500/10 border-purple-400/20")}>
              <p className="text-sm text-purple-200">Project Review</p>
              <p className={cn("text-xs mt-1", glassTheme.text.secondary)}>8 days left</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <GlassCard variant="default">
        <h3 className={cn(glassTheme.typography.h4, glassTheme.text.primary, "mb-4")}>Recent Activity</h3>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={cn("flex items-center justify-between p-2 rounded-lg border", "bg-white/5 border-white/10")}>
              <p className={cn("text-sm", glassTheme.text.secondary)}>Activity {i}</p>
              <span className={cn("text-xs", glassTheme.text.muted)}>2 hours ago</span>
            </div>
          ))}
        </div>
      </GlassCard>
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
  color: "emerald" | "blue" | "amber" | "purple";
}) {
  const colorMap = {
    emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
    blue: "bg-blue-500/20 text-blue-300 border-blue-400/30",
    amber: "bg-amber-500/20 text-amber-300 border-amber-400/30",
    purple: "bg-purple-500/20 text-purple-300 border-purple-400/30",
  };

  return (
    <GlassCard variant="default" glow>
      <div className="flex items-start justify-between">
        <div>
          <p className={cn("text-sm", glassTheme.text.secondary)}>{label}</p>
          <p className={cn("text-3xl font-bold mt-2", glassTheme.text.primary)}>{value}</p>
        </div>
        <div className={cn("p-3 rounded-lg border", colorMap[color])}>
          <Icon className="size-5" />
        </div>
      </div>
    </GlassCard>
  );
}
