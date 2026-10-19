"use server";

import { connectToDatabase } from "@/lib/db";
import { Course } from "@/app/models/course";
import { Board } from "@/app/models/Board";
import { Level } from "@/app/models/Level";
import { Subject } from "@/app/models/Subject";
import { Enrollment } from "@/app/models/Enrollment";
import { requirePermission, requireRole, AuthError } from "@/lib/auth/guards";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export type CatalogCourse = {
  _id: string;
  medium?: string;
  isActive: boolean;
  createdAt: string;
  board: { _id: string; name: string } | null;
  level: { _id: string; name: string; order: number } | null;
  subject: { _id: string; name: string } | null;
};

function fail(error: unknown, fallback: string): string {
  return error instanceof AuthError
    ? error.message
    : error instanceof Error
      ? error.message
      : fallback;
}

/**
 * All courses with their board, level and subject resolved.
 */
export async function getCoursesByOrg(): Promise<
  ActionResult<CatalogCourse[]>
> {
  try {
    await requirePermission("course:view", { fresh: true });
    await connectToDatabase();

    const courses = await Course.find({})
      .populate("boardId", "name")
      .populate("levelId", "name order")
      .populate("subjectId", "name")
      .sort({ createdAt: -1 })
      .lean();

    const data = courses.map((c) => ({
      _id: String(c._id),
      medium: c.medium,
      isActive: c.isActive,
      createdAt: new Date(c.createdAt).toISOString(),
      board: c.boardId as unknown as CatalogCourse["board"],
      level: c.levelId as unknown as CatalogCourse["level"],
      subject: c.subjectId as unknown as CatalogCourse["subject"],
    }));

    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error) {
    const message = fail(error, "Failed to fetch courses");
    console.error("getCoursesByOrg error:", message);
    return { success: false, error: message };
  }
}

/**
 * Catalog lookup lists for the course form (active entries only).
 */
export async function getCatalogOptions(): Promise<
  ActionResult<{
    boards: { _id: string; name: string }[];
    levels: { _id: string; name: string; order: number }[];
    subjects: { _id: string; name: string }[];
  }>
> {
  try {
    await requirePermission("course:manage", { fresh: true });
    await connectToDatabase();

    const [boards, levels, subjects] = await Promise.all([
      Board.find({ isActive: true }).select("name").sort({ name: 1 }).lean(),
      Level.find({ isActive: true })
        .select("name order")
        .sort({ order: 1, name: 1 })
        .lean(),
      Subject.find({ isActive: true }).select("name").sort({ name: 1 }).lean(),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify({ boards, levels, subjects })),
    };
  } catch (error) {
    const message = fail(error, "Failed to load catalog options");
    return { success: false, error: message };
  }
}

/**
 * Courses a specific user is enrolled in (student or teacher).
 */
export async function getUserCourses(): Promise<ActionResult<any[]>> {
  try {
    const ctx = await requireRole(
      ["student", "teacher", "admin", "super_admin"],
      {
        fresh: true,
      },
    );
    await connectToDatabase();

    const enrollments = await Enrollment.find({
      userId: ctx.userId,
      status: "approved",
    })
      .populate("courseId")
      .lean();

    const courses = enrollments.map((e: any) => e.courseId).filter(Boolean);
    return { success: true, data: JSON.parse(JSON.stringify(courses)) };
  } catch (error) {
    const message = fail(error, "Failed to fetch courses");
    console.error("getUserCourses error:", message);
    return { success: false, error: message };
  }
}

/* Course create/update/delete live in app/actions/catalog.ts */
