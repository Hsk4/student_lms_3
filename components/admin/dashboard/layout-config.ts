/**
 * Shared (server + client safe) description of the bento dashboard.
 * No "use client" here on purpose, so server components (e.g. the loading
 * skeleton) can import these constants as real values.
 */

export type WidgetId =
  | "enrollments"
  | "courses"
  | "pending"
  | "mockPapers"
  | "submissions"
  | "quickActions"
  | "people"
  | "boards"
  | "topCourses"
  | "recent";

/** The out-of-the-box arrangement. Users can reorder; we persist their order. */
export const DEFAULT_ORDER: WidgetId[] = [
  "enrollments",
  "courses",
  "pending",
  "mockPapers",
  "submissions",
  "quickActions",
  "people",
  "boards",
  "topCourses",
  "recent",
];

type WidgetLayout = {
  title: string;
  description?: string;
  /** Grid placement. Kept as literal strings so Tailwind can see them. */
  className: string;
};

export const WIDGET_LAYOUT: Record<WidgetId, WidgetLayout> = {
  enrollments: {
    title: "Enrollments",
    className: "lg:col-span-3",
  },
  courses: {
    title: "Courses",
    className: "lg:col-span-3",
  },
  pending: {
    title: "Pending reviews",
    className: "lg:col-span-3",
  },
  mockPapers: {
    title: "Mock papers",
    className: "lg:col-span-3",
  },
  submissions: {
    title: "Submission activity",
    description: "Submitted vs. graded, last 14 days",
    className: "sm:col-span-2 lg:col-span-8 lg:row-span-2",
  },
  quickActions: {
    title: "Quick actions",
    className: "lg:col-span-4",
  },
  people: {
    title: "People",
    description: "Members and course assignments",
    className: "lg:col-span-4",
  },
  boards: {
    title: "Curriculum by board",
    description: "Students enrolled per educational board",
    className: "lg:col-span-4",
  },
  topCourses: {
    title: "Top courses",
    description: "Ranked by enrolled students",
    className: "lg:col-span-4",
  },
  recent: {
    title: "Recent activity",
    className: "sm:col-span-2 lg:col-span-4",
  },
};
