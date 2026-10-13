import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  UserButton,
  OrganizationSwitcher,
} from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import Link from "next/link";
import {
  appRoleFromClerkRole,
  canRoleAccessPermission,
  isClerkOrgRole,
  ORG_PERMISSIONS,
} from "@/lib/auth/roles";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Student LMS",
  description: "Multi-tenant learning management system",
};

async function HeaderActions() {
  const { userId, orgId, orgRole } = await auth();
  const normalizedOrgRole = isClerkOrgRole(orgRole) ? orgRole : null;
  const role = appRoleFromClerkRole(normalizedOrgRole);
  const canManageMembers = canRoleAccessPermission(normalizedOrgRole, ORG_PERMISSIONS.memberManage);
  const canManageCourses = canRoleAccessPermission(normalizedOrgRole, ORG_PERMISSIONS.courseManage);
  const canViewCourses = canRoleAccessPermission(normalizedOrgRole, ORG_PERMISSIONS.courseView);

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${glassTheme.bg.dark}`}
      >
        {/* Background blur effects */}
        <div className="fixed inset-0 -z-50 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <ClerkProvider>
          <header className={cn("fixed top-0 w-full backdrop-blur-xl border-b z-40", glassTheme.bg.glass)}>
            <div className="flex justify-between items-center p-4 max-w-screen-2xl mx-auto w-full px-6">
              <Suspense
                fallback={
                  <>
                    <div className="flex items-center gap-4">
                      <Link href="/">
                        <h1 className={cn("font-bold text-lg", glassTheme.text.primary)}>Student LMS</h1>
                      </Link>
                    </div>
                    <div className="h-10 w-20 bg-white/10 animate-pulse rounded-lg" />
                  </>
                }
              >
                <HeaderActions />
              </Suspense>
            </div>
          </header>
          <main className="min-h-screen pt-20 p-4">{children}</main>
        </ClerkProvider>
      </body>
    </html>
  );
}
