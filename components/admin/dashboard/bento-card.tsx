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
 * Purely presentational tile with glassmorphism design.
 * Rendered both in the grid (wrapped by `SortableBento`) and inside 
 * the <DragOverlay> as the floating copy.
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
        "backdrop-blur-xl border transition-all duration-300",
        dark
          ? // Dark widget: deep teal glass
            "bg-teal-950/40 text-teal-50 border-teal-400/20 shadow-xl shadow-teal-500/10 hover:shadow-2xl hover:shadow-teal-500/20 hover:border-teal-400/40 [background-image:radial-gradient(120%_80%_at_100%_0%,oklch(0.55_0.15_165/0.25),transparent_60%)]"
          : // Light widget: frosted glass
            "bg-white/10 text-foreground border-white/20 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 hover:bg-white/15 hover:border-white/30",
        floating && "cursor-grabbing shadow-2xl ring-2 ring-teal-400/60 bg-white/20 scale-105",
        dropTarget && "ring-2 ring-teal-400/70 shadow-2xl bg-white/20 border-teal-400/50",
      )}
    >
      <CardHeader>
        <CardTitle
          className={cn(
            "flex items-center gap-2 text-sm font-medium",
            dark ? "text-teal-100" : "text-foreground/90",
          )}
        >
          <span
            className={cn(
              "grid size-7 place-items-center rounded-lg backdrop-blur-md transition-all",
              dark
                ? "bg-teal-400/20 text-teal-300 border border-teal-400/30 hover:bg-teal-400/30"
                : "bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-400/20 hover:bg-teal-500/30 dark:border-teal-400/40",
            )}
          >
            <Icon className="size-4" />
          </span>
          {layout.title}
        </CardTitle>
        {layout.description && (
          <CardDescription className={cn("pl-9 text-xs", dark ? "text-teal-200/70" : "text-foreground/60")}>
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
                "cursor-grab touch-none backdrop-blur-md transition-all rounded-lg",
                "opacity-0 group-hover/bento:opacity-100 focus-visible:opacity-100 active:cursor-grabbing",
                "[@media(hover:none)]:opacity-100",
                dark
                  ? "text-teal-200/70 hover:bg-teal-400/20 hover:text-teal-50 hover:border hover:border-teal-400/30"
                  : "text-foreground/60 hover:bg-white/20 hover:text-foreground hover:border hover:border-white/30",
              )}
            >
              <GripVertical className="size-4" />
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
        isDragging && "z-0 opacity-20",
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
