import { SignOutButton } from "@clerk/nextjs";

export default function PendingApprovalPage() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-4 text-center">
            <h1 className="text-xl font-semibold">Waiting for approval</h1>
            <p className="max-w-md text-sm text-muted-foreground">
                Your teacher account has been created. An administrator needs to approve it
                before you can access the teacher area. Once approved, sign out and back in.
            </p>
            <SignOutButton>
                <button className="rounded-md border px-3 py-1.5 text-sm">Sign out</button>
            </SignOutButton>
        </div>
    );
}
