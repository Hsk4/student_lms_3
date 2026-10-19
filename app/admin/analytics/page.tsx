import { requirePagePermission } from "@/lib/auth/guards";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { BarChart3, TrendingUp, Users, BookOpen, Target } from "lucide-react";

export default async function AdminAnalyticsPage() {
  await requirePagePermission("user:manage", { fresh: true });

  const stats = [
    { icon: Users, label: "Total Users", value: "342", change: "+12%", color: "emerald" },
    { icon: BookOpen, label: "Active Courses", value: "24", change: "+3", color: "blue" },
    { icon: Target, label: "Completion Rate", value: "78%", change: "+5%", color: "purple" },
    { icon: TrendingUp, label: "Avg Score", value: "85.3", change: "+2.1", color: "amber" },
  ];

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="Analytics"
        subtitle="Performance Metrics"
        description="View detailed analytics and performance metrics for your organization."
        icon={<BarChart3 className="w-6 h-6 text-emerald-300" />}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <GlassCard key={i} variant="default" glow>
            <div className="flex items-start justify-between">
              <div>
                <p className={cn("text-sm font-medium mb-2", glassTheme.text.secondary)}>{stat.label}</p>
                <p className={cn("text-3xl font-bold", glassTheme.text.primary)}>{stat.value}</p>
                <p className={cn("text-xs mt-2 font-semibold", stat.color === "emerald" ? "text-emerald-300" : stat.color === "blue" ? "text-blue-300" : stat.color === "purple" ? "text-purple-300" : "text-amber-300")}>
                  {stat.change} vs last month
                </p>
              </div>
              <div className={cn(
                "p-3 rounded-lg",
                stat.color === "emerald" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30" :
                stat.color === "blue" ? "bg-blue-500/20 text-blue-300 border border-blue-400/30" :
                stat.color === "purple" ? "bg-purple-500/20 text-purple-300 border border-purple-400/30" :
                "bg-amber-500/20 text-amber-300 border border-amber-400/30"
              )}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard variant="default">
          <h3 className={cn(glassTheme.typography.h4, glassTheme.text.primary, "mb-6")}>Enrollment Trend</h3>
          <div className="h-64 flex items-center justify-center rounded-lg bg-white/5 border border-white/10">
            <p className={glassTheme.text.muted}>Chart placeholder</p>
          </div>
        </GlassCard>

        <GlassCard variant="default">
          <h3 className={cn(glassTheme.typography.h4, glassTheme.text.primary, "mb-6")}>Course Distribution</h3>
          <div className="h-64 flex items-center justify-center rounded-lg bg-white/5 border border-white/10">
            <p className={glassTheme.text.muted}>Chart placeholder</p>
          </div>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <GlassCard variant="default">
        <h3 className={cn(glassTheme.typography.h4, glassTheme.text.primary, "mb-6")}>Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: "New enrollment", detail: "45 students enrolled in Math 101", time: "2 hours ago" },
            { action: "Course created", detail: "Physics Fundamentals - Class XI", time: "5 hours ago" },
            { action: "Assignment submitted", detail: "3,429 assignments submitted this week", time: "1 day ago" },
            { action: "User joined", detail: "120 new teachers joined the platform", time: "2 days ago" },
          ].map((activity, i) => (
            <div key={i} className={cn(
              "p-4 rounded-lg border transition-all",
              "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
            )}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={cn("font-semibold text-sm", glassTheme.text.primary)}>{activity.action}</p>
                  <p className={cn("text-sm mt-1", glassTheme.text.secondary)}>{activity.detail}</p>
                </div>
                <span className={cn("text-xs", glassTheme.text.muted)}>{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
