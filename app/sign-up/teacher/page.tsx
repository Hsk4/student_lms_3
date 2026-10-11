"use client";

import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function TeacherSignUpPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Teacher Registration</h1>
        <p className="text-muted-foreground">Join as an educator to manage courses and students.</p>
      </div>
      <Suspense fallback={<div className="h-[500px] w-[350px] bg-gray-100 animate-pulse rounded-lg" />}>
        <SignUp 
            routing="path" 
            path="/sign-up/teacher" 
            signInUrl="/sign-in"
            forceRedirectUrl="/teacher"
            unsafeMetadata={{ role: "teacher" }}
        />
      </Suspense>
    </div>
  );
}
