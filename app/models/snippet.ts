import mongoose, {Schema, Document, Model} from "mongoose";

export interface ISnippet extends Document{
    title: string;
    code: string;
    language: string;
    tags: string[];
    userId: string;
    orgId?: string; // Attached when created inside an Organization context
    createdAt: Date;
    updatedAt: Date;
}

const SnippetSchema = new Schema<ISnippet>(
    {
        title: {type: String, required: true},
        code: {type: String, required: true},
        language: {type: String, required: true},
        tags: {type: [String], required: true},
        userId: {type: String, required: true}
    },
    {timestamps: true
    }
)

export const Snippet: Model<ISnippet>= 
mongoose.models.Snippet || mongoose.model<ISnippet>("Snippet", SnippetSchema);