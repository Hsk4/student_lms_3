"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function DeactivationMessage() {
    const searchParams = useSearchParams();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (searchParams.get("error") === "account_deactivated") {
            setIsVisible(true);
        }
    }, [searchParams]);

    if (!isVisible) return null;

    return (
        <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded relative mb-4 flex items-center justify-between">
            <span className="block sm:inline font-medium">
                Your account has been deactivated. Contact admin to reactivate it.
            </span>
            <button onClick={() => setIsVisible(false)} className="ml-4">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
