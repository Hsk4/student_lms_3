'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Bot,
  BellRing,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { mockTimetable } from '@/data/mock-data';
import { DayOfWeek, TimetableSlot } from '@/types/dashboard';

export default function TimetablePage() {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [reminders, setReminders] = useState<Record<string, boolean>>({});

  const days: { id: DayOfWeek; label: string; badge?: number }[] = [
    { id: 'Monday', label: 'Monday', badge: 2 },
    { id: 'Tuesday', label: 'Tuesday', badge: 2 },
    { id: 'Wednesday', label: 'Wednesday', badge: 3 },
    { id: 'Thursday', label: 'Thursday', badge: 2 },
    { id: 'Friday', label: 'Friday', badge: 2 },
    { id: 'Saturday', label: 'Saturday', badge: 1 },
  ];

  const currentSlots = mockTimetable.filter((slot) => slot.day === selectedDay);

  const toggleReminder = (id: string) => {
    setReminders((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getTypeBadge = (type: TimetableSlot['type']) => {
    switch (type) {
      case 'Lecture':
        return <Badge variant="info">Lecture</Badge>;
      case 'Lab':
        return <Badge variant="purple">Lab Session</Badge>;
      case 'Tutorial':
        return <Badge variant="cyan">Tutorial</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Class Timetable & Schedule"
        description="Weekly lecture hours, laboratory allocations, and interactive class timetable."
        badge="Active Term"
        actions={
          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-indigo-500/20">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Time Zone: Local Campus Time (UTC-5)</span>
          </div>
        }
      />

      {/* Day Selector Tabs */}
      <div className="pt-1">
        <Tabs
          tabs={days}
          activeTab={selectedDay}
          onChange={(val) => setSelectedDay(val as DayOfWeek)}
          variant="segmented"
        />
      </div>

      {/* Day Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-400" />
            <span>{selectedDay} Schedule</span>
          </h2>
          <span className="text-xs text-slate-400">
            {currentSlots.length} Scheduled Sessions
          </span>
        </div>

        {currentSlots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentSlots.map((slot) => {
              const isReminded = reminders[slot.id];
              return (
                <Card
                  key={slot.id}
                  hoverEffect
                  className="p-5 border-l-4 border-l-indigo-500 flex flex-col justify-between border-indigo-500/15"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                          {slot.courseCode}
                        </span>
                        {getTypeBadge(slot.type)}
                      </div>
                      <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-bold bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {slot.startTime} – {slot.endTime}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {slot.courseTitle}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                          {slot.room}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-400" />
                          {slot.instructor}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                    <button
                      onClick={() => toggleReminder(slot.id)}
                      className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                        isReminded
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                          : 'text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800/60'
                      }`}
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      <span>{isReminded ? 'Alarm Set' : 'Set Alarm'}</span>
                    </button>

                    <Link href="/dashboard/assistant">
                      <Button variant="ghost" size="sm" className="text-xs text-cyan-300 hover:text-cyan-200">
                        <Bot className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                        Ask AI Topic
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
            <CalendarDays className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-lg font-semibold text-white">No classes scheduled</h3>
            <p className="text-xs text-slate-400">
              Enjoy your study break or use this time to catch up on assignments.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
