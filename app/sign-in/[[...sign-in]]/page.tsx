import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<div className="h-[400px] w-[350px] bg-gray-100 animate-pulse rounded-lg" />}>
        <SignIn />
      </Suspense>
    </div>
  );
}
