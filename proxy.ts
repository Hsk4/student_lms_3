import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  appRoleFromClerkRole,
  canRoleAccessPermission,
  homePathForRole,
  isClerkOrgRole,
  ORG_PERMISSIONS,
} from "@/lib/auth/roles";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);
const isOrgSelectRoute = createRouteMatcher(["/select-org(.*)"]);
const isUnauthorizedRoute = createRouteMatcher(["/unauthorized(.*)", "/auth(.*)"]);
const isApiRoute = createRouteMatcher(["/api(.*)", "/trpc(.*)"]);
const isAdminArea = createRouteMatcher(["/admin(.*)"]);
const isTeacherArea = createRouteMatcher(["/teacher(.*)"]);
const isStudentArea = createRouteMatcher(["/student(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId, orgRole, redirectToSignIn, sessionClaims } = await auth();
  // 1. Unauthenticated
  if (!userId) {
    if (isPublicRoute(req)) return;
    if (isApiRoute(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  const status = (sessionClaims?.metadata as { status?: string })?.status;
  if (status === "deactivated") {
    return NextResponse.redirect(new URL("/?error=account_deactivated", req.url));
  }

  if (isPublicRoute(req) || isUnauthorizedRoute(req)) return;

  // 2. Every protected route requires an active organization.
  if (!orgId && !isOrgSelectRoute(req)) {
    if (isApiRoute(req)) {
      return NextResponse.json({ error: "No active organization" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/select-org", req.url));
  }

  if (isOrgSelectRoute(req)) return;

  const normalizedOrgRole = isClerkOrgRole(orgRole) ? orgRole : null;
  const role = appRoleFromClerkRole(normalizedOrgRole);
  if (!role) {
    if (isApiRoute(req)) {
      return NextResponse.json({ error: "Organization role not configured" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // 3. Coarse permission gates by area. Server actions must still re-check.
  if (isAdminArea(req) && !canRoleAccessPermission(normalizedOrgRole, ORG_PERMISSIONS.memberManage)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (isTeacherArea(req) && !canRoleAccessPermission(normalizedOrgRole, ORG_PERMISSIONS.courseManage)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (isStudentArea(req) && !canRoleAccessPermission(normalizedOrgRole, ORG_PERMISSIONS.courseView)) {
    return NextResponse.redirect(new URL(homePathForRole(role), req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
