import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isTeacherRoute = createRouteMatcher(["/teacher(.*)"]);
const isStudentRoute = createRouteMatcher(["/student(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgRole, sessionClaims } = await auth();

  // 1. Redirect unauthenticated users to sign-in
  if (!userId && !isPublicRoute(req)) {
    return (await auth()).redirectToSignIn();
  }

  // 2. Account Deactivation Check
  const status = (sessionClaims?.publicMetadata as { status?: string })?.status;
  if (userId && status === "deactivated") {
    return NextResponse.redirect(new URL("/?error=account_deactivated", req.url));
  }

  // 3. Role Sync (Convert unsafeMetadata to publicMetadata after signup)
  // Note: This is a simplified way to handle it without webhooks for now
  if (userId && !sessionClaims?.metadata?.role) {
    const unsafeRole = (sessionClaims?.unsafeMetadata as { role?: string })?.role;
    if (unsafeRole === "teacher" || unsafeRole === "student") {
        // We can't update user from middleware directly, 
        // the RoleSelection component or a server action called from client will handle it.
        // But we must allow the user to reach a page where RoleSelection can render.
    }
  }

  // 3. Direct URL protection for /admin (checks Clerk B2B role)
  if (isAdminRoute(req)) {
    try {
      const { orgRole: latestOrgRole } = await auth();
      if (latestOrgRole !== "org:admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (e) {
      return (await auth()).redirectToSignIn();
    }
  }

  // 4. Teacher Route Protection
  if (isTeacherRoute(req)) {
    const role = (sessionClaims?.metadata as { role?: string })?.role || orgRole;
    if (role !== "org:admin" && role !== "teacher") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 5. Student Route Protection
  if (isStudentRoute(req)) {
    const role = (sessionClaims?.metadata as { role?: string })?.role || orgRole;
    if (role !== "org:admin" && role !== "student" && role !== "teacher") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};