import { requirePageRole } from "@/lib/auth/guards";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { Trophy } from "lucide-react";

export const instant = false;

export default async function StudentResultsPage() {
  await requirePageRole(["student"], { requireOrg: true });

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="Academic Results"
        subtitle="Grade Tracker"
        description="View your exam scores and course grades."
        icon={<Trophy className="w-6 h-6 text-teal-400" />}
      />

      <GlassCard variant="default" className="text-center py-16">
        <p className={glassTheme.text.secondary}>No results available yet</p>
      </GlassCard>
    </div>
  );
}
