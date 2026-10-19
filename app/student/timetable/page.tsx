import { requirePageRole } from "@/lib/auth/guards";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { Calendar } from "lucide-react";

export const instant = false;

export default async function StudentTimetablePage() {
  await requirePageRole(["student"], { requireOrg: true });

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="Weekly Timetable"
        subtitle="Schedule Management"
        description="View your complete class schedule for the week."
        icon={<Calendar className="w-6 h-6 text-teal-400" />}
      />

      <GlassCard variant="default" className="text-center py-16">
        <p className={glassTheme.text.secondary}>No classes scheduled yet</p>
      </GlassCard>
    </div>
  );
}
