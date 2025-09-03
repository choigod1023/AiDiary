import ky from "ky";

// Use relative base to leverage frontend proxy (Vercel rewrites / Vite proxy)
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// Mixed content guard (https app -> http api)
if (typeof window !== "undefined") {
  try {
    if (location.protocol === "https:" && API_BASE_URL.startsWith("http://")) {
      // eslint-disable-next-line no-console
      console.warn(
        "API over http on https app will be blocked on Safari/modern browsers. Consider using https API URL.",
        { API_BASE_URL }
      );
    }
  } catch {
    // no-op
  }
}

// 토큰을 가져오는 함수
const getAuthToken = () => {
  try {
    return localStorage.getItem("auth_token");
  } catch (error) {
    console.warn("Failed to get token from localStorage:", error);
    return null;
  }
};

export const api = ky.create({
  prefixUrl: API_BASE_URL,
  credentials: "include",
  timeout: 10000, // 타임아웃 단축 (30초 → 10초)
  retry: { limit: 1, methods: ["get", "post", "put", "delete"] }, // 재시도 횟수 감소
  // Safari 호환을 위한 기본 옵션
  cache: "no-store",
  referrerPolicy: "strict-origin-when-cross-origin",
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  hooks: {
    beforeRequest: [
      (request) => {
        // 토큰을 헤더에 추가
        const token = getAuthToken();
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }

        // 개발 환경에서만 로깅
        if (import.meta.env.DEV) {
          console.log("API Request:", {
            url: request.url,
            method: request.method,
            prefixUrl: API_BASE_URL,
          });
        }
      },
    ],
    afterResponse: [
      (request, _options, response) => {
        // 개발 환경에서만 로깅
        if (import.meta.env.DEV) {
          console.log("API Response:", {
            url: request.url,
            status: response.status,
          });
        }
        return response;
      },
    ],
    beforeError: [
      (error) => {
        // 에러는 항상 로깅 (디버깅 필요)
        console.error("API Error:", {
          url: error.request?.url,
          status: error.response?.status,
          message: error.message,
        });
        return error;
      },
    ],
  },
});

import { DiaryEntry } from "../types/diary";
import { User } from "../types/auth";

type ServerDiaryEntry = DiaryEntry & { entryId?: number };

// 인증 API
export const authApi = {
  // Google OAuth 로그인
  googleLogin: (
    credential: string
  ): Promise<{ success: boolean; user: User; token: string }> =>
    api.post("api/auth/google", { json: { accessToken: credential } }).json(),

  // Naver OAuth 로그인
  naverLogin: (
    accessToken: string
  ): Promise<{ success: boolean; user: User; token: string }> =>
    api.post("api/auth/naver", { json: { accessToken } }).json(),

  // 토큰 검증
  verifyToken: (): Promise<{ success: boolean }> =>
    api.get("api/auth/verify").json(),

  // 로그아웃
  logout: (): Promise<{ success: boolean }> =>
    api.post("api/auth/logout").json(),

  // 사용자 정보 조회
  getProfile: (): Promise<User> => api.get("api/auth/profile").json(),
};

// API 함수들
export const diaryApi = {
  // 일기 목록 조회
  getList: (): Promise<DiaryEntry[]> =>
    api
      .get("api/diary")
      .json<{
        entries: ServerDiaryEntry[];
        total: number;
        page: number;
        totalPages: number;
      }>()
      .then((r) =>
        r.entries.map((e: ServerDiaryEntry) => ({
          id: e.entryId ?? e.id,
          title: e.title,
          date: e.date,
          emotion: e.emotion,
          entry: e.entry,
          aiFeedback: e.aiFeedback,
          visibility: e.visibility,
          shareToken: e.shareToken,
          userId: e.userId,
          authorName: e.authorName,
        }))
      ),

  // 특정 일기 조회
  getById: (id: string, shareToken?: string): Promise<DiaryEntry> => {
    const searchParams = new URLSearchParams();

    // 공유 토큰이 있는 경우에만 쿼리 파라미터로 전달
    if (shareToken) {
      searchParams.append("token", shareToken);
    }

    return api
      .get(`api/diary/${id}`, {
        searchParams: searchParams.toString() ? searchParams : undefined,
      })
      .json<ServerDiaryEntry>()
      .then((e) => ({
        id: e.entryId ?? e.id,
        title: e.title,
        date: e.date,
        emotion: e.emotion,
        entry: e.entry,
        aiFeedback: e.aiFeedback,
        visibility: e.visibility,
        shareToken: e.shareToken,
        userId: e.userId,
        authorName: e.authorName,
      }));
  },

  // 일기 저장
  create: (payload: {
    entry: string;
    visibility?: "private" | "shared";
    title?: string;
    useAITitle?: boolean;
    authorName?: string;
  }): Promise<{ message: string; entry: DiaryEntry }> =>
    api
      .post("api/diary", { json: payload })
      .json<{ message: string; entry: ServerDiaryEntry }>()
      .then((r) => ({
        message: r.message,
        entry: {
          id: r.entry?.entryId ?? r.entry?.id,
          title: r.entry?.title,
          date: r.entry?.date,
          emotion: r.entry?.emotion,
          entry: r.entry?.entry,
          aiFeedback: r.entry?.aiFeedback,
          visibility: r.entry?.visibility || "private",
          shareToken: r.entry?.shareToken,
          userId: r.entry?.userId,
          authorName: r.entry?.authorName,
        },
      })),

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

  // 일기 수정
  update: (
    id: string,
    payload: {
      title?: string;
      entry: string;
      useAITitle?: boolean;
      visibility?: "private" | "shared";
    }
  ): Promise<{ message?: string }> =>
    api.put(`api/diary/${id}`, { json: payload }).json(),

  // 댓글 목록 조회
  getComments: (
    id: string,
    token: string
  ): Promise<{
    comments: {
      id: string;
      authorName?: string;
      content: string;
      createdAt: string;
    }[];
  }> =>
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
  ): Promise<{
    comment: {
      id: string;
      authorName?: string;
      content: string;
      createdAt: string;
    };
  }> =>
    api
      .post(`api/diary/${id}/comments`, {
        searchParams: { token },
        json: data,
      })
      .json(),
};
