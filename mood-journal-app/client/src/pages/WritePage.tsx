import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { diaryApi } from "../utils/api";
import LoadingSpinner from "../components/LoadingSpinner";

const WritePage: React.FC = () => {
  const [entry, setEntry] = useState<string>("");
  const navigate = useNavigate();

  // 일기 저장 mutation
  const saveMutation = useMutation({
    mutationFn: (entry: string) => diaryApi.create(entry),
    onSuccess: () => {
      setEntry("");
      alert("일기가 저장되었습니다!");
      navigate("/list");
    },
    onError: (error: Error) => {
      console.error("Error saving diary entry:", error);
      alert("일기 저장에 실패했습니다. 다시 시도해주세요.");
    },
  });

  const handleSave = async () => {
    if (!entry.trim()) {
      alert("일기 내용을 입력해주세요.");
      return;
    }

    saveMutation.mutate(entry);
  };

  return (
    <div className="flex flex-1 justify-center items-center p-8 w-full bg-amber-50">
      <div className="max-w-8xl w-[70vw] mx-auto rounded-lg shadow-lg p-8 bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 font-sans rounded-lg transition-colors bg-stone-300 text-stone-900 hover:bg-stone-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
          >
            뒤로 가기
          </button>
          <h1 className="text-4xl font-bold text-center">일기 작성</h1>
          <div className="w-[100px]"></div>
        </div>
        <textarea
          className="p-6 w-full h-80 font-sans text-gray-900 bg-amber-50 rounded-lg border-2 border-amber-300 resize-none focus:outline-none focus:border-amber-400 dark:bg-gray-900 dark:text-white dark:border-gray-600 dark:focus:border-blue-500"
          placeholder="여기에 일기를 작성하세요..."
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          disabled={saveMutation.isPending}
        ></textarea>
        <button
          className={`py-4 mt-8 w-full font-sans font-semibold text-white rounded-lg transition-colors ${
            saveMutation.isPending
              ? "bg-gray-400 cursor-not-allowed dark:bg-gray-500"
              : "bg-yellow-600 hover:bg-yellow-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          }`}
          onClick={handleSave}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <div className="flex justify-center items-center">
              <LoadingSpinner size="sm" color="white" />
              <span className="ml-2">저장 중...</span>
            </div>
          ) : (
            "일기 저장"
          )}
        </button>
      </div>
    </div>
  );
};

export default WritePage;
