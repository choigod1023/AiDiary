import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface EmotionMix {
  date: string;
  emotions: {
    [key: string]: number; // 감정 이름과 비율 (0-100)
  };
}

interface StatsChartProps {
  emotionData: EmotionMix[];
}

const StatsChart: React.FC<StatsChartProps> = ({ emotionData }) => {
  // 날짜 오름차순 정렬 (이전 → 최근)
  const sortedData = [...emotionData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // 모든 고유 감정 목록 추출
  const allEmotions = Array.from(
    new Set(sortedData.flatMap((entry) => Object.keys(entry.emotions)))
  );

  // 평균 감정 비율 계산
  const averageEmotions = allEmotions.reduce((acc, emotion) => {
    const sum = sortedData.reduce(
      (sum, entry) => sum + (entry.emotions[emotion] || 0),
      0
    );
    acc[emotion] = sum / Math.max(1, sortedData.length);
    return acc;
  }, {} as { [key: string]: number });

  // 상위 5개 감정만 사용
  const topEmotions = Object.entries(averageEmotions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([emotion]) => emotion);

  // 고정 팔레트 (상위 5개 전용, 모두 다른 색)
  const palette = [
    "#ff6b6b", // red
    "#4dabf7", // blue
    "#ffd43b", // yellow
    "#69db7c", // green
    "#b197fc", // purple
  ];

  // 스택 바 차트 데이터 (상위 5개 감정만)
  const stackedBarData = {
    labels: sortedData.map((entry) => entry.date),
    datasets: topEmotions.map((emotion, index) => ({
      label: emotion,
      data: sortedData.map((entry) => entry.emotions[emotion] || 0),
      backgroundColor: palette[index % palette.length] + "99", // 60% alpha
      borderColor: palette[index % palette.length],
      borderWidth: 1,
    })),
  };

  // 도넛 옵션 제거 (중복 시각화 제거)

  // 다크 모드 동기화: class 변경이나 시스템 테마 변경 시 반영
  const [isDark, setIsDark] = React.useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark")
  );
  React.useEffect(() => {
    const mq =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      const byClass = document.documentElement.classList.contains("dark");
      setIsDark(byClass || (mq ? mq.matches : false));
    };
    update();
    if (mq && mq.addEventListener) {
      mq.addEventListener("change", update);
    }
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      if (mq && mq.removeEventListener) {
        mq.removeEventListener("change", update);
      }
      obs.disconnect();
    };
  }, []);
  const axisColor = isDark ? "#e5e7eb" : "#1f2937"; // gray-200 / gray-800
  const gridColor = isDark ? "rgba(229,231,235,0.15)" : "rgba(31,41,55,0.1)";

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { color: gridColor },
        ticks: { color: axisColor, font: { size: 12 } },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        max: 100,
        ticks: {
          color: axisColor,
          font: { size: 12 },
          callback: function (value: string | number) {
            return `${value}%`;
          },
        },
        grid: { color: gridColor },
      },
    },
  };

  // 가로 스크롤 컨테이너: 최근 데이터가 오른쪽에 위치 → 초기 스크롤을 오른쪽 끝으로 이동
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = el.scrollWidth;
    }
  }, [sortedData.length]);

  // 차트 너비: 데이터 길이에 비례하여 확대 (가로 스크롤 유도)
  const chartWidth = Math.max(900, sortedData.length * 64);

  return (
    <div className="flex flex-col gap-12 w-full">
      <div className="w-full bg-white border border-amber-200 p-8 rounded-xl shadow-sm h-[700px] dark:bg-gray-800 dark:border-gray-700">
        {/* 고정 제목 + 커스텀 범례 (가로 스크롤 영역 밖) */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
            감정 비율 변화
          </h3>
          <div className="flex flex-wrap gap-2">
            {topEmotions.map((emotion, index) => (
              <div key={emotion} className="flex gap-2 items-center text-sm">
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ backgroundColor: palette[index % palette.length] }}
                />
                <span className="text-stone-700 dark:text-stone-200">
                  {emotion}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div
          ref={scrollRef}
          className="overflow-x-auto w-full h-[calc(100%-2rem)]"
        >
          <div style={{ width: chartWidth, height: "100%" }}>
            <Bar
              key={`stacked-${isDark ? "dark" : "light"}`}
              data={stackedBarData}
              options={barOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsChart;
