import { requirePageRole } from "@/lib/auth/guards";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import { connectToDatabase } from "@/lib/db";
import { Enrollment } from "@/app/models/Enrollment";
import { User } from "@/app/models/User";
import { Book } from "@/app/models/Book";
import { Material } from "@/app/models/Material";
import mongoose from "mongoose";

export const instant = false;

type CourseRef = {
  _id: mongoose.Types.ObjectId;
  boardId?: { name?: string } | null;
  levelId?: { name?: string } | null;
  subjectId?: { name?: string } | null;
  medium?: string;
};

export default async function StudentCoursesPage() {
  const { userId } = await requirePageRole(["student"]);

  let courses: CourseRef[] = [];
  let books: { _id: string; title: string; author?: string; publisher?: string }[] = [];
  let papers: { _id: string; title: string; year?: number }[] = [];

  try {
    await connectToDatabase();

    const enrollments = await Enrollment.find({
      userId,
      role: "student",
      status: "approved",
    })
      .populate({
        path: "courseId",
        populate: [{ path: "boardId" }, { path: "levelId" }, { path: "subjectId" }],
      })
      .lean();

    courses = enrollments
      .map((e) => e.courseId as unknown as CourseRef | null)
      .filter((c): c is CourseRef => Boolean(c));

    const courseIds = courses.map((c) => c._id);

    if (courseIds.length > 0) {
      const [bookDocs, paperDocs] = await Promise.all([
        Book.find({ courseId: { $in: courseIds }, isRecommended: true })
          .select("title author publisher")
          .lean<{ _id: unknown; title: string; author?: string; publisher?: string }[]>(),
        Material.find({ courseId: { $in: courseIds }, kind: "past_paper" })
          .select("title year")
          .sort({ year: -1 })
          .lean<{ _id: unknown; title: string; year?: number }[]>(),
      ]);

      books = bookDocs.map((b) => ({
        _id: String(b._id),
        title: b.title,
        author: b.author,
        publisher: b.publisher,
      }));
      papers = paperDocs.map((p) => ({ _id: String(p._id), title: p.title, year: p.year }));
    }
  } catch (error) {
    console.error("Error loading student courses:", error);
  }

  const student = await User.findOne({ clerkId: userId })
    .select("onboarded")
    .lean<{ onboarded?: boolean } | null>();

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="My Courses"
        subtitle="Enrolled Subjects"
        description="Your approved subjects, recommended books and past papers."
        icon={<BookOpen className="w-6 h-6 text-teal-400" />}
      />

      {courses.length === 0 ? (
        <GlassCard variant="default" className="py-16 text-center">
          <p className={glassTheme.text.secondary}>
            No courses yet. A course appears here once a teacher accepts you.
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, i) => (
            <GlassCard key={i} variant="default" className={glassTheme.hover.tealCard}>
              <h3 className={cn("text-lg font-bold", glassTheme.text.primary)}>
                {course.subjectId?.name ?? "Subject"}
              </h3>
              <p className={cn("mt-1 text-sm", glassTheme.text.secondary)}>
                {[course.boardId?.name, course.levelId?.name].filter(Boolean).join(" · ")}
              </p>
              {course.medium && (
                <p className={cn("mt-1 text-xs", glassTheme.text.muted)}>
                  Medium: {course.medium}
                </p>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard variant="default">
          <h3 className={cn("mb-4 text-lg font-bold", glassTheme.text.primary)}>
            Recommended Books
          </h3>
          {books.length === 0 ? (
            <p className={cn("text-sm", glassTheme.text.secondary)}>
              No books recommended yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {books.map((book) => (
                <li key={book._id} className={cn("text-sm", glassTheme.text.primary)}>
                  {book.title}
                  <span className={cn("ml-2 text-xs", glassTheme.text.muted)}>
                    {[book.author, book.publisher].filter(Boolean).join(" · ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard variant="default">
          <h3 className={cn("mb-4 text-lg font-bold", glassTheme.text.primary)}>Past Papers</h3>
          {papers.length === 0 ? (
            <p className={cn("text-sm", glassTheme.text.secondary)}>
              No past papers available yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {papers.map((paper) => (
                <li key={paper._id} className={cn("text-sm", glassTheme.text.primary)}>
                  {paper.title}
                  {paper.year && (
                    <span className={cn("ml-2 text-xs", glassTheme.text.muted)}>
                      {paper.year}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>

      {student && !student.onboarded && (
        <GlassCard variant="default" className="border-amber-400/30 bg-amber-500/10">
          <p className="text-sm text-amber-200">
            Parent details are still missing. You will be asked for them during onboarding.
          </p>
        </GlassCard>
      )}
    </div>
  );
}
