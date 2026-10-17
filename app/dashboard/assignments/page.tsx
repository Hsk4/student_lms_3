'use client';

import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { AssignmentCard } from '@/components/stddashboard/AssignmentCard';
import { Tabs } from '@/components/ui/Tabs';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, FileCheck2, Clock, CheckCircle2, Award } from 'lucide-react';
import { mockAssignments } from '@/data/mock-data';
import { Assignment } from '@/types/dashboard';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');

  const handleUpdateAssignment = (id: string, updated: Partial<Assignment>) => {
    setAssignments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const pendingCount = assignments.filter((a) => a.status === 'pending').length;
  const submittedCount = assignments.filter((a) => a.status === 'submitted').length;
  const gradedCount = assignments.filter((a) => a.status === 'graded').length;

  const tabs = [
    { id: 'all', label: 'All Assignments', badge: assignments.length },
    { id: 'pending', label: 'Pending', badge: pendingCount },
    { id: 'submitted', label: 'Submitted', badge: submittedCount },
    { id: 'graded', label: 'Graded', badge: gradedCount },
  ];

  const filteredAssignments = useMemo(() => {
    return assignments.filter((asg) => {
      const matchesSearch =
        asg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asg.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asg.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = activeTab === 'all' || asg.status === activeTab;

      return matchesSearch && matchesStatus;
    });
  }, [assignments, searchQuery, activeTab]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Assignments & Deliverables"
        description="Track upcoming problem sets, submit lab code solutions, and review grader evaluations."
        badge="Fall 2026"
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-900/60 border-amber-500/20 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Due Soon</p>
            <p className="text-xl font-bold text-white">{pendingCount} Active Tasks</p>
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-blue-500/20 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Awaiting Grade</p>
            <p className="text-xl font-bold text-white">{submittedCount} Submissions</p>
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-emerald-500/20 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Average Graded Score</p>
            <p className="text-xl font-bold text-emerald-400">95.0%</p>
          </div>
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-2">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search assignments or course codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as typeof activeTab)}
          variant="segmented"
        />
      </div>

      {/* Grid of assignments */}
      {filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onUpdateStatus={handleUpdateAssignment}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <FileCheck2 className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-semibold text-white">No assignments found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            There are no deliverables matching your filter criteria.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setActiveTab('all');
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
