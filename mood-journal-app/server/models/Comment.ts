import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  id: number;
  entryId: number; // DiaryEntry.id (number)
  shareToken: string; // required to validate shared access
  authorName?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    entryId: { type: Number, required: true, index: true },
    shareToken: { type: String, required: true, index: true },
    authorName: { type: String },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

commentSchema.index({ entryId: 1, createdAt: -1 });

export const CommentModel = mongoose.model<IComment>("Comment", commentSchema);
