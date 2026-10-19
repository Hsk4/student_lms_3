"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  type SortingStrategy,
} from "@dnd-kit/sortable";
import { GripVertical, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/Button";
import type { DashboardData } from "@/lib/admin-dashboard";
import { BentoShell, SortableBento } from "./bento-card";
import { DEFAULT_ORDER, type WidgetId } from "./layout-config";

/* -------------------------------------------------------------------------- */
/*  Persisted layout (localStorage via useSyncExternalStore)                   */
/*  – SSR renders DEFAULT_ORDER, the client swaps in the saved order after     */
/*    hydration without any mismatch or setState-in-effect.                    */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY = "admin-dashboard:bento-order:v1";
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb); // keep multiple tabs in sync
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

const getServerSnapshot = (): string | null => null;

function saveOrder(order: WidgetId[] | null) {
  try {
    if (order) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode / quota — layout simply won't persist */
  }
  listeners.forEach((l) => l());
}

/** Validate a stored order; drop unknown ids and append any new widgets. */
function resolveOrder(raw: string | null): WidgetId[] {
  if (!raw) return DEFAULT_ORDER;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_ORDER;
    const known = new Set<string>(DEFAULT_ORDER);
    const seen = new Set<string>();
    const kept = parsed.filter((x): x is WidgetId => {
      if (typeof x !== "string" || !known.has(x) || seen.has(x)) return false;
      seen.add(x);
      return true;
    });
    return [...kept, ...DEFAULT_ORDER.filter((id) => !seen.has(id))];
  } catch {
    return DEFAULT_ORDER;
  }
}

/* -------------------------------------------------------------------------- */
/*  Grid                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Bento tiles have different spans, so dnd-kit's default "slide neighbours into
 * each other's slots" strategy looks broken mid-drag (a 4-col tile can't occupy
 * an 8-col slot). Instead the other tiles stay put, the tile under the pointer
 * is highlighted as the drop target, and the CSS grid reflows on drop.
 */
const stayPutStrategy: SortingStrategy = () => null;

export function BentoGrid({ data }: { data: DashboardData }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const order = useMemo(() => resolveOrder(raw), [raw]);
  const isCustom = raw !== null && order.some((id, i) => id !== DEFAULT_ORDER[i]);

  const [activeId, setActiveId] = useState<WidgetId | null>(null);

  const sensors = useSensors(
    // A small distance threshold keeps clicks on links/buttons from starting a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as WidgetId);
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = order.indexOf(active.id as WidgetId);
    const to = order.indexOf(over.id as WidgetId);
    if (from < 0 || to < 0) return;
    saveOrder(arrayMove(order, from, to));
  }

  return (
    <section aria-label="Dashboard widgets" className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-lg backdrop-blur-md bg-teal-950/30 border border-teal-500/30 p-4 shadow-sm">
        <p className="flex items-center gap-1.5 text-xs text-teal-200/70">
          <GripVertical className="size-3.5" />
          Drag the grip on any card to rearrange your dashboard.
        </p>
        <Button
          variant="ghost"
          size="sm"
          disabled={!isCustom}
          onClick={() => saveOrder(null)}
          className="text-teal-200/70 hover:text-teal-100 hover:bg-teal-500/20 backdrop-blur-md transition-all border border-teal-500/30"
        >
          <RotateCcw className="size-3.5" />
          Reset layout
        </Button>
      </div>

      <DndContext
        id="admin-dashboard-bento" /* stable id → no hydration mismatch on aria ids */
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext items={order} strategy={stayPutStrategy}>
          <div className="grid grid-flow-dense grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[minmax(10rem,auto)]">
            {order.map((id) => (
              <SortableBento key={id} id={id} data={data} />
            ))}
          </div>
        </SortableContext>

        <DragOverlay
          dropAnimation={{ duration: 220, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }}
        >
          {activeId ? (
            <div className="h-full" aria-hidden>
              <BentoShell id={activeId} data={data} floating />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
}
