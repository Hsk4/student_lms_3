import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Grades are numeric 0–100 (`score`), with `maxScore` copied from the assignment
 * so a submission stays self-describing. `status` is the workflow state;
 * `gradedAt`/`gradedBy` record who marked it.
 */
export interface ISubmission extends Document {
  assignmentId: mongoose.Types.ObjectId;
  studentId: string;
  /** Free-text answer. */
  text?: string;
  /** Link to an uploaded file (no uploads yet, so this is a URL). */
  fileUrl?: string;
  submittedAt: Date;
  status: "submitted" | "graded" | "resubmit_required";
  score?: number;
  maxScore?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },
    studentId: { type: String, required: true, index: true },
    text: { type: String },
    fileUrl: { type: String },
    submittedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["submitted", "graded", "resubmit_required"],
      default: "submitted",
    },
    score: { type: Number, min: 0, max: 100 },
    maxScore: { type: Number, min: 1 },
    feedback: { type: String },
    gradedBy: { type: String },
    gradedAt: { type: Date },
  },
  { timestamps: true },
);

SubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export const Submission: Model<ISubmission> =
  mongoose.models.Submission ||
  mongoose.model<ISubmission>("Submission", SubmissionSchema);
