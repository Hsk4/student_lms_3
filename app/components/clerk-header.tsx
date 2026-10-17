"use client";

import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { glassTheme } from "@/lib/theme/glass";

export function ClerkComponents({
  userId,
  orgId,
  role,
  canManageMembers,
  canManageCourses,
  canViewCourses,
}: {
  userId: string | null;
  orgId: string | null;
  role: string | null;
  canManageMembers: boolean;
  canManageCourses: boolean;
  canViewCourses: boolean;
}) {
  return (
    <>
      <div className="flex items-center gap-4">
        <Link href="/">
          <h1 className={cn("font-bold text-lg", glassTheme.text.primary)}>Student LMS</h1>
        </Link>
        {userId && (
          <OrganizationSwitcher
            hidePersonal
            afterSelectOrganizationUrl={role ? `/${role}` : "/select-org"}
          />
        )}
        {userId && !orgId && (
          <Link href="/select-org" className="text-sm font-medium text-amber-400">
            Select school
          </Link>
        )}
        {userId && orgId && role && (
          <nav className="flex gap-4 ml-4">
            {canManageMembers && (
              <Link href="/admin" className={cn("text-sm font-medium hover:text-emerald-400 transition-colors", glassTheme.text.secondary)}>
                Admin
              </Link>
            )}
            {canManageCourses && (
              <Link href="/teacher" className={cn("text-sm font-medium hover:text-emerald-400 transition-colors", glassTheme.text.secondary)}>
                Teacher
              </Link>
            )}
            {canViewCourses && (
              <Link href="/student" className={cn("text-sm font-medium hover:text-emerald-400 transition-colors", glassTheme.text.secondary)}>
                Student
              </Link>
            )}
          </nav>
        )}
      </div>
      <div>
        {!userId ? (
          <div className="flex gap-2">
            <Link href="/sign-in">
              <button className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", glassTheme.text.secondary, "hover:text-white")}>
                Sign In
              </button>
            </Link>
            <Link href="/sign-up">
              <button className="px-6 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all">
                Sign Up
              </button>
            </Link>
          </div>
        ) : (
          <UserButton />
        )}
      </div>
    </>
  );
}
