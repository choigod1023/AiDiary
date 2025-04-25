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
          `${import.meta.env.VITE_API_URL}/api/diary/emotion-stats`
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
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-900">
        <div className="text-2xl text-white">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-900">
        <div className="text-2xl text-red-500">에러: {error}</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-900">
        <div className="text-2xl text-white">데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-gray-900 text-gray-200">
      <div className="w-[50vw] flex flex-col">
        <div className="mb-12 w-full">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              뒤로 가기
            </button>
            <h1 className="text-4xl font-bold text-white">감정 분석 통계</h1>
            <div className="w-[100px]"></div> {/* 균형을 위한 빈 div */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 w-full">
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold text-white mb-4">
                전체 통계
              </h2>
              <p className="text-lg">총 일기 수: {stats.totalEntries}개</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-4">
                평균 감정 비율
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(stats.averageEmotions).map(
                  ([emotion, value]) => (
                    <div
                      key={emotion}
                      className="bg-gray-700 p-3 rounded-lg flex flex-col items-center"
                    >
                      <span className="text-sm mb-1">{emotion}</span>
                      <span className="text-lg font-bold text-white">
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
