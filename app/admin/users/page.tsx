import { auth, createClerkClient } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toggleUserStatus, updateUserRole } from "@/app/actions/admin";
import { UserCog, ShieldAlert, ShieldCheck, UserMinus, UserPlus } from "lucide-react";
import { Suspense } from "react";

export default function AdminUsersPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage roles and account status for faculty and students.
                    </p>
                </div>
            </div>

            <Suspense fallback={<div>Loading members...</div>}>
                <MembersList />
            </Suspense>
        </div>
    );
}

async function MembersList() {
    const { orgId } = await auth();
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

    // In a real app, you'd probably use a search/filter, but for now we list organization members
    const memberships = await clerkClient.organizations.getOrganizationMembershipList({
        organizationId: orgId!,
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Organization Members</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left text-muted-foreground">
                        <thead className="text-xs uppercase bg-muted/50">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {memberships.data.map((membership) => (
                                <Suspense key={membership.id} fallback={<tr><td colSpan={4}>Loading user...</td></tr>}>
                                    <UserRow membership={membership} />
                                </Suspense>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

// Separate component to handle actions in a real app, but here we'll use Server Actions
async function UserRow({ membership }: { membership: any }) {
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const user = await clerkClient.users.getUser(membership.publicUserData.userId);
    const status = (user.publicMetadata as { status?: string })?.status || "active";
    const role = (user.publicMetadata as { role?: string })?.role || membership.role.replace("org:", "");

    return (
        <tr className="border-b hover:bg-muted/30 transition-colors">
            <td className="px-6 py-4 font-medium text-foreground">
                <div className="flex flex-col">
                    <span>{user.firstName} {user.lastName}</span>
                    <span className="text-xs text-muted-foreground">{user.emailAddresses[0].emailAddress}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <Badge variant="outline" className="capitalize">{role}</Badge>
            </td>
            <td className="px-6 py-4">
                <Badge className={status === "active" ? "bg-emerald-500" : "bg-destructive"}>
                    {status}
                </Badge>
            </td>
            <td className="px-6 py-4 text-right space-x-2">
                <form action={async () => {
                    "use server";
                    await toggleUserStatus(user.id, status);
                }} className="inline">
                    <Button size="sm" variant="ghost" className={status === "active" ? "text-destructive" : "text-emerald-600"}>
                        {status === "active" ? <UserMinus className="w-4 h-4 mr-1" /> : <UserPlus className="w-4 h-4 mr-1" />}
                        {status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                </form>

                <form action={async () => {
                    "use server";
                    // Toggle between teacher/student for demo
                    const newRole = role === "teacher" ? "student" : "teacher";
                    await updateUserRole(user.id, newRole);
                }} className="inline">
                    <Button size="sm" variant="ghost">
                        <UserCog className="w-4 h-4 mr-1" />
                        Change Role
                    </Button>
                </form>
            </td>
        </tr>
    );
}
