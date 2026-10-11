"use server";

import { auth, createClerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function setUserRole(role: "teacher" | "student") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await clerkClient.users.updateUser(userId, {
    publicMetadata: { role },
  });

  if (role === "teacher") {
    redirect("/teacher");
  } else {
    redirect("/student");
  }
}