import { createClerkClient } from "@clerk/nextjs/server";
import { requirePageRole } from "@/lib/auth/guards";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { UserCheck, AlertCircle, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { assignRoleToUser } from "@/app/actions/admin";
import { Suspense } from "react";

export default async function AdminAccountsPage() {
    return (
        <div className="space-y-6">
            <GlassPageHeader
                title="Account Management"
                subtitle="Member Onboarding"
                description="Review and assign roles to pending user accounts."
                icon={<UserCheck className="w-6 h-6 text-emerald-300" />}
            />

            <Suspense fallback={<div className={cn(glassTheme.bg.card, "rounded-xl p-8 text-center", glassTheme.text.secondary)}>Loading accounts...</div>}>
                <PendingAccountsList />
            </Suspense>
        </div>
    );
}

async function PendingAccountsList() {
    const { orgId } = await requirePageRole(["admin"], { requireOrg: true });
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

    try {
        const memberships = await clerkClient.organizations.getOrganizationMembershipList({
            organizationId: orgId!,
        });

        const pendingUsers: any[] = [];
        const assignedUsers: any[] = [];

        for (const membership of memberships.data) {
            const userId = membership.publicUserData?.userId;
            if (!userId) continue;
            const user = await clerkClient.users.getUser(userId);
            const hasRole = user.publicMetadata?.role;

            if (hasRole) {
                assignedUsers.push({ user, membership });
            } else {
                pendingUsers.push({ user, membership });
            }
        }

        return (
            <div className="space-y-6">
                {/* Pending Accounts */}
                <GlassCard variant="default">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                        <AlertCircle className="w-5 h-5 text-amber-300" />
                        <h3 className={cn(glassTheme.typography.h3, glassTheme.text.primary)}>
                            Pending Accounts
                        </h3>
                        <Badge className="ml-auto bg-amber-500/30 text-amber-200 border-amber-400/50">
                            {pendingUsers.length}
                        </Badge>
                    </div>

                    {pendingUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <UserCheck className="w-12 h-12 text-white/20 mx-auto mb-4" />
                            <p className={cn("text-sm", glassTheme.text.secondary)}>
                                No pending accounts. All users have been assigned roles.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingUsers.map(({ user, membership }) => (
                                <div key={user.id} className={cn(
                                    "p-4 rounded-lg border transition-all",
                                    "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                )}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                                "bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 border border-emerald-400/30"
                                            )}>
                                                <Mail className="w-5 h-5 text-emerald-300" />
                                            </div>
                                            <div>
                                                <p className={cn("font-semibold", glassTheme.text.primary)}>
                                                    {user.firstName} {user.lastName}
                                                </p>
                                                <p className={cn("text-sm mt-1", glassTheme.text.secondary)}>
                                                    {user.emailAddresses[0]?.emailAddress}
                                                </p>
                                                <p className={cn("text-xs mt-1", glassTheme.text.muted)}>
                                                    Joined {new Date(user.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                                            Pending
                                        </Badge>
                                    </div>

                                    <div className="flex gap-2">
                                        <form action={async () => {
                                            "use server";
                                            await assignRoleToUser(user.id, "student");
                                        }} className="flex-1">
                                            <Button
                                                type="submit"
                                                className={cn(
                                                    "w-full h-8 text-xs font-semibold",
                                                    "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-400/30 transition-all"
                                                )}
                                            >
                                                Assign Student
                                            </Button>
                                        </form>
                                        <form action={async () => {
                                            "use server";
                                            await assignRoleToUser(user.id, "teacher");
                                        }} className="flex-1">
                                            <Button
                                                type="submit"
                                                className={cn(
                                                    "w-full h-8 text-xs font-semibold",
                                                    "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-400/30 transition-all"
                                                )}
                                            >
                                                Assign Teacher
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </GlassCard>

                {/* Assigned Users */}
                {assignedUsers.length > 0 && (
                    <GlassCard variant="default">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                            <UserCheck className="w-5 h-5 text-emerald-300" />
                            <h3 className={cn(glassTheme.typography.h3, glassTheme.text.primary)}>
                                Assigned Users
                            </h3>
                            <Badge className="ml-auto bg-emerald-500/30 text-emerald-200 border-emerald-400/50">
                                {assignedUsers.length}
                            </Badge>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className={cn("px-4 py-3 text-left font-semibold", glassTheme.text.secondary)}>User</th>
                                        <th className={cn("px-4 py-3 text-left font-semibold", glassTheme.text.secondary)}>Email</th>
                                        <th className={cn("px-4 py-3 text-left font-semibold", glassTheme.text.secondary)}>Role</th>
                                        <th className={cn("px-4 py-3 text-left font-semibold", glassTheme.text.secondary)}>Assigned</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignedUsers.map(({ user }) => (
                                        <tr key={user.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                                            <td className={cn("px-4 py-3", glassTheme.text.primary)}>
                                                {user.firstName} {user.lastName}
                                            </td>
                                            <td className={cn("px-4 py-3 text-xs", glassTheme.text.secondary)}>
                                                {user.emailAddresses[0]?.emailAddress}
                                            </td>
                                            <td className={cn("px-4 py-3")}>
                                                <Badge className={cn(
                                                    user.publicMetadata?.role === "teacher"
                                                        ? "bg-emerald-500/30 text-emerald-200 border-emerald-400/50"
                                                        : "bg-blue-500/30 text-blue-200 border-blue-400/50"
                                                )}>
                                                    {user.publicMetadata?.role}
                                                </Badge>
                                            </td>
                                            <td className={cn("px-4 py-3 text-xs", glassTheme.text.muted)}>
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                )}
            </div>
        );
    } catch (error) {
        console.error("Error fetching accounts:", error);
        return (
            <GlassCard variant="premium" className={cn("border-red-400/30 bg-red-500/10 text-center py-8")}>
                <AlertCircle className="w-8 h-8 text-red-300 mx-auto mb-3" />
                <p className="text-red-300 font-semibold">Error Loading Accounts</p>
                <p className={cn("text-sm mt-1", "text-red-200/70")}>Please try again later or contact support.</p>
            </GlassCard>
        );
    }
}
