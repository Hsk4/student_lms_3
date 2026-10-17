'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { CourseCard } from '@/components/stddashboard/CourseCard';
import { Tabs } from '@/components/ui/Tabs';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, BookOpen, Filter, Sparkles, BookMarked } from 'lucide-react';
import { mockCourses } from '@/data/mock-data';

function CoursesContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    { id: 'All', label: 'All Courses', badge: mockCourses.length },
    { id: 'Core Computer Science', label: 'Core CS' },
    { id: 'Artificial Intelligence', label: 'AI & ML' },
    { id: 'Systems Engineering', label: 'Systems' },
    { id: 'Applied Mathematics', label: 'Mathematics' },
    { id: 'Humanities & Ethics', label: 'Humanities' },
  ];

  const filteredCourses = useMemo(() => {
    return mockCourses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || course.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const totalCredits = mockCourses.reduce((acc, c) => acc + c.credits, 0);
  const avgProgress = Math.round(
    mockCourses.reduce((acc, c) => acc + c.progress, 0) / mockCourses.length
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Enrolled Courses"
        description="Explore your registered courses, syllabi, instructor contacts, and completion milestones."
        badge="Fall 2026 Semester"
      />

      {/* Course Stats Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-900/60 border-indigo-500/15 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Enrolled</p>
            <p className="text-xl font-bold text-white">{mockCourses.length} Courses</p>
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-indigo-500/15 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Credits</p>
            <p className="text-xl font-bold text-white">{totalCredits} Credit Hours</p>
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-indigo-500/15 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Average Completion</p>
            <p className="text-xl font-bold text-white">{avgProgress}% Progress</p>
          </div>
        </Card>
      </div>

      {/* Controls: Search and Filter Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-2">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search by code, title, instructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <Tabs
          tabs={categories}
          activeTab={selectedCategory}
          onChange={setSelectedCategory}
          variant="segmented"
        />
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-semibold text-white">No matching courses found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or switching category filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CoursesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-12 text-center text-sm text-slate-400">
          Loading courses...
        </div>
      }
    >
      <CoursesContent />
    </React.Suspense>
  );
}
