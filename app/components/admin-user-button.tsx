"use client";

import { UserButton } from "@clerk/nextjs";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

export function AdminUserButton() {
  return (
    <Suspense fallback={<div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" />}>
      <UserButton />
    </Suspense>
  );
}
