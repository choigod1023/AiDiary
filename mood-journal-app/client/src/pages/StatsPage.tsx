import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { match, P } from "ts-pattern";
import { diaryApi } from "../utils/api";
import StatsChart from "../components/StatsChart";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";

interface EmotionMix {
  date: string;
  emotions: {
    [key: string]: number;
  };
}

interface OverallStats {
  totalEntries: number;
  averageEmotions: {
    [key: string]: number;
  };
  emotionTrends: EmotionMix[];
}

const StatsPage: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();

  // React Query를 사용한 감정 통계 조회 (인증된 경우에만)
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery<OverallStats>({
    queryKey: ["emotion-stats"],
    queryFn: diaryApi.getEmotionStats,
    staleTime: 5 * 60 * 1000, // 5분
    enabled: authState.isAuthenticated && !authState.isLoading, // 인증된 경우에만 실행
  });

  // 인증 로딩 중이거나 인증되지 않은 경우
  if (authState.isLoading) {
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-gray-900 bg-amber-50 min-w-screen dark:bg-gray-900 dark:text-white">
        <div className="w-[50vw] flex flex-col">
          <div className="mb-12 w-full">
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-lg transition-colors bg-stone-300 text-stone-900 hover:bg-stone-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                뒤로 가기
              </button>
              <h1 className="text-4xl font-bold">감정 분석 통계</h1>
              <div className="w-[100px]"></div>
            </div>
          </div>
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner size="lg" text="인증 상태를 확인하는 중..." />
          </div>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!authState.isAuthenticated) {
    navigate("/login?from=/stats");
    return null;
  }

  // ts-pattern을 사용한 상태별 렌더링
  return match({ isLoading, error, stats })
    .with({ isLoading: true }, () => (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-gray-900 bg-amber-50 min-w-screen dark:bg-gray-900 dark:text-white">
        <div className="w-[50vw] flex flex-col">
          <div className="mb-12 w-full">
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-lg transition-colors bg-stone-300 text-stone-900 hover:bg-stone-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                뒤로 가기
              </button>
              <h1 className="text-4xl font-bold">감정 분석 통계</h1>
              <div className="w-[100px]"></div>
            </div>
          </div>
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner size="lg" text="통계 데이터를 불러오는 중..." />
          </div>
        </div>
      </div>
    ))
    .with({ error: P.not(null) }, () => (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-gray-900 bg-amber-50 min-w-screen dark:bg-gray-900 dark:text-white">
        <div className="w-[50vw] flex flex-col">
          <div className="mb-12 w-full">
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-lg transition-colors bg-stone-300 text-stone-900 hover:bg-stone-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                뒤로 가기
              </button>
              <h1 className="text-4xl font-bold">감정 분석 통계</h1>
              <div className="w-[100px]"></div>
            </div>
          </div>
          <div className="p-4 bg-red-100 rounded-lg border border-red-200 dark:bg-red-900 dark:border-red-800">
            <p className="text-red-800 dark:text-red-200">
              통계 데이터를 불러오는데 실패했습니다. 다시 시도해주세요.
            </p>
          </div>
        </div>
      </div>
    ))
    .with({ stats: P.nullish }, () => (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-gray-900 bg-amber-50 min-w-screen dark:bg-gray-900 dark:text-white">
        <div className="w-[50vw] flex flex-col">
          <div className="mb-12 w-full">
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-lg transition-colors bg-stone-300 text-stone-900 hover:bg-stone-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                뒤로 가기
              </button>
              <h1 className="text-4xl font-bold">감정 분석 통계</h1>
              <div className="w-[100px]"></div>
            </div>
          </div>
          <div className="py-16 text-center text-stone-600 dark:text-stone-400">
            <p className="text-lg">통계 데이터가 없습니다.</p>
          </div>
        </div>
      </div>
    ))
    .otherwise(({ stats }) => {
      if (!stats) return null;
      return (
        <div className="flex flex-col justify-center items-center w-full min-h-screen text-gray-900 bg-amber-50 min-w-screen dark:bg-gray-900 dark:text-white">
          <div className="w-[50vw] flex flex-col">
            <div className="mb-12 w-full">
              <div className="flex justify-between items-center mb-8">
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 rounded-lg transition-colors bg-stone-300 text-stone-900 hover:bg-stone-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
                >
                  뒤로 가기
                </button>
                <h1 className="text-4xl font-bold">감정 분석 통계</h1>
                <div className="w-[100px]"></div>
              </div>
              <div className="grid grid-cols-1 gap-8 mb-12 w-full md:grid-cols-2">
                <div className="p-6 bg-white rounded-xl border border-amber-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <h2 className="mb-4 text-2xl font-semibold">전체 통계</h2>
                  <p className="text-lg">총 일기 수: {stats.totalEntries}개</p>
                </div>
                <div className="p-6 bg-white rounded-xl border border-amber-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  <h3 className="mb-4 text-xl font-semibold">평균 감정 비율</h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {Object.entries(stats.averageEmotions).map(
                      ([emotion, value]) => (
                        <div
                          key={emotion}
                          className="flex flex-col items-center p-3 bg-amber-50 rounded-lg border border-amber-100 dark:bg-gray-700 dark:border-gray-600"
                        >
                          <span className="mb-1 text-sm">{emotion}</span>
                          <span className="text-lg font-bold">
                            {value.toFixed(1)}%
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full min-h-[800px] flex flex-col gap-12">
              <StatsChart emotionData={stats.emotionTrends} />
            </div>
          </div>
        </div>
      );
    });
};

export default StatsPage;
