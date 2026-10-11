"use client";

import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function StudentSignUpPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Student Registration</h1>
        <p className="text-muted-foreground">Start your learning journey with our academic programs.</p>
      </div>
      <Suspense fallback={<div className="h-[500px] w-[350px] bg-gray-100 animate-pulse rounded-lg" />}>
        <SignUp 
            routing="path" 
            path="/sign-up/student" 
            signInUrl="/sign-in"
            forceRedirectUrl="/student"
            unsafeMetadata={{ role: "student" }}
        />
      </Suspense>
    </div>
  );
}
