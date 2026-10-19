"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { deleteCourse } from "@/app/actions/catalog";

export type CourseRow = {
  id: string;
  board: string;
  level: string;
  subject: string;
  medium: string;
  isActive: boolean;
};

export function CourseRows({ rows }: { rows: CourseRow[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(row: CourseRow) {
    if (
      !window.confirm(
        `Delete ${row.board} · ${row.level} · ${row.subject}? Enrollments for this course are removed too.`,
      )
    ) {
      return;
    }
    setBusyId(row.id);
    setError(null);
    try {
      const result = await deleteCourse(row.id);
      if (!result.success) {
        setError(result.error ?? "Delete failed");
        return;
      }
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (rows.length === 0) {
    return (
      <GlassCard variant="default" className="py-16 text-center">
        <p className={glassTheme.text.secondary}>
          No courses yet — create the first one above.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}
      <GlassCard variant="default">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {["Board", "Level", "Subject", "Medium", "Status", ""].map(
                (h) => (
                  <th
                    key={h}
                    className={cn(
                      "px-4 py-3 text-left font-semibold",
                      glassTheme.text.secondary,
                    )}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-white/10 hover:bg-white/5"
              >
                <td className={cn("px-4 py-4", glassTheme.text.primary)}>
                  {row.board}
                </td>
                <td className={cn("px-4 py-4", glassTheme.text.primary)}>
                  {row.level}
                </td>
                <td className={cn("px-4 py-4", glassTheme.text.primary)}>
                  {row.subject}
                </td>
                <td
                  className={cn("px-4 py-4 text-xs", glassTheme.text.secondary)}
                >
                  {row.medium || "—"}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "inline-block rounded-lg border px-2 py-1 text-xs font-medium",
                      row.isActive
                        ? "border-emerald-400/30 bg-emerald-500/20 text-emerald-200"
                        : "border-white/10 bg-white/5 text-white/60",
                    )}
                  >
                    {row.isActive ? "active" : "inactive"}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => remove(row)}
                    disabled={busyId === row.id}
                    title="Delete course"
                    className={cn(
                      "rounded-lg border border-red-400/30 bg-red-500/20 p-2 text-red-300 hover:bg-red-500/30",
                      busyId === row.id && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
