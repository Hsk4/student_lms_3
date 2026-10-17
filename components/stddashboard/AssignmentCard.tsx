'use client';

import React, { useState } from 'react';
import { Assignment } from '@/types/dashboard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import {
  Calendar,
  Clock,
  FileCheck2,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export interface AssignmentCardProps {
  assignment: Assignment;
  onUpdateStatus?: (id: string, updated: Partial<Assignment>) => void;
}

export function AssignmentCard({ assignment, onUpdateStatus }: AssignmentCardProps) {
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment>(assignment);

  const getStatusBadge = (status: Assignment['status']) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="info">Submitted</Badge>;
      case 'graded':
        return <Badge variant="success">Graded</Badge>;
      case 'late':
        return <Badge variant="danger">Overdue</Badge>;
      default:
        return <Badge variant="warning">Pending</Badge>;
    }
  };

  const [formattedDueDate, setFormattedDueDate] = useState('Oct 18, 11:59 PM');

  React.useEffect(() => {
    try {
      const d = new Date(currentAssignment.dueDate);
      setFormattedDueDate(
        d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    } catch {
      // fallback
    }
  }, [currentAssignment.dueDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const updated: Assignment = {
        ...currentAssignment,
        status: 'submitted',
        submissionDate: new Date().toISOString(),
        submissionFile: fileName || 'assignment_submission.pdf',
      };
      setCurrentAssignment(updated);
      if (onUpdateStatus) {
        onUpdateStatus(currentAssignment.id, updated);
      }
      setIsSubmitting(false);
      setShowSubmitModal(false);
    }, 600);
  };

  return (
    <>
      <Card hoverEffect className="flex flex-col justify-between h-full border-indigo-500/15">
        <div>
          <CardHeader className="p-5 pb-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
                {currentAssignment.courseCode}
              </span>
              {getStatusBadge(currentAssignment.status)}
            </div>

            <CardTitle className="text-base text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
              {currentAssignment.title}
            </CardTitle>

            <CardDescription className="text-xs text-slate-400 line-clamp-2">
              {currentAssignment.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 pt-1 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Due: {formattedDueDate}</span>
              </div>
              <span className="font-semibold text-slate-200">
                {currentAssignment.status === 'graded' && currentAssignment.score !== undefined ? (
                  <span className="text-emerald-400 font-bold">
                    {currentAssignment.score} / {currentAssignment.points} pts
                  </span>
                ) : (
                  <span>{currentAssignment.points} pts</span>
                )}
              </span>
            </div>

            {currentAssignment.feedback && (
              <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300">
                <span className="font-semibold block mb-0.5">Instructor Feedback:</span>
                <p className="text-[11px] text-emerald-200/90">{currentAssignment.feedback}</p>
              </div>
            )}

            {currentAssignment.submissionFile && (
              <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-950/30 p-2 rounded-lg border border-indigo-500/20">
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate">{currentAssignment.submissionFile}</span>
              </div>
            )}
          </CardContent>
        </div>

        <div className="p-5 pt-0 mt-auto flex items-center justify-end border-t border-slate-800/80">
          {currentAssignment.status === 'pending' || currentAssignment.status === 'late' ? (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setShowSubmitModal(true)}
              className="text-xs w-full sm:w-auto"
            >
              <Upload className="w-3.5 h-3.5 mr-1" />
              Submit Work
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowSubmitModal(true)}
              className="text-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              View Submission
            </Button>
          )}
        </div>
      </Card>

      {/* Submission Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title={currentAssignment.title}
        description={`${currentAssignment.courseCode} • Max Points: ${currentAssignment.points}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800">
            {currentAssignment.description}
          </p>

          <Input
            label="File Upload / Document Name"
            placeholder="e.g. project_submission_vance.zip or document.pdf"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            disabled={currentAssignment.status === 'graded'}
          />

          <Textarea
            label="Submission Notes / Code Links"
            placeholder="Add any commentary, repository link, or explanations for your instructor..."
            rows={4}
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            disabled={currentAssignment.status === 'graded'}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowSubmitModal(false)}
            >
              Cancel
            </Button>
            {currentAssignment.status !== 'graded' && (
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Confirm Submission
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
}
