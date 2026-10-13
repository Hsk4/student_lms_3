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
    UserCheck,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { glassTheme } from "@/lib/theme/glass";

const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Accounts", href: "/admin/accounts", icon: UserCheck },
    { name: "Courses & Boards", href: "/admin/courses", icon: BookOpen },
    { name: "Users & Faculty", href: "/admin/users", icon: Users },
    { name: "Assignments", href: "/admin/assignments", icon: FileText },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className={cn(
            "w-64 border-r backdrop-blur-xl flex flex-col justify-between p-6 min-h-screen",
            glassTheme.bg.sidebar
        )}>
            <div className="space-y-8">
                {/* Logo Header - Premium Glass Card */}
                <Link href="/admin" className="flex items-center gap-3 group">
                    <div className={cn(
                        "p-2.5 rounded-lg transition-all shadow-lg group-hover:shadow-xl group-hover:scale-110",
                        glassTheme.gradient.emerald
                    )}>
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className={cn("font-black text-lg leading-none", glassTheme.text.primary)}>
                            Fastly
                        </h2>
                        <span className={cn("text-xs font-semibold tracking-wider", glassTheme.text.secondary)}>
                            LMS ADMIN
                        </span>
                    </div>
                </Link>

                {/* Navigation Menu - Enhanced */}
                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                                    isActive
                                        ? cn(
                                            glassTheme.bg.premium,
                                            "text-white shadow-lg",
                                            "border-emerald-400/50"
                                        )
                                        : cn(
                                            glassTheme.text.secondary,
                                            "hover:text-white hover:bg-white/5 hover:border-white/10"
                                        )
                                )}
                            >
                                <Icon className={cn(
                                    "w-5 h-5 transition-transform",
                                    isActive ? "text-emerald-300 scale-110" : "text-white/60 group-hover:scale-110"
                                )} />
                                <span>{item.name}</span>
                                {isActive && (
                                    <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Info Card - Premium Glass */}
            <div className={cn(
                "p-4 rounded-xl space-y-3",
                "bg-linear-to-br from-emerald-500/15 to-emerald-600/10 border border-emerald-400/30",
                "backdrop-blur-md shadow-lg"
            )}>
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-300" />
                    <p className={cn("text-xs font-bold uppercase tracking-wider text-emerald-200")}>
                        System Active
                    </p>
                </div>
                <p className={cn("text-xs leading-relaxed text-emerald-100/80")}>
                    6 Boards • 24 Active Courses
                </p>
            </div>
        </aside>
    );
}
