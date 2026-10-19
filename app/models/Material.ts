import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Learning material attached to a course. This is also where past/mock papers
 * live (replacing the old MockPaper collection): `kind: "past_paper"`.
 */
export type MaterialKind =
  | "note"
  | "worksheet"
  | "past_paper"
  | "video"
  | "link";

export const MATERIAL_KINDS: MaterialKind[] = [
  "note",
  "worksheet",
  "past_paper",
  "video",
  "link",
];

export interface IMaterial extends Document {
  title: string;
  description?: string;
  kind: MaterialKind;
  courseId: mongoose.Types.ObjectId;
  fileUrl?: string;
  /** For past papers: the exam year. */
  year?: number;
  /** For past papers: link to the marking scheme. */
  solutionsUrl?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema = new Schema<IMaterial>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    kind: { type: String, enum: MATERIAL_KINDS, required: true, index: true },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    fileUrl: { type: String },
    year: { type: Number },
    solutionsUrl: { type: String },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

export const Material: Model<IMaterial> =
  mongoose.models.Material ||
  mongoose.model<IMaterial>("Material", MaterialSchema);
