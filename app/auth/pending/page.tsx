"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Mail, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";

export default function AuthPendingPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.replace("/sign-up");
    }

    // Poll for role assignment every 5 seconds
    if (isLoaded && user) {
      const interval = setInterval(async () => {
        await user.reload();
        if (user.publicMetadata?.role) {
          // Role was assigned, redirect to dashboard
          router.push("/");
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className={cn("flex min-h-screen items-center justify-center", glassTheme.bg.dark)}>
        <p className={glassTheme.text.secondary}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex items-center justify-center", glassTheme.bg.dark)}>
      {/* Background effects */}
      <div className="fixed inset-0 -z-50">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md px-4">
        <GlassCard variant="premium" className="space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full",
              "bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 border border-emerald-400/30"
            )}>
              <Clock className="h-8 w-8 text-emerald-300 animate-spin" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className={cn(glassTheme.typography.h3, glassTheme.text.primary)}>
              Account Pending Review
            </h1>
            <p className={cn("text-sm", glassTheme.text.secondary)}>
              {user?.emailAddresses?.[0]?.emailAddress}
            </p>
          </div>

          {/* Message */}
          <div className={cn(
            "rounded-lg border p-4",
            "bg-emerald-500/10 border-emerald-400/30"
          )}>
            <p className={cn("text-sm font-medium text-emerald-200 mb-2")}>
              Your account has been created successfully!
            </p>
            <p className={cn("text-sm text-emerald-100/80")}>
              An administrator will review and assign your role shortly. Your access level will be determined based on your registration choice.
            </p>
          </div>

          {/* Details */}
          <div className={cn("space-y-3 rounded-lg p-4", "bg-white/5 border border-white/10")}>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-emerald-300 mt-0.5 shrink-0" />
              <div>
                <p className={cn("text-xs font-semibold uppercase tracking-wider", glassTheme.text.secondary)}>
                  Email
                </p>
                <p className={cn("text-sm mt-1", glassTheme.text.primary)}>
                  {user?.emailAddresses?.[0]?.emailAddress}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-300 mt-0.5 shrink-0" />
              <div>
                <p className={cn("text-xs font-semibold uppercase tracking-wider", glassTheme.text.secondary)}>
                  Status
                </p>
                <p className="text-sm mt-1 text-amber-300 font-medium">
                  Awaiting Admin Assignment
                </p>
              </div>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="space-y-3">
            <p className={cn("text-xs font-semibold uppercase tracking-wider", glassTheme.text.secondary)}>
              What Happens Next
            </p>
            <ol className={cn("space-y-2 text-sm", glassTheme.text.secondary)}>
              {[
                "An admin will review your account",
                "Your role will be assigned (Student or Teacher)",
                "You'll receive confirmation",
                "Return to login with your new access level",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-300 font-bold mt-0.5">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Auto-refresh Info */}
          <div className={cn(
            "rounded-lg border p-3 text-center",
            "bg-blue-500/10 border-blue-400/30"
          )}>
            <p className={cn("text-xs text-blue-200")}>
              ✓ This page checks automatically every 5 seconds
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => signOut({ redirectUrl: "/" })}
              className={glassTheme.button.primary + " px-6 py-2.5 rounded-lg font-semibold text-sm w-full"}
            >
              Sign Out
            </button>
            <Link href="/" className="block">
              <button className={glassTheme.button.glass + " px-6 py-2.5 rounded-lg font-semibold text-sm w-full"}>
                Return Home
              </button>
            </Link>
          </div>
        </GlassCard>

        {/* Footer Note */}
        <p className={cn("text-center text-xs mt-6", glassTheme.text.muted)}>
          If you don't receive your role within 24 hours, contact support
        </p>
      </div>
    </div>
  );
}
