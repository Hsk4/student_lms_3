import { DEFAULT_ORDER, WIDGET_LAYOUT } from "./layout-config";

/** Loading state that mirrors the real bento grid, so nothing jumps on load. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-busy aria-label="Loading dashboard">
      <div className="h-8" />
      <div className="grid grid-flow-dense grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[minmax(10rem,auto)]">
        {DEFAULT_ORDER.map((id) => (
          <div
            key={id}
            className={`min-h-40 animate-pulse rounded-2xl bg-muted/70 ring-1 ring-foreground/5 ${WIDGET_LAYOUT[id].className}`}
          />
        ))}
      </div>
    </div>
  );
}
