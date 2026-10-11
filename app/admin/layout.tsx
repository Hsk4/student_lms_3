import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { UserButton } from "@clerk/nextjs";
import { Search, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function AdminHeaderContent() {
    const { orgRole } = await auth();
    if (orgRole !== "org:admin") {
        redirect("/");
    }
    return null;
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-muted/20">
            <Suspense fallback={null}>
                <AdminHeaderContent />
            </Suspense>
            <AdminSidebar />
            <div className="flex-1 flex flex-col">
                {/* Top Bar Header */}
                <header className="h-16 border-b bg-background px-6 flex items-center justify-between">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search courses, students, or mock papers..."
                            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border bg-muted/40 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/admin/courses/new">
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                                <Plus className="w-4 h-4" /> Add Course
                            </Button>
                        </Link>
                        <div className="p-2 border rounded-full hover:bg-muted cursor-pointer">
                            <Bell className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <Suspense fallback={<div className="w-8 h-8 rounded-full bg-muted animate-pulse" />}>
                            <UserButton />
                        </Suspense>
                    </div>
                </header>

                {/* Main Content Body */}
                <main className="p-6 space-y-6 flex-1">{children}</main>
            </div>
        </div>
    );
}