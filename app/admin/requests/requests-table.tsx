"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { approveUser, rejectUser } from "@/app/actions/admin";
import type { AssignableRole, Role, UserStatus } from "@/lib/auth/roles";

export type RequestRow = {
  userId: string;
  email: string;
  name: string;
  role: Role | null;
  status: UserStatus;
  createdAt: string;
};

const ASSIGNABLE: AssignableRole[] = ["student", "teacher", "parent"];

const roleStyles: Record<string, string> = {
  super_admin: "bg-amber-500/20 text-amber-200 border-amber-400/30",
  admin: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
  teacher: "bg-blue-500/20 text-blue-200 border-blue-400/30",
  student: "bg-purple-500/20 text-purple-200 border-purple-400/30",
  parent: "bg-cyan-500/20 text-cyan-200 border-cyan-400/30",
};

const statusStyles: Record<UserStatus, string> = {
  pending: "bg-amber-500/20 text-amber-200 border-amber-400/30",
  active: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
  rejected: "bg-red-500/20 text-red-200 border-red-400/30",
  suspended: "bg-red-500/20 text-red-200 border-red-400/30",
};

export function RequestsTable({ rows }: { rows: RequestRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function approve(
    userId: string,
    role: AssignableRole,
    reject: boolean,
  ) {
    setError(null);
    setBusyId(userId);

    if (reject) {
      const reason = window.prompt(
        "Reason for rejection (shown in the audit log):",
      );
      if (!reason?.trim()) {
        setBusyId(null);
        return;
      }
      const result = await rejectUser(userId, reason);
      if (!result.success) setError(result.error);
    } else {
      const result = await approveUser(userId, role);
      if (!result.success) setError(result.error);
    }

    setBusyId(null);
    router.refresh();
  }

  if (rows.length === 0) {
    return (
      <GlassCard variant="default" className="text-center py-16">
        <p className={glassTheme.text.secondary}>No sign-ups yet</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <GlassCard variant="default">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {[
                  "Name",
                  "Email",
                  "Role",
                  "Status",
                  "Signed up",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className={cn(
                      "px-4 py-3 text-left font-semibold",
                      glassTheme.text.secondary,
                    )}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isPending = row.status === "pending";
                const busy = busyId === row.userId;

                return (
                  <tr
                    key={row.userId}
                    className="border-b border-white/10 transition-colors hover:bg-white/5"
                  >
                    <td
                      className={cn(
                        "px-4 py-4 font-medium",
                        glassTheme.text.primary,
                      )}
                    >
                      {row.name}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-4 text-xs",
                        glassTheme.text.secondary,
                      )}
                    >
                      {row.email}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-block rounded-lg border px-2 py-1 text-xs font-medium",
                          row.role
                            ? roleStyles[row.role]
                            : "border-white/10 bg-white/5 text-white/60",
                        )}
                      >
                        {row.role ?? "unassigned"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-block rounded-lg border px-2 py-1 text-xs font-medium",
                          statusStyles[row.status],
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-4 text-xs",
                        glassTheme.text.secondary,
                      )}
                    >
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      {isPending ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {ASSIGNABLE.map((role) => (
                            <button
                              key={role}
                              disabled={busy}
                              onClick={() => approve(row.userId, role, false)}
                              className={cn(
                                "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                                "border border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
                                "hover:border-emerald-400/50 hover:bg-emerald-500/25",
                                "disabled:cursor-not-allowed disabled:opacity-50",
                              )}
                            >
                              <Check className="h-3 w-3" />
                              {role === "student"
                                ? "Student"
                                : role === "teacher"
                                  ? "Teacher"
                                  : "Parent"}
                            </button>
                          ))}
                          <button
                            disabled={busy}
                            onClick={() => approve(row.userId, "student", true)}
                            className={cn(
                              "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                              "border border-red-400/30 bg-red-500/15 text-red-200",
                              "hover:border-red-400/50 hover:bg-red-500/25",
                              "disabled:cursor-not-allowed disabled:opacity-50",
                            )}
                          >
                            <X className="h-3 w-3" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className={cn("text-xs", glassTheme.text.muted)}>
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
