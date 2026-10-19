import { requirePageRole } from "@/lib/auth/guards";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { BookOpen } from "lucide-react";

export const instant = false;

export default async function StudentCoursesPage() {
  await requirePageRole(["student"], { requireOrg: true });

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="Enrolled Courses"
        subtitle="Course Management"
        description="Explore your registered courses and subjects."
        icon={<BookOpen className="w-6 h-6 text-teal-400" />}
      />

      <GlassCard variant="default" className="text-center py-16">
        <p className={glassTheme.text.secondary}>No courses enrolled yet</p>
      </GlassCard>
    </div>
  );
}
