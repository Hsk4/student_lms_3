"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { ShieldX } from "lucide-react";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";

export default function RejectedPage() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center",
        glassTheme.bg.dark,
      )}
    >
      <div className="fixed inset-0 -z-50">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md px-4">
        <GlassCard variant="premium" className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 border border-red-400/30">
              <ShieldX className="h-8 w-8 text-red-300" />
            </div>
          </div>

          <div className="space-y-2">
            <h1
              className={cn(glassTheme.typography.h3, glassTheme.text.primary)}
            >
              Sign-up Not Approved
            </h1>
            <p className={cn("text-sm", glassTheme.text.secondary)}>
              An administrator did not approve this account
              {user?.emailAddresses?.[0]?.emailAddress
                ? ` (${user.emailAddresses[0].emailAddress})`
                : ""}
              .
            </p>
          </div>

          <p className={cn("text-sm", glassTheme.text.muted)}>
            If you think this is a mistake, contact the school administration
            and ask them to review your account.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => signOut({ redirectUrl: "/" })}
              className={
                glassTheme.button.primary +
                " px-6 py-2.5 rounded-lg font-semibold text-sm w-full"
              }
            >
              Sign Out
            </button>
            <Link href="/">
              <button
                className={
                  glassTheme.button.glass +
                  " px-6 py-2.5 rounded-lg font-semibold text-sm w-full"
                }
              >
                Return Home
              </button>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
