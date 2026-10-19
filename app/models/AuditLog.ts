import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Append-only record of privileged actions (role changes, role approvals,
 * rejections, suspensions). Never updated or deleted by application code.
 */
export interface IAuditLog extends Document {
  /** Clerk id of the admin who performed the action. */
  actorId: string;
  actorRole: string;
  /** e.g. "user.assign_role", "user.reject", "user.suspend". */
  action: string;
  /** Clerk id of the affected user. */
  targetId?: string;
  targetEmail?: string;
  /** Free-form detail: previous/next values, rejection reason, etc. */
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: String, required: true, index: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true, index: true },
    targetId: { type: String, index: true },
    targetEmail: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
