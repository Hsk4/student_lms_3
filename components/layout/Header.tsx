'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Bot,
  Menu,
  CheckCircle,
  User,
  Settings,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { mockStudentProfile, mockNotifications } from '@/data/mock-data';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  isSidebarCollapsed: boolean;
}

export function Header({ onOpenMobileMenu, isSidebarCollapsed }: HeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/dashboard/courses?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header
      className={cn(
        'h-16 fixed top-0 right-0 z-30 bg-slate-950/70 backdrop-blur-2xl border-b border-indigo-500/15 transition-all duration-300 flex items-center justify-between px-4 sm:px-6',
        isSidebarCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-64'
      )}
    >
      {/* Left: Mobile Menu Trigger & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search courses, assignments, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-100 placeholder-slate-500 transition-all focus:outline-none"
          />
        </form>
      </div>

      {/* Right: Quick actions, notifications, AI trigger, user avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Semester Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/80 border border-indigo-500/20 text-xs text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>Fall 2026 • Week 7</span>
        </div>

        {/* AI Assistant Quick Pill */}
        <Link
          href="/dashboard/assistant"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 text-xs font-semibold shadow-sm transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.25)]"
        >
          <Bot className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
          <span className="hidden sm:inline">Ask AIDA</span>
        </Link>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-950 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-indigo-500/25 shadow-2xl shadow-black/60 p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto my-2 no-scrollbar">
                {notifications.slice(0, 4).map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      'py-2.5 px-2 rounded-lg transition-colors flex flex-col gap-1',
                      !notif.read ? 'bg-indigo-950/25' : 'hover:bg-slate-800/40'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-snug">
                      {notif.message}
                    </p>
                  </div>
                ))}
              </div>

              <Link
                href="/dashboard/notifications"
                onClick={() => setShowNotifications(false)}
                className="w-full py-2 text-center block text-xs font-semibold text-indigo-400 hover:text-indigo-300 border-t border-slate-800 transition-colors"
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-800"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/30">
              {mockStudentProfile.avatar}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-100">
                {mockStudentProfile.name}
              </span>
              <span className="text-[10px] text-emerald-400">
                GPA {mockStudentProfile.cgpa}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-indigo-500/25 shadow-2xl shadow-black/60 p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-bold text-white">{mockStudentProfile.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{mockStudentProfile.email}</p>
              </div>

              <div className="py-1 space-y-0.5">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  <User className="w-4 h-4 text-indigo-400" />
                  Student Profile
                </Link>
                <Link
                  href="/dashboard/results"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  <GraduationCap className="w-4 h-4 text-purple-400" />
                  Grades & Results
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  <Settings className="w-4 h-4 text-cyan-400" />
                  Preferences & Settings
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-800">
                <div className="px-3 py-1.5 text-[11px] text-slate-400">
                  Semester 5 • CSE
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
