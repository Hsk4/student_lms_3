import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerk } from "@/lib/auth/guards";

export async function GET() {
  try {
    const { orgId, userId } = await auth();

    if (!orgId || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const memberships = await clerk.organizations.getOrganizationMembershipList({
      organizationId: orgId,
      limit: 100,
    });

    const pending = [];
    const assigned = [];

    for (const membership of memberships.data) {
      const userIdFromMembership = membership.publicUserData?.userId;
      if (!userIdFromMembership) continue;

      try {
        const user = await clerk.users.getUser(userIdFromMembership);
        const role = user.publicMetadata?.role as "student" | "teacher" | null;
        const email = user.emailAddresses?.[0]?.emailAddress || "";
        const firstName = user.firstName || "Unknown";
        const lastName = user.lastName || "User";
        const createdAt = user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString();

        const userData = {
          userId: userIdFromMembership,
          email,
          firstName,
          lastName,
          createdAt,
          role,
        };

        if (!role) {
          pending.push(userData);
        } else {
          assigned.push(userData);
        }
      } catch (error) {
        console.error(`Error fetching user ${userIdFromMembership}:`, error);
      }
    }

    return NextResponse.json({
      pending: pending.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      assigned: assigned.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    });
  } catch (error) {
    console.error("Error fetching organization users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
