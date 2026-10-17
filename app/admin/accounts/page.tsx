"use client";

import { useEffect, useState } from "react";
import { UserCheck, Mail, Calendar, ShieldCheck, Clock } from "lucide-react";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { assignRoleToUser } from "@/app/actions/admin";

interface PendingUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  role: "student" | "teacher" | null;
}

export default function AdminAccountsPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setPendingUsers(data.pending || []);
      setAssignedUsers(data.assigned || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (userId: string, role: "student" | "teacher") => {
    setAssigning(userId);
    try {
      const result = await assignRoleToUser(userId, role) as any;
      if (result?.success) {
        // Move user from pending to assigned
        const user = pendingUsers.find(u => u.userId === userId);
        if (user) {
          setPendingUsers(pendingUsers.filter(u => u.userId !== userId));
          setAssignedUsers([...assignedUsers, { ...user, role }]);
        }
      } else {
        setError(result.error || "Failed to assign role");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign role");
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="Account Management"
        subtitle="Member Onboarding"
        description="Review and assign roles to pending user accounts."
        icon={<UserCheck className="w-6 h-6 text-teal-400" />}
      />

      {error && (
        <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4 text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <p className={glassTheme.text.secondary}>Loading accounts...</p>
        </div>
      ) : (
        <>
          {/* Pending Users Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400" />
              <h2 className={cn("text-xl font-bold", glassTheme.text.primary)}>
                Pending Users ({pendingUsers.length})
              </h2>
            </div>

            {pendingUsers.length === 0 ? (
              <GlassCard variant="default" className="text-center py-12">
                <p className={glassTheme.text.secondary}>No pending users awaiting role assignment</p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pendingUsers.map((user) => (
                  <GlassCard key={user.userId} variant="default">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={cn("text-lg font-semibold", glassTheme.text.primary)}>
                            {user.firstName} {user.lastName}
                          </h3>
                          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-400/30">
                            Pending
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-teal-400" />
                            <span className={glassTheme.text.secondary}>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-teal-400" />
                            <span className={glassTheme.text.secondary}>
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => handleAssignRole(user.userId, "student")}
                          disabled={assigning === user.userId}
                          className={cn(
                            "px-4 py-2 rounded-lg font-semibold text-sm transition-all",
                            "bg-blue-500/20 border border-blue-400/30",
                            "text-blue-300 hover:bg-blue-500/30 hover:border-blue-400/50",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                          )}
                        >
                          {assigning === user.userId ? "Assigning..." : "Student"}
                        </button>
                        <button
                          onClick={() => handleAssignRole(user.userId, "teacher")}
                          disabled={assigning === user.userId}
                          className={cn(
                            "px-4 py-2 rounded-lg font-semibold text-sm transition-all",
                            "bg-emerald-500/20 border border-emerald-400/30",
                            "text-emerald-300 hover:bg-emerald-500/30 hover:border-emerald-400/50",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                          )}
                        >
                          {assigning === user.userId ? "Assigning..." : "Teacher"}
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Users Section */}
          <div className="space-y-4 pt-8 border-t border-teal-500/20">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className={cn("text-xl font-bold", glassTheme.text.primary)}>
                Assigned Users ({assignedUsers.length})
              </h2>
            </div>

            {assignedUsers.length === 0 ? (
              <GlassCard variant="default" className="text-center py-12">
                <p className={glassTheme.text.secondary}>No users have been assigned roles yet</p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {assignedUsers.map((user) => (
                  <GlassCard key={user.userId} variant="default">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={cn("text-lg font-semibold", glassTheme.text.primary)}>
                            {user.firstName} {user.lastName}
                          </h3>
                          <span className={cn(
                            "px-2 py-1 rounded-lg text-xs font-medium border",
                            user.role === "teacher"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                              : "bg-blue-500/20 text-blue-300 border-blue-400/30"
                          )}>
                            {user.role === "teacher" ? "Teacher" : "Student"}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-teal-400" />
                            <span className={glassTheme.text.secondary}>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-teal-400" />
                            <span className={glassTheme.text.secondary}>
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
