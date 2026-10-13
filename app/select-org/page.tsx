"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/glass/glass-card";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";
import { Building2 } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function SelectOrgPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<any[]>([]);

  useEffect(() => {
    if (isLoaded && user) {
      setOrganizations(user.organizationMemberships || []);
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", glassTheme.bg.dark)}>
        <p className={glassTheme.text.secondary}>Loading organizations...</p>
      </div>
    );
  }

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
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="space-y-8">
          {/* Heading */}
          <div className="text-center space-y-3">
            <h2 className={cn(glassTheme.typography.h2, glassTheme.text.primary)}>
              Select Your School
            </h2>
            <p className={cn("text-lg", glassTheme.text.secondary)}>
              Choose an organization to continue
            </p>
          </div>

          {/* Organizations Grid */}
          {organizations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.map((membership: any) => (
                <GlassCard
                  key={membership.organization.id}
                  variant="default"
                  interactive
                  className="cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => {
                    router.push("/");
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-lg",
                      "bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-400/30"
                    )}>
                      <Building2 className="w-6 h-6 text-emerald-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className={cn(glassTheme.typography.h4, glassTheme.text.primary)}>
                        {membership.organization.name}
                      </h3>
                      <p className={cn("text-xs mt-1", glassTheme.text.secondary)}>
                        Role: {membership.role}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard variant="premium" className="text-center py-16">
              <p className={glassTheme.text.secondary}>
                No organizations found. Contact your administrator.
              </p>
            </GlassCard>
          )}

          {/* Links */}
          <div className="flex justify-center gap-4 pt-8">
            <Link href="/">
              <button className={cn(
                "px-6 py-2 rounded-lg font-semibold transition-all",
                glassTheme.button.primary
              )}>
                Go Home
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
