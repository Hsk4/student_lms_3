import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * An assignment belongs to one course. Teachers of that course publish it;
 * students enrolled in the course submit a text answer and/or a file link.
 */
export interface IAssignment extends Document {
  title: string;
  description: string;
  instructions?: string;
  courseId: mongoose.Types.ObjectId;
  dueDate: Date;
  maxScore: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    instructions: { type: String },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    dueDate: { type: Date, required: true },
    maxScore: { type: Number, default: 100, min: 1 },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

export const Assignment: Model<IAssignment> =
  mongoose.models.Assignment ||
  mongoose.model<IAssignment>("Assignment", AssignmentSchema);
