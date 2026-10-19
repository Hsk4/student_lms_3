import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { homePathForRole, isRole, isUserStatus } from "@/lib/auth/roles";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);
const isUnauthorizedRoute = createRouteMatcher(["/unauthorized(.*)", "/rejected(.*)"]);
const isApiRoute = createRouteMatcher(["/api(.*)", "/trpc(.*)"]);
const isAdminArea = createRouteMatcher(["/admin(.*)"]);
const isSuperAdminArea = createRouteMatcher(["/admin/admins(.*)"]);
const isTeacherArea = createRouteMatcher(["/teacher(.*)"]);
const isStudentArea = createRouteMatcher(["/student(.*)"]);
const isParentArea = createRouteMatcher(["/parent(.*)"]);

function denyApi(message: string, status = 403) {
  return NextResponse.json({ error: message }, { status });
}

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn, sessionClaims } = await auth();

  // 1. Unauthenticated
  if (!userId) {
    if (isPublicRoute(req)) return;
    if (isApiRoute(req)) return denyApi("Unauthorized", 401);
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  const metadata = (sessionClaims?.metadata ?? {}) as { role?: unknown; status?: unknown };
  const role = isRole(metadata.role) ? metadata.role : null;
  const status = isUserStatus(metadata.status) ? metadata.status : "pending";

  const redirectTo = (path: string) => NextResponse.redirect(new URL(path, req.url));
  const path = req.nextUrl.pathname;

  // 2. Account status gates
  if (status === "suspended") return redirectTo("/?error=account_suspended");
  if (status === "rejected") {
    if (isUnauthorizedRoute(req)) return;
    return redirectTo("/rejected");
  }
  if (status !== "active") {
    // Pending accounts may only reach the public routes and their own status page.
    if (isPublicRoute(req) || path.startsWith("/pending")) return;
    if (isApiRoute(req)) return denyApi("Account is pending approval");
    return redirectTo("/pending");
  }

  if (isPublicRoute(req) || isUnauthorizedRoute(req)) return;

  // An active account that reached sign-up can go straight to its home.
  if (path.startsWith("/pending")) return redirectTo(homePathForRole(role));
  // 3. Coarse area gates. Server code must still re-check every row.
  const wrongRole = (allowed: boolean) => {
    if (allowed) return;
    if (isApiRoute(req)) return denyApi("Forbidden");
    return redirectTo(homePathForRole(role));
  };

  if (isSuperAdminArea(req)) return wrongRole(role === "super_admin");
  if (isAdminArea(req)) return wrongRole(role === "admin" || role === "super_admin");
  if (isTeacherArea(req)) return wrongRole(role === "teacher");
  if (isStudentArea(req)) return wrongRole(role === "student");
  if (isParentArea(req)) return wrongRole(role === "parent");
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
