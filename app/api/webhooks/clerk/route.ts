import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/app/models/User";
import { isRole, isUserStatus } from "@/lib/auth/roles";

/**
 * Clerk user mirror. Not wired into role assignment: users are created with
 * `status: "pending"` and no role, and only admin actions change that.
 */
export async function POST(request: NextRequest) {
  let event;
  try {
    event = await verifyWebhook(request);
  } catch (error) {
    console.error("[clerk-webhook] signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    await connectToDatabase();
  } catch (error) {
    console.error("[clerk-webhook] database unavailable", error);
    // 500 → Clerk retries later.
    return NextResponse.json(
      { error: "Database unavailable" },
      { status: 500 },
    );
  }

  try {
    switch (event.type) {
      case "user.created": {
        const {
          id,
          email_addresses,
          first_name,
          last_name,
          image_url,
          public_metadata,
        } = event.data;

        const metadata = (public_metadata ?? {}) as {
          role?: unknown;
          status?: unknown;
        };
        // Never trust a role from the event: new users start pending.
        await User.updateOne(
          { clerkId: id },
          {
            $setOnInsert: {
              clerkId: id,
              email: email_addresses?.[0]?.email_address ?? "",
              firstName: first_name ?? "",
              lastName: last_name ?? "",
              imageUrl: image_url,
              status: isUserStatus(metadata.status)
                ? metadata.status
                : "pending",
              onboarded: false,
            },
            ...(isRole(metadata.role) ? { $set: { role: metadata.role } } : {}),
          },
          { upsert: true },
        );
        break;
      }

      case "user.updated": {
        const {
          id,
          email_addresses,
          first_name,
          last_name,
          image_url,
          public_metadata,
        } = event.data;
        const metadata = (public_metadata ?? {}) as {
          role?: unknown;
          status?: unknown;
          onboarded?: unknown;
        };

        const update: Record<string, unknown> = {
          email: email_addresses?.[0]?.email_address ?? "",
          firstName: first_name ?? "",
          lastName: last_name ?? "",
          imageUrl: image_url,
        };
        if (isRole(metadata.role)) update.role = metadata.role;
        if (isUserStatus(metadata.status)) update.status = metadata.status;
        if (typeof metadata.onboarded === "boolean")
          update.onboarded = metadata.onboarded;

        await User.updateOne(
          { clerkId: id },
          { $set: update, $setOnInsert: { status: "pending" } },
          { upsert: true },
        );
        break;
      }

      case "user.deleted": {
        if (event.data.id) {
          await User.deleteOne({ clerkId: event.data.id });
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error("[clerk-webhook] handler failed", event.type, error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
