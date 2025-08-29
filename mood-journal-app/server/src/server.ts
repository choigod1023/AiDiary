import express, { Request, RequestHandler, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { DiaryEntryModel } from "../models/DiaryEntry";
import {
  summarizeTitle,
  convertEmotionToEmoji,
  generateAIFeedback,
} from "../utils/summaryUtils";
import {
  analyzeDiaryEntries,
  saveEmotionAnalysis,
  getLatestEmotionAnalyses,
  getOverallEmotionStats,
} from "../utils/emotionAnalysis";
import swaggerUi from "swagger-ui-express";
import { specs } from "./swagger";
import diaryRoutes from "./routes/diaryRoutes";
import authRoutes from "./authRoutes";
import commentRoutes from "./routes/commentRoutes";
import emotionRoutes from "./routes/emotionRoutes";
import aiFeedbackRoutes from "./routes/aiFeedbackRoutes";
import shareRoutes from "./routes/shareRoutes";

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

// Preflight/CORS headers (explicit) prior to cors() for reliability on Vercel/edge
app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;
  const allowedOrigins = [
    "https://ai-diary-eight-drab.vercel.app",
    "http://localhost:5173",
  ];
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// CORS 설정
const allowedOrigins = [
  "https://ai-diary-eight-drab.vercel.app",
  "https://ai-diary-server.vercel.app",
  "http://localhost:5173",
  "http://choigod1023.p-e.kr:5173",
];

const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    // 개발 환경에서는 모든 origin 허용
    if (process.env.NODE_ENV !== "production") {
      callback(null, true);
      return;
    }

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// CORS 미들웨어 적용
app.use(cors(corsOptions));
app.use(cookieParser());

// OPTIONS 요청 처리
app.options("*", cors(corsOptions));

app.use(express.json());

// MongoDB 연결
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Swagger UI 마운트
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// API 라우트들 마운트
app.use("/api/auth", authRoutes);
app.use("/api/diary", diaryRoutes);
app.use("/api/diary", commentRoutes);
app.use("/api/emotions", emotionRoutes);
app.use("/api/ai-feedback", aiFeedbackRoutes);
app.use("/api/share", shareRoutes);

// (removed) Inline public Diary CRUD endpoints to enforce auth via diaryRoutes

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

// 특정 ID의 일기 조회 API (static routes above; param route below)
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

// 일기 삭제 API
app.delete("/api/diary/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // ID 유효성 검사
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return res
        .status(400)
        .json({ error: "유효하지 않은 ID 형식입니다. 숫자 ID가 필요합니다." });
    }

    // 일기 항목 찾기
    const entry = await DiaryEntryModel.findOne({ id: numericId });
    if (!entry) {
      return res.status(404).json({ error: "Diary entry not found" });
    }

    // 일기 항목 삭제
    await DiaryEntryModel.deleteOne({ id: numericId });

    // 관련 감정 분석 데이터도 삭제 (선택사항)
    try {
      const { EmotionAnalysisModel } = require("../models/EmotionAnalysis");
      await EmotionAnalysisModel.deleteOne({ diaryId: numericId });
    } catch (error) {
      console.log("감정 분석 데이터 삭제 실패 (선택사항):", error);
    }

    res.json({ message: "Diary entry deleted successfully!" });
  } catch (error) {
    console.error("Error deleting diary entry:", error);
    res.status(500).json({ error: "Failed to delete diary entry" });
  }
});

// AI 피드백 생성 API (낙장불입: 한번 생성되면 저장되고 재생성 불가)
app.post("/api/diary/:id/ai-feedback", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { entry, emotion } = req.body;

    const numericId = Number(id);
    if (isNaN(numericId)) {
      return res
        .status(400)
        .json({ error: "유효하지 않은 ID 형식입니다. 숫자 ID가 필요합니다." });
    }

    const diaryEntry = await DiaryEntryModel.findOne({ id: numericId });
    if (!diaryEntry) {
      return res.status(404).json({ error: "Diary entry not found" });
    }

    // 이미 피드백이 존재하면 재생성 금지
    if (diaryEntry.aiFeedback) {
      return res.json({
        feedback: diaryEntry.aiFeedback,
        locked: true,
        at: diaryEntry.aiFeedbackAt,
      });
    }

    // AI 피드백 생성
    const feedback = await generateAIFeedback(
      entry ?? diaryEntry.entry,
      emotion ?? diaryEntry.emotion
    );

    // 저장 및 반환
    diaryEntry.aiFeedback = feedback;
    diaryEntry.aiFeedbackAt = new Date();
    await diaryEntry.save();

    res.json({ feedback, locked: true, at: diaryEntry.aiFeedbackAt });
  } catch (error) {
    console.error("Error generating AI feedback:", error);
    res.status(500).json({ error: "Failed to generate AI feedback" });
  }
});

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
