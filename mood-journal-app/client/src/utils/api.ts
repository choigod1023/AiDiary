import ky from "ky";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = ky.create({
  prefixUrl: API_BASE_URL,
  credentials: "include",
  timeout: 30000,
  retry: {
    limit: 2,
    methods: ["get", "post", "put", "delete"],
  },
  hooks: {
    beforeRequest: [
      (request) => {
        console.log("API Request:", request.method, request.url);
      },
    ],
    afterResponse: [
      (request, options, response) => {
        console.log("API Response:", response.status, response.url);
        return response;
      },
    ],
  },
});

import { DiaryEntry } from "../types/diary";

// API 함수들
export const diaryApi = {
  // 일기 목록 조회
  getList: (): Promise<DiaryEntry[]> => api.get("api/diary").json(),

  // 특정 일기 조회
  getById: (id: string): Promise<DiaryEntry> =>
    api.get(`api/diary/${id}`).json(),

  // 일기 저장
  create: (entry: string): Promise<{ message: string }> =>
    api.post("api/diary", { json: { entry } }).json(),

  // 일기 삭제
  delete: (id: string): Promise<void> => api.delete(`api/diary/${id}`).json(),

  // AI 피드백 요청
  requestFeedback: (
    id: string,
    data: { entry: string; emotion: string }
  ): Promise<{ feedback: string }> =>
    api.post(`api/diary/${id}/ai-feedback`, { json: data }).json(),

  // 감정 통계 조회
  getEmotionStats: (): Promise<{
    totalEntries: number;
    averageEmotions: { [key: string]: number };
    emotionTrends: { date: string; emotions: { [key: string]: number } }[];
  }> => api.get("api/diary/emotion-stats").json(),

  // 감정 분석 결과 조회
  getEmotionAnalysis: (
    limit?: number
  ): Promise<{ date: string; emotions: { [key: string]: number } }[]> =>
    api
      .get("api/diary/emotion-analysis", {
        searchParams: limit ? { limit: limit.toString() } : {},
      })
      .json(),
};
