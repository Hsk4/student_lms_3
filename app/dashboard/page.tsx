'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  CalendarCheck2,
  BookOpen,
  FileCheck2,
  ArrowRight,
  Bot,
} from 'lucide-react';
import { WelcomeBanner } from '@/components/stddashboard/WelcomeBanner';
import { StatCard } from '@/components/stddashboard/StatCard';
import { CourseCard } from '@/components/stddashboard/CourseCard';
import { AssignmentCard } from '@/components/stddashboard/AssignmentCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  mockDashboardStats,
  mockCourses,
  mockAssignments,
  mockTimetable,
} from '@/data/mock-data';

export default function DashboardPage() {
  const activeAssignments = mockAssignments.filter((a) => a.status === 'pending');
  const todayClasses = mockTimetable.slice(0, 3); // Preview items

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* 4 Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Cumulative CGPA"
          value="3.84"
          subtitle="Out of 4.00 Scale"
          trend={{ value: '+0.06 vs Term 4', isPositive: true }}
          icon={GraduationCap}
          colorScheme="purple"
        />
        <StatCard
          title="Overall Attendance"
          value={`${mockDashboardStats.averageAttendance}%`}
          subtitle="Across all courses"
          trend={{ value: 'Above 85% threshold', isPositive: true }}
          icon={CalendarCheck2}
          colorScheme="emerald"
        />
        <StatCard
          title="Active Courses"
          value={mockDashboardStats.activeCourses}
          subtitle="19 Total Credits"
          icon={BookOpen}
          colorScheme="indigo"
        />
        <StatCard
          title="Assignments Due"
          value={mockDashboardStats.pendingAssignments}
          subtitle="Next due in 2 days"
          trend={{ value: '1 Critical Priority', isPositive: false }}
          icon={FileCheck2}
          colorScheme="amber"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Active Courses
              </h2>
              <p className="text-xs text-slate-400">
                Current progress and upcoming lectures for Fall 2026
              </p>
            </div>
            <Link href="/dashboard/courses">
              <Button variant="outline" size="sm" className="text-xs">
                View All Courses
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockCourses.slice(0, 4).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>

        {/* Right 1 Col: Schedule & AI */}
        <div className="space-y-6">
          <Card className="border-indigo-500/15">
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base text-white">Today&apos;s Lectures</CardTitle>
                <p className="text-xs text-slate-400">Monday Schedule</p>
              </div>
              <Link href="/dashboard/timetable">
                <span className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                  Full Timetable →
                </span>
              </Link>
            </CardHeader>
            <CardContent className="p-5 pt-2 space-y-3">
              {todayClasses.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/30 transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-300">
                        {item.courseCode}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-200 line-clamp-1">
                      {item.courseTitle}
                    </p>
                    <p className="text-[11px] text-slate-400">{item.room}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-cyan-300 block">
                      {item.startTime}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.endTime}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick AI Study Buddy */}
          <Card
            glow
            className="bg-gradient-to-br from-indigo-950/50 via-slate-900/80 to-cyan-950/40 border-cyan-500/25 p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Bot className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Need Quick Study Help?</h4>
                <p className="text-xs text-slate-400">Ask AIDA about today&apos;s lectures</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              AIDA can instantly generate flashcards, summarize syllabus topics, or explain
              complex algorithmic proofs.
            </p>
            <Link href="/dashboard/assistant">
              <Button variant="cyan" size="sm" className="w-full text-xs">
                Launch AI Study Room
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Pending Assignments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-indigo-400" />
              Pending Assignments
            </h2>
            <p className="text-xs text-slate-400">
              Submit your work before deadline timestamps
            </p>
          </div>
          <Link href="/dashboard/assignments">
            <Button variant="outline" size="sm" className="text-xs">
              All Assignments ({mockAssignments.length})
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeAssignments.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      </div>
    </div>
  );
}