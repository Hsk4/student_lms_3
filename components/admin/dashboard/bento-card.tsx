"use client";

import type { ButtonHTMLAttributes, Ref } from "react";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DashboardData } from "@/lib/admin-dashboard";
import { WIDGET_LAYOUT, type WidgetId } from "./layout-config";
import { DARK_WIDGETS, WIDGET_ICONS, WidgetBody } from "./widgets";

interface HandleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Purely presentational tile. Rendered both in the grid (wrapped by
 * `SortableBento`) and inside the <DragOverlay> as the floating copy.
 */
export function BentoShell({
  id,
  data,
  handleProps,
  floating = false,
  dropTarget = false,
}: {
  id: WidgetId;
  data: DashboardData;
  handleProps?: HandleProps;
  floating?: boolean;
  dropTarget?: boolean;
}) {
  const layout = WIDGET_LAYOUT[id];
  const Icon = WIDGET_ICONS[id];
  const dark = DARK_WIDGETS.has(id);

  return (
    <Card
      style={{ borderRadius: "var(--radius-2xl)" }}
      className={cn(
        "h-full gap-4 [--card-spacing:--spacing(5)]",
        "transition-[box-shadow,--tw-ring-color] duration-200",
        dark
          ? "bg-emerald-950 text-emerald-50 ring-emerald-800/60 [background-image:radial-gradient(120%_80%_at_100%_0%,oklch(0.55_0.15_165/0.35),transparent_60%)]"
          : "hover:shadow-md hover:ring-foreground/20",
        floating && "cursor-grabbing shadow-2xl ring-2 ring-emerald-500/60",
        dropTarget && "ring-2 ring-emerald-500/70 shadow-lg",
      )}
    >
      <CardHeader>
        <CardTitle
          className={cn(
            "flex items-center gap-2 text-sm font-medium",
            dark ? "text-emerald-100" : "text-muted-foreground",
          )}
        >
          <span
            className={cn(
              "grid size-7 place-items-center rounded-lg",
              dark
                ? "bg-emerald-400/15 text-emerald-300"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            )}
          >
            <Icon className="size-4" />
          </span>
          {layout.title}
        </CardTitle>
        {layout.description && (
          <CardDescription className={cn("pl-9 text-xs", dark && "text-emerald-200/60")}>
            {layout.description}
          </CardDescription>
        )}
        {handleProps && (
          <CardAction>
            <button
              type="button"
              aria-label={`Move ${layout.title}`}
              title="Drag to rearrange"
              {...handleProps}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-xs" }),
                "cursor-grab touch-none text-muted-foreground active:cursor-grabbing",
                "opacity-0 transition-opacity group-hover/bento:opacity-100 focus-visible:opacity-100",
                "[@media(hover:none)]:opacity-100",
                dark && "text-emerald-200/70 hover:bg-white/10 hover:text-emerald-50",
              )}
            >
              <GripVertical />
            </button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col">
        <WidgetBody id={id} data={data} />
      </CardContent>
    </Card>
  );
}

/** Grid cell: owns the dnd-kit sortable state, delegates visuals to BentoShell. */
export function SortableBento({ id, data }: { id: WidgetId; data: DashboardData }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "group/bento relative min-w-0",
        WIDGET_LAYOUT[id].className,
        // The original tile fades to a ghost while its floating copy is dragged.
        isDragging && "z-0 opacity-30",
      )}
    >
      <BentoShell
        id={id}
        data={data}
        dropTarget={isOver && !isDragging}
        handleProps={{ ref: setActivatorNodeRef, ...attributes, ...listeners }}
      />
    </div>
  );
}
