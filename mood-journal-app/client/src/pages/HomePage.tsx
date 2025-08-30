import React from "react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen-mobile text-gray-900 bg-amber-50 dark:bg-gray-900 dark:text-white px-mobile">
      <h1 className="mb-6 text-mobile-2xl font-bold text-center">
        감정 일기 앱에 오신 것을 환영합니다!
      </h1>
      <p className="mb-8 text-mobile-base text-center">
        AI가 당신의 일기를 요약하고, 감정 상태를 이모지로 표현해드립니다.
      </p>
      <div className="space-y-4 w-full max-w-sm">
        <Link
          to="/write"
          className="block py-4 w-full font-semibold text-center text-white bg-yellow-600 rounded-lg transition-colors hover:bg-yellow-700 dark:bg-blue-600 dark:hover:bg-blue-700 touch-target"
        >
          새로운 일기 작성
        </Link>
        <Link
          to="/list"
          className="block py-4 w-full font-semibold text-center rounded-lg transition-colors bg-stone-300 text-stone-900 hover:bg-stone-400 dark:bg-green-600 dark:text-white dark:hover:bg-green-700 touch-target"
        >
          일기 목록 보기
        </Link>
        <Link
          to="/stats"
          className="block py-4 w-full font-semibold text-center bg-amber-300 rounded-lg transition-colors text-stone-900 hover:bg-amber-400 dark:bg-purple-600 dark:text-white dark:hover:bg-purple-700 touch-target"
        >
          감정 통계 보기
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
