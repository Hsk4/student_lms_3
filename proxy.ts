import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { homePathForRole, isRole, isUserStatus } from "@/lib/auth/roles";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);
const isUnauthorizedRoute = createRouteMatcher([
  "/unauthorized(.*)",
  "/rejected(.*)",
]);
const isApiRoute = createRouteMatcher(["/api(.*)", "/trpc(.*)"]);
const isAdminArea = createRouteMatcher(["/admin(.*)"]);
const isTeacherArea = createRouteMatcher(["/teacher(.*)"]);
const isStudentArea = createRouteMatcher(["/student(.*)"]);

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

  const metadata = (sessionClaims?.metadata ?? {}) as {
    role?: unknown;
    status?: unknown;
  };
  const role = isRole(metadata.role) ? metadata.role : null;
  const status = isUserStatus(metadata.status) ? metadata.status : "pending";

  const redirectTo = (path: string) =>
    NextResponse.redirect(new URL(path, req.url));

  // 2. Account status gates
  if (status === "suspended") return redirectTo("/?error=account_suspended");
  if (status === "rejected") {
    if (isUnauthorizedRoute(req)) return;
    return redirectTo("/rejected");
  }
  if (status !== "active") {
    // Pending accounts may only use the public routes and /auth/pending.
    if (isPublicRoute(req) || req.nextUrl.pathname.startsWith("/auth/pending"))
      return;
    if (isApiRoute(req)) return denyApi("Account is pending approval");
    return redirectTo("/auth/pending");
  }

  if (isPublicRoute(req) || isUnauthorizedRoute(req)) return;

  // 3. Coarse area gates. Server code must still re-check every row.
  if (isAdminArea(req)) {
    if (role !== "admin") {
      if (isApiRoute(req)) return denyApi("Forbidden");
      return redirectTo(homePathForRole(role));
    }
    return;
  }

  if (isTeacherArea(req)) {
    if (role !== "teacher") {
      if (isApiRoute(req)) return denyApi("Forbidden");
      return redirectTo(homePathForRole(role));
    }
    return;
  }

  if (isStudentArea(req)) {
    if (role !== "student") {
      if (isApiRoute(req)) return denyApi("Forbidden");
      return redirectTo(homePathForRole(role));
    }
    return;
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
