import { Suspense } from "react";
import { Building2, TriangleAlert, LayoutDashboard } from "lucide-react";

import { getAdminDashboardData } from "@/lib/admin-dashboard";
import { BentoGrid } from "@/components/admin/dashboard/bento-grid";
import { DashboardSkeleton } from "@/components/admin/dashboard/dashboard-skeleton";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <GlassPageHeader 
        title="Dashboard Overview" 
        subtitle="Analytics & Performance"
        description="Enrollments, curriculum and review activity across your organization."
        icon={<LayoutDashboard className="w-6 h-6 text-teal-400" />}
      />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

async function DashboardContent() {
  const data = await getAdminDashboardData();

  if (!data.hasOrg) {
    return (
      <div className={cn(glassTheme.bg.tealPremium, "rounded-2xl py-20 text-center shadow-xl")}>
        <div className={cn(
          "mx-auto w-16 h-16 rounded-xl flex items-center justify-center mb-4",
          "bg-gradient-to-br from-teal-500/20 to-teal-600/20 border border-teal-400/40"
        )}>
          <Building2 className="w-8 h-8 text-teal-400" />
        </div>
        <h2 className={cn(glassTheme.typography.h3, glassTheme.text.primary, "mb-2")}>
          No organization selected
        </h2>
        <p className={cn("text-base", glassTheme.text.secondary)}>
          Pick or create an organization from the switcher in the top bar to see its courses, people and activity.
        </p>
      </div>
    );
  }

  return (
    <>
      {data.degraded && (
        <div className={cn(
          "flex items-start gap-4 rounded-xl px-6 py-4 text-sm",
          "backdrop-blur-xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 to-amber-600/10",
          glassTheme.shadow.md
        )}>
          <TriangleAlert className="w-5 h-5 text-amber-300 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-200 mb-1">Data Sync Warning</p>
            <p className="text-amber-100/80">
              Some live data couldn&apos;t be loaded, so a few numbers may be missing or zero. Check the server logs and refresh to try again.
            </p>
          </div>
        </div>
      )}
      <BentoGrid data={data} />
    </>
  );
}
