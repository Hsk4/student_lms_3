'use client';

import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { Trophy, TrendingUp, BarChart3 } from 'lucide-react';
import { mockResults } from '@/data/mock-data';

export default function StudentResultsPage() {
  const averageScore = Math.round(
    mockResults.reduce((acc, r) => acc + (r.score / r.total) * 100, 0) / mockResults.length
  );

  const getGradeColor = (grade: string) => {
    switch (grade.charAt(0)) {
      case 'A':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      case 'B':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30';
      case 'C':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      default:
        return 'bg-red-500/20 text-red-300 border-red-400/30';
    }
  };

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="Academic Results"
        subtitle="Grade Tracker"
        description="View your exam scores and course grades."
        icon={<Trophy className="w-6 h-6 text-teal-400" />}
      />

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard variant="default">
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-sm", glassTheme.text.secondary)}>Average Score</p>
              <p className={cn("text-4xl font-bold mt-1", glassTheme.text.primary)}>
                {averageScore}%
              </p>
            </div>
            <div className={cn("p-3 rounded-lg", "bg-teal-500/20 text-teal-300 border border-teal-400/30")}>
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="default">
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-sm", glassTheme.text.secondary)}>Total Exams</p>
              <p className={cn("text-4xl font-bold mt-1", glassTheme.text.primary)}>
                {mockResults.length}
              </p>
            </div>
            <div className={cn("p-3 rounded-lg", "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30")}>
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="default">
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-sm", glassTheme.text.secondary)}>Best Grade</p>
              <p className={cn("text-4xl font-bold mt-1", glassTheme.text.primary)}>
                A
              </p>
            </div>
            <div className={cn("p-3 rounded-lg", "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30")}>
              <Trophy className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Results Table */}
      <div className="overflow-hidden rounded-lg border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={cn(glassTheme.bg.glass)}>
                <th className={cn("px-6 py-4 text-left text-sm font-bold", glassTheme.text.primary)}>
                  Course
                </th>
                <th className={cn("px-6 py-4 text-left text-sm font-bold", glassTheme.text.primary)}>
                  Exam Type
                </th>
                <th className={cn("px-6 py-4 text-center text-sm font-bold", glassTheme.text.primary)}>
                  Score
                </th>
                <th className={cn("px-6 py-4 text-center text-sm font-bold", glassTheme.text.primary)}>
                  Percentage
                </th>
                <th className={cn("px-6 py-4 text-center text-sm font-bold", glassTheme.text.primary)}>
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {mockResults.map((result, index) => {
                const percentage = Math.round((result.score / result.total) * 100);
                return (
                  <tr key={index} className={cn("hover:bg-white/5 transition-colors", glassTheme.bg.glass)}>
                    <td className={cn("px-6 py-4 text-sm font-bold", glassTheme.text.primary)}>
                      {result.course}
                    </td>
                    <td className={cn("px-6 py-4 text-sm", glassTheme.text.secondary)}>
                      {result.exam}
                    </td>
                    <td className={cn("px-6 py-4 text-center text-sm font-bold", glassTheme.text.primary)}>
                      {result.score}/{result.total}
                    </td>
                    <td className={cn("px-6 py-4 text-center text-sm font-bold", glassTheme.text.accent)}>
                      {percentage}%
                    </td>
                    <td className={cn("px-6 py-4 text-center")}>
                      <span className={cn(
                        "inline-block px-3 py-1 rounded-lg text-xs font-bold border",
                        getGradeColor(result.grade)
                      )}>
                        {result.grade}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockResults.map((result, index) => (
          <GlassCard key={index} variant="default" className={glassTheme.hover.tealCard}>
            <div className="mb-4">
              <h3 className={cn("font-bold", glassTheme.text.primary)}>{result.course}</h3>
              <p className={cn("text-sm", glassTheme.text.secondary)}>{result.exam}</p>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className={cn("text-xs", glassTheme.text.secondary)}>Score</span>
                <span className={cn("text-sm font-bold", glassTheme.text.primary)}>
                  {result.score}/{result.total}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("text-xs", glassTheme.text.secondary)}>Performance</span>
                  <span className={cn("text-xs font-bold", glassTheme.text.accent)}>
                    {Math.round((result.score / result.total) * 100)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-teal-900/30 overflow-hidden border border-teal-500/20">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-teal-600"
                    style={{ width: `${(result.score / result.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold text-center border",
              getGradeColor(result.grade)
            )}>
              Grade: {result.grade}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
