import express, { Request, RequestHandler, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import { DiaryEntryModel } from "../models/DiaryEntry";
import { summarizeTitle, convertEmotionToEmoji } from "../utils/summaryUtils";
import {
  analyzeDiaryEntries,
  saveEmotionAnalysis,
  getLatestEmotionAnalyses,
  getOverallEmotionStats,
} from "../utils/emotionAnalysis";

// 개발 환경에서만 dotenv를 사용
if (process.env.NODE_ENV !== "production") {
  const dotenv = require("dotenv");
  dotenv.config();
}

// MongoDB 연결 문자열 확인
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI 환경 변수가 설정되지 않았습니다.");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB 연결
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// 일기 저장 API
app.post("/api/diary", async (req: Request, res: Response) => {
  try {
    const { entry } = req.body;

    // 제목 요약 및 감정 이모지 변환
    const title = await summarizeTitle(entry);
    const emotionEmoji = await convertEmotionToEmoji(entry);

    // 현재 날짜와 시간을 포맷팅 (월일시분까지)
    const now = new Date();
    const formattedDate = now.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const newEntry = new DiaryEntryModel({
      id: Date.now(), // 고유한 숫자 ID 생성
      title, // 요약된 제목
      date: formattedDate, // 포맷팅된 날짜와 시간
      emotion: emotionEmoji, // 변환된 이모지
      entry,
    });

    await newEntry.save();

    // 감정 분석 수행 및 저장
    await saveEmotionAnalysis(newEntry.id, formattedDate, entry);

    res.status(201).json({ message: "Diary entry saved successfully!" });
  } catch (error) {
    console.error("Error saving diary entry:", error);
    res.status(500).json({ error: "Failed to save diary entry" });
  }
});

// 일기 조회 API
app.get("/api/diary", async (req: Request, res: Response) => {
  try {
    const entries = await DiaryEntryModel.find().sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    console.error("Error fetching diary entries:", error);
    res.status(500).json({ error: "Failed to fetch diary entries" });
  }
});

// 감정 분석 결과 조회 API
app.get("/api/diary/emotion-analysis", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const analyses = await getLatestEmotionAnalyses(limit);
    res.json(analyses);
  } catch (error) {
    console.error("Error fetching emotion analyses:", error);
    res.status(500).json({ error: "Failed to fetch emotion analyses" });
  }
});

// 전체 감정 통계 조회 API
app.get("/api/diary/emotion-stats", async (req: Request, res: Response) => {
  try {
    const stats = await getOverallEmotionStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching emotion stats:", error);
    res.status(500).json({ error: "Failed to fetch emotion stats" });
  }
});

// 특정 ID의 일기 조회 API
app.get("/api/diary/:id", (async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // ID 유효성 검사
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return res
        .status(400)
        .json({ error: "유효하지 않은 ID 형식입니다. 숫자 ID가 필요합니다." });
    }

    const entry = await DiaryEntryModel.findOne({ id: numericId });

    if (!entry) {
      return res.status(404).json({ error: "Diary entry not found" });
    }

    res.json(entry);
  } catch (error) {
    console.error("Error fetching diary entry:", error);
    res.status(500).json({ error: "Failed to fetch diary entry" });
  }
}) as unknown as RequestHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
