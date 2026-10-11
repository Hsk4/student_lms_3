"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    Users,
    FileText,
    BarChart3,
    Settings,
    GraduationCap,
    LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Courses & Boards", href: "/admin/courses", icon: BookOpen },
    { name: "Users & Faculty", href: "/admin/users", icon: Users },
    { name: "Assignments", href: "/admin/assignments", icon: FileText },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r bg-sidebar text-sidebar-foreground flex flex-col justify-between p-4 min-h-screen">
            <div className="space-y-6">
                {/* Logo Header */}
                <div className="flex items-center gap-3 px-2">
                    <div className="p-2 bg-emerald-600 text-white rounded-xl">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-base leading-none">Fastly LMS</h2>
                        <span className="text-xs text-muted-foreground">Admin Portal</span>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Card callout */}
            <div className="p-4 bg-emerald-950 text-emerald-100 rounded-2xl space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">System Active</p>
                <p className="text-xs text-emerald-200">6 Boards • 24 Active Courses Configured</p>
            </div>
        </aside>
    );
}