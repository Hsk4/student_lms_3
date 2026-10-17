'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import {
  Bell,
  CheckCircle,
  Clock,
  Award,
  AlertCircle,
  Megaphone,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { mockNotifications } from '@/data/mock-data';
import { NotificationItem } from '@/types/dashboard';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'academic' | 'announcements'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filterTabs = [
    { id: 'all', label: 'All Notifications', badge: notifications.length },
    { id: 'unread', label: 'Unread', badge: unreadCount },
    { id: 'academic', label: 'Grades & Tasks' },
    { id: 'announcements', label: 'Announcements' },
  ];

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearRead = () => {
    setNotifications((prev) => prev.filter((n) => !n.read));
  };

  const filteredList = useMemo(() => {
    return notifications.filter((item) => {
      if (activeFilter === 'unread') return !item.read;
      if (activeFilter === 'academic')
        return item.type === 'grade' || item.type === 'assignment' || item.type === 'reminder';
      if (activeFilter === 'announcements')
        return item.type === 'announcement' || item.type === 'system';
      return true;
    });
  }, [notifications, activeFilter]);

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'grade':
        return <Award className="w-5 h-5 text-emerald-400" />;
      case 'assignment':
      case 'reminder':
        return <Clock className="w-5 h-5 text-amber-400" />;
      case 'announcement':
        return <Megaphone className="w-5 h-5 text-cyan-400" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Student Notifications"
        description="Important alerts, assignment grading notices, venue relocations, and official university announcements."
        badge={`${unreadCount} Unread`}
        actions={
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
                <CheckCircle className="w-4 h-4 mr-1.5 text-indigo-400" />
                Mark all read
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleClearRead}>
              <Trash2 className="w-4 h-4 mr-1.5 text-slate-400" />
              Clear read
            </Button>
          </div>
        }
      />

      <div className="pt-1">
        <Tabs
          tabs={filterTabs}
          activeTab={activeFilter}
          onChange={(val) => setActiveFilter(val as typeof activeFilter)}
          variant="segmented"
        />
      </div>

      {filteredList.length > 0 ? (
        <div className="space-y-3">
          {filteredList.map((notif) => (
            <Card
              key={notif.id}
              hoverEffect
              className={`p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${
                !notif.read
                  ? 'border-indigo-500/40 bg-indigo-950/20'
                  : 'border-slate-800/80 bg-slate-900/60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                  {getNotifIcon(notif.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{notif.title}</h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    {notif.message}
                  </p>
                  <p className="text-[11px] text-slate-400 pt-0.5">{notif.timestamp}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => handleToggleRead(notif.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  {notif.read ? 'Mark Unread' : 'Mark Read'}
                </button>

                {notif.actionUrl && (
                  <Link href={notif.actionUrl}>
                    <Button variant="outline" size="sm" className="text-xs">
                      View
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <Bell className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-semibold text-white">No notifications</h3>
          <p className="text-xs text-slate-400">
            You&apos;re completely up to date. Check back later for announcements.
          </p>
        </div>
      )}
    </div>
  );
}
