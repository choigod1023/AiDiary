import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatsChart from "../components/StatsChart";

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
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/diary/emotion-stats`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch emotion stats");
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching emotion stats:", error);
        setError("감정 통계 데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-gray-900 bg-amber-50 min-w-screen dark:bg-gray-900 dark:text-white">
        <div className="text-2xl">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-gray-900 bg-amber-50 min-w-screen dark:bg-gray-900 dark:text-white">
        <div className="text-2xl text-rose-600 dark:text-rose-400">
          에러: {error}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-gray-900 bg-amber-50 min-w-screen dark:bg-gray-900 dark:text-white">
        <div className="text-2xl">데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen text-gray-900 bg-amber-50 min-w-screen dark:bg-gray-900 dark:text-white">
      <div className="w-[50vw] flex flex-col">
        <div className="w-full mb-12">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg transition-colors bg-stone-300 text-stone-900 hover:bg-stone-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              뒤로 가기
            </button>
            <h1 className="text-4xl font-bold">감정 분석 통계</h1>
            <div className="w-[100px]"></div>
          </div>
          <div className="grid w-full grid-cols-1 gap-8 mb-12 md:grid-cols-2">
            <div className="p-6 bg-white border border-amber-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
              <h2 className="mb-4 text-2xl font-semibold">전체 통계</h2>
              <p className="text-lg">총 일기 수: {stats.totalEntries}개</p>
            </div>
            <div className="p-6 bg-white border border-amber-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
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
};

export default StatsPage;
