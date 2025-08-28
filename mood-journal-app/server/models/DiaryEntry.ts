import mongoose, { Schema, Document } from "mongoose";

// 스키마 정의
export interface IDiaryEntry {
  entryId: number; // id 대신 entryId 사용
  userId: string; // 사용자 ID 추가
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

// Document와 결합된 인터페이스
export interface IDiaryEntryDocument extends IDiaryEntry, Document {}

const diarySchema = new Schema(
  {
    entryId: { type: Number, required: true, unique: true }, // id 대신 entryId 사용
    userId: { type: String, required: true, index: true }, // 사용자 ID
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
export const DiaryEntryModel = mongoose.model<IDiaryEntryDocument>(
  "DiaryEntry",
  diarySchema
);
