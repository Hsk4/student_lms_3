import { requirePagePermission } from "@/lib/auth/guards";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { UserCheck, ShieldAlert } from "lucide-react";
import { Suspense } from "react";
import { clerk } from "@/lib/auth/guards";
import { isRole, isUserStatus } from "@/lib/auth/roles";
import { RequestsTable, type RequestRow } from "./requests-table";

export const instant = false;

const STATUS_ORDER = { pending: 0, active: 1, rejected: 2, suspended: 3 } as const;

async function RequestsList() {
  let rows: RequestRow[] = [];

  try {
    const { data: users } = await clerk.users.getUserList({ limit: 100 });

    rows = users
      .map((user) => {
        const metadata = (user.publicMetadata ?? {}) as { role?: unknown; status?: unknown };
        return {
          userId: user.id,
          email: user.emailAddresses?.[0]?.emailAddress ?? "",
          name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unnamed user",
          role: isRole(metadata.role) ? metadata.role : null,
          status: isUserStatus(metadata.status) ? metadata.status : "pending",
          createdAt: new Date(user.createdAt).toISOString(),
        };
      })
      .sort((a, b) => {
        const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        return byStatus !== 0
          ? byStatus
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  } catch (error) {
    console.error("Error loading access requests:", error);
    return (
      <GlassCard variant="default" className="text-center py-8 border-red-400/30 bg-red-500/10">
        <p className="text-red-300">Could not load pending requests.</p>
      </GlassCard>
    );
  }

  return <RequestsTable rows={rows} />;
}

export default async function AdminRequestsPage() {
  await requirePagePermission("user:manage", { fresh: true });

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="Access Requests"
        subtitle="Onboarding Queue"
        description="Approve or reject sign-ups and assign a role. Only admins can grant access."
        icon={<UserCheck className="w-6 h-6 text-emerald-300" />}
      />

      <div className={cn("flex items-start gap-3 rounded-lg border p-4", "bg-amber-500/10 border-amber-400/30")}>
        <ShieldAlert className="w-5 h-5 text-amber-300 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-100/80">
          Admin and super-admin accounts cannot be created here. The super admin is seeded with
          <code className="mx-1 rounded bg-black/30 px-1.5 py-0.5 text-xs">bun scripts/seed-super-admin.ts</code>.
        </p>
      </div>

      <Suspense
        fallback={
          <GlassCard variant="default" className="py-12 text-center">
            <p className={glassTheme.text.secondary}>Loading requests...</p>
          </GlassCard>
        }
      >
        <RequestsList />
      </Suspense>
    </div>
  );
}
