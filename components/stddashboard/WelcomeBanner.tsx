'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Flame, Clock, ArrowRight, BookOpen, Bot } from 'lucide-react';
import { mockStudentProfile, mockCourses } from '@/data/mock-data';

export function WelcomeBanner() {
  const [greeting, setGreeting] = React.useState('Welcome back');

  React.useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) setGreeting('Good morning');
    else if (currentHour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const nextClass = mockCourses[0]; // CS401

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/70 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl backdrop-blur-xl mb-8">
      {/* Decorative blurred background orbs */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 -mb-10 w-48 h-48 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Academic Excellence Portal</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {greeting},{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              {mockStudentProfile.name.split(' ')[0]}
            </span>{' '}
            ⚡
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            You have <strong className="text-white">3 upcoming assignments</strong> and a lecture on{' '}
            <strong className="text-cyan-300">{nextClass.code}</strong> tomorrow at 09:00 AM.
            Your academic streak is in top 5% of your department.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/80 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>19 Day Study Streak</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Next: {nextClass.room}</span>
            </div>
          </div>
        </div>

        {/* Quick action card inside banner */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px]">
          <Link
            href="/dashboard/assistant"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/30 hover:border-cyan-400/60 transition-all hover:scale-[1.02] group shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                <Bot className="w-5 h-5 text-cyan-300" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Ask AI Tutor
                </p>
                <p className="text-[11px] text-slate-400">Summarize Raft protocol</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/dashboard/courses"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all hover:scale-[1.02] group shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <BookOpen className="w-5 h-5 text-indigo-300" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Continue Learning
                </p>
                <p className="text-[11px] text-slate-400">6 Enrolled Courses</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
