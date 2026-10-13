"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { BookOpen, Plus, X } from "lucide-react";
import { createCourse } from "@/app/actions/courses";

const BOARDS = [
  "Sindh Board",
  "Aga Khan Board",
  "O Levels",
  "A Levels",
  "BCOM",
  "Bachelors",
];

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
      setError("Please fill all fields");
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
        description="Set up a new course with board, level, and subjects."
        icon={<BookOpen className="w-6 h-6 text-teal-400" />}
      />

      <GlassCard variant="default" className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4 text-red-300">
              {error}
            </div>
          )}

          {/* Board Selection */}
          <div>
            <label className={cn("block text-sm font-semibold mb-2", glassTheme.text.primary)}>
              Educational Board
            </label>
            <select
              value={formData.board}
              onChange={(e) => setFormData({ ...formData, board: e.target.value })}
              className={cn(
                "w-full px-4 py-2 rounded-lg transition-all",
                "bg-teal-900/20 border border-teal-500/30",
                "text-white placeholder-white/50",
                "focus:outline-none focus:ring-2 focus:ring-teal-400/60 focus:border-teal-400/40"
              )}
            >
              <option value="">Select a board</option>
              {BOARDS.map((board) => (
                <option key={board} value={board}>
                  {board}
                </option>
              ))}
            </select>
          </div>

          {/* Level/Grade */}
          <div>
            <label className={cn("block text-sm font-semibold mb-2", glassTheme.text.primary)}>
              Level or Grade
            </label>
            <input
              type="text"
              placeholder="e.g., Grade 9, 1st Year, A-Level"
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
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add a subject"
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
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6">
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
    </div>
  );
}
