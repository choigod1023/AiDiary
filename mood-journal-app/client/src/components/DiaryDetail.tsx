import React from "react";
import BackButton from "./BackButton";
import DiaryViewer from "./DiaryViewer";
import DiaryEditor from "./DiaryEditor";

interface DiaryDetailProps {
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
    useAITitle?: boolean;
    authorName?: string;
  };
  handleBack: () => void;
  handleDelete: () => void;
  showAIFeedback: boolean;
  aiFeedback: string;
  aiLoading: boolean;
  onAIFeedbackRequest: () => void;
  isOwner?: boolean;
  isSaving?: boolean;
  onEdit?: (entry: {
    id: string | number;
    title: string;
    date: string;
    emotion: string;
    entry: string;
    visibility: "private" | "shared";
    shareToken?: string;
    userId: string;
    aiFeedback?: string;
    useAITitle?: boolean;
  }) => void;
  onVisibilityChange?: (visibility: "private" | "shared") => void;
}

const DiaryDetail: React.FC<DiaryDetailProps> = ({
  entry,
  handleBack,
  handleDelete,
  showAIFeedback,
  aiFeedback,
  aiLoading,
  onAIFeedbackRequest,
  isOwner = true,
  isSaving = false,
  onEdit,
  onVisibilityChange,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editData, setEditData] = React.useState({
    title: entry.title,
    entry: entry.entry,
    useAITitle: false,
  });

  const handleSave = () => {
    if (onEdit) {
      onEdit({
        ...entry,
        ...editData,
        useAITitle: editData.useAITitle,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      title: entry.title,
      entry: entry.entry,
      useAITitle: false,
    });
    setIsEditing(false);
  };

  const toggleVisibility = () => {
    if (onVisibilityChange) {
      const newVisibility =
        entry.visibility === "private" ? "shared" : "private";
      onVisibilityChange(newVisibility);
    }
  };

  // 모바일 하단 툴바 컴포넌트
  const MobileToolbar: React.FC<{
    isOwner: boolean;
    isEditing: boolean;
    visibility: string;
    shareToken?: string;
    entryId: string | number;
    onVisibilityChange: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onAIFeedbackRequest: () => void;
    aiLoading: boolean;
  }> = ({
    isOwner,
    isEditing,
    visibility,
    shareToken,
    entryId,
    onVisibilityChange,
    onEdit,
    onDelete,
    onAIFeedbackRequest,
    aiLoading,
  }) => {
    // 표시할 버튼들을 계산
    const buttons = [];

    if (isOwner) {
      buttons.push({
        key: "visibility",
        onClick: onVisibilityChange,
        className: `px-2 py-2 rounded-lg transition-colors border text-xs font-medium h-10 flex items-center justify-center ${
          visibility === "shared"
            ? "bg-green-600 text-white border-green-700 dark:bg-green-600 dark:border-green-500"
            : "bg-gray-600 text-white border-gray-700 dark:bg-gray-600 dark:border-gray-500"
        }`,
        text: visibility === "shared" ? "🌐 공개" : "🔒 비공개",
      });
    }

    if (visibility === "shared") {
      buttons.push({
        key: "link",
        onClick: () => {
          const shareUrl = `${window.location.origin}/detail/${entryId}?token=${shareToken}`;
          navigator.clipboard
            .writeText(shareUrl)
            .then(() => {
              alert("링크가 클립보드에 복사되었습니다!");
            })
            .catch(() => {
              window.prompt("아래 링크를 복사해서 공유하세요:", shareUrl);
            });
        },
        className:
          "px-2 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg border border-blue-700 transition-colors dark:bg-blue-600 dark:border-blue-500 h-10 flex items-center justify-center",
        text: "🔗 링크 복사",
      });
    }

    // 한마디 듣기 버튼 (작성자만) - 데스크톱과 동일한 스타일
    if (isOwner && !isEditing) {
      buttons.push({
        key: "ai-feedback",
        onClick: onAIFeedbackRequest,
        className: `px-2 py-2 text-xs font-medium rounded-lg border-2 transition-colors h-10 flex items-center justify-center ${
          aiLoading
            ? "bg-amber-400 text-stone-900 border-amber-500 cursor-wait dark:bg-yellow-500 dark:text-stone-900 dark:border-yellow-600"
            : "bg-amber-700 text-amber-50 hover:bg-amber-800 border-amber-900 dark:bg-amber-600 dark:text-amber-50 dark:hover:bg-amber-500 dark:border-amber-600"
        }`,
        text: aiLoading ? "듣는 중..." : "🎵 한마디",
      });
    }

    if (isOwner && !isEditing) {
      buttons.push({
        key: "edit",
        onClick: onEdit,
        className:
          "px-2 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg border border-blue-700 transition-colors dark:bg-blue-600 dark:border-blue-500 h-10 flex items-center justify-center",
        text: "✏️ 수정",
      });
    }

    if (isOwner) {
      buttons.push({
        key: "delete",
        onClick: onDelete,
        className:
          "px-2 py-2 text-xs font-medium text-white bg-rose-700 rounded-lg border border-rose-800 transition-colors dark:bg-red-600 dark:border-red-700 h-10 flex items-center justify-center",
        text: "🗑️ 삭제",
      });
    }

    return (
      <div className="fixed right-0 bottom-0 left-0 z-50 sm:hidden">
        <div className="bg-white border-t-2 border-amber-700 shadow-lg dark:bg-gray-800 dark:border-stone-700">
          <div className="flex gap-1 justify-around items-stretch p-2">
            {buttons.map((button) => (
              <button
                key={button.key}
                onClick={button.onClick}
                className={`flex-1 ${button.className}`}
              >
                {button.text}
              </button>
            ))}
          </div>
        </div>
        {/* 하단 안전 영역을 위한 패딩 */}
        <div className="bg-white safe-area-bottom dark:bg-gray-800"></div>
      </div>
    );
  };

  return (
    <div className="flex flex-col pt-4 pb-5 w-full min-h-screen px-mobile xs:mb-6 text-stone-900 dark:text-white mobile-bottom-spacing">
      {/* 헤더 - 공통 컨트롤 */}
      <div className="flex-shrink-0 pb-2 mb-4 border-b xs:pb-4 xs:mb-6 border-amber-700/70 dark:border-gray-700">
        <div className="flex justify-between items-center h-8 xs:h-12">
          <BackButton onClick={handleBack} />
          {/* 컨트롤 버튼들 - 데스크톱에서만 표시 */}
          <div className="hidden items-center space-x-2 md:flex">
            {/* 수정 모드에서는 '비공개' 버튼 하나만 노출하고, 클릭 시 즉시 공개로 전환 */}
            {isOwner && isEditing ? (
              // 수정 모드: 상단에서는 상태 텍스트만 표시 (전환은 에디터 내부에서 처리)
              <div className="text-sm text-gray-800 dark:text-gray-200">
                현재 상태 :{" "}
                {entry.visibility === "shared" ? "🌐 공개" : "🔒 비공개"}
              </div>
            ) : (
              // 보기 모드: 상태 텍스트만
              <span
                className={`px-3 py-2 rounded-lg border text-sm ${
                  entry.visibility === "shared"
                    ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700"
                    : "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                }`}
              >
                {entry.visibility === "shared" ? "🌐 공개" : "🔒 비공개"}
              </span>
            )}

            {/* 링크 복사 버튼 (공개된 글만) */}
            {entry.visibility === "shared" && (
              <button
                onClick={() => {
                  const shareUrl = `${window.location.origin}/detail/${entry.id}?token=${entry.shareToken}`;
                  navigator.clipboard
                    .writeText(shareUrl)
                    .then(() => {
                      alert("링크가 클립보드에 복사되었습니다!");
                    })
                    .catch(() => {
                      window.prompt(
                        "아래 링크를 복사해서 공유하세요:",
                        shareUrl
                      );
                    });
                }}
                className="px-3 py-2 text-sm text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                title="일기 링크 복사"
              >
                🔗 링크 복사
              </button>
            )}

            {/* 수정 버튼 (작성자만) */}
            {isOwner && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="hidden px-3 py-2 text-sm text-white bg-blue-600 rounded-lg transition-colors md:block hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                ✏️ 수정
              </button>
            )}

            {/* 삭제 버튼 (작성자만) */}
            {isOwner && (
              <button
                onClick={handleDelete}
                className="hidden px-4 py-2 text-sm text-white bg-rose-700 rounded-lg transition-colors md:block hover:bg-rose-800 dark:bg-red-600 dark:hover:bg-red-700"
              >
                삭제
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 - 모드에 따라 다른 컴포넌트 렌더링 */}
      <div className="flex-1 pb-2">
        {isEditing ? (
          <DiaryEditor
            entry={entry}
            editData={editData}
            onEditDataChange={setEditData}
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={isSaving}
          />
        ) : (
          <DiaryViewer
            entry={{
              ...entry,
              authorName: entry.authorName,
            }}
            showAIFeedback={showAIFeedback}
            aiFeedback={aiFeedback}
            aiLoading={aiLoading}
            onAIFeedbackRequest={onAIFeedbackRequest}
            isOwner={isOwner}
          />
        )}
      </div>

      {/* ID 표시 */}
      <div className="flex-shrink-0 mt-4 text-sm text-right text-stone-600 dark:text-gray-500">
        <p>ID: {entry.id}</p>
      </div>

      {/* 모바일 하단 툴바 */}
      <MobileToolbar
        isOwner={isOwner}
        isEditing={isEditing}
        visibility={entry.visibility}
        shareToken={entry.shareToken}
        entryId={entry.id}
        onVisibilityChange={toggleVisibility}
        onEdit={() => setIsEditing(true)}
        onDelete={handleDelete}
        onAIFeedbackRequest={onAIFeedbackRequest}
        aiLoading={aiLoading}
      />
    </div>
  );
};

export default DiaryDetail;
