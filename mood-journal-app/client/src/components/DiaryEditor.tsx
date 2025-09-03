import React from "react";

interface DiaryEditorProps {
  entry: {
    id: string | number;
    title: string;
    date: string;
    emotion: string;
    entry: string;
    visibility: "private" | "shared";
    shareToken?: string;
    userId: string;
    aiFeedback?: string;
    authorName?: string;
  };
  editData: {
    title: string;
    entry: string;
    useAITitle: boolean;
    visibility?: "private" | "shared";
  };
  onEditDataChange: (data: {
    title: string;
    entry: string;
    useAITitle: boolean;
    visibility?: "private" | "shared";
  }) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const DiaryEditor: React.FC<DiaryEditorProps> = ({
  entry,
  editData,
  onEditDataChange,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  return (
    <>
      {/* 제목 */}
      <div className="mb-6">
        <input
          value={editData.title}
          onChange={(e) =>
            onEditDataChange({ ...editData, title: e.target.value })
          }
          disabled={editData.useAITitle} // AI 제목 생성 체크 시 비활성화
          className={`w-full p-3 text-2xl font-bold rounded-lg text-black bg-amber-50 border-2 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none ${
            editData.useAITitle
              ? "bg-amber-100 text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400 dark:border-gray-500"
              : "bg-white border-amber-600 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          }`}
          placeholder={
            editData.useAITitle
              ? "AI가 자동으로 제목을 생성합니다"
              : "제목을 입력하세요"
          }
        />
      </div>

      {/* 작성자 정보 */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 text-sm text-amber-700 dark:text-amber-300">
          <span className="font-medium">✍️ 작성자:</span>
          <span>{entry.authorName || entry.userId}</span>
        </div>
      </div>

      {/* 날짜 및 감정 */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg text-amber-800 dark:text-stone-200">
          📅 {entry.date}
        </div>
        {/* 새로운 일기 작성 시에는 기분 선택 부분 숨김 */}
        {entry.id !== "new" && (
          <div className="flex flex-col items-end space-y-1">
            <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
              오늘의 내 기분
            </div>
            <div className="text-2xl">{entry.emotion}</div>
          </div>
        )}
      </div>

      {/* AI 제목 생성 체크박스 */}
      <div className="mb-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={editData.useAITitle}
            onChange={(e) =>
              onEditDataChange({ ...editData, useAITitle: e.target.checked })
            }
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            AI가 제목과 감정을 자동으로 생성
          </span>
        </label>
      </div>

      {/* 공개 범위 토글 */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            공개 범위
          </span>
          <button
            type="button"
            onClick={() =>
              onEditDataChange({
                ...editData,
                visibility:
                  (editData.visibility ?? entry.visibility) === "private"
                    ? "shared"
                    : "private",
              })
            }
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              (editData.visibility ?? entry.visibility) === "private"
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            }`}
          >
            {(editData.visibility ?? entry.visibility) === "private"
              ? "🔒 비공개"
              : "🌍 공개"}
          </button>
        </div>
      </div>

      {/* 일기 내용 */}
      <div className="mb-6">
        <textarea
          value={editData.entry}
          onChange={(e) =>
            onEditDataChange({ ...editData, entry: e.target.value })
          }
          rows={10}
          className="p-4 w-full text-lg text-black bg-amber-50 rounded-lg border-2 border-amber-600 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          placeholder="일기 내용을 입력하세요"
        />
      </div>

      {/* 액션 버튼들 */}
      <div className="flex justify-end mb-6 space-x-3">
        <button
          onClick={() => {
            if (isSaving) return;
            if (!editData.entry.trim()) return;
            onSave();
          }}
          disabled={isSaving}
          className={`px-6 py-3 text-white rounded-lg transition-colors ${
            isSaving
              ? "bg-gray-400 cursor-not-allowed dark:bg-gray-500"
              : "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
          }`}
        >
          {isSaving ? "⏳ 저장 중..." : "💾 저장"}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
        >
          ❌ 취소
        </button>
      </div>
    </>
  );
};

export default DiaryEditor;
