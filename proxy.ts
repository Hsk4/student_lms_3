import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { homePathForRole, isRole, type Role } from "@/lib/auth/roles";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);
const isRoleSetupRoute = createRouteMatcher(["/auth/complete"]);
const isPendingRoute = createRouteMatcher(["/pending"]);
const isApiRoute = createRouteMatcher(["/api(.*)", "/trpc(.*)"]);

// Which roles may enter which area. Admin is NOT derived from Clerk
// organization membership: anyone can create an org and become org:admin.
const roleRoutes: Array<[ReturnType<typeof createRouteMatcher>, readonly Role[]]> = [
  [createRouteMatcher(["/admin(.*)"]), ["admin"]],
  [createRouteMatcher(["/teacher(.*)"]), ["teacher", "admin"]],
  [createRouteMatcher(["/student(.*)"]), ["student", "admin"]],
];

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // 1. Unauthenticated
  if (!userId) {
    if (isPublicRoute(req)) return;
    if (isApiRoute(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // 2. Deactivated accounts (also banned in Clerk, see toggleUserStatus)
  if (sessionClaims?.metadata?.status === "deactivated") {
    if (req.nextUrl.pathname === "/") return;
    if (isApiRoute(req)) {
      return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/?error=account_deactivated", req.url));
  }

  // 3. Self-registered teachers wait for admin approval
  if (sessionClaims?.metadata?.status === "pending") {
    if (isPublicRoute(req) || isRoleSetupRoute(req) || isPendingRoute(req)) return;
    if (isApiRoute(req)) {
      return NextResponse.json({ error: "Awaiting approval" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/pending", req.url));
  }

  if (isPublicRoute(req) || isRoleSetupRoute(req)) return;

  // 4. Signed in but no role yet -> finish onboarding
  const role = sessionClaims?.metadata?.role;
  if (!isRole(role)) {
    if (isApiRoute(req)) {
      return NextResponse.json({ error: "Role not assigned" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/auth/complete", req.url));
  }

  // 5. Role-based route protection
  for (const [matches, allowed] of roleRoutes) {
    if (matches(req) && !allowed.includes(role)) {
      return NextResponse.redirect(new URL(homePathForRole(role), req.url));
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
