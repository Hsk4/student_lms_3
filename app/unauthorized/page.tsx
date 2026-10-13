"use client";

import Link from "next/link";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default function UnauthorizedPage() {
  return (
    <div className={cn("min-h-screen", glassTheme.bg.dark)}>
      {/* Background effects */}
      <div className="fixed inset-0 -z-50">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className={cn("sticky top-0 z-40 backdrop-blur-xl border-b", glassTheme.bg.glass)}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className={cn("font-bold text-lg", glassTheme.text.primary)}>Student LMS</h1>
          <UserButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-20">
        <GlassCard variant="premium" className={cn(
          "text-center py-16 border-red-400/30 bg-red-500/10"
        )}>
          <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-6" />
          
          <h1 className={cn(glassTheme.typography.h2, "text-red-300", "mb-3")}>
            Access Denied
          </h1>

          <p className={cn("text-lg mb-8", "text-red-200/70")}>
            You don't have permission to access this area.
          </p>

          <div className="space-y-3">
            <p className={cn("text-sm", glassTheme.text.secondary)}>
              If you believe this is an error, please contact your administrator.
            </p>
            <p className={cn("text-xs", glassTheme.text.muted)}>
              Your current role doesn't have access to this resource.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link href="/">
              <button className={glassTheme.button.primary + " px-6 py-2 rounded-lg font-semibold text-sm"}>
                Go Home
              </button>
            </Link>
            <button
              onClick={() => window.history.back()}
              className={glassTheme.button.secondary + " px-6 py-2 rounded-lg font-semibold text-sm"}
            >
              Go Back
            </button>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}
