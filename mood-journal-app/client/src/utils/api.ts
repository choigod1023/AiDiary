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
});

import { DiaryEntry } from "../types/diary";

// 인증 API
export const authApi = {
  // Google OAuth 로그인
  googleLogin: (
    credential: string
  ): Promise<{ success: boolean; token: string; user: any }> =>
    api.post("api/auth/google", { json: { credential } }).json(),

  // Naver OAuth 로그인
  naverLogin: (
    accessToken: string
  ): Promise<{ success: boolean; token: string; user: any }> =>
    api.post("api/auth/naver", { json: { accessToken } }).json(),

  // 토큰 검증
  verifyToken: (): Promise<{ success: boolean }> =>
    api.get("api/auth/verify").json(),

  // 로그아웃
  logout: (): Promise<void> => api.post("api/auth/logout").json(),

  // 사용자 정보 조회
  getProfile: (): Promise<any> => api.get("api/auth/profile").json(),
};

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

  // 댓글 목록 조회
  getComments: (id: string, token: string): Promise<{ comments: any[] }> =>
    api
      .get(`api/diary/${id}/comments`, {
        searchParams: { token },
      })
      .json(),

  // 댓글 작성
  addComment: (
    id: string,
    token: string,
    data: { content: string; authorName?: string }
  ): Promise<{ comment: any }> =>
    api
      .post(`api/diary/${id}/comments`, {
        searchParams: { token },
        json: data,
      })
      .json(),
};
