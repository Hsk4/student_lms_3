import { requirePageRole } from "@/lib/auth/guards";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { BookOpen, FileCheck2, Calendar } from "lucide-react";

export const instant = false;

export default async function StudentDashboardPage() {
  await requirePageRole(["student"], { requireOrg: true });

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="My Learning Dashboard"
        subtitle="Student Portal"
        description="Track your progress, manage your courses and assignments."
        icon={<BookOpen className="w-6 h-6 text-teal-400" />}
      />

      <div
        className={cn(
          glassTheme.bg.tealPremium,
          "rounded-2xl p-8 mb-8",
          glassTheme.shadow.glowLarge,
        )}
      >
        <div className="max-w-2xl">
          <h1
            className={cn("text-4xl font-black mb-2", glassTheme.text.primary)}
          >
            Welcome back! 👋
          </h1>
          <p className={cn("text-lg", glassTheme.text.secondary)}>
            Your dashboard will display courses, assignments, and upcoming
            classes once data is available.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard variant="default">
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-sm", glassTheme.text.secondary)}>
                Enrolled Courses
              </p>
              <p
                className={cn(
                  "text-3xl font-bold mt-1",
                  glassTheme.text.primary,
                )}
              >
                0
              </p>
            </div>
            <div
              className={cn(
                "p-3 rounded-lg",
                "bg-teal-500/20 text-teal-300 border border-teal-400/30",
              )}
            >
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="default">
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-sm", glassTheme.text.secondary)}>
                Pending Tasks
              </p>
              <p
                className={cn(
                  "text-3xl font-bold mt-1",
                  glassTheme.text.primary,
                )}
              >
                0
              </p>
            </div>
            <div
              className={cn(
                "p-3 rounded-lg",
                "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30",
              )}
            >
              <FileCheck2 className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="default">
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-sm", glassTheme.text.secondary)}>
                Classes Today
              </p>
              <p
                className={cn(
                  "text-3xl font-bold mt-1",
                  glassTheme.text.primary,
                )}
              >
                0
              </p>
            </div>
            <div
              className={cn(
                "p-3 rounded-lg",
                "bg-amber-500/20 text-amber-300 border border-amber-400/30",
              )}
            >
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard variant="default" className="text-center py-16">
        <p className={glassTheme.text.secondary}>
          Dashboard features will be populated in later phases
        </p>
      </GlassCard>
    </div>
  );
}
