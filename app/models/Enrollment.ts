import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEnrollment extends Document {
  userId: string;
  courseId: mongoose.Types.ObjectId;
  role: "teacher" | "student";
  status: "pending" | "approved" | "rejected";
  assignedBy?: string; // Admin userId who approved/assigned
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    userId: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    role: { type: String, enum: ["teacher", "student"], required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
    assignedBy: { type: String },
  },
  { timestamps: true }
);

export const Enrollment: Model<IEnrollment> =
  mongoose.models.Enrollment || mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);