import React from "react";
import { DiaryEntry } from "../types/diary";

interface DiaryDetailProps {
  entry: DiaryEntry;
  handleBack: () => void;
  handleDelete: () => Promise<void>;
  showAIFeedback: boolean;
  aiFeedback: string;
  aiLoading: boolean;
  onAIFeedbackRequest: () => Promise<void>;
}

const DiaryDetail: React.FC<DiaryDetailProps> = ({
  entry,
  handleBack,
  handleDelete,
  showAIFeedback,
  aiFeedback,
  aiLoading,
  onAIFeedbackRequest,
}) => {
  return (
    <div className="p-8 mx-auto w-full max-w-6xl bg-amber-200 rounded-2xl border-2 border-amber-800 shadow-md text-stone-900 dark:bg-gray-800 dark:text-white dark:border-gray-700">
      <div className="pb-4 mb-6 border-b border-amber-700/70 dark:border-gray-700">
        <div className="flex justify-between items-center h-12">
          <button
            onClick={handleBack}
            className="px-4 py-2 mr-4 rounded-lg transition-colors bg-stone-300 text-stone-900 hover:bg-stone-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
          >
            뒤로 가기
          </button>
          <h1 className="text-3xl font-bold truncate max-w-[60%]">
            {entry.title}
          </h1>
          <button
            onClick={handleDelete}
            className="px-4 py-2 ml-4 text-white bg-rose-700 rounded-lg transition-colors hover:bg-rose-800 dark:bg-red-600 dark:hover:bg-red-700"
          >
            삭제
          </button>
        </div>
        <div className="w-24"></div>
        <div className="flex items-center mt-4 text-stone-600 dark:text-gray-400">
          <span className="mr-4">{entry.date}</span>
          <span className="text-2xl">{entry.emotion}</span>
        </div>
      </div>

      <div className="p-6 mb-6 bg-white rounded-xl border-2 border-amber-700 shadow-sm dark:bg-gray-700 dark:border-gray-600">
        <p className="text-lg leading-relaxed whitespace-pre-wrap">
          {entry.entry}
        </p>
      </div>

      {/* ☕ 한 잔의 위로 - Light: slightly lighter than outer; Dark: warm neutral */}
      <div className="p-6 mb-6 bg-amber-100 rounded-2xl border-2 border-amber-700 shadow-sm text-stone-900 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-amber-900 dark:text-stone-100">
            ☕ 한 잔의 위로
          </h3>
          <button
            onClick={onAIFeedbackRequest}
            disabled={aiLoading || Boolean(entry.aiFeedback)}
            title={
              entry.aiFeedback ? "이미 말이 저장되었습니다" : "한마디 듣기"
            }
            className={`px-3 py-2 rounded-lg transition-colors border-2 ${
              entry.aiFeedback
                ? "bg-stone-300 text-stone-800 border-stone-400 cursor-not-allowed dark:bg-stone-700 dark:text-stone-300 dark:border-stone-600"
                : aiLoading
                ? "bg-amber-400 text-stone-900 border-amber-500 cursor-wait dark:bg-yellow-500 dark:text-stone-900 dark:border-yellow-600"
                : "bg-amber-700 text-amber-50 hover:bg-amber-800 border-amber-900 dark:bg-amber-600 dark:text-amber-50 dark:hover:bg-amber-500 dark:border-amber-600"
            }`}
          >
            {entry.aiFeedback
              ? "저장됨"
              : aiLoading
              ? "듣는 중..."
              : "한마디 듣기"}
          </button>
        </div>

        {(entry.aiFeedback || (showAIFeedback && aiFeedback)) && (
          <div className="p-4 bg-white rounded-xl border-2 border-amber-600 shadow-xs dark:bg-stone-700 dark:border-stone-600">
            <p className="leading-relaxed whitespace-pre-wrap text-stone-900 dark:text-stone-100">
              {entry.aiFeedback || aiFeedback}
            </p>
          </div>
        )}

        {!entry.aiFeedback && !showAIFeedback && (
          <p className="italic text-stone-700 dark:text-stone-300">
            위의 "한마디 듣기" 버튼을 누르면, 다정한 한마디가 생성되어
            저장됩니다.
          </p>
        )}
      </div>

      <div className="text-sm text-right text-stone-600 dark:text-gray-500">
        <p>ID: {entry.id}</p>
      </div>
    </div>
  );
};

export default DiaryDetail;
