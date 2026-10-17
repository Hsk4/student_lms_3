"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteCourse } from "@/app/actions/courses";
import { useRouter } from "next/navigation";

export function DeleteCourseButton({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    setLoading(true);
    try {
      const result = await deleteCourse(courseId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Failed to delete course");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={cn(
        "p-2 rounded-lg backdrop-blur-md transition-all",
        "bg-red-500/20 border border-red-400/30 hover:bg-red-500/30",
        "text-red-300 hover:text-red-200",
        loading && "opacity-50 cursor-not-allowed"
      )}
      title="Delete course"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
