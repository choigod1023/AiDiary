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
import authRoutes from "../src/authRoutes";
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

// 프록시 신뢰 (Secure 쿠키 및 req.secure 동작을 위해)
app.set("trust proxy", 1);

// Preflight/CORS headers (explicit) prior to cors() for reliability on Vercel/edge
app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;
  const allowedOrigins = [
    "https://ai-diary-eight-drab.vercel.app",
    "https://choigod1023.p-e.kr",
    "http://choigod1023.p-e.kr",
    "http://choigod1023.p-e.kr:5173",
    "http://localhost:5173",
    "http://localhost:3000",
  ];
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Authorization, X-Requested-With, Accept"
    );
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Expose-Headers", "Content-Type, Authorization");
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
  "https://choigod1023.p-e.kr",
  "http://choigod1023.p-e.kr",
  "http://choigod1023.p-e.kr:5173",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
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
  allowedHeaders: [
    "Origin",
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
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
app.use("/api/diary", aiFeedbackRoutes);
app.use("/api/emotions", emotionRoutes);
app.use("/api/share", shareRoutes);

// 공개 일기 엔드포인트는 제거되었습니다. 인증된 라우터만 사용합니다.

// 테스트용 헬스체크 엔드포인트 추가
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "Server is running",
    headers: req.headers,
  });
});

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
