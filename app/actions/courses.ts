"use server"

import { requireCourseAccess, requireOrgContext, requirePermission } from "@/lib/auth/guards"
import { ORG_PERMISSIONS } from "@/lib/auth/roles"

import {connectToDatabase} from "@/lib/db"

import {Course, BoardType} from "@/app/models/course";
import { Enrollment } from "@/app/models/Enrollment";
import {revalidatePath} from "next/cache";


// create a course offering (offered to admins only)

export async function createCourse(data: {
    board: BoardType;
    levelOrGrade: string;
    subjects: string[];
})
{
    const { userId, orgId } = await requirePermission(ORG_PERMISSIONS.courseCreate, {
        fresh: true,
        requireOrg: true,
    });


    await connectToDatabase();


    const newCourse = await Course.create({
        board : data.board,
        levelOrGrade : data.levelOrGrade,
        subjects : data.subjects,
        createdBy : userId,
        orgId : orgId!
    });


    revalidatePath("/dashboard/courses");
    return {success: true, courseId: newCourse._id.toString()};
}


export async function getCoursesByOrg(){

    const ctx = await requireOrgContext({ requireOrg: true }).catch(() => null);

    if(!ctx){
        return [];
    }

    await connectToDatabase();

    if (ctx.role === "student") {
        const enrollments = await Enrollment.find({
            orgId: ctx.orgId,
            userId: ctx.userId,
            role: "student",
            status: "approved",
        }).populate("courseId").lean();

        const courses = enrollments
            .map((enrollment) => enrollment.courseId)
            .filter(Boolean);

        return JSON.parse(JSON.stringify(courses));
    }

    const courses = await Course.find({ orgId: ctx.orgId }).sort({ createdAt: -1 }).lean();

    return JSON.parse(JSON.stringify(courses));
};


// Delete a Course offering (Admin Only)
export async function deleteCourse(courseId: string) {
    const { orgId } = await requireCourseAccess(courseId, "manage");

    await connectToDatabase();
    await Course.deleteOne({ _id: courseId, orgId });

    revalidatePath("/dashboard/courses");
    revalidatePath("/admin/courses");
    return { success: true };
}
