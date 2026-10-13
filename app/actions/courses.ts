"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import { Course, type ICourse } from "@/app/models/course";
import { Enrollment } from "@/app/models/Enrollment";
import { requirePagePermission, AuthError } from "@/lib/auth/guards";
import { ORG_PERMISSIONS } from "@/lib/auth/roles";

/**
 * Get all courses for an organization
 */
export async function getCoursesByOrg() {
  try {
    const ctx = await requirePagePermission(ORG_PERMISSIONS.courseView, { requireOrg: true });
    await connectToDatabase();

    const courses = await Course.find({ orgId: ctx.orgId }).sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(courses)) };
  } catch (error) {
    console.error("Error fetching courses:", error);
    return { success: false, error: "Failed to fetch courses" };
  }
}

/**
 * Create a new course
 */
export async function createCourse(data: {
  board: string;
  levelOrGrade: string;
  subjects: string[];
}) {
  try {
    const ctx = await requirePagePermission(ORG_PERMISSIONS.courseManage, { fresh: true, requireOrg: true });
    await connectToDatabase();

    if (!data.board || !data.levelOrGrade || !data.subjects?.length) {
      return { success: false, error: "Missing required fields" };
    }

    const course = await Course.create({
      board: data.board,
      levelOrGrade: data.levelOrGrade,
      subjects: data.subjects,
      createdBy: ctx.userId,
      orgId: ctx.orgId,
    } as Partial<ICourse>);

    try {
      revalidatePath("/admin/courses");
    } catch (e) {}

    return { success: true, data: JSON.parse(JSON.stringify(course)) };
  } catch (error) {
    console.error("Error creating course:", error);
    return { success: false, error: "Failed to create course" };
  }
}

/**
 * Delete a course
 */
export async function deleteCourse(courseId: string) {
  try {
    const ctx = await requirePagePermission(ORG_PERMISSIONS.courseManage, { fresh: true, requireOrg: true });
    await connectToDatabase();

    const course = await Course.findOne({ _id: courseId, orgId: ctx.orgId });
    if (!course) throw new AuthError("NOT_FOUND", 404);

    if (course.createdBy !== ctx.userId && !ctx.has({ permission: ORG_PERMISSIONS.memberManage })) {
      throw new AuthError("FORBIDDEN", 403);
    }

    await Enrollment.deleteMany({ courseId });
    await Course.findByIdAndDelete(courseId);

    try {
      revalidatePath("/admin/courses");
    } catch (e) {}

    return { success: true };
  } catch (error) {
    console.error("Error deleting course:", error);
    return { success: false, error: "Failed to delete course" };
  }
}

/**
 * Get courses for a specific user
 */
export async function getUserCourses() {
  try {
    const ctx = await requirePagePermission(ORG_PERMISSIONS.courseView, { requireOrg: true });
    await connectToDatabase();

    const enrollments = await Enrollment.find({
      userId: ctx.userId,
      orgId: ctx.orgId,
      status: "approved",
    })
      .populate("courseId")
      .lean();

    const courses = enrollments.map((e: any) => e.courseId);
    return { success: true, data: JSON.parse(JSON.stringify(courses)) };
  } catch (error) {
    console.error("Error fetching user courses:", error);
    return { success: false, error: "Failed to fetch courses" };
  }
}
