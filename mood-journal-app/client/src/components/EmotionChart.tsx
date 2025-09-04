import React from "react";
import { Link } from "react-router-dom";

interface EmotionChartProps {
  data: {
    totalEntries: number;
    averageEmotions: { [key: string]: number };
    emotionTrends: { date: string; emotions: { [key: string]: number } }[];
  };
  type: "weekly" | "monthly";
  className?: string;
}

// 퍼센트 바별 색깔 (그라데이션 효과)
const percentageBarColors = [
  "linear-gradient(90deg, #FF6B6B, #FF8E53)",
  "linear-gradient(90deg, #4ECDC4, #45B7D1)",
  "linear-gradient(90deg, #FFD93D, #FF8E53)",
  "linear-gradient(90deg, #6C5CE7, #A8E6CF)",
];

const emotionLabels = {
  happy: "행복",
  sad: "슬픔",
  angry: "화남",
  neutral: "보통",
  surprised: "놀람",
  fear: "두려움",
  disgust: "혐오",
};

const EmotionChart: React.FC<EmotionChartProps> = ({
  data,
  type,
  className = "",
}) => {
  // 주간/월간 범위에 따라 트렌드 데이터 집계
  const range = type === "weekly" ? 7 : 30;
  const trendSlice = Array.isArray(data.emotionTrends)
    ? data.emotionTrends.slice(-range)
    : [];

  const aggregated: { [key: string]: number } = {};
  if (trendSlice.length > 0) {
    for (const day of trendSlice) {
      const emotions = day?.emotions || {};
      for (const [k, v] of Object.entries(emotions)) {
        aggregated[k] = (aggregated[k] || 0) + (typeof v === "number" ? v : 0);
      }
    }
  }

  // 집계 데이터가 없으면 평균값 사용 (fallback)
  const baseEmotions =
    Object.keys(aggregated).length > 0 ? aggregated : data.averageEmotions;

  // 감정별 비율 계산 (소수점 제거)
  const totalEmotions = Object.values(baseEmotions).reduce(
    (sum, count) => sum + count,
    0
  );
  const emotionPercentages = Object.entries(baseEmotions)
    .map(([emotion, count]) => ({
      emotion,
      percentage:
        totalEmotions > 0
          ? Math.round(
              ((typeof count === "number" ? count : 0) / totalEmotions) * 100
            )
          : 0,
    }))
    .filter((e) => e.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  // 상위 4개 감정만 표시
  const topEmotions = emotionPercentages.slice(0, 4);

  return (
    <div
      className={`p-4 rounded-lg ring-1 shadow-sm bg-white/90 dark:bg-gray-800/90 ring-black/5 dark:ring-white/10 ${className}`}
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {type === "weekly" ? "주간" : "월간"} 감정 분포
        </h4>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          총 {data.totalEntries}개
        </span>
      </div>

      {/* 미니멀 도표식 차트 */}
      <div className="space-y-3">
        {topEmotions.map(({ emotion, percentage }, index) => (
          <div key={emotion} className="flex gap-2 items-center">
            {/* 감정 이름 */}
            <span className="min-w-0 text-xs text-gray-600 flex-2 dark:text-gray-400">
              {emotionLabels[emotion as keyof typeof emotionLabels] || emotion}
            </span>

            {/* 퍼센트 바 */}
            <div className="overflow-hidden flex-1 h-3 bg-gray-200 rounded-full dark:bg-gray-600">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${percentage}%`,
                  background:
                    percentageBarColors[index % percentageBarColors.length],
                }}
              />
            </div>

            {/* 퍼센트 */}
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[2rem] text-right">
              {percentage}%
            </span>
          </div>
        ))}
      </div>

      {/* /stats 바로가기 */}
      <div className="pt-2 mt-3 border-t border-gray-200 dark:border-gray-600">
        <Link
          to="/stats"
          className="inline-flex justify-center items-center py-2 w-full text-xs font-medium text-amber-700 rounded-md hover:underline dark:text-blue-300"
        >
          차트 전체 보러가기 →
        </Link>
      </div>
    </div>
  );
};

export default EmotionChart;
