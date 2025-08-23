import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartDataLabels
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
  // 모든 고유 감정 목록 추출
  const allEmotions = Array.from(
    new Set(emotionData.flatMap((entry) => Object.keys(entry.emotions)))
  );

  // 평균 감정 비율 계산
  const averageEmotions = allEmotions.reduce((acc, emotion) => {
    const sum = emotionData.reduce(
      (sum, entry) => sum + (entry.emotions[emotion] || 0),
      0
    );
    acc[emotion] = sum / emotionData.length;
    return acc;
  }, {} as { [key: string]: number });

  // 도넛 차트 데이터
  const doughnutChartData = {
    labels: allEmotions,
    datasets: [
      {
        data: allEmotions.map((emotion) => averageEmotions[emotion]),
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
          "rgba(255, 159, 64, 0.8)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // 스택 바 차트 데이터
  const stackedBarData = {
    labels: emotionData.map((entry) => entry.date),
    datasets: allEmotions.map((emotion, index) => ({
      label: emotion,
      data: emotionData.map((entry) => entry.emotions[emotion] || 0),
      backgroundColor: [
        "rgba(255, 99, 132, 0.6)",
        "rgba(54, 162, 235, 0.6)",
        "rgba(255, 206, 86, 0.6)",
        "rgba(75, 192, 192, 0.6)",
        "rgba(153, 102, 255, 0.6)",
        "rgba(255, 159, 64, 0.6)",
      ][index % 6],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(75, 192, 192, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 159, 64, 1)",
      ][index % 6],
      borderWidth: 1,
    })),
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "#1f2937", // stone-800 for light
          font: { size: 14 },
          padding: 20,
        },
      },
      title: {
        display: true,
        text: "평균 감정 비율",
        color: "#1f2937",
        font: { size: 18, weight: "bold" as const },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value.toFixed(1)}%`;
          },
        },
      },
      datalabels: {
        color: "#1f2937",
        font: { size: 14, weight: "bold" as const },
        formatter: (value: number) => `${value.toFixed(1)}%`,
      },
    },
  } as any;

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: { color: "#1f2937", font: { size: 14 }, padding: 20 },
      },
      title: {
        display: true,
        text: "감정 비율 변화",
        color: "#1f2937",
        font: { size: 18, weight: "bold" as const },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { color: "rgba(31, 41, 55, 0.1)" },
        ticks: { color: "#1f2937", font: { size: 12 } },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        max: 100,
        ticks: {
          color: "#1f2937",
          font: { size: 12 },
          callback: function (value: any) {
            return `${value}%`;
          },
        },
        grid: { color: "rgba(31, 41, 55, 0.1)" },
      },
    },
  } as any;

  return (
    <div className="flex flex-col gap-12 w-full">
      <div className="w-full bg-white border border-amber-200 p-8 rounded-xl shadow-sm h-[600px] flex justify-center items-center dark:bg-gray-800 dark:border-gray-700">
        <div className="w-full h-full">
          <Doughnut data={doughnutChartData} options={doughnutOptions} />
        </div>
      </div>
      <div className="w-full bg-white border border-amber-200 p-8 rounded-xl shadow-sm h-[700px] dark:bg-gray-800 dark:border-gray-700">
        <div className="w-full h-full">
          <Bar data={stackedBarData} options={barOptions} />
        </div>
      </div>
    </div>
  );
};

export default StatsChart;
