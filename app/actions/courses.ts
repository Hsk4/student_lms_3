"use server"

import {auth } from "@clerk/nextjs/server"

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
    const {userId , orgId, has } = await auth();

    if(!userId || !orgId){
        throw new Error("Unauthorized");
    }

    // Check Clerk B2B role permission
    const isAdmin = has({ role: "org:admin" });
    if (!isAdmin) {
        throw new Error("Unauthorized: Admin privileges required to create courses.");
    }


    await connectToDatabase();


    const newCourse = await Course.create({
        board : data.board,
        levelOrGrade : data.levelOrGrade,
        subjects : data.subjects,
        createdBy : userId,
        orgId : orgId
    });


    revalidatePath("/dashboard/courses");
    return {success: true, courseId: newCourse._id.toString()};
}


export async function getCoursesByOrg(){

    const {orgId} = await auth();

    if(!orgId){
        return [];
    }

    await connectToDatabase();
    const courses = await Course.find({ orgId }).sort({ createdAt: -1 }).lean();

    return JSON.parse(JSON.stringify(courses));
};


// Delete a Course offering (Admin Only)
export async function deleteCourse(courseId: string) {
    const { userId, orgId, has } = await auth();

    if (!userId || !orgId || !has({ role: "org:admin" })) {
        throw new Error("Forbidden: Admin privileges required to delete courses.");
    }

    await connectToDatabase();
    await Course.deleteOne({ _id: courseId, orgId });

    revalidatePath("/dashboard/courses");
    return { success: true };
}