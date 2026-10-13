export {};

declare global {
    // Mirrors the "metadata" claim added in Clerk Dashboard → Sessions →
    // Customize session token:  { "metadata": "{{user.public_metadata}}" }
    interface CustomJwtSessionClaims {
        metadata: {
            role?: "admin" | "teacher" | "student";
            status?: "active" | "pending" | "deactivated";
        };
    }
}
