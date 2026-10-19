"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { glassTheme } from "@/lib/theme/glass";
import { createCourse } from "@/app/actions/catalog";

type Option = { id: string; name: string };

export function CourseForm({
  boards,
  levels,
  subjects,
}: {
  boards: Option[];
  levels: Option[];
  subjects: Option[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boardId, setBoardId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [medium, setMedium] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await createCourse({
        boardId,
        levelId,
        subjectId,
        medium,
      });
      if (!result.success) {
        setError(result.error ?? "Failed to create course");
        return;
      }
      setMedium("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const selectClass =
    "rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2 text-sm text-white focus:border-emerald-400/50 focus:outline-none";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-wrap items-end gap-3 rounded-xl border p-4",
        glassTheme.bg.glass,
      )}
    >
      {[
        { label: "Board", value: boardId, set: setBoardId, options: boards },
        { label: "Level", value: levelId, set: setLevelId, options: levels },
        {
          label: "Subject",
          value: subjectId,
          set: setSubjectId,
          options: subjects,
        },
      ].map((field) => (
        <label
          key={field.label}
          className="flex min-w-40 flex-1 flex-col gap-1"
        >
          <span
            className={cn("text-xs font-semibold", glassTheme.text.secondary)}
          >
            {field.label}
          </span>
          <select
            value={field.value}
            onChange={(e) => field.set(e.target.value)}
            className={selectClass}
            required
          >
            <option value="">Select…</option>
            {field.options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
      ))}

      <label className="flex min-w-32 flex-1 flex-col gap-1">
        <span
          className={cn("text-xs font-semibold", glassTheme.text.secondary)}
        >
          Medium (optional)
        </span>
        <input
          value={medium}
          onChange={(e) => setMedium(e.target.value)}
          placeholder="English / Urdu"
          className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/50 focus:outline-none"
        />
      </label>

      <button
        type="submit"
        disabled={busy || !boardId || !levelId || !subjectId}
        className={cn(
          "rounded-lg px-4 py-2 text-sm font-semibold",
          glassTheme.button.primary,
          (busy || !boardId || !levelId || !subjectId) && "opacity-50",
        )}
      >
        {busy ? "Creating..." : "Create Course"}
      </button>

      {error && <p className="w-full text-sm text-red-300">{error}</p>}
    </form>
  );
}
