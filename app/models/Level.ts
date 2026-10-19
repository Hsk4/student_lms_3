import mongoose, { Schema, Document, Model } from "mongoose";

/** Admin-managed level / grade (e.g. "Grade 9", "1st Year", "O Level"). */
export interface ILevel extends Document {
  name: string;
  slug: string;
  /** Display order ascending; grades 1..12, then years. */
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LevelSchema = new Schema<ILevel>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Level: Model<ILevel> =
  mongoose.models.Level || mongoose.model<ILevel>("Level", LevelSchema);
