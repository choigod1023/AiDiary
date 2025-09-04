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
      // 파생 통계 계산
      const emotionLabelMap: Record<string, string> = {
        happy: "행복",
        sad: "슬픔",
        angry: "화남",
        neutral: "보통",
        surprised: "놀람",
        fear: "두려움",
        disgust: "혐오",
      };

      const sortedTrends = [...stats.emotionTrends].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const totalsByDay = sortedTrends.map((d) =>
        Object.values(d.emotions || {}).reduce(
          (acc, v) => acc + (typeof v === "number" ? v : 0),
          0
        )
      );

      const sumLastN = (n: number) =>
        (totalsByDay.length > 0 ? totalsByDay.slice(-n) : []).reduce(
          (a, b) => a + b,
          0
        );

      const weeklyEntries = sumLastN(7);
      const monthlyEntries = sumLastN(30);
      const activeDays = totalsByDay.filter((t) => t > 0).length;

      // 최장/현재 연속 작성일 계산
      let longestStreak = 0;
      let currentStreakCalc = 0;
      for (const total of totalsByDay) {
        if (total > 0) {
          currentStreakCalc += 1;
          if (currentStreakCalc > longestStreak)
            longestStreak = currentStreakCalc;
        } else {
          currentStreakCalc = 0;
        }
      }
      // 현재 연속: 끝에서부터 연속된 활성 일수 계산
      let currentStreak = 0;
      for (let i = totalsByDay.length - 1; i >= 0; i -= 1) {
        if (totalsByDay[i] > 0) currentStreak += 1;
        else break;
      }

      // 최다 감정 및 상위 3개 감정
      const avgEntries = Object.entries(stats.averageEmotions || {});
      const topEmotionEntry = avgEntries.reduce(
        (best, cur) => (cur[1] > (best?.[1] ?? -Infinity) ? cur : best),
        undefined as [string, number] | undefined
      );
      const topEmotionName = topEmotionEntry
        ? emotionLabelMap[topEmotionEntry[0]] || topEmotionEntry[0]
        : "없음";
      const top3Emotions = avgEntries
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([k, v]) => ({ name: emotionLabelMap[k] || k, value: v }));

      const dateRange = {
        start: sortedTrends[0]?.date,
        end: sortedTrends[sortedTrends.length - 1]?.date,
      };
      return (
        <div className="flex flex-col justify-center items-center w-full min-h-screen text-gray-900 bg-amber-50 min-w-screen dark:bg-gray-900 dark:text-white">
          <div className="flex flex-col pt-5 w-full px-mobile">
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
                  <div className="grid grid-cols-2 gap-4 text-base">
                    <div className="text-stone-600 dark:text-stone-300">
                      총 일기 수
                    </div>
                    <div className="text-lg font-semibold text-right">
                      {stats.totalEntries}개
                    </div>

                    <div className="text-stone-600 dark:text-stone-300">
                      최근 7일 작성
                    </div>
                    <div className="text-lg font-semibold text-right">
                      {weeklyEntries}개
                    </div>

                    <div className="text-stone-600 dark:text-stone-300">
                      최근 30일 작성
                    </div>
                    <div className="text-lg font-semibold text-right">
                      {monthlyEntries}개
                    </div>

                    <div className="text-stone-600 dark:text-stone-300">
                      활동한 일수
                    </div>
                    <div className="text-lg font-semibold text-right">
                      {activeDays}일
                    </div>

                    <div className="text-stone-600 dark:text-stone-300">
                      최장 연속 작성
                    </div>
                    <div className="text-lg font-semibold text-right">
                      {longestStreak}일
                    </div>

                    <div className="text-stone-600 dark:text-stone-300">
                      현재 연속 작성
                    </div>
                    <div className="text-lg font-semibold text-right">
                      {currentStreak}일
                    </div>

                    <div className="text-stone-600 dark:text-stone-300">
                      가장 많은 감정
                    </div>
                    <div className="text-lg font-semibold text-right">
                      {topEmotionName}
                    </div>

                    <div className="text-stone-600 dark:text-stone-300">
                      상위 감정 Top3
                    </div>
                    <div className="text-lg font-semibold text-right">
                      {top3Emotions
                        .map((e) => `${e.name} ${e.value.toFixed(1)}%`)
                        .join(" · ")}
                    </div>

                    {dateRange.start && dateRange.end && (
                      <>
                        <div className="text-stone-600 dark:text-stone-300">
                          데이터 범위
                        </div>
                        <div className="text-lg font-semibold text-right">
                          {new Date(dateRange.start).toLocaleDateString()} ~{" "}
                          {new Date(dateRange.end).toLocaleDateString()}
                        </div>
                      </>
                    )}
                  </div>
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
