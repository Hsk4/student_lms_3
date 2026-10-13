import mongoose, { Schema, Document, Model } from "mongoose";

export type BoardType =
    | "Sindh Board"
    | "Aga Khan Board"
    | "O Levels"
    | "A Levels"
    | "BCOM"
    | "Bachelors";

export interface ICourse extends Document {
    board: BoardType;
    levelOrGrade: string; // e.g., "1st year (Only Commerce)", "9th", "Advance Accounting"
    subjects: string[];   // e.g., ["Accounting", "Maths", "Economics", "Business Studies"]
    createdBy: string;    // Clerk org admin/teacher userId who owns the course
    orgId: string;        // Clerk Organization ID
    createdAt: Date;
    updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
    {
        board: {
            type: String,
            required: true,
            enum: ["Sindh Board", "Aga Khan Board", "O Levels", "A Levels", "BCOM", "Bachelors"]
        },
        levelOrGrade: { type: String, required: true },
        subjects: [{ type: String, required: true }],
        createdBy: { type: String, required: true },
        orgId: { type: String, required: true },
    },
    { timestamps: true }
);

export const Course: Model<ICourse> =
    mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);
