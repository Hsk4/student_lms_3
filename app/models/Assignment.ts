import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAssignment extends Document {
  title: string;
  description: string;
  courseId: mongoose.Types.ObjectId;
  subject: string;
  dueDate: Date;
  starterSnippetId?: mongoose.Types.ObjectId;
  createdBy: string; // Admin or Teacher userId
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    subject: { type: String, required: true },
    dueDate: { type: Date, required: true },
    starterSnippetId: { type: Schema.Types.ObjectId, ref: "Snippet" },
    createdBy: { type: String, required: true },
    orgId: { type: String, required: true },
  },
  { timestamps: true }
);

export const Assignment: Model<IAssignment> =
  mongoose.models.Assignment || mongoose.model<IAssignment>("Assignment", AssignmentSchema);