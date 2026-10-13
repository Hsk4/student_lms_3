"use client";

import { useSession, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { homePathForRole, isRole, type Role } from "@/lib/auth/roles";

function roleFromToken(jwt: string | null): unknown {
    try {
        const payload = jwt?.split(".")[1];
        if (!payload) return undefined;
        const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(json)?.metadata?.role;
    } catch {
        return undefined;
    }
}

/**
 * Post-sign-up/sign-in landing page. 
 * If user has a role, redirects to their dashboard.
 * If user has no role, redirects to pending page.
 */
export default function AuthCompletePage() {
    const { user, isLoaded } = useUser();
    const { session } = useSession();
    const router = useRouter();
    const started = useRef(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoaded || !user || !session || started.current) return;
        started.current = true;

        (async () => {
            try {
                const existing = user.publicMetadata?.role;
                const role: Role | null = isRole(existing) ? existing : null;

                if (!role) {
                    // User has no role yet, send to pending page
                    router.replace("/auth/pending");
                    return;
                }

                // User has a role, verify token and redirect
                await user.reload();
                for (let i = 0; i < 6; i++) {
                    const token = await session.getToken({ skipCache: true });
                    if (roleFromToken(token) === role) {
                        window.location.replace(homePathForRole(role));
                        return;
                    }
                    await new Promise((r) => setTimeout(r, 500));
                }
                setError(
                    "Your role was saved, but the session token doesn't include it yet. " +
                        "Check the Clerk session token template (see AUTH_SETUP.md) or sign in again.",
                );
            } catch (e) {
                console.error(e);
                setError("Something went wrong while setting up your account.");
            }
        })();
    }, [isLoaded, user, session, router]);

    return (
        <div className="flex min-h-[60vh] items-center justify-center p-4 text-center">
            {error ? (
                <p className="max-w-md text-sm text-destructive">{error}</p>
            ) : (
                <p className="animate-pulse text-sm text-muted-foreground">
                    Setting up your account...
                </p>
            )}
        </div>
    );
}
