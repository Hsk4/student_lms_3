"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Small delete button with a confirm prompt; reports the server error inline. */
export function DeleteEntryButton({
  id,
  label,
  action,
}: {
  id: string;
  label: string;
  action: (id: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm(`Delete ${label}?`)) return;
    setBusy(true);
    setError(null);
    try {
      const result = await action(id);
      if (!result.success) {
        setError(result.error ?? "Delete failed");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleDelete}
        disabled={busy}
        title={`Delete ${label}`}
        className={cn(
          "rounded-lg border border-red-400/30 bg-red-500/20 p-2 text-red-300 transition-all hover:bg-red-500/30",
          busy && "cursor-not-allowed opacity-50",
        )}
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {error && (
        <span className="max-w-48 text-right text-xs text-red-300">
          {error}
        </span>
      )}
    </div>
  );
}
