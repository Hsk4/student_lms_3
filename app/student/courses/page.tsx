'use client';

import { useState, useMemo } from 'react';
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { BookOpen, Search } from 'lucide-react';
import { mockCourses } from '@/data/mock-data';

export default function StudentCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = useMemo(() => {
    return mockCourses.filter((course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const totalCredits = mockCourses.reduce((acc, c) => acc + (c.students || 0), 0);
  const avgProgress = Math.round(
    mockCourses.reduce((acc, c) => acc + (c.progress || 0), 0) / mockCourses.length
  );

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="Enrolled Courses"
        subtitle="Course Management"
        description="Explore your registered courses, syllabi, and completion progress."
        icon={<BookOpen className="w-6 h-6 text-teal-400" />}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard variant="default">
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-sm", glassTheme.text.secondary)}>Total Enrolled</p>
              <p className={cn("text-3xl font-bold mt-1", glassTheme.text.primary)}>{mockCourses.length}</p>
            </div>
            <div className={cn("p-3 rounded-lg", "bg-teal-500/20 text-teal-300 border border-teal-400/30")}>
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="default">
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-sm", glassTheme.text.secondary)}>Students Reached</p>
              <p className={cn("text-3xl font-bold mt-1", glassTheme.text.primary)}>{totalCredits}</p>
            </div>
            <div className={cn("p-3 rounded-lg", "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30")}>
              <Search className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="default">
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-sm", glassTheme.text.secondary)}>Avg Progress</p>
              <p className={cn("text-3xl font-bold mt-1", glassTheme.text.primary)}>{avgProgress}%</p>
            </div>
            <div className={cn("p-3 rounded-lg", "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30")}>
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-lg",
          glassTheme.bg.glass
        )}>
          <Search className="w-5 h-5 text-white/50" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-white placeholder:text-white/50 flex-1"
          />
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <GlassCard variant="default" className="text-center py-16">
          <p className={glassTheme.text.secondary}>No courses found matching your search</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <GlassCard key={course.id} variant="default" className={glassTheme.hover.tealCard}>
              <div className="mb-4">
                <h3 className={cn("font-bold text-lg", glassTheme.text.primary)}>
                  {course.name}
                </h3>
                <p className={cn("text-sm", glassTheme.text.secondary)}>
                  {course.subject}
                </p>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn("text-xs", glassTheme.text.secondary)}>Progress</span>
                    <span className={cn("text-xs font-bold", glassTheme.text.primary)}>
                      {course.progress}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-teal-900/30 overflow-hidden border border-teal-500/20">
                    <div
                      className="h-full bg-gradient-to-r from-teal-400 to-teal-600"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                <p className={cn("text-xs", glassTheme.text.secondary)}>
                  Instructor: {course.instructor}
                </p>
              </div>

              <button className={cn(
                "w-full px-3 py-2 rounded-lg text-sm font-medium transition-all",
                glassTheme.button.glass
              )}>
                View Course
              </button>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
