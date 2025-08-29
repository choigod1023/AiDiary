import mongoose, { Schema } from "mongoose";
import type { HydratedDocument } from "mongoose";

// 스키마 정의
export interface IDiaryEntry {
  id: number; // 일기 고유 ID
  userId: string; // 사용자 ID 추가
  authorName: string; // 작성자 이름 추가
  title: string;
  date: string;
  emotion: string;
  entry: string;
  visibility: "private" | "public" | "shared"; // 공개 설정 추가
  shareToken?: string; // 공유 토큰 추가
  emotionAnalysis?: {
    [key: string]: number;
  };
  aiFeedback?: string;
  aiFeedbackAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Hydrated document type (avoids id type conflict with Document)
export type IDiaryEntryDocument = HydratedDocument<IDiaryEntry>;

const diarySchema = new Schema(
  {
    id: { type: Number, required: true, unique: true }, // 일기 고유 ID
    userId: { type: String, required: true, index: true }, // 사용자 ID
    authorName: { type: String, required: true }, // 작성자 이름
    title: { type: String, required: true },
    date: { type: String, required: true },
    emotion: { type: String, required: true },
    entry: { type: String, required: true },
    visibility: {
      type: String,
      enum: ["private", "public", "shared"],
      default: "private",
    }, // 공개 설정
    shareToken: { type: String, sparse: true, index: true }, // 공유 토큰
    emotionAnalysis: {
      type: Map,
      of: Number,
      default: {},
    },
    aiFeedback: { type: String, default: undefined },
    aiFeedbackAt: { type: Date, default: undefined },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
  }
);

// 모델 생성
export const DiaryEntryModel = mongoose.model<IDiaryEntry>(
  "DiaryEntry",
  diarySchema
);
