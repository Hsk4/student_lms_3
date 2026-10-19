"use client";

import { LayoutDashboard, BookOpen, Users, FileText, Zap, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { DraggableGrid } from "@/components/glass/draggable-grid";

type DashboardItem = 
  | "stats-students"
  | "stats-courses"
  | "stats-pending"
  | "stats-completion"
  | "quick-courses"
  | "quick-users"
  | "quick-analytics"
  | "quick-settings"
  | "welcome"
  | "recent-activity";

export function AdminDashboardContent() {
  const defaultOrder: DashboardItem[] = [
    "stats-students",
    "stats-courses",
    "stats-pending",
    "stats-completion",
    "quick-courses",
    "quick-users",
    "quick-analytics",
    "quick-settings",
    "welcome",
    "recent-activity",
  ];

  const renderItem = (id: DashboardItem, isOver: boolean, isDragging: boolean) => {
    const gridClass = {
      // Stats - 1 column each
      "stats-students": "sm:col-span-1 lg:col-span-3 lg:row-span-2",
      "stats-courses": "sm:col-span-1 lg:col-span-3 lg:row-span-2",
      "stats-pending": "sm:col-span-1 lg:col-span-3 lg:row-span-2",
      "stats-completion": "sm:col-span-1 lg:col-span-3 lg:row-span-2",
      // Quick actions - 1 column each
      "quick-courses": "sm:col-span-1 lg:col-span-3 lg:row-span-2",
      "quick-users": "sm:col-span-1 lg:col-span-3 lg:row-span-2",
      "quick-analytics": "sm:col-span-1 lg:col-span-3 lg:row-span-2",
      "quick-settings": "sm:col-span-1 lg:col-span-3 lg:row-span-2",
      // Welcome - full width
      "welcome": "sm:col-span-2 lg:col-span-6 lg:row-span-2",
      // Recent activity - full width
      "recent-activity": "sm:col-span-2 lg:col-span-12 lg:row-span-2",
    };

    const stats = [
      { id: "stats-students", label: "Total Students", value: "342", color: "teal", icon: Users },
      { id: "stats-courses", label: "Active Courses", value: "24", color: "cyan", icon: BookOpen },
      { id: "stats-pending", label: "Pending Users", value: "8", color: "amber", icon: AlertCircle },
      { id: "stats-completion", label: "Completion Rate", value: "78%", color: "emerald", icon: TrendingUp },
    ];

    const quickLinks = [
      { id: "quick-courses", icon: BookOpen, label: "Manage Courses", href: "/admin/courses", color: "teal" },
      { id: "quick-users", icon: Users, label: "Manage Users", href: "/admin/users", color: "cyan" },
      { id: "quick-analytics", icon: FileText, label: "Analytics", href: "/admin/analytics", color: "emerald" },
      { id: "quick-settings", icon: Zap, label: "Settings", href: "/admin/settings", color: "amber" },
    ];

    // Render stat cards
    const stat = stats.find(s => s.id === id);
    if (stat) {
      const Icon = stat.icon;
      return (
        <div className={cn(gridClass[id])}>
          <GlassCard variant="default" className={cn(isDragging && "opacity-50")}>
            <div className="flex items-start justify-between">
              <div>
                <p className={cn("text-sm", glassTheme.text.secondary)}>{stat.label}</p>
                <p className={cn("text-3xl font-bold mt-2", glassTheme.text.primary)}>{stat.value}</p>
              </div>
              <div className={cn(
                "p-3 rounded-lg border",
                stat.color === "teal" ? "bg-teal-500/20 text-teal-300 border-teal-400/30" :
                stat.color === "cyan" ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/30" :
                stat.color === "amber" ? "bg-amber-500/20 text-amber-300 border-amber-400/30" :
                "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
              )}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </GlassCard>
        </div>
      );
    }

    // Render quick action cards
    const link = quickLinks.find(l => l.id === id);
    if (link) {
      const Icon = link.icon;
      return (
        <div className={cn(gridClass[id])}>
          <Link href={link.href} className="h-full">
            <GlassCard variant="default" className={cn("h-full", glassTheme.hover.tealCard, isDragging && "opacity-50")}>
              <div className="flex flex-col items-center gap-3 h-full justify-center text-center">
                <div className={cn(
                  "p-4 rounded-lg",
                  link.color === "teal" ? "bg-teal-500/20 text-teal-300 border border-teal-400/30" :
                  link.color === "cyan" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30" :
                  link.color === "amber" ? "bg-amber-500/20 text-amber-300 border border-amber-400/30" :
                  "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className={cn("font-semibold text-sm", glassTheme.text.primary)}>
                  {link.label}
                </p>
              </div>
            </GlassCard>
          </Link>
        </div>
      );
    }

    // Welcome card
    if (id === "welcome") {
      return (
        <div className={cn(gridClass[id])}>
          <GlassCard variant="default" className={cn(glassTheme.bg.tealPremium, glassTheme.shadow.glowLarge, isDragging && "opacity-50", "h-full")}>
            <div className="flex flex-col justify-between h-full">
              <div>
                <h3 className={cn("text-2xl font-bold mb-2", glassTheme.text.primary)}>Welcome to Admin Panel</h3>
                <p className={cn("text-sm", glassTheme.text.secondary)}>
                  Manage your organization's courses, users, and view real-time analytics. Drag cards to customize your layout.
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </GlassCard>
        </div>
      );
    }

    // Recent activity card
    if (id === "recent-activity") {
      return (
        <div className={cn(gridClass[id])}>
          <GlassCard variant="default" className={cn(isDragging && "opacity-50", "h-full")}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={cn("text-lg font-bold", glassTheme.text.primary)}>Recent Activity</h3>
                <Clock className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="space-y-3">
                {[
                  { action: "User 'John Doe' assigned as Teacher", time: "2 min ago" },
                  { action: "Course 'Mathematics 101' created", time: "1 hour ago" },
                  { action: "10 students enrolled in 'Physics 201'", time: "3 hours ago" },
                  { action: "Admin role granted to 'Sarah Smith'", time: "5 hours ago" },
                ].map((item, i) => (
                  <div key={i} className={cn("flex items-start gap-3 pb-3 border-b", i === 3 ? "border-b-0" : "border-teal-400/20")}>
                    <div className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm", glassTheme.text.primary)}>{item.action}</p>
                      <p className={cn("text-xs mt-1", glassTheme.text.muted)}>{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      );
    }

    return null;
  };

  return (
    <DraggableGrid<DashboardItem>
      items={defaultOrder}
      onReorder={(items) => {
        console.log("New order:", items);
      }}
      storageKey="admin-dashboard-layout"
      children={renderItem}
      gap="md"
    />
  );
}
