import React from "react";
import { DiaryEntry } from "../types/diary";

interface DiaryDetailProps {
  entry: DiaryEntry;
  handleBack: () => void;
}

const DiaryDetail: React.FC<DiaryDetailProps> = ({ entry, handleBack }) => {
  return (
    <div className="w-full max-w-6xl mx-auto p-8 bg-gray-800 text-white rounded-lg shadow-lg">
      <div className="mb-6 border-b border-gray-700 pb-4">
        <div className="flex justify-between items-center h-12">
          <button
            onClick={handleBack}
            className="mr-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            뒤로 가기
          </button>
          <h1 className="text-3xl font-bold text-white truncate max-w-[80%]">
            {entry.title}
          </h1>
        </div>
        <div className="w-24"></div> {/* 균형을 위한 빈 공간 */}
        <div className="flex items-center text-gray-400 mt-4">
          <span className="mr-4">{entry.date}</span>
          <span className="text-2xl">{entry.emotion}</span>
        </div>
      </div>

      <div className="mb-6 bg-gray-700 p-6 rounded-lg">
        <p className="text-lg leading-relaxed whitespace-pre-wrap">
          {entry.entry}
        </p>
      </div>

      <div className="text-right text-gray-500 text-sm">
        <p>ID: {entry.id}</p>
      </div>
    </div>
  );
};

export default DiaryDetail;
