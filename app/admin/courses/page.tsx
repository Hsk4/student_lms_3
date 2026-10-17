import { BookOpen, Plus, Edit3 } from "lucide-react";
import { GlassPageHeader } from "@/components/glass/glass-page-header";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { requirePagePermission } from "@/lib/auth/guards";
import { ORG_PERMISSIONS } from "@/lib/auth/roles";
import { Suspense } from "react";
import { DeleteCourseButton } from "./delete-course-button";
import { CoursesList } from "./courses-list";

export default async function AdminCoursesPage() {
  const ctx = await requirePagePermission(ORG_PERMISSIONS.courseManage, { fresh: true, requireOrg: true });

  return (
    <div className="space-y-6">
      <GlassPageHeader
        title="Courses & Boards"
        subtitle="Curriculum Management"
        description="Manage all courses, boards, and subjects for your organization."
        icon={<BookOpen className="w-6 h-6 text-teal-400" />}
        cta={
          <Link href="/admin/courses/new">
            <button className={cn(
              "px-6 py-2 rounded-lg font-semibold flex items-center gap-2",
              glassTheme.button.primary
            )}>
              <Plus className="w-4 h-4" />
              New Course
            </button>
          </Link>
        }
      />

      <Suspense fallback={
        <GlassCard variant="default" className="py-12">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" />
            <p className={glassTheme.text.secondary}>Loading courses...</p>
          </div>
        </GlassCard>
      }>
        <CoursesList orgId={ctx.orgId!} />
      </Suspense>
    </div>
  );
}
