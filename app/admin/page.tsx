import { Suspense } from "react";
import { Building2, TriangleAlert } from "lucide-react";

import { getAdminDashboardData } from "@/lib/admin-dashboard";
import { BentoGrid } from "@/components/admin/dashboard/bento-grid";
import { DashboardSkeleton } from "@/components/admin/dashboard/dashboard-skeleton";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Static shell: prerendered instantly, data streams in below */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground">
          Enrollments, curriculum and review activity across your organization.
        </p>
      </div>

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
      <div className="grid place-items-center rounded-2xl border border-dashed py-20 text-center">
        <div className="grid size-12 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
          <Building2 className="size-6" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">No organization selected</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Pick or create an organization from the switcher in the top bar to see its
          courses, people and activity.
        </p>
      </div>
    );
  }

  return (
    <>
      {data.degraded && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            Some live data couldn&apos;t be loaded, so a few numbers may be missing or
            zero. Check the server logs and refresh to try again.
          </p>
        </div>
      )}
      <BentoGrid data={data} />
    </>
  );
}
