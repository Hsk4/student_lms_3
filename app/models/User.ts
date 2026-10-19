import mongoose, { Schema, Document, Model } from "mongoose";
import type { Role, UserStatus } from "@/lib/auth/roles";

/**
 * Local mirror of the Clerk user. Clerk stays the source of truth for
 * role/status (session claims are read from its token); this collection exists
 * so admin lists, analytics and relationships can be queried without hitting
 * the Clerk API on every request. Kept in sync by /api/webhooks/clerk.
 */
export interface IUser extends Document {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  role?: Role;
  status: UserStatus;
  onboarded: boolean;
  /** Students this parent is linked to (parent only). Phase 4/7. */
  childrenIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, index: true },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    imageUrl: { type: String },
    role: {
      type: String,
      enum: ["super_admin", "admin", "teacher", "student", "parent"],
    },
    status: {
      type: String,
      enum: ["pending", "active", "rejected", "suspended"],
      default: "pending",
      index: true,
    },
    onboarded: { type: Boolean, default: false },
    childrenIds: [{ type: String }],
  },
  { timestamps: true },
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
