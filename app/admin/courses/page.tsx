import { getCoursesByOrg } from "@/app/actions/courses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

async function CoursesList() {
    const courses = await getCoursesByOrg();

    if (courses.length === 0) {
        return (
            <div className="text-center py-20 border-2 border-dashed rounded-2xl">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No courses found</h3>
                <p className="text-muted-foreground mb-6">Start by creating your first course for your organization.</p>
                <Link href="/admin/courses/new">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Plus className="w-4 h-4 mr-2" /> Add Your First Course
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
                <Card key={course._id} className="overflow-hidden border-transparent hover:border-emerald-200 transition-all group">
                    <div className="h-2 bg-emerald-600 w-full" />
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{course.levelOrGrade}</CardTitle>
                            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded tracking-wider">
                                {course.board}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {course.subjects.map((sub: string) => (
                                <span key={sub} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                                    {sub}
                                </span>
                            ))}
                        </div>
                        <div className="pt-4 border-t flex justify-between items-center text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <GraduationCap className="w-3 h-3" />
                                {course.subjects.length} Subjects
                            </span>
                            <Button variant="ghost" size="sm" className="h-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                                View Details
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default function AdminCoursesPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Courses & Boards</h1>
                    <p className="text-sm text-muted-foreground">Manage curricula and subjects for your educational organization.</p>
                </div>
                <Link href="/admin/courses/new">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                        <Plus className="w-4 h-4" /> Create Course
                    </Button>
                </Link>
            </div>

            <Suspense fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />
                    ))}
                </div>
            }>
                <CoursesList />
            </Suspense>
        </div>
    );
}