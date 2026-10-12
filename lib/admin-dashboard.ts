import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import type { Model } from "mongoose";

import { connectToDatabase } from "@/lib/db";
import { Course } from "@/app/models/course";
import { Enrollment } from "@/app/models/Enrollment";
import { Assignment } from "@/app/models/Assignment";
import { MockPaper } from "@/app/models/MockPaper";
import { Submission } from "@/app/models/Submission";

/* -------------------------------------------------------------------------- */
/*  Types (plain, serialisable — these cross the server → client boundary)     */
/* -------------------------------------------------------------------------- */

export type ActivityKind =
  | "submission"
  | "enrollment"
  | "course"
  | "mock"
  | "assignment";

export interface DashboardData {
  /** False when the admin has no active Clerk organization. */
  hasOrg: boolean;
  /** True when a data source failed and some numbers are missing. */
  degraded: boolean;
  orgName: string | null;
  stats: {
    enrollments: { total: number; delta: number; trend: number[] };
    courses: { total: number; delta: number; trend: number[] };
    pending: { total: number; gradedThisWeek: number; trend: number[] };
    mockPapers: { total: number; delta: number; trend: number[] };
  };
  people: {
    members: number | null;
    students: number;
    teachers: number;
    pendingApprovals: number;
    assignments: number;
  };
  submissionSeries: {
    labels: string[];
    submitted: number[];
    graded: number[];
  };
  boards: { board: string; courses: number; students: number }[];
  topCourses: {
    id: string;
    title: string;
    board: string;
    students: number;
    teachers: number;
  }[];
  activity: {
    id: string;
    kind: ActivityKind;
    title: string;
    detail: string;
    ago: string;
  }[];
}

/* -------------------------------------------------------------------------- */
/*  Small helpers                                                              */
/* -------------------------------------------------------------------------- */

const DAY = 86_400_000;

/** `n` UTC day keys (YYYY-MM-DD) ending today, oldest first. */
function dayKeys(n: number, now: number): string[] {
  const today = new Date(now);
  const base = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  return Array.from({ length: n }, (_, i) =>
    new Date(base - (n - 1 - i) * DAY).toISOString().slice(0, 10),
  );
}

/** Per-day document counts for the given keys, via one aggregation. */
async function dailyCounts(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>,
  match: Record<string, unknown>,
  field: "createdAt" | "updatedAt",
  keys: string[],
): Promise<number[]> {
  const since = new Date(`${keys[0]}T00:00:00.000Z`);
  const rows = await model.aggregate<{ _id: string; n: number }>([
    { $match: { ...match, [field]: { $gte: since } } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: `$${field}`, timezone: "UTC" },
        },
        n: { $sum: 1 },
      },
    },
  ]);
  const byDay = new Map(rows.map((r) => [r._id, r.n]));
  return keys.map((k) => byDay.get(k) ?? 0);
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** Collapse a daily series into weekly buckets (oldest first). */
function weekly(daily: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < daily.length; i += 7) out.push(sum(daily.slice(i, i + 7)));
  return out;
}

function ago(date: Date, now: number): string {
  const s = Math.max(0, Math.round((now - date.getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function chartLabel(key: string): string {
  return new Date(`${key}T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function emptyData(partial: Partial<DashboardData> = {}): DashboardData {
  const keys14 = Array.from({ length: 14 }, () => 0);
  return {
    hasOrg: true,
    degraded: false,
    orgName: null,
    stats: {
      enrollments: { total: 0, delta: 0, trend: Array(8).fill(0) },
      courses: { total: 0, delta: 0, trend: Array(8).fill(0) },
      pending: { total: 0, gradedThisWeek: 0, trend: keys14 },
      mockPapers: { total: 0, delta: 0, trend: Array(8).fill(0) },
    },
    people: {
      members: null,
      students: 0,
      teachers: 0,
      pendingApprovals: 0,
      assignments: 0,
    },
    submissionSeries: { labels: [], submitted: [], graded: [] },
    boards: [],
    topCourses: [],
    activity: [],
    ...partial,
  };
}

/* -------------------------------------------------------------------------- */
/*  Main loader                                                                */
/* -------------------------------------------------------------------------- */

export async function getAdminDashboardData(): Promise<DashboardData> {
  // Opt in to request-time rendering before touching Date / the DB
  // (required by Cache Components).
  await connection();

  const { userId, orgId, has } = await auth();
  if (!userId || !has({ role: "org:admin" })) redirect("/");
  if (!orgId) return emptyData({ hasOrg: false });

  const now = Date.now();
  const keys14 = dayKeys(14, now);
  const keys56 = dayKeys(56, now);
  const weekAgo = new Date(now - 7 * DAY);

  const data = emptyData();

  /* ---- Clerk: org name + member count (independent of Mongo) ------------ */
  const clerkPart = (async () => {
    try {
      const client = await clerkClient();
      const [org, memberships] = await Promise.all([
        client.organizations.getOrganization({ organizationId: orgId }),
        client.organizations.getOrganizationMembershipList({
          organizationId: orgId,
          limit: 1,
        }),
      ]);
      data.orgName = org.name;
      data.people.members = memberships.totalCount;
    } catch (err) {
      console.error("[admin-dashboard] Clerk lookup failed", err);
      data.degraded = true;
    }
  })();

  /* ---- Mongo: everything else, scoped to this organization -------------- */
  const mongoPart = (async () => {
    try {
      await connectToDatabase();

      const [courses, assignments] = await Promise.all([
        Course.find({ orgId })
          .select("board levelOrGrade subjects createdAt")
          .sort({ createdAt: -1 })
          .lean(),
        Assignment.find({ orgId })
          .select("title createdAt")
          .sort({ createdAt: -1 })
          .lean(),
      ]);

      const courseIds = courses.map((c) => c._id);
      const assignmentIds = assignments.map((a) => a._id);
      const inCourses = { courseId: { $in: courseIds } };
      const inAssignments = { assignmentId: { $in: assignmentIds } };

      const courseTitle = new Map(
        courses.map((c) => [c._id.toString(), `${c.levelOrGrade} · ${c.board}`]),
      );
      const assignmentTitle = new Map(
        assignments.map((a) => [a._id.toString(), a.title]),
      );

      const [
        approvedTotal,
        pendingApprovals,
        studentIds,
        teacherIds,
        perCourseRoles,
        enrollmentDaily,
        courseDaily,
        mockDaily,
        mockTotal,
        pendingTotal,
        gradedThisWeek,
        submittedDaily,
        gradedDaily,
        recentSubmissions,
        recentEnrollments,
        recentMocks,
      ] = await Promise.all([
        Enrollment.countDocuments({ ...inCourses, status: "approved" }),
        Enrollment.countDocuments({ ...inCourses, status: "pending" }),
        Enrollment.distinct("userId", { ...inCourses, status: "approved", role: "student" }),
        Enrollment.distinct("userId", { ...inCourses, status: "approved", role: "teacher" }),
        Enrollment.aggregate<{ _id: { courseId: string; role: string }; n: number }>([
          { $match: { ...inCourses, status: "approved" } },
          { $group: { _id: { courseId: "$courseId", role: "$role" }, n: { $sum: 1 } } },
        ]),
        dailyCounts(Enrollment, { ...inCourses, status: "approved" }, "createdAt", keys56),
        dailyCounts(Course, { orgId }, "createdAt", keys56),
        dailyCounts(MockPaper, { orgId }, "createdAt", keys56),
        MockPaper.countDocuments({ orgId }),
        Submission.countDocuments({ ...inAssignments, status: "submitted" }),
        Submission.countDocuments({
          ...inAssignments,
          status: "graded",
          updatedAt: { $gte: weekAgo },
        }),
        dailyCounts(Submission, inAssignments, "createdAt", keys14),
        dailyCounts(Submission, { ...inAssignments, status: "graded" }, "updatedAt", keys14),
        Submission.find(inAssignments).sort({ createdAt: -1 }).limit(5).lean(),
        Enrollment.find(inCourses).sort({ createdAt: -1 }).limit(4).lean(),
        MockPaper.find({ orgId })
          .select("title subject createdAt")
          .sort({ createdAt: -1 })
          .limit(3)
          .lean(),
      ]);

      /* Stat cards */
      data.stats.enrollments = {
        total: approvedTotal,
        delta: sum(enrollmentDaily.slice(-7)),
        trend: weekly(enrollmentDaily),
      };
      data.stats.courses = {
        total: courses.length,
        delta: sum(courseDaily.slice(-30)),
        trend: weekly(courseDaily),
      };
      data.stats.pending = {
        total: pendingTotal,
        gradedThisWeek,
        trend: submittedDaily,
      };
      data.stats.mockPapers = {
        total: mockTotal,
        delta: sum(mockDaily.slice(-30)),
        trend: weekly(mockDaily),
      };

      /* People */
      data.people.students = studentIds.length;
      data.people.teachers = teacherIds.length;
      data.people.pendingApprovals = pendingApprovals;
      data.people.assignments = assignments.length;

      /* Chart */
      data.submissionSeries = {
        labels: keys14.map(chartLabel),
        submitted: submittedDaily,
        graded: gradedDaily,
      };

      /* Per-course roll-up → boards + top courses */
      const roles = new Map<string, { students: number; teachers: number }>();
      for (const row of perCourseRoles) {
        const id = String(row._id.courseId);
        const entry = roles.get(id) ?? { students: 0, teachers: 0 };
        if (row._id.role === "student") entry.students += row.n;
        if (row._id.role === "teacher") entry.teachers += row.n;
        roles.set(id, entry);
      }

      const boardMap = new Map<string, { courses: number; students: number }>();
      for (const c of courses) {
        const b = boardMap.get(c.board) ?? { courses: 0, students: 0 };
        b.courses += 1;
        b.students += roles.get(c._id.toString())?.students ?? 0;
        boardMap.set(c.board, b);
      }
      data.boards = [...boardMap.entries()]
        .map(([board, v]) => ({ board, ...v }))
        .sort((a, b) => b.students - a.students || b.courses - a.courses);

      data.topCourses = courses
        .map((c) => {
          const r = roles.get(c._id.toString());
          return {
            id: c._id.toString(),
            title: c.levelOrGrade,
            board: c.board,
            students: r?.students ?? 0,
            teachers: r?.teachers ?? 0,
          };
        })
        .sort((a, b) => b.students - a.students)
        .slice(0, 5);

      /* Activity feed: merge a few sources, newest first */
      const feed: (DashboardData["activity"][number] & { at: number })[] = [
        ...recentSubmissions.map((s) => ({
          id: `sub-${s._id}`,
          kind: "submission" as const,
          title:
            s.status === "graded"
              ? "Submission graded"
              : s.status === "resubmit_required"
                ? "Resubmission requested"
                : "New submission",
          detail: assignmentTitle.get(String(s.assignmentId)) ?? "Assignment",
          at: s.createdAt.getTime(),
          ago: ago(s.createdAt, now),
        })),
        ...recentEnrollments.map((e) => ({
          id: `enr-${e._id}`,
          kind: "enrollment" as const,
          title: `${e.role === "teacher" ? "Teacher" : "Student"} ${
            e.status === "pending" ? "requested access" : "assigned"
          }`,
          detail: courseTitle.get(String(e.courseId)) ?? "Course",
          at: e.createdAt.getTime(),
          ago: ago(e.createdAt, now),
        })),
        ...courses.slice(0, 3).map((c) => ({
          id: `crs-${c._id}`,
          kind: "course" as const,
          title: "Course created",
          detail: `${c.levelOrGrade} · ${c.board}`,
          at: c.createdAt.getTime(),
          ago: ago(c.createdAt, now),
        })),
        ...recentMocks.map((m) => ({
          id: `mock-${m._id}`,
          kind: "mock" as const,
          title: "Mock paper published",
          detail: m.title,
          at: m.createdAt.getTime(),
          ago: ago(m.createdAt, now),
        })),
        ...assignments.slice(0, 3).map((a) => ({
          id: `asg-${a._id}`,
          kind: "assignment" as const,
          title: "Assignment created",
          detail: a.title,
          at: a.createdAt.getTime(),
          ago: ago(a.createdAt, now),
        })),
      ];
      data.activity = feed
        .sort((a, b) => b.at - a.at)
        .slice(0, 8)
        .map((item) => ({
          id: item.id,
          kind: item.kind,
          title: item.title,
          detail: item.detail,
          ago: item.ago,
        }));
    } catch (err) {
      console.error("[admin-dashboard] Mongo queries failed", err);
      data.degraded = true;
    }
  })();

  await Promise.all([clerkPart, mongoPart]);
  return data;
}
