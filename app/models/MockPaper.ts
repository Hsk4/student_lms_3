import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMockPaper extends Document {
  title: string;
  board: string;
  levelOrGrade: string;
  subject: string;
  year?: number;
  fileUrl?: string; // Link to PDF or document storage
  solutionsUrl?: string;
  createdBy: string;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
}

const MockPaperSchema = new Schema<IMockPaper>(
  {
    title: { type: String, required: true },
    board: { type: String, required: true },
    levelOrGrade: { type: String, required: true },
    subject: { type: String, required: true },
    year: { type: Number },
    fileUrl: { type: String },
    solutionsUrl: { type: String },
    createdBy: { type: String, required: true },
    orgId: { type: String, required: true },
  },
  { timestamps: true }
);

export const MockPaper: Model<IMockPaper> =
  mongoose.models.MockPaper || mongoose.model<IMockPaper>("MockPaper", MockPaperSchema);