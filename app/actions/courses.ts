"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import { Course, type ICourse } from "@/app/models/course";
import { Enrollment } from "@/app/models/Enrollment";
import { requirePagePermission, AuthError } from "@/lib/auth/guards";
import { ORG_PERMISSIONS } from "@/lib/auth/roles";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Get all courses for an organization
 */
export async function getCoursesByOrg(): Promise<ActionResult<any[]>> {
  try {
    const ctx = await requirePagePermission(ORG_PERMISSIONS.courseView, { 
      requireOrg: true,
      fresh: true,
    });
    await connectToDatabase();

    const courses = await Course.find({ orgId: ctx.orgId }).sort({ createdAt: -1 }).lean();
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
    const ctx = await requirePagePermission(ORG_PERMISSIONS.courseManage, { 
      fresh: true, 
      requireOrg: true 
    });

    if (!data.board?.trim() || !data.levelOrGrade?.trim() || !data.subjects?.length) {
      return { success: false, error: "Missing required fields: board, levelOrGrade, subjects" };
    }

    await connectToDatabase();

    const course = await Course.create({
      board: data.board,
      levelOrGrade: data.levelOrGrade,
      subjects: data.subjects,
      createdBy: ctx.userId,
      orgId: ctx.orgId,
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
    const ctx = await requirePagePermission(ORG_PERMISSIONS.courseManage, { 
      fresh: true, 
      requireOrg: true 
    });
    await connectToDatabase();

    const course = await Course.findOne({ _id: courseId, orgId: ctx.orgId });
    if (!course) {
      throw new AuthError("Course not found", 404);
    }

    if (course.createdBy !== ctx.userId && !ctx.has({ permission: ORG_PERMISSIONS.memberManage })) {
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
    const ctx = await requirePagePermission(ORG_PERMISSIONS.courseView, { 
      requireOrg: true,
      fresh: true,
    });
    await connectToDatabase();

    const enrollments = await Enrollment.find({
      userId: ctx.userId,
      orgId: ctx.orgId,
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
