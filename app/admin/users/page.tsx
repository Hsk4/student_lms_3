import { clerk, requirePagePermission } from "@/lib/auth/guards";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { Users, User } from "lucide-react";
import { Suspense } from "react";

export default async function AdminUsersPage() {
  await requirePagePermission("user:manage", { fresh: true });

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="Users & Faculty"
        subtitle="Member Management"
        description="Manage school members, roles, and permissions."
        icon={<Users className="w-6 h-6 text-emerald-300" />}
      />
      <Suspense
        fallback={
          <div
            className={cn(
              glassTheme.bg.card,
              "rounded-xl p-8 text-center",
              glassTheme.text.secondary,
            )}
          >
            Loading members...
          </div>
        }
      >
        <UsersList />
      </Suspense>
    </div>
  );
}

async function UsersList() {
  try {
    const { data: users } = await clerk.users.getUserList({ limit: 100 });

    if (users.length === 0) {
      return (
        <GlassCard variant="premium" className="text-center py-16">
          <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <h3
            className={cn(
              glassTheme.typography.h3,
              glassTheme.text.primary,
              "mb-2",
            )}
          >
            No members yet
          </h3>
          <p className={glassTheme.text.secondary}>
            Users appear here after they sign up
          </p>
        </GlassCard>
      );
    }

    return (
      <GlassCard variant="default">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th
                  className={cn(
                    "px-4 py-3 text-left font-semibold",
                    glassTheme.text.secondary,
                  )}
                >
                  Name
                </th>
                <th
                  className={cn(
                    "px-4 py-3 text-left font-semibold",
                    glassTheme.text.secondary,
                  )}
                >
                  Email
                </th>
                <th
                  className={cn(
                    "px-4 py-3 text-left font-semibold",
                    glassTheme.text.secondary,
                  )}
                >
                  Role
                </th>
                <th
                  className={cn(
                    "px-4 py-3 text-left font-semibold",
                    glassTheme.text.secondary,
                  )}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const metadata = user.publicMetadata as {
                  role?: string;
                  status?: string;
                };
                const role = metadata.role || "unassigned";
                const status = user.banned
                  ? "suspended"
                  : metadata.status || "pending";

                return (
                  <tr
                    key={user.id}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className={cn("px-4 py-4", glassTheme.text.primary)}>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            "bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 border border-emerald-400/30",
                          )}
                        >
                          <User className="w-4 h-4 text-emerald-300" />
                        </div>
                        <p className="font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-4 text-xs",
                        glassTheme.text.secondary,
                      )}
                    >
                      {user.emailAddresses?.[0]?.emailAddress || "N/A"}
                    </td>
                    <td className={cn("px-4 py-4", glassTheme.text.primary)}>
                      <span
                        className={cn(
                          "inline-block px-2 py-1 rounded-lg text-xs font-medium",
                          role === "admin"
                            ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30"
                            : role === "teacher"
                              ? "bg-blue-500/20 text-blue-200 border border-blue-400/30"
                              : role === "student"
                                ? "bg-purple-500/20 text-purple-200 border border-purple-400/30"
                                : "bg-white/5 text-white/60 border border-white/10",
                        )}
                      >
                        {role}
                      </span>
                    </td>
                    <td className={cn("px-4 py-4", glassTheme.text.primary)}>
                      <span
                        className={cn(
                          "inline-block px-2 py-1 rounded-lg text-xs font-medium",
                          status === "active"
                            ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30"
                            : status === "pending"
                              ? "bg-amber-500/20 text-amber-200 border border-amber-400/30"
                              : "bg-red-500/20 text-red-200 border border-red-400/30",
                        )}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    );
  } catch (error) {
    console.error("Error fetching members:", error);
    return (
      <GlassCard
        variant="premium"
        className={cn("text-center py-8 border-red-400/30 bg-red-500/10")}
      >
        <p className="text-red-300">Error loading members. Please try again.</p>
      </GlassCard>
    );
  }
}
