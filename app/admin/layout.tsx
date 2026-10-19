import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminUserButton } from "@/app/components/admin-user-button";
import { Search, Bell, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";

import { requirePagePermission } from "@/lib/auth/guards";
import { ORG_PERMISSIONS } from "@/lib/auth/roles";
import { Suspense } from "react";

async function AdminGate({ children }: { children: React.ReactNode }) {
    await requirePagePermission(ORG_PERMISSIONS.memberManage, { fresh: true });
    return <>{children}</>;
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={cn("flex min-h-screen", glassTheme.bg.dark)}>
            {/* Background blur effects */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
            </div>

            <AdminSidebar />
            <div className="flex-1 flex flex-col">
                {/* Top Bar Header - Premium Glass */}
                <header className={cn(
                    "h-20 border-b backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40",
                    glassTheme.bg.glass
                )}>
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                        <input
                            type="text"
                            placeholder="Search courses, students, assignments..."
                            className={cn(
                                "w-full pl-9 pr-4 py-2.5 text-sm rounded-lg backdrop-blur-md",
                                "bg-white/10 border border-white/20 text-white placeholder:text-white/50",
                                "focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all"
                            )}
                        />
                    </div>

                    <div className="flex items-center gap-4 ml-6">
                        <Link href="/admin/courses/new">
                            <Button size="sm" className={cn(
                                "rounded-lg font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl",
                                glassTheme.button.primary
                            )}>
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">New Course</span>
                            </Button>
                        </Link>

                        <button className={cn(
                            "p-2.5 rounded-lg backdrop-blur-md transition-all",
                            glassTheme.bg.glass,
                            "hover:bg-white/20 text-white/70 hover:text-white"
                        )}>
                            <Bell className="w-5 h-5" />
                        </button>

                        <button className={cn(
                            "p-2.5 rounded-lg backdrop-blur-md transition-all flex items-center gap-2",
                            glassTheme.bg.glass,
                            "hover:bg-white/20 text-white/70 hover:text-white"
                        )}>
                            <Sparkles className="w-5 h-5" />
                        </button>

                        <AdminUserButton />
                    </div>
                </header>

                {/* Main Content - Glassmorphic Background */}
                <main className="p-6 space-y-6 flex-1 overflow-auto">
                    <Suspense fallback={null}>
                        <AdminGate>{children}</AdminGate>
                    </Suspense>
                </main>
            </div>
        </div>
    );
}
