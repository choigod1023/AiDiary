import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { match, P } from "ts-pattern";
import { diaryApi } from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { DiaryEntry } from "../types/diary";
import { useAuth } from "../contexts/AuthContext";

const ListPage: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();

  // React Query를 사용한 일기 목록 조회 (인증된 경우에만)
  const {
    data: entries = [],
    isLoading,
    error,
  } = useQuery<DiaryEntry[]>({
    queryKey: ["diary-list"],
    queryFn: diaryApi.getList,
    staleTime: 2 * 60 * 1000, // 2분
    enabled: authState.isAuthenticated && !authState.isLoading, // 인증된 경우에만 실행
  });

  // 인증 로딩 중이거나 인증되지 않은 경우
  if (authState.isLoading) {
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-gray-900 bg-amber-50 min-w-screen dark:bg-gray-900 dark:text-white">
        <div className="p-8 mx-auto w-full max-w-4xl text-gray-900 bg-white rounded-lg shadow-lg dark:bg-gray-800 dark:text-white">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg transition-colors bg-stone-300 text-stone-900 hover:bg-stone-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              뒤로 가기
            </button>
            <h1 className="text-4xl font-bold text-center">일기 목록</h1>
            <div className="w-[100px]"></div>
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
    navigate("/login?from=/list");
    return null;
  }

  // ts-pattern을 사용한 상태별 렌더링
  return match({ isLoading, error, entries })
    .with({ isLoading: true }, () => (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-gray-900 bg-amber-50 min-w-screen dark:bg-gray-900 dark:text-white">
        <div className="p-8 mx-auto w-full max-w-4xl text-gray-900 bg-white rounded-lg shadow-lg dark:bg-gray-800 dark:text-white">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg transition-colors bg-stone-300 text-stone-900 hover:bg-stone-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              뒤로 가기
            </button>
            <h1 className="text-4xl font-bold text-center">일기 목록</h1>
            <div className="w-[100px]"></div>
          </div>
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner size="lg" text="일기 목록을 불러오는 중..." />
          </div>
        </div>
      </div>
    ))
    .with({ error: P.not(null) }, () => (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-gray-900 bg-amber-50 min-w-screen dark:bg-gray-900 dark:text-white">
        <div className="p-8 mx-auto w-full max-w-4xl text-gray-900 bg-white rounded-lg shadow-lg dark:bg-gray-800 dark:text-white">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg transition-colors bg-stone-300 text-stone-900 hover:bg-stone-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              뒤로 가기
            </button>
            <h1 className="text-4xl font-bold text-center">일기 목록</h1>
            <div className="w-[100px]"></div>
          </div>
          <div className="p-4 bg-red-100 rounded-lg border border-red-200 dark:bg-red-900 dark:border-red-800">
            <p className="text-red-800 dark:text-red-200">
              일기 목록을 불러오는데 실패했습니다. 다시 시도해주세요.
            </p>
          </div>
        </div>
      </div>
    ))
    .with({ entries: [] }, () => (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-gray-900 bg-amber-50 min-w-screen dark:bg-gray-900 dark:text-white">
        <div className="p-8 mx-auto w-full max-w-4xl text-gray-900 bg-white rounded-lg shadow-lg dark:bg-gray-800 dark:text-white">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg transition-colors bg-stone-300 text-stone-900 hover:bg-stone-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              뒤로 가기
            </button>
            <h1 className="text-4xl font-bold text-center">일기 목록</h1>
            <div className="w-[100px]"></div>
          </div>
          <div className="py-16 text-center text-stone-600 dark:text-stone-400">
            <p className="text-lg">아직 작성된 일기가 없습니다.</p>
            <p className="mt-2">첫 번째 일기를 작성해보세요!</p>
          </div>
        </div>
      </div>
    ))
    .otherwise(({ entries }) => (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-gray-900 bg-amber-50 min-w-screen dark:bg-gray-900 dark:text-white">
        <div className="p-8 mx-auto w-full max-w-4xl text-gray-900 bg-white rounded-lg shadow-lg dark:bg-gray-800 dark:text-white">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg transition-colors bg-stone-300 text-stone-900 hover:bg-stone-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              뒤로 가기
            </button>
            <h1 className="text-4xl font-bold text-center">일기 목록</h1>
            <div className="w-[100px]"></div>
          </div>
          <ul className="space-y-4">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="p-4 bg-amber-200 rounded-lg border border-amber-800 transition-colors hover:bg-amber-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600"
              >
                <Link
                  to={`/detail/${entry.id}`}
                  className="block text-black dark:text-white"
                >
                  <strong>{entry.date}</strong>: {entry.emotion} - {entry.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    ));
};

export default ListPage;
