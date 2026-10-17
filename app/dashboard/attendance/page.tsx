'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import {
  CalendarCheck2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Info,
} from 'lucide-react';
import { mockAttendance } from '@/data/mock-data';

export default function AttendancePage() {
  const [selectedCourseId, setSelectedCourseId] = useState(mockAttendance[0].id);

  const selectedRecord =
    mockAttendance.find((rec) => rec.id === selectedCourseId) || mockAttendance[0];

  const totalClassesAll = mockAttendance.reduce((acc, r) => acc + r.totalClasses, 0);
  const attendedClassesAll = mockAttendance.reduce((acc, r) => acc + r.attendedClasses, 0);
  const overallPercentage = ((attendedClassesAll / totalClassesAll) * 100).toFixed(1);

  const courseTabs = mockAttendance.map((rec) => ({
    id: rec.id,
    label: rec.courseCode,
    badge: `${rec.percentage}%`,
  }));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3" />
            Present
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            Absent
          </span>
        );
      case 'leave':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            Excused Leave
          </span>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Attendance & Participation"
        description="Monitor physical and laboratory attendance logs to ensure compliance with university exam regulations."
        badge="Threshold: 75%"
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-slate-900/60 border-emerald-500/20 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Overall Rate</p>
            <p className="text-3xl font-extrabold text-emerald-400 mt-1">{overallPercentage}%</p>
            <p className="text-xs text-slate-400 mt-0.5">Eligibility: Verified</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CalendarCheck2 className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-indigo-500/20 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Attended / Total</p>
            <p className="text-3xl font-extrabold text-white mt-1">
              {attendedClassesAll} <span className="text-sm font-normal text-slate-400">/ {totalClassesAll}</span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Sessions conducted</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <CheckCircle className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-amber-500/20 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Permissible Absences</p>
            <p className="text-3xl font-extrabold text-amber-400 mt-1">7 Remaining</p>
            <p className="text-xs text-slate-400 mt-0.5">Before 75% warning</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* University Threshold Advisory */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white">Academic Policy Notice:</strong> All accredited programs require a minimum of 75.0% verified physical attendance to qualify for End-Semester Examinations. Currently all 6 of your courses are safely above the threshold.
        </div>
      </div>

      {/* Course Breakdown Cards */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white tracking-tight">Course Attendance Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockAttendance.map((rec) => (
            <Card
              key={rec.id}
              hoverEffect
              onClick={() => setSelectedCourseId(rec.id)}
              className={`p-4 cursor-pointer transition-all border ${
                selectedCourseId === rec.id
                  ? 'border-indigo-500 ring-1 ring-indigo-500/40 bg-indigo-950/20'
                  : 'border-slate-800 hover:border-indigo-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                  {rec.courseCode}
                </span>
                <span className="text-xs font-bold text-emerald-400">{rec.percentage}%</span>
              </div>
              <p className="text-xs font-semibold text-white line-clamp-1 mb-1">
                {rec.courseTitle}
              </p>
              <div className="space-y-1 mt-3">
                <ProgressBar
                  value={rec.percentage}
                  size="sm"
                  color={rec.percentage >= 90 ? 'emerald' : 'indigo'}
                />
                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>{rec.attendedClasses} / {rec.totalClasses} Lectures</span>
                  <span className="text-indigo-300 hover:underline">View History →</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Course Session History Detail */}
      <Card className="border-indigo-500/15 overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base text-white">
                Detailed Log: {selectedRecord.courseCode} — {selectedRecord.courseTitle}
              </CardTitle>
              <p className="text-xs text-slate-400">
                Instructor: {selectedRecord.instructor} • Logged Sessions
              </p>
            </div>
            <Tabs
              tabs={courseTabs}
              activeTab={selectedCourseId}
              onChange={setSelectedCourseId}
              variant="segmented"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-5">Session Date</th>
                  <th className="py-3 px-5">Lecture Topic Covered</th>
                  <th className="py-3 px-5">Duration</th>
                  <th className="py-3 px-5 text-right">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {selectedRecord.history.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-5 font-medium text-slate-200 whitespace-nowrap">
                      {log.date}
                    </td>
                    <td className="py-3 px-5 text-slate-300 font-normal">
                      {log.topic}
                    </td>
                    <td className="py-3 px-5 text-slate-400 whitespace-nowrap">
                      {log.duration}
                    </td>
                    <td className="py-3 px-5 text-right whitespace-nowrap">
                      {getStatusBadge(log.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
