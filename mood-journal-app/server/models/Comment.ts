import mongoose, { Schema, Document } from "mongoose";

export interface IComment {
  commentId: number; // id 대신 commentId 사용
  entryId: number; // DiaryEntry.entryId (number)
  shareToken: string; // required to validate shared access
  authorName?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Document와 결합된 인터페이스
export interface ICommentDocument extends IComment, Document {}

const commentSchema = new Schema(
  {
    commentId: { type: Number, required: true, unique: true }, // id 대신 commentId 사용
    entryId: { type: Number, required: true, index: true },
    shareToken: { type: String, required: true, index: true },
    authorName: { type: String },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

commentSchema.index({ entryId: 1, createdAt: -1 });

export const CommentModel = mongoose.model<ICommentDocument>(
  "Comment",
  commentSchema
);
