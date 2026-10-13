import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubmission extends Document {
  orgId: string;
  assignmentId: mongoose.Types.ObjectId;
  studentId: string; // Clerk Student userId
  codeSnippet?: string;
  notes?: string;
  grade?: string;     // e.g., "A+", "85/100", "Pass"
  feedback?: string;  // Teacher/Instructor review notes
  status: "submitted" | "graded" | "resubmit_required";
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    orgId: { type: String, required: true, index: true },
    assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment", required: true },
    studentId: { type: String, required: true },
    codeSnippet: { type: String },
    notes: { type: String },
    grade: { type: String },
    feedback: { type: String },
    status: { type: String, enum: ["submitted", "graded", "resubmit_required"], default: "submitted" },
  },
  { timestamps: true }
);

SubmissionSchema.index({ orgId: 1, assignmentId: 1, studentId: 1 });

export const Submission: Model<ISubmission> =
  mongoose.models.Submission || mongoose.model<ISubmission>("Submission", SubmissionSchema);
