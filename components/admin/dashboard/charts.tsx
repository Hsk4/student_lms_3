"use client";

import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Path helpers                                                               */
/* -------------------------------------------------------------------------- */

type Pt = [number, number];

/** Map values onto a w × h box. y is inverted (SVG) and padded top/bottom. */
function toPoints(data: number[], w: number, h: number, pad: number, max: number): Pt[] {
  if (data.length === 0) return [];
  const step = data.length > 1 ? w / (data.length - 1) : 0;
  return data.map((v, i) => [i * step, pad + (h - pad * 2) * (1 - v / max)]);
}

/** Smooth line through points using horizontal-tangent cubic segments (no overshoot). */
function smoothLine(pts: Pt[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M0,${pts[0][1]} L100,${pts[0][1]}`;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return d;
}

function closeArea(line: string, pts: Pt[], h: number): string {
  if (!line || pts.length < 2) return "";
  return `${line} L${pts[pts.length - 1][0]},${h} L${pts[0][0]},${h} Z`;
}

const fmt = (n: number) => n.toLocaleString("en-US");

/* -------------------------------------------------------------------------- */
/*  Sparkline                                                                  */
/* -------------------------------------------------------------------------- */

export function Sparkline({
  data,
  className,
}: {
  data: number[];
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const { line, area } = useMemo(() => {
    const max = Math.max(...data, 1);
    const pts = toPoints(data, 100, 40, 4, max);
    const l = smoothLine(pts);
    return { line: l, area: closeArea(l, pts, 40) };
  }, [data]);

  return (
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className={cn("block h-14 w-full", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={`spark-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      {area && <path d={area} fill={`url(#spark-${uid})`} />}
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Area chart (multi-series, hover tooltip)                                   */
/* -------------------------------------------------------------------------- */

export interface ChartSeries {
  name: string;
  data: number[];
  /** Tailwind text-colour class — the chart paints with `currentColor`. */
  colorClass: string;
  /** Tailwind bg-colour class for the legend/tooltip dot. */
  dotClass: string;
}

export function AreaChart({
  labels,
  series,
  className,
}: {
  labels: string[];
  series: ChartSeries[];
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [hover, setHover] = useState<number | null>(null);

  const n = labels.length;
  const rawMax = Math.max(...series.flatMap((s) => s.data), 0);
  // Round the axis up to a "nice" number (1, 2, 5 × 10ⁿ) so gridlines read cleanly.
  const max = useMemo(() => {
    if (rawMax <= 4) return 4;
    const pow = 10 ** Math.floor(Math.log10(rawMax));
    const m = rawMax / pow;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * pow;
  }, [rawMax]);

  const geometry = useMemo(
    () =>
      series.map((s) => {
        const pts = toPoints(s.data, 100, 100, 3, max);
        const line = smoothLine(pts);
        return { pts, line, area: closeArea(line, pts, 100) };
      }),
    [series, max],
  );

  if (n < 2) {
    return (
      <div className={cn("grid place-items-center text-sm text-muted-foreground", className)}>
        Not enough data yet
      </div>
    );
  }

  const gridlines = [0, 0.25, 0.5, 0.75, 1];

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setHover(Math.round(ratio * (n - 1)));
  }

  const hoverX = hover === null ? 0 : (hover / (n - 1)) * 100;

  return (
    <div className={cn("flex gap-3", className)}>
      {/* Y axis */}
      <div className="flex flex-col justify-between pb-6 text-right font-mono text-[10px] text-muted-foreground tabular-nums">
        <span>{fmt(max)}</span>
        <span>{fmt(max / 2)}</span>
        <span>0</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Plot */}
        <div
          className="relative min-h-40 flex-1 touch-pan-y"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full overflow-visible"
            role="img"
            aria-label={`${series.map((s) => s.name).join(" and ")} over the last ${n} days`}
          >
            <defs>
              {series.map((s, i) => (
                <linearGradient
                  key={s.name}
                  id={`area-${uid}-${i}`}
                  className={s.colorClass}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="currentColor" stopOpacity={i === 0 ? 0.22 : 0.12} />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              ))}
            </defs>

            {gridlines.map((g) => (
              <line
                key={g}
                x1="0"
                x2="100"
                y1={g * 100}
                y2={g * 100}
                className="stroke-border"
                strokeWidth="1"
                strokeDasharray={g === 1 ? undefined : "3 4"}
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {geometry.map((g, i) => (
              <g key={series[i].name} className={series[i].colorClass}>
                {g.area && <path d={g.area} fill={`url(#area-${uid}-${i})`} />}
                <path
                  d={g.line}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}

            {hover !== null && (
              <line
                x1={hoverX}
                x2={hoverX}
                y1="0"
                y2="100"
                className="stroke-foreground/25"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>

          {/* Hover dots (HTML so they stay perfectly round despite the stretched viewBox) */}
          {hover !== null &&
            geometry.map((g, i) => (
              <span
                key={series[i].name}
                className={cn(
                  "pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card",
                  series[i].dotClass,
                )}
                style={{ left: `${hoverX}%`, top: `${g.pts[hover][1]}%` }}
              />
            ))}

          {/* Tooltip */}
          {hover !== null && (
            <div
              className="pointer-events-none absolute top-0 z-10 w-max min-w-28 rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md"
              style={{
                left: `${hoverX}%`,
                transform: `translateX(${hoverX > 65 ? "calc(-100% - 12px)" : "12px"})`,
              }}
            >
              <p className="mb-1 font-medium">{labels[hover]}</p>
              {series.map((s) => (
                <p key={s.name} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className={cn("size-2 rounded-full", s.dotClass)} />
                    {s.name}
                  </span>
                  <span className="font-medium tabular-nums">{fmt(s.data[hover])}</span>
                </p>
              ))}
            </div>
          )}
        </div>

        {/* X axis */}
        <div className="mt-2 flex h-4 justify-between text-[10px] text-muted-foreground">
          <span>{labels[0]}</span>
          <span className="hidden sm:inline">{labels[Math.floor((n - 1) / 2)]}</span>
          <span>{labels[n - 1]}</span>
        </div>
      </div>
    </div>
  );
}
