import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<div className="h-[500px] w-[350px] bg-gray-100 animate-pulse rounded-lg" />}>
        <SignUp />
      </Suspense>
    </div>
  );
}
