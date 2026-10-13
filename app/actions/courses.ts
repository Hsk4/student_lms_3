"use server"

import { requireRole } from "@/lib/auth/guards"

import {connectToDatabase} from "@/lib/db"

import {Course, BoardType} from "@/app/models/course";
import {revalidatePath} from "next/cache";


// create a course offering (offered to admins only)

export async function createCourse(data: {
    board: BoardType;
    levelOrGrade: string;
    subjects: string[];
})
{
    const { userId, orgId } = await requireRole(["admin"], { fresh: true, requireOrg: true });


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

    // Any signed-in, active user with a role may list their org's courses.
    const ctx = await requireRole(["admin", "teacher", "student"], { requireOrg: true }).catch(() => null);

    if(!ctx){
        return [];
    }

    await connectToDatabase();
    const courses = await Course.find({ orgId: ctx.orgId }).sort({ createdAt: -1 }).lean();

    return JSON.parse(JSON.stringify(courses));
};


// Delete a Course offering (Admin Only)
export async function deleteCourse(courseId: string) {
    const { orgId } = await requireRole(["admin"], { fresh: true, requireOrg: true });

    await connectToDatabase();
    await Course.deleteOne({ _id: courseId, orgId });

    revalidatePath("/dashboard/courses");
    return { success: true };
}
