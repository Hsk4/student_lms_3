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
  useSortable,
  type SortingStrategy,
} from "@dnd-kit/sortable";
import { GripVertical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { glassTheme } from "@/lib/theme/glass";

const stayPutStrategy: SortingStrategy = () => null;

interface DraggableGridProps<T extends string> {
  items: T[];
  onReorder: (items: T[]) => void;
  children: (id: T, isOver: boolean, isDragging: boolean) => React.ReactNode;
  storageKey: string;
  className?: string;
  gap?: "sm" | "md" | "lg";
}

// Shared localStorage logic
function createStorageManager<T extends string>(storageKey: string, defaultItems: T[]) {
  const listeners = new Set<() => void>();

  function subscribe(cb: () => void) {
    listeners.add(cb);
    window.addEventListener("storage", cb);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", cb);
    };
  }

  function getSnapshot(): string | null {
    try {
      return window.localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  }

  function getServerSnapshot(): string | null {
    return null;
  }

  function saveOrder(items: T[] | null) {
    try {
      if (items) window.localStorage.setItem(storageKey, JSON.stringify(items));
      else window.localStorage.removeItem(storageKey);
    } catch {
      /* private mode / quota */
    }
    listeners.forEach((l) => l());
  }

  function resolveOrder(raw: string | null): T[] {
    if (!raw) return defaultItems;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return defaultItems;
      const known = new Set<string>(defaultItems);
      const seen = new Set<string>();
      const kept = parsed.filter((x): x is T => {
        if (typeof x !== "string" || !known.has(x) || seen.has(x)) return false;
        seen.add(x);
        return true;
      });
      return [...kept, ...defaultItems.filter((id) => !seen.has(id))];
    } catch {
      return defaultItems;
    }
  }

  return { subscribe, getSnapshot, getServerSnapshot, saveOrder, resolveOrder };
}

export function DraggableGrid<T extends string>({
  items: defaultItems,
  onReorder,
  children,
  storageKey,
  className,
  gap = "md",
}: DraggableGridProps<T>) {
  const storage = useMemo(() => createStorageManager(storageKey, defaultItems), [storageKey, defaultItems]);
  const raw = useSyncExternalStore(storage.subscribe, storage.getSnapshot, storage.getServerSnapshot);
  const items = useMemo(() => storage.resolveOrder(raw), [raw, storage]);
  const isCustom = raw !== null && items.some((id, i) => id !== defaultItems[i]);

  const [activeId, setActiveId] = useState<T | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragStart(e: DragStartEvent) {
    setActiveId(e.active.id as T);
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = items.indexOf(active.id as T);
    const to = items.indexOf(over.id as T);
    if (from < 0 || to < 0) return;
    const newOrder = arrayMove(items, from, to);
    storage.saveOrder(newOrder);
    onReorder(newOrder);
  }

  const gapClass = gap === "sm" ? "gap-2" : gap === "lg" ? "gap-6" : "gap-4";

  return (
    <section className="space-y-4">
      <div className={cn(glassTheme.bg.glass, "rounded-lg p-4 flex items-center justify-between", glassTheme.shadow.sm)}>
        <p className={cn("flex items-center gap-1.5 text-xs", glassTheme.text.secondary)}>
          <GripVertical className="size-3.5" />
          Drag cards to rearrange your dashboard.
        </p>
        <Button
          variant="ghost"
          size="sm"
          disabled={!isCustom}
          onClick={() => storage.saveOrder(null)}
          className={cn(glassTheme.text.secondary, "hover:text-white hover:bg-white/20 backdrop-blur-md transition-all")}
        >
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext items={items} strategy={stayPutStrategy}>
          <div className={cn("grid grid-flow-dense grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[minmax(10rem,auto)]", gapClass, className)}>
            {items.map((id) => (
              <DraggableItem key={id} id={id}>
                {(isOver, isDragging) => children(id, isOver, isDragging)}
              </DraggableItem>
            ))}
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }}>
          {activeId ? <div className="h-full" aria-hidden>{children(activeId, false, true)}</div> : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
}

function DraggableItem({ id, children }: { id: string; children: (isOver: boolean, isDragging: boolean) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging, isOver } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`, transition }}
      className={cn("group/item relative min-w-0 rounded-xl", isDragging && "z-0 opacity-20")}
    >
      <div ref={setActivatorNodeRef} {...attributes} {...listeners} className="absolute inset-0 z-10 opacity-0 cursor-grab active:cursor-grabbing" />
      {children(isOver, isDragging)}
    </div>
  );
}
