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
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockStudentProfile } from '@/data/mock-data';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  const navItems = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Courses', href: '/dashboard/courses', icon: BookOpen },
    { title: 'Assignments', href: '/dashboard/assignments', icon: FileCheck2 },
    { title: 'Attendance', href: '/dashboard/attendance', icon: CalendarCheck2 },
    { title: 'Results', href: '/dashboard/results', icon: GraduationCap },
    { title: 'Timetable', href: '/dashboard/timetable', icon: CalendarDays },
    { title: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { title: 'AI Assistant', href: '/dashboard/assistant', icon: Bot, isSpecial: true },
    { title: 'Profile', href: '/dashboard/profile', icon: User },
    { title: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-950/95 border-r border-indigo-500/20 p-5 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
        <div className="flex items-center justify-between pb-4 border-b border-indigo-500/15">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-600/30">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                AetherLMS
              </span>
              <p className="text-[10px] text-cyan-400 font-medium">Student Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto py-4 space-y-1 no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850 hover:bg-slate-800/50',
                  item.isSpecial && !isActive && 'text-cyan-400 border border-cyan-500/20 bg-cyan-950/20'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive ? 'text-white' : item.isSpecial ? 'text-cyan-400' : 'text-slate-400')} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>

        {/* Profile Card Footer */}
        <div className="pt-4 border-t border-indigo-500/15">
          <div className="flex items-center gap-3 p-2 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs">
              {mockStudentProfile.avatar}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{mockStudentProfile.name}</p>
              <p className="text-[10px] text-emerald-400 font-medium">CGPA: {mockStudentProfile.cgpa}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
