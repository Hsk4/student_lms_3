'use client';

import { useState, useMemo } from 'react';
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { FileCheck2, Search, Filter } from 'lucide-react';
import { mockAssignments } from '@/data/mock-data';

export default function StudentAssignmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  const statuses = [
    { value: 'all' as const, label: 'All', color: 'teal' },
    { value: 'pending' as const, label: 'Pending', color: 'amber' },
    { value: 'submitted' as const, label: 'Submitted', color: 'cyan' },
    { value: 'graded' as const, label: 'Graded', color: 'emerald' },
  ];

  const filteredAssignments = useMemo(() => {
    return mockAssignments.filter((assignment) => {
      const matchesSearch =
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.course.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const counts = {
    all: mockAssignments.length,
    pending: mockAssignments.filter((a) => a.status === 'pending').length,
    submitted: mockAssignments.filter((a) => a.status === 'submitted').length,
    graded: mockAssignments.filter((a) => a.status === 'graded').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      case 'submitted':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30';
      case 'graded':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      default:
        return 'bg-teal-500/20 text-teal-300 border-teal-400/30';
    }
  };

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="Assignments & Submissions"
        subtitle="Task Management"
        description="Track your assignments, submissions, and grades."
        icon={<FileCheck2 className="w-6 h-6 text-teal-400" />}
      />

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statuses.map((status) => (
          <GlassCard key={status.value} variant="default">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-sm", glassTheme.text.secondary)}>{status.label}</p>
                <p className={cn("text-3xl font-bold mt-1", glassTheme.text.primary)}>
                  {counts[status.value]}
                </p>
              </div>
              <div className={cn("p-3 rounded-lg border", `bg-${status.color}-500/20 text-${status.color}-300 border-${status.color}-400/30`)}>
                <FileCheck2 className="w-6 h-6" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-lg flex-1",
          glassTheme.bg.glass
        )}>
          <Search className="w-5 h-5 text-white/50" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-white placeholder:text-white/50 flex-1"
          />
        </div>

        <div className="flex gap-2">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                statusFilter === status.value
                  ? glassTheme.button.primary
                  : glassTheme.button.glass
              )}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments Grid */}
      {filteredAssignments.length === 0 ? (
        <GlassCard variant="default" className="text-center py-16">
          <p className={glassTheme.text.secondary}>No assignments found</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssignments.map((assignment) => (
            <GlassCard key={assignment.id} variant="default" className={glassTheme.hover.tealCard}>
              <div className="mb-4">
                <h3 className={cn("font-bold", glassTheme.text.primary)}>{assignment.title}</h3>
                <p className={cn("text-sm mt-1", glassTheme.text.secondary)}>{assignment.course}</p>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className={cn("text-xs", glassTheme.text.secondary)}>Due:</span>
                  <span className={cn("text-xs font-bold", glassTheme.text.primary)}>
                    {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                </div>

                {assignment.score && (
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs", glassTheme.text.secondary)}>Score:</span>
                    <span className={cn("text-xs font-bold", glassTheme.text.primary)}>
                      {assignment.score}/100
                    </span>
                  </div>
                )}
              </div>

              <div className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold text-center border",
                getStatusColor(assignment.status)
              )}>
                {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
