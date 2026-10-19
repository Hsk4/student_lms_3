import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Recommended courseware. Students buy books themselves — there are no prices
 * or payments anywhere in this model.
 */
export interface IBook extends Document {
  title: string;
  author?: string;
  publisher?: string;
  /** Recommended for this course (optional: a book can be board-wide). */
  courseId?: mongoose.Types.ObjectId;
  boardId?: mongoose.Types.ObjectId;
  levelId?: mongoose.Types.ObjectId;
  subjectId?: mongoose.Types.ObjectId;
  isbn?: string;
  edition?: string;
  isRecommended: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true },
    publisher: { type: String, trim: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    boardId: { type: Schema.Types.ObjectId, ref: "Board" },
    levelId: { type: Schema.Types.ObjectId, ref: "Level" },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject" },
    isbn: { type: String, trim: true },
    edition: { type: String, trim: true },
    isRecommended: { type: Boolean, default: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

export const Book: Model<IBook> =
  mongoose.models.Book || mongoose.model<IBook>("Book", BookSchema);
