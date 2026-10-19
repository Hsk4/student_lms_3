import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * One course = board + level + subject (+ optional medium). A teacher is
 * assigned per course, which is why subjects are no longer an array here.
 */
export interface ICourse extends Document {
  boardId: mongoose.Types.ObjectId;
  levelId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  /** e.g. "English", "Urdu", "Sindhi". Free text is fine for a single school. */
  medium?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true },
    levelId: { type: Schema.Types.ObjectId, ref: "Level", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    medium: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

CourseSchema.index(
  { boardId: 1, levelId: 1, subjectId: 1, medium: 1 },
  { unique: true },
);

export const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);
