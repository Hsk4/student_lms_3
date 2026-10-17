'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  GraduationCap,
  Award,
  Download,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle,
} from 'lucide-react';
import { mockResults, mockStudentProfile } from '@/data/mock-data';

export default function ResultsPage() {
  const [selectedSemesterIndex, setSelectedSemesterIndex] = useState(0);

  const semesterTabs = mockResults.map((sem, idx) => ({
    id: String(idx),
    label: sem.semesterName,
    badge: `GPA ${sem.gpa}`,
  }));

  const activeSemester = mockResults[selectedSemesterIndex];

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (grade.startsWith('B')) return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    if (grade.startsWith('C')) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  const handleDownloadTranscript = () => {
    alert(`Downloading Unofficial Academic Transcript for ${mockStudentProfile.name} (${mockStudentProfile.rollNumber})...`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Grades & Academic Results"
        description="Comprehensive audit of semester grades, credit tallies, and cumulative academic standing."
        badge={`CGPA: ${mockStudentProfile.cgpa}`}
        actions={
          <Button variant="primary" size="sm" onClick={handleDownloadTranscript}>
            <Download className="w-4 h-4 mr-1.5" />
            Download Transcript
          </Button>
        }
      />

      {/* Cumulative Performance Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-slate-900/60 border-purple-500/25">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Cumulative GPA</span>
            <GraduationCap className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-white mt-2">{mockStudentProfile.cgpa}</p>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Consistent Top Tier
          </p>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-indigo-500/25">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Degree Credits</span>
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-white mt-2">
            {mockStudentProfile.creditsCompleted}{' '}
            <span className="text-sm font-normal text-slate-400">/ {mockStudentProfile.totalCredits}</span>
          </p>
          <div className="mt-2">
            <ProgressBar
              value={(mockStudentProfile.creditsCompleted / mockStudentProfile.totalCredits) * 100}
              size="sm"
              color="indigo"
            />
          </div>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-cyan-500/25">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Academic Honor</span>
            <Award className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-xl font-bold text-cyan-300 mt-2">Dean&apos;s Honor List</p>
          <p className="text-xs text-slate-400 mt-1">Shortlisted 4 consecutive terms</p>
        </Card>

        <Card className="p-5 bg-slate-900/60 border-emerald-500/25">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Term Standing</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 mt-2">Good Standing</p>
          <p className="text-xs text-slate-400 mt-1">Zero academic flags</p>
        </Card>
      </div>

      {/* Semester Selector Tabs */}
      <div className="pt-2">
        <Tabs
          tabs={semesterTabs}
          activeTab={String(selectedSemesterIndex)}
          onChange={(val) => setSelectedSemesterIndex(Number(val))}
          variant="segmented"
        />
      </div>

      {/* Detailed Semester Course Grades Table */}
      <Card className="border-indigo-500/15 overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base text-white">
              {activeSemester.semesterName} Course Grade Sheet
            </CardTitle>
            <p className="text-xs text-slate-400">
              Total Credits: {activeSemester.credits} • Semester GPA: {activeSemester.gpa}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Term GPA: {activeSemester.gpa} / 4.00
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-5">Course Code</th>
                  <th className="py-3.5 px-5">Course Title</th>
                  <th className="py-3.5 px-5">Credits</th>
                  <th className="py-3.5 px-5">Marks / 100</th>
                  <th className="py-3.5 px-5">Grade Point</th>
                  <th className="py-3.5 px-5 text-right">Letter Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activeSemester.courses.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-indigo-300">
                      {item.code}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-100">
                      {item.title}
                    </td>
                    <td className="py-3.5 px-5 text-slate-300">{item.credits}</td>
                    <td className="py-3.5 px-5 text-slate-300">
                      {item.marks} / {item.maxMarks}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-300">
                      {item.gradePoint.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span
                        className={`inline-block font-mono font-extrabold px-3 py-1 rounded-lg text-xs border ${getGradeColor(
                          item.grade
                        )}`}
                      >
                        {item.grade}
                      </span>
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
