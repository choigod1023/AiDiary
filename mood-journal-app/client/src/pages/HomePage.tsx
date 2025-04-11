import React from "react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="text-5xl font-bold mb-6">
        감정 일기 앱에 오신 것을 환영합니다!
      </h1>
      <p className="text-lg mb-8 text-center">
        AI가 당신의 일기를 요약하고, 감정 상태를 이모지로 표현해드립니다.
      </p>
      <div className="space-y-4">
        <Link
          to="/write"
          className="block w-64 py-3 bg-blue-600 text-center text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          새로운 일기 작성
        </Link>
        <Link
          to="/list"
          className="block w-64 py-3 bg-green-600 text-center text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
        >
          일기 목록 보기
        </Link>
        <Link
          to="/stats"
          className="block w-64 py-3 bg-purple-600 text-center text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
        >
          감정 통계 보기
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
