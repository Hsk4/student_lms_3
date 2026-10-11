// app/test-courses/page.tsx
import { createCourse, getCoursesByOrg } from "@/app/actions/courses";
import { Suspense } from "react";

async function CoursesList() {
    const courses = await getCoursesByOrg();
    return <pre>{JSON.stringify(courses, null, 2)}</pre>;
}

export default function TestCoursesPage() {
    async function handleCreate(formData: FormData) {
        "use server";
        const board = formData.get("board") as any;
        const levelOrGrade = formData.get("levelOrGrade") as string;
        const subjects = (formData.get("subjects") as string)
            .split(",")
            .map((s) => s.trim());

        await createCourse({ board, levelOrGrade, subjects });
    }

    return (
        <div style={{ padding: "20px" }}>
            <h2>Test Course Creation (Admin Only)</h2>
            <form action={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
                <select name="board" required>
                    <option value="Sindh Board">Sindh Board</option>
                    <option value="Aga Khan Board">Aga Khan Board</option>
                    <option value="O Levels">O Levels</option>
                    <option value="A Levels">A Levels</option>
                    <option value="BCOM">BCOM</option>
                    <option value="Bachelors">Bachelors</option>
                </select>
                <input name="levelOrGrade" placeholder="Level/Grade (e.g., 1st year)" required />
                <input name="subjects" placeholder="Subjects (comma separated)" required />
                <button type="submit">Create Course</button>
            </form>

            <hr style={{ margin: "20px 0" }} />

            <h2>Existing Courses in Org</h2>
            <Suspense fallback={<div>Loading courses...</div>}>
                <CoursesList />
            </Suspense>
        </div>
    );
}