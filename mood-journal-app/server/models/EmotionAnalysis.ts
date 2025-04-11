import mongoose, { Schema, Document } from "mongoose";

export interface IEmotionAnalysis extends Document {
  diaryId: number;
  date: string;
  emotions: {
    [key: string]: number;
  };
  createdAt: Date;
}

const EmotionAnalysisSchema = new Schema({
  diaryId: { type: Number, required: true, unique: true },
  date: { type: String, required: true },
  emotions: {
    type: Object,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export const EmotionAnalysisModel = mongoose.model<IEmotionAnalysis>(
  "EmotionAnalysis",
  EmotionAnalysisSchema
);
