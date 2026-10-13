"use client";

import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";
import { glassTheme } from "@/lib/theme/glass";
import { cn } from "@/lib/utils";

export default function SignUpPage() {
  return (
    <div className={cn("flex flex-col min-h-screen items-center justify-center p-4", glassTheme.bg.dark)}>
      {/* Background effects */}
      <div className="fixed inset-0 -z-50">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="mb-8 text-center max-w-md">
        <h1 className={cn("text-3xl font-bold", glassTheme.text.primary)}>Create Account</h1>
        <p className={cn("text-muted-foreground mt-2", glassTheme.text.secondary)}>
          Sign up with your email. An admin will review and assign your role shortly.
        </p>
      </div>
      
      <Suspense fallback={<div className="h-[500px] w-[350px] bg-gray-100 animate-pulse rounded-lg" />}>
        <SignUp 
          routing="path" 
          path="/sign-up" 
          signInUrl="/sign-in"
          forceRedirectUrl="/auth/pending"
          signInForceRedirectUrl="/auth/pending"
        />
      </Suspense>
    </div>
  );
}
