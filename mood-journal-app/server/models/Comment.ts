import mongoose, { Schema, Document } from "mongoose";

export interface IComment {
  commentId: number; // id 대신 commentId 사용
  entryId: number; // DiaryEntry.entryId (number)
  shareToken?: string; // 공유 토큰 (선택사항)
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
    shareToken: { type: String, index: true }, // required 제거
    authorName: { type: String },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
    id: false, // id virtual field 비활성화
    _id: true, // _id는 유지
    versionKey: false, // __v 필드도 비활성화
  }
);

// 기존 id 인덱스 제거를 위한 설정
commentSchema.index({ entryId: 1, createdAt: -1 });

export const CommentModel = mongoose.model<ICommentDocument>(
  "Comment",
  commentSchema
);
