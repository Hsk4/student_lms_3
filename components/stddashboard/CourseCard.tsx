'use client';

import React, { useState } from 'react';
import { Course } from '@/types/dashboard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Clock,
  MapPin,
  User,
  GraduationCap,
  Calendar,
  ExternalLink,
  BookOpen,
  CheckCircle,
} from 'lucide-react';

export interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Card hoverEffect className="flex flex-col justify-between h-full group border-indigo-500/15">
        <div>
          {/* Card Accent Top Bar */}
          <div
            className={`h-2 w-full bg-gradient-to-r ${course.color}`}
          />

          <CardHeader className="space-y-2 p-5 pb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {course.code}
              </span>
              <Badge variant="cyan" className="text-[10px]">
                {course.category}
              </Badge>
            </div>

            <CardTitle className="text-base text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
              {course.title}
            </CardTitle>

            <CardDescription className="flex items-center gap-1.5 text-xs text-slate-400">
              <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{course.instructor}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 p-5 pt-1">
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{course.schedule}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{course.room}</span>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Course Completion</span>
                <span className="text-slate-200 font-semibold">{course.progress}%</span>
              </div>
              <ProgressBar value={course.progress} size="sm" color="gradient" />
            </div>
          </CardContent>
        </div>

        {/* Footer with actions */}
        <div className="p-5 pt-0 mt-auto flex items-center justify-between border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-emerald-400">Grade: {course.grade}</span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowModal(true)}
            className="text-xs"
          >
            Details
          </Button>
        </div>
      </Card>

      {/* Course Detail Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={course.title}
        description={`${course.code} • ${course.category}`}
        maxWidth="lg"
      >
        <div className="space-y-5 mt-2">
          <p className="text-sm text-slate-300 leading-relaxed">
            {course.description}
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-400 block mb-0.5">Instructor</span>
              <span className="font-semibold text-white">{course.instructor}</span>
              <span className="block text-slate-400 text-[11px]">{course.instructorEmail}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Credits</span>
              <span className="font-semibold text-white">{course.credits} Credits</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Schedule</span>
              <span className="font-semibold text-white">{course.schedule}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Location</span>
              <span className="font-semibold text-white">{course.room}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Syllabus Covered</span>
              <span className="text-indigo-300 font-semibold">{course.progress}%</span>
            </div>
            <ProgressBar value={course.progress} size="md" color="indigo" />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{course.attendedLectures} Attended</span>
              <span>{course.totalLectures} Total Lectures</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                alert(`Opening syllabus material for ${course.code}`);
                setShowModal(false);
              }}
            >
              <BookOpen className="w-4 h-4 mr-1.5" />
              Access Materials
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
