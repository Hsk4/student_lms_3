'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  CalendarCheck2,
  GraduationCap,
  CalendarDays,
  Bell,
  User,
  Settings,
  Bot,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockStudentProfile } from '@/data/mock-data';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      title: 'Courses',
      href: '/dashboard/courses',
      icon: BookOpen,
      badge: '6',
    },
    {
      title: 'Assignments',
      href: '/dashboard/assignments',
      icon: FileCheck2,
      badge: '3 Due',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      title: 'Attendance',
      href: '/dashboard/attendance',
      icon: CalendarCheck2,
      badge: '91%',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      title: 'Results',
      href: '/dashboard/results',
      icon: GraduationCap,
      badge: '3.84',
    },
    {
      title: 'Timetable',
      href: '/dashboard/timetable',
      icon: CalendarDays,
      badge: null,
    },
    {
      title: 'Notifications',
      href: '/dashboard/notifications',
      icon: Bell,
      badge: '2 New',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      title: 'AI Assistant',
      href: '/dashboard/assistant',
      icon: Bot,
      isSpecial: true,
      badge: 'Active',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      title: 'Profile',
      href: '/dashboard/profile',
      icon: User,
      badge: null,
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-slate-950/80 backdrop-blur-2xl border-r border-indigo-500/15 transition-all duration-300 select-none shadow-2xl',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-indigo-500/15">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-600/30 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-wide bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                AetherLMS
              </span>
              <span className="text-[10px] text-cyan-400 font-medium tracking-widest uppercase">
                Student Portal
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 no-scrollbar">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Academic Navigation
          </div>
        )}

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative',
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/90 to-blue-600/90 text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850 hover:bg-slate-800/50 border border-transparent',
                item.isSpecial && !isActive && 'border-cyan-500/20 text-cyan-300 hover:border-cyan-500/40 bg-cyan-950/20'
              )}
              title={isCollapsed ? item.title : undefined}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                  isActive ? 'text-white' : item.isSpecial ? 'text-cyan-400' : 'text-slate-400 group-hover:text-indigo-400'
                )}
              />

              {!isCollapsed && (
                <>
                  <span className="truncate flex-1">{item.title}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full font-semibold border shrink-0',
                        item.badgeColor || (isActive ? 'bg-white/20 text-white border-white/30' : 'bg-slate-800 text-slate-300 border-slate-700/60')
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-r-full shadow-[0_0_8px_#06b6d4]" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Profile summary footer */}
      <div className="p-3 border-t border-indigo-500/15">
        <Link
          href="/dashboard/profile"
          className={cn(
            'flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-slate-800/60 group',
            isCollapsed && 'justify-center'
          )}
          title={isCollapsed ? `${mockStudentProfile.name} (CGPA ${mockStudentProfile.cgpa})` : undefined}
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-md shadow-purple-600/30 ring-1 ring-purple-400/40">
            {mockStudentProfile.avatar}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden flex-1">
              <div className="text-xs font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                {mockStudentProfile.name}
              </div>
              <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5">
                <span>{mockStudentProfile.rollNumber}</span>
                <span className="text-emerald-400 font-semibold">• GPA {mockStudentProfile.cgpa}</span>
              </div>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
