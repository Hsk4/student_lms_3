"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import { Course, type ICourse } from "@/app/models/course";
import { Enrollment } from "@/app/models/Enrollment";
import { requirePermission, requireRole, AuthError } from "@/lib/auth/guards";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Get all courses
 */
export async function getCoursesByOrg(): Promise<ActionResult<any[]>> {
  try {
    await requirePermission("course:view", { fresh: true });
    await connectToDatabase();

    const courses = await Course.find({}).sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(courses)) };
  } catch (error) {
    const message = error instanceof AuthError
      ? error.message
      : error instanceof Error
      ? error.message
      : "Failed to fetch courses";
    console.error("getCoursesByOrg error:", message);
    return { success: false, error: message };
  }
}

/**
 * Create a new course
 */
export async function createCourse(data: {
  board: string;
  levelOrGrade: string;
  subjects: string[];
}): Promise<ActionResult<any>> {
  try {
    const ctx = await requirePermission("course:manage", { fresh: true });

    if (!data.board?.trim() || !data.levelOrGrade?.trim() || !data.subjects?.length) {
      return { success: false, error: "Missing required fields: board, levelOrGrade, subjects" };
    }

    await connectToDatabase();

    const course = await Course.create({
      board: data.board,
      levelOrGrade: data.levelOrGrade,
      subjects: data.subjects,
      createdBy: ctx.userId,
    } as Partial<ICourse>);

    revalidatePath("/admin/courses");
    return { success: true, data: JSON.parse(JSON.stringify(course)) };
  } catch (error) {
    const message = error instanceof AuthError
      ? error.message
      : error instanceof Error
      ? error.message
      : "Failed to create course";
    console.error("createCourse error:", message);
    return { success: false, error: message };
  }
}

/**
 * Delete a course
 */
export async function deleteCourse(courseId: string): Promise<ActionResult<null>> {
  try {
    const ctx = await requirePermission("course:manage", { fresh: true });
    await connectToDatabase();

    const course = await Course.findOne({ _id: courseId });
    if (!course) {
      throw new AuthError("Course not found", 404);
    }

    if (course.createdBy !== ctx.userId && !ctx.has({ permission: "user:manage" })) {
      throw new AuthError("Not authorized to delete this course", 403);
    }

    await Enrollment.deleteMany({ courseId });
    await Course.findByIdAndDelete(courseId);

    revalidatePath("/admin/courses");
    return { success: true, data: null };
  } catch (error) {
    const message = error instanceof AuthError
      ? error.message
      : error instanceof Error
      ? error.message
      : "Failed to delete course";
    console.error("deleteCourse error:", message);
    return { success: false, error: message };
  }
}

/**
 * Get courses for a specific user
 */
export async function getUserCourses(): Promise<ActionResult<any[]>> {
  try {
    const ctx = await requireRole(["student", "teacher", "admin"], { fresh: true });
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
    const message = error instanceof AuthError 
      ? error.message 
      : error instanceof Error 
      ? error.message 
      : "Failed to fetch courses";
    console.error("getUserCourses error:", message);
    return { success: false, error: message };
  }
}
