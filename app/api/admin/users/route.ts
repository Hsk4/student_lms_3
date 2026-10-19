import { NextResponse } from "next/server";
import { clerk, requirePermission, AuthError } from "@/lib/auth/guards";
import { isRole } from "@/lib/auth/roles";

export async function GET() {
  try {
    await requirePermission("user:manage", { fresh: true });

    const { data: users } = await clerk.users.getUserList({ limit: 100 });

    const pending = [];
    const assigned = [];

    for (const user of users) {
      const role = isRole(user.publicMetadata?.role)
        ? user.publicMetadata.role
        : null;
      const email = user.emailAddresses?.[0]?.emailAddress || "";
      const firstName = user.firstName || "Unknown";
      const lastName = user.lastName || "User";
      const createdAt = user.createdAt
        ? new Date(user.createdAt).toISOString()
        : new Date().toISOString();

      const userData = {
        userId: user.id,
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
    }

    return NextResponse.json({
      pending: pending.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
      assigned: assigned.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
