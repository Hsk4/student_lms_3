"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { BookOpen, Plus, X } from "lucide-react";
import { createCourse } from "@/app/actions/courses";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    board: "",
    levelOrGrade: "",
    subjects: [] as string[],
  });

  const [subjectInput, setSubjectInput] = useState("");

  const handleAddSubject = () => {
    if (subjectInput.trim() && !formData.subjects.includes(subjectInput.trim())) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, subjectInput.trim()],
      });
      setSubjectInput("");
    }
  };

  const handleRemoveSubject = (index: number) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.board || !formData.levelOrGrade || formData.subjects.length === 0) {
      setError("Please fill all fields and add at least one subject");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await createCourse({
      board: formData.board,
      levelOrGrade: formData.levelOrGrade,
      subjects: formData.subjects,
    });

    if (result.success) {
      router.push("/admin/courses");
    } else {
      setError(result.error || "Failed to create course");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="Create New Course"
        subtitle="Add to Curriculum"
        description="Create a new course with custom board, level, and subjects."
        icon={<BookOpen className="w-6 h-6 text-teal-400" />}
      />

      <GlassCard variant="default" className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4 text-red-300">
              {error}
            </div>
          )}

          {/* Board (Custom Text Input) */}
          <div>
            <label className={cn("block text-sm font-semibold mb-2", glassTheme.text.primary)}>
              Educational Board
            </label>
            <p className={cn("text-xs mb-3", glassTheme.text.secondary)}>
              Enter any board name (e.g., Sindh Board, Aga Khan Board, IGCSE, IB, etc.)
            </p>
            <input
              type="text"
              placeholder="e.g., Sindh Board, Aga Khan Board, O Levels, A Levels, IGCSE, IB, CBSE"
              value={formData.board}
              onChange={(e) => setFormData({ ...formData, board: e.target.value })}
              className={cn(
                "w-full px-4 py-2 rounded-lg transition-all",
                "bg-teal-900/20 border border-teal-500/30",
                "text-white placeholder-white/50",
                "focus:outline-none focus:ring-2 focus:ring-teal-400/60 focus:border-teal-400/40"
              )}
            />
          </div>

          {/* Level/Grade (Custom Text Input) */}
          <div>
            <label className={cn("block text-sm font-semibold mb-2", glassTheme.text.primary)}>
              Level or Grade
            </label>
            <p className={cn("text-xs mb-3", glassTheme.text.secondary)}>
              Enter any level or grade designation
            </p>
            <input
              type="text"
              placeholder="e.g., Grade 9, 1st Year, A-Level, Form 3, Class 10, Intermediate"
              value={formData.levelOrGrade}
              onChange={(e) => setFormData({ ...formData, levelOrGrade: e.target.value })}
              className={cn(
                "w-full px-4 py-2 rounded-lg transition-all",
                "bg-teal-900/20 border border-teal-500/30",
                "text-white placeholder-white/50",
                "focus:outline-none focus:ring-2 focus:ring-teal-400/60 focus:border-teal-400/40"
              )}
            />
          </div>

          {/* Subjects */}
          <div>
            <label className={cn("block text-sm font-semibold mb-2", glassTheme.text.primary)}>
              Subjects
            </label>
            <p className={cn("text-xs mb-3", glassTheme.text.secondary)}>
              Add individual subjects for this course
            </p>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="e.g., Mathematics, English, Physics, History"
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSubject())}
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg transition-all",
                  "bg-teal-900/20 border border-teal-500/30",
                  "text-white placeholder-white/50",
                  "focus:outline-none focus:ring-2 focus:ring-teal-400/60 focus:border-teal-400/40"
                )}
              />
              <button
                type="button"
                onClick={handleAddSubject}
                className={cn(
                  "px-4 py-2 rounded-lg font-semibold flex items-center gap-2",
                  "bg-teal-500/20 border border-teal-400/30",
                  "text-teal-300 hover:bg-teal-500/30 transition-all"
                )}
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {formData.subjects.length > 0 && (
              <div>
                <p className={cn("text-xs mb-2", glassTheme.text.secondary)}>
                  Added subjects: {formData.subjects.length}
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.subjects.map((subject, index) => (
                    <div
                      key={index}
                      className={cn(
                        "px-3 py-1 rounded-lg flex items-center gap-2",
                        "bg-teal-500/20 border border-teal-400/30",
                        "text-teal-200"
                      )}
                    >
                      {subject}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(index)}
                        className="hover:text-teal-100 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          {formData.board && formData.levelOrGrade && formData.subjects.length > 0 && (
            <div className={cn(
              "p-4 rounded-lg border",
              "bg-emerald-500/10 border-emerald-400/30"
            )}>
              <p className={cn("text-sm font-semibold mb-2", "text-emerald-300")}>
                Course Summary
              </p>
              <div className={cn("text-sm space-y-1", glassTheme.text.secondary)}>
                <p><span className="font-semibold text-emerald-400">Board:</span> {formData.board}</p>
                <p><span className="font-semibold text-emerald-400">Level:</span> {formData.levelOrGrade}</p>
                <p><span className="font-semibold text-emerald-400">Subjects:</span> {formData.subjects.join(", ")}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-teal-500/20">
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "flex-1 px-6 py-2 rounded-lg font-semibold",
                glassTheme.button.primary,
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? "Creating..." : "Create Course"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className={cn(
                "px-6 py-2 rounded-lg font-semibold",
                "bg-white/10 border border-white/20",
                "text-white hover:bg-white/15 transition-all"
              )}
            >
              Cancel
            </button>
          </div>
        </form>
      </GlassCard>

      {/* Info Box */}
      <GlassCard variant="default" className="max-w-3xl">
        <div className="space-y-3">
          <h3 className={cn("font-semibold", glassTheme.text.primary)}>
            💡 Tips for Creating Courses
          </h3>
          <ul className={cn("space-y-2 text-sm", glassTheme.text.secondary)}>
            <li>• <span className="text-teal-300">Board:</span> Use standard names like "Sindh Board", "IGCSE", "IB" or create custom ones</li>
            <li>• <span className="text-teal-300">Level:</span> Can be any format - "Grade 9", "9th Class", "Form 1", "Class 10", etc.</li>
            <li>• <span className="text-teal-300">Subjects:</span> Add one at a time. Press Enter or click "Add" to add each subject</li>
            <li>• You can create multiple courses with the same board but different levels</li>
          </ul>
        </div>
      </GlassCard>
    </div>
  );
}
