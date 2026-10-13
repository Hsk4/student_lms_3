"use client";

import { setUserRole } from "@/app/actions/role";
import { useSession, useUser } from "@clerk/nextjs";
import { GraduationCap, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { homePathForRole } from "@/lib/auth/roles";

export function RoleSelection() {
    const { user, isLoaded } = useUser();
    const { session, isLoaded: isSessionLoaded } = useSession();
    const pathname = usePathname();
    const [isSelecting, setIsSelecting] = useState(false);

    const role = user?.publicMetadata?.role;
    if (!isLoaded || !isSessionLoaded || !user || !session || role || pathname.startsWith("/auth/complete")) {
        return null;
    }

    const handleRoleSelect = async (selectedRole: "teacher" | "student") => {
        if (!session) return;
        setIsSelecting(true);
        try {
            await setUserRole(selectedRole);
            await user.reload();
            await session?.getToken({ skipCache: true });
            window.location.assign(homePathForRole(selectedRole));
        } catch (error) {
            console.error("Failed to set role:", error);
            setIsSelecting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-950 border rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-8 animate-in fade-in zoom-in duration-300">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Complete Your Profile</h2>
                    <p className="text-muted-foreground">Select your role to personalize your experience.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={() => handleRoleSelect("teacher")}
                        disabled={isSelecting}
                        className="group flex flex-col items-center justify-center p-6 border-2 border-zinc-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all space-y-4 disabled:opacity-50"
                    >
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                            <span className="block text-lg font-bold">Teacher</span>
                            <span className="text-xs text-muted-foreground">Manage courses & grades</span>
                        </div>
                    </button>

                    <button
                        onClick={() => handleRoleSelect("student")}
                        disabled={isSelecting}
                        className="group flex flex-col items-center justify-center p-6 border-2 border-zinc-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all space-y-4 disabled:opacity-50"
                    >
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                            <span className="block text-lg font-bold">Student</span>
                            <span className="text-xs text-muted-foreground">Learn & track progress</span>
                        </div>
                    </button>
                </div>
                
                {isSelecting && (
                    <div className="text-center text-sm text-emerald-600 animate-pulse font-medium">
                        Setting up your dashboard...
                    </div>
                )}
            </div>
        </div>
    );
}
