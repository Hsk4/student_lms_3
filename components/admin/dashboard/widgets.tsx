"use client";

import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  Clock,
  FileText,
  GraduationCap,
  Layers,
  Lock,
  Plus,
  Trophy,
  UserPlus,
  Users,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ActivityKind, DashboardData } from "@/lib/admin-dashboard";
import { AreaChart, Sparkline } from "./charts";
import type { WidgetId } from "./layout-config";

const fmt = (n: number) => n.toLocaleString("en-US");

/* -------------------------------------------------------------------------- */
/*  Per-widget presentation metadata                                           */
/* -------------------------------------------------------------------------- */

export const WIDGET_ICONS: Record<WidgetId, LucideIcon> = {
  enrollments: Users,
  courses: BookOpen,
  pending: ClipboardCheck,
  mockPapers: FileText,
  submissions: Activity,
  quickActions: Zap,
  people: UsersRound,
  boards: Layers,
  topCourses: Trophy,
  recent: Clock,
};

/** Tiles that use the dark emerald treatment. */
export const DARK_WIDGETS: ReadonlySet<WidgetId> = new Set<WidgetId>(["quickActions"]);

/* -------------------------------------------------------------------------- */
/*  Shared bits                                                                */
/* -------------------------------------------------------------------------- */

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid flex-1 place-items-center rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

const TONES = {
  emerald: { text: "text-emerald-600 dark:text-emerald-400", spark: "text-emerald-500" },
  amber: { text: "text-amber-600 dark:text-amber-400", spark: "text-amber-500" },
} as const;

function StatBody({
  value,
  delta,
  deltaLabel,
  trend,
  tone = "emerald",
}: {
  value: number;
  delta: number;
  deltaLabel: string;
  trend: number[];
  tone?: keyof typeof TONES;
}) {
  const t = TONES[tone];
  return (
    <div className="flex flex-1 flex-col">
      <span className="text-4xl font-semibold tracking-tight tabular-nums">{fmt(value)}</span>
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className={cn("inline-flex items-center gap-0.5 font-medium", t.text)}>
          {delta > 0 && <ArrowUpRight className="size-3" />}
          {delta > 0 ? `+${fmt(delta)}` : fmt(delta)}
        </span>
        {deltaLabel}
      </p>
      {/* Sparkline bleeds to the card edges */}
      <div className="mt-auto -mx-(--card-spacing) -mb-(--card-spacing) pt-5">
        <Sparkline data={trend} className={t.spark} />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Individual widgets                                                         */
/* -------------------------------------------------------------------------- */

function SubmissionsBody({ data }: { data: DashboardData }) {
  const { labels, submitted, graded } = data.submissionSeries;
  const totalSubmitted = submitted.reduce((a, b) => a + b, 0);
  const totalGraded = graded.reduce((a, b) => a + b, 0);
  const rate = totalSubmitted > 0 ? Math.round((totalGraded / totalSubmitted) * 100) : 0;
  const avg = labels.length ? (totalSubmitted / labels.length).toFixed(1) : "0";

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kpi label="Submitted" value={fmt(totalSubmitted)} dot="bg-emerald-500" />
        <Kpi label="Graded" value={fmt(totalGraded)} dot="bg-sky-500" />
        <Kpi label="Grading rate" value={`${rate}%`} />
        <Kpi label="Avg / day" value={avg} />
      </div>
      <AreaChart
        className="flex-1"
        labels={labels}
        series={[
          {
            name: "Submitted",
            data: submitted,
            colorClass: "text-emerald-500",
            dotClass: "bg-emerald-500",
          },
          {
            name: "Graded",
            data: graded,
            colorClass: "text-sky-500",
            dotClass: "bg-sky-500",
          },
        ]}
      />
    </div>
  );
}

function Kpi({ label, value, dot }: { label: string; value: string; dot?: string }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {dot && <span className={cn("size-2 rounded-full", dot)} />}
        {label}
      </p>
      <p className="mt-0.5 text-xl font-semibold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}

type QuickAction = { label: string; hint: string; icon: LucideIcon; href?: string };

const QUICK_ACTIONS: QuickAction[] = [
  { label: "Add course", hint: "New board & subjects", icon: Plus, href: "/admin/courses/new" },
  { label: "Manage users", hint: "Roles & access", icon: UserPlus, href: "/admin/users" },
  { label: "Browse courses", hint: "All offerings", icon: GraduationCap, href: "/admin/courses" },
  { label: "Publish mock paper", hint: "Coming soon", icon: FileText },
  { label: "Create assignment", hint: "Coming soon", icon: ClipboardCheck },
];

function QuickActionsBody() {
  return (
    <ul className="-mx-1 flex flex-col gap-0.5">
      {QUICK_ACTIONS.map((a) => {
        const Icon = a.icon;
        const inner = (
          <>
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20">
              <Icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{a.label}</span>
              <span className="block truncate text-xs text-emerald-200/60">{a.hint}</span>
            </span>
            {a.href ? (
              <ChevronRight className="size-4 text-emerald-200/40 transition-transform group-hover/action:translate-x-0.5 group-hover/action:text-emerald-200" />
            ) : (
              <Lock className="size-3.5 text-emerald-200/30" />
            )}
          </>
        );
        return (
          <li key={a.label}>
            {a.href ? (
              <Link
                href={a.href}
                className="group/action flex items-center gap-3 rounded-xl px-1 py-1.5 transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:outline-none"
              >
                {inner}
              </Link>
            ) : (
              <div
                aria-disabled
                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-1 py-1.5 opacity-60"
              >
                {inner}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function PeopleBody({ data }: { data: DashboardData }) {
  const { members, students, teachers, pendingApprovals, assignments } = data.people;
  const total = students + teachers;
  const studentPct = total > 0 ? (students / total) * 100 : 0;

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-4xl font-semibold tracking-tight tabular-nums">
            {members === null ? "—" : fmt(members)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Organization members</p>
        </div>
        {pendingApprovals > 0 && (
          <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
            {pendingApprovals} awaiting approval
          </Badge>
        )}
      </div>

      <div>
        <div className="flex h-2 overflow-hidden rounded-full bg-muted">
          <div className="bg-emerald-500 transition-all" style={{ width: `${studentPct}%` }} />
          <div className="bg-sky-500 transition-all" style={{ width: `${total > 0 ? 100 - studentPct : 0}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <Mini label="Students" value={students} dot="bg-emerald-500" />
          <Mini label="Teachers" value={teachers} dot="bg-sky-500" />
          <Mini label="Assignments" value={assignments} dot="bg-muted-foreground/40" />
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value, dot }: { label: string; value: number; dot: string }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className={cn("size-2 rounded-full", dot)} />
        {label}
      </p>
      <p className="text-lg font-semibold tabular-nums">{fmt(value)}</p>
    </div>
  );
}

function BoardsBody({ data }: { data: DashboardData }) {
  if (data.boards.length === 0) {
    return <EmptyHint>No courses yet. Create one to see the breakdown.</EmptyHint>;
  }
  const max = Math.max(...data.boards.map((b) => b.students), 1);
  return (
    <ul className="flex flex-col gap-4">
      {data.boards.map((b) => (
        <li key={b.board} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium">{b.board}</span>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {fmt(b.students)} students · {b.courses} {b.courses === 1 ? "course" : "courses"}
            </span>
          </div>
          <Progress
            value={(b.students / max) * 100}
            aria-label={`${b.board}: ${b.students} students`}
            className="gap-0 [&_[data-slot=progress-indicator]]:rounded-full [&_[data-slot=progress-indicator]]:bg-emerald-500 [&_[data-slot=progress-track]]:h-1.5"
          />
        </li>
      ))}
    </ul>
  );
}

function TopCoursesBody({ data }: { data: DashboardData }) {
  if (data.topCourses.length === 0) {
    return <EmptyHint>Courses will be ranked here once students enroll.</EmptyHint>;
  }
  return (
    <ol className="flex flex-col gap-1">
      {data.topCourses.map((c, i) => (
        <li
          key={c.id}
          className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/60"
        >
          <span
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-lg text-xs font-semibold tabular-nums",
              i === 0
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                : "bg-muted text-muted-foreground",
            )}
          >
            {i + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{c.title}</span>
            <span className="block truncate text-xs text-muted-foreground">{c.board}</span>
          </span>
          <span className="shrink-0 text-right">
            <span className="block text-sm font-semibold tabular-nums">{fmt(c.students)}</span>
            <span className="block text-[10px] text-muted-foreground">students</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

const ACTIVITY_STYLE: Record<ActivityKind, { icon: LucideIcon; chip: string }> = {
  submission: { icon: ClipboardCheck, chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  enrollment: { icon: UserPlus, chip: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  course: { icon: BookOpen, chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  mock: { icon: FileText, chip: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  assignment: { icon: GraduationCap, chip: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
};

function RecentBody({ data }: { data: DashboardData }) {
  if (data.activity.length === 0) {
    return <EmptyHint>Activity from your organization will appear here.</EmptyHint>;
  }
  return (
    <ul className="flex flex-col gap-3.5">
      {data.activity.map((a) => {
        const s = ACTIVITY_STYLE[a.kind];
        const Icon = s.icon;
        return (
          <li key={a.id} className="flex items-start gap-3">
            <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-full", s.chip)}>
              <Icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{a.title}</span>
              <span className="block truncate text-xs text-muted-foreground">{a.detail}</span>
            </span>
            <span className="shrink-0 pt-0.5 text-xs text-muted-foreground">{a.ago}</span>
          </li>
        );
      })}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/*  Registry                                                                   */
/* -------------------------------------------------------------------------- */

export function WidgetBody({ id, data }: { id: WidgetId; data: DashboardData }) {
  switch (id) {
    case "enrollments":
      return (
        <StatBody
          value={data.stats.enrollments.total}
          delta={data.stats.enrollments.delta}
          deltaLabel="this week"
          trend={data.stats.enrollments.trend}
        />
      );
    case "courses":
      return (
        <StatBody
          value={data.stats.courses.total}
          delta={data.stats.courses.delta}
          deltaLabel="last 30 days"
          trend={data.stats.courses.trend}
        />
      );
    case "pending":
      return (
        <StatBody
          tone="amber"
          value={data.stats.pending.total}
          delta={data.stats.pending.gradedThisWeek}
          deltaLabel="graded this week"
          trend={data.stats.pending.trend}
        />
      );
    case "mockPapers":
      return (
        <StatBody
          value={data.stats.mockPapers.total}
          delta={data.stats.mockPapers.delta}
          deltaLabel="last 30 days"
          trend={data.stats.mockPapers.trend}
        />
      );
    case "submissions":
      return <SubmissionsBody data={data} />;
    case "quickActions":
      return <QuickActionsBody />;
    case "people":
      return <PeopleBody data={data} />;
    case "boards":
      return <BoardsBody data={data} />;
    case "topCourses":
      return <TopCoursesBody data={data} />;
    case "recent":
      return <RecentBody data={data} />;
  }
}
