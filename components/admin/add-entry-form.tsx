"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { glassTheme } from "@/lib/theme/glass";

/**
 * Inline "add" form used by every catalog list. `onSubmit` is a server action
 * passed down from the page; the field values arrive keyed by input name.
 */
export function AddEntryForm({
  label,
  fields,
  onSubmit,
}: {
  label: string;
  fields: { name: string; placeholder: string; type?: "text" | "number" }[];
  onSubmit: (
    values: Record<string, string>,
  ) => Promise<{ success: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await onSubmit(values);
      if (!result.success) {
        setError(result.error ?? "Failed to save");
        return;
      }
      setValues({});
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold",
          glassTheme.button.primary,
        )}
      >
        <Plus className="h-4 w-4" />
        {label}
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-wrap items-end gap-3 rounded-xl border p-4",
        glassTheme.bg.glass,
      )}
    >
      {fields.map((field) => (
        <label key={field.name} className="flex min-w-48 flex-1 flex-col gap-1">
          <span
            className={cn("text-xs font-semibold", glassTheme.text.secondary)}
          >
            {field.placeholder}
          </span>
          <input
            type={field.type ?? "text"}
            value={values[field.name] ?? ""}
            onChange={(e) =>
              setValues((v) => ({ ...v, [field.name]: e.target.value }))
            }
            placeholder={field.placeholder}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/50 focus:outline-none"
          />
        </label>
      ))}
      <button
        type="submit"
        disabled={busy}
        className={cn(
          "rounded-lg px-4 py-2 text-sm font-semibold",
          glassTheme.button.primary,
          busy && "opacity-50",
        )}
      >
        {busy ? "Saving..." : "Save"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className={cn(
          "rounded-lg px-4 py-2 text-sm font-medium",
          glassTheme.button.glass,
        )}
      >
        Cancel
      </button>
      {error && <p className="w-full text-sm text-red-300">{error}</p>}
    </form>
  );
}
