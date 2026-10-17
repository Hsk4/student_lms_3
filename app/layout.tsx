import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import {
  appRoleFromClerkRole,
  canRoleAccessPermission,
  isClerkOrgRole,
  ORG_PERMISSIONS,
} from "@/lib/auth/roles";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { ClerkComponents } from "./components/clerk-header";

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

async function HeaderContent() {
  const { userId, orgId, orgRole } = await auth();
  const normalizedOrgRole = isClerkOrgRole(orgRole) ? orgRole : null;
  const role = appRoleFromClerkRole(normalizedOrgRole);
  const canManageMembers = canRoleAccessPermission(normalizedOrgRole, ORG_PERMISSIONS.memberManage);
  const canManageCourses = canRoleAccessPermission(normalizedOrgRole, ORG_PERMISSIONS.courseManage);
  const canViewCourses = canRoleAccessPermission(normalizedOrgRole, ORG_PERMISSIONS.courseView);

  return (
    <ClerkComponents
      userId={userId ?? null}
      orgId={orgId ?? null}
      role={role ?? null}
      canManageMembers={canManageMembers}
      canManageCourses={canManageCourses}
      canViewCourses={canViewCourses}
    />
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
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-32 bg-white/10 animate-pulse rounded" />
                  </div>
                }
              >
                <HeaderContent />
              </Suspense>
            </div>
          </header>
          <main className="min-h-screen pt-20 p-4">{children}</main>
        </ClerkProvider>
      </body>
    </html>
  );
}
