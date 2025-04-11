import mongoose, { Schema, Document } from "mongoose";

// 스키마 정의
export interface IDiaryEntry extends Document {
  id: number;
  title: string;
  date: string;
  emotion: string;
  entry: string;
  emotionAnalysis?: {
    [key: string]: number;
  };
}

const diarySchema = new Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  emotion: { type: String, required: true },
  entry: { type: String, required: true },
  emotionAnalysis: {
    type: Map,
    of: Number,
    default: {},
  },
});

// 모델 생성
export const DiaryEntryModel = mongoose.model<IDiaryEntry>(
  "DiaryEntry",
  diarySchema
);
