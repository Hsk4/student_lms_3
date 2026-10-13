import { requirePageRole } from "@/lib/auth/guards";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { BarChart3, BookOpen, Users, Clock } from "lucide-react";
import Link from "next/link";

export default async function TeacherPage() {
  const { role } = await requirePageRole(["teacher", "admin"], { requireOrg: true });

  // If admin, show message they should use /admin
  if (role === "admin") {
    return (
      <div className="space-y-6">
        <GlassPageHeader 
          title="Teacher Dashboard" 
          subtitle="Restricted Area"
          description="Admin users should access the Admin Panel instead."
          icon={<BookOpen className="w-6 h-6 text-emerald-300" />}
        />
        <GlassCard variant="premium" className="text-center py-16">
          <p className={cn("text-lg mb-4", glassTheme.text.primary)}>
            You are an Admin. Access the Admin Panel for full controls.
          </p>
          <Link href="/admin">
            <button className={glassTheme.button.primary + " px-6 py-2 rounded-lg font-semibold"}>
              Go to Admin Panel
            </button>
          </Link>
        </GlassCard>
      </div>
    );
  }

  const stats = [
    { icon: BookOpen, label: "Active Courses", value: "3", color: "emerald" },
    { icon: Users, label: "Total Students", value: "42", color: "blue" },
    { icon: Clock, label: "Pending Reviews", value: "8", color: "amber" },
    { icon: BarChart3, label: "Avg Score", value: "78%", color: "purple" },
  ];

  return (
    <div className="space-y-6">
      <GlassPageHeader 
        title="Teacher Dashboard" 
        subtitle="Classroom Management"
        description="Manage your courses, assignments, and student progress."
        icon={<BookOpen className="w-6 h-6 text-emerald-300" />}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} icon={stat.icon} label={stat.label} value={stat.value} color={stat.color as any} />
        ))}
      </div>

      {/* Main Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard variant="default" glow className="lg:col-span-2">
          <h3 className={cn(glassTheme.typography.h4, glassTheme.text.primary, "mb-4")}>Recent Assignments</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn("p-3 rounded-lg border transition-all", "bg-white/5 border-white/10 hover:bg-white/10")}>
                <p className={glassTheme.text.primary}>Assignment {i}</p>
                <p className={cn("text-xs mt-1", glassTheme.text.secondary)}>5 submissions pending</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard variant="default" glow>
          <h3 className={cn(glassTheme.typography.h4, glassTheme.text.primary, "mb-4")}>Quick Actions</h3>
          <div className="space-y-2">
            <button className={cn("w-full px-4 py-2 rounded-lg transition-all text-sm font-medium", glassTheme.bg.glass, glassTheme.hover.glass, glassTheme.text.primary)}>
              Create Assignment
            </button>
            <button className={cn("w-full px-4 py-2 rounded-lg transition-all text-sm font-medium", glassTheme.bg.glass, glassTheme.hover.glass, glassTheme.text.primary)}>
              Grade Submissions
            </button>
            <button className={cn("w-full px-4 py-2 rounded-lg transition-all text-sm font-medium", glassTheme.bg.glass, glassTheme.hover.glass, glassTheme.text.primary)}>
              View Analytics
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Class Performance */}
      <GlassCard variant="default">
        <h3 className={cn(glassTheme.typography.h4, glassTheme.text.primary, "mb-4")}>Class Performance</h3>
        <div className="h-64 flex items-center justify-center rounded-lg bg-white/5 border border-white/10">
          <p className={glassTheme.text.muted}>Chart placeholder</p>
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
