import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { diaryApi } from "../utils/api";

interface DiaryViewerProps {
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
  showAIFeedback: boolean;
  aiFeedback: string;
  aiLoading: boolean;
  onAIFeedbackRequest: () => void;
  isOwner?: boolean;
}

// 제목 컴포넌트
const DiaryTitle: React.FC<{ title: string }> = ({ title }) => (
  <div className="mb-3 sm:mb-4 md:mb-6">
    <h1 className="text-lg font-semibold leading-tight text-amber-900 sm:text-xl md:text-2xl lg:text-3xl dark:text-stone-100">
      {title}
    </h1>
  </div>
);

// 작성자 정보 컴포넌트
const AuthorInfo: React.FC<{ authorName?: string; userId: string }> = ({
  authorName,
  userId,
}) => (
  <div className="mb-2.5 sm:mb-3 md:mb-4">
    <div className="text-xs text-amber-700 sm:text-sm md:text-base dark:text-stone-300">
      {authorName || userId}
    </div>
  </div>
);

// 날짜 및 감정 컴포넌트
const DateAndEmotion: React.FC<{ date: string; emotion: string }> = ({
  date,
  emotion,
}) => (
  <div className="flex justify-between items-center mb-3 sm:mb-4 md:mb-6">
    <div className="text-sm text-amber-800 sm:text-base md:text-lg dark:text-stone-200">
      {date}
    </div>
    <div className="text-lg text-amber-700 sm:text-xl md:text-2xl dark:text-stone-300">
      {emotion}
    </div>
  </div>
);

// 일기 내용 컴포넌트
const DiaryContent: React.FC<{ content: string }> = ({ content }) => (
  <div className="mb-4 sm:mb-6">
    <div className="p-4 bg-white rounded-xl border-2 border-amber-700 shadow-sm sm:p-6 dark:bg-gray-700 dark:border-gray-600">
      <p className="text-sm leading-relaxed whitespace-pre-wrap sm:text-base text-stone-800 dark:text-stone-200">
        {content}
      </p>
    </div>
  </div>
);

// AI 피드백 컴포넌트
const AIFeedback: React.FC<{
  showAIFeedback: boolean;
  aiFeedback: string;
  aiLoading: boolean;
  onAIFeedbackRequest: () => void;
  isOwner: boolean;
  hasFeedback: boolean;
}> = ({
  showAIFeedback,
  aiFeedback,
  aiLoading,
  onAIFeedbackRequest,
  isOwner,
  hasFeedback,
}) => (
  <div className="p-4 mb-4 bg-amber-100 rounded-2xl border-2 border-amber-700 shadow-sm sm:p-6 sm:mb-6 text-stone-900 dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100">
    <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:justify-between sm:items-center sm:gap-0">
      <h3 className="text-base font-semibold text-amber-900 sm:text-lg dark:text-stone-100">
        ☕ 한 잔의 위로
      </h3>
      {/* 데스크톱에서는 기존 버튼 표시 */}
      <div className="hidden sm:block">
        <button
          onClick={onAIFeedbackRequest}
          disabled={!isOwner || aiLoading || hasFeedback}
          title={
            !isOwner
              ? "작성자만 사용할 수 있습니다"
              : hasFeedback
              ? "이미 말이 저장되었습니다"
              : "한마디 듣기"
          }
          className={`px-3 py-2 text-base md:px-4 md:py-2.5 md:text-lg rounded-lg transition-colors border-2 ${
            !isOwner || hasFeedback
              ? "bg-stone-300 text-stone-800 border-stone-400 cursor-not-allowed dark:bg-stone-700 dark:text-stone-300 dark:border-stone-600"
              : aiLoading
              ? "bg-amber-400 text-stone-900 border-amber-500 cursor-wait dark:bg-yellow-500 dark:text-stone-900 dark:border-yellow-600"
              : "bg-amber-700 text-amber-50 hover:bg-amber-800 border-amber-900 dark:bg-amber-600 dark:text-amber-50 dark:hover:bg-amber-500 dark:border-amber-600"
          }`}
        >
          {!isOwner
            ? "작성자 전용"
            : hasFeedback
            ? "저장됨"
            : aiLoading
            ? "듣는 중..."
            : "한마디 듣기"}
        </button>
      </div>
    </div>
    {showAIFeedback && aiFeedback && (
      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 sm:p-4 dark:bg-stone-700 dark:border-stone-600">
        <p className="text-sm text-amber-800 sm:text-base dark:text-stone-200">
          {aiFeedback}
        </p>
      </div>
    )}
  </div>
);

// 댓글 컴포넌트
const Comments: React.FC<{
  entryId: string;
  shareToken?: string;
  visibility: string;
}> = ({ entryId, shareToken, visibility }) => {
  if (visibility !== "shared") return null;

  return (
    <div className="p-4 mb-4 bg-amber-50 rounded-xl border-2 border-amber-700 shadow-sm sm:p-6 sm:mb-6 dark:bg-stone-800 dark:border-stone-700">
      <h3 className="mb-3 text-base font-semibold text-amber-900 sm:text-lg dark:text-stone-100">
        댓글
      </h3>
      <ServerComments entryId={String(entryId)} shareToken={shareToken} />
    </div>
  );
};

// Server-backed SharedComments component
const ServerComments: React.FC<{ entryId: string; shareToken?: string }> = ({
  entryId,
  shareToken,
}) => {
  const queryClient = useQueryClient();
  const [text, setText] = React.useState("");
  const [authorName, setAuthorName] = React.useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["comments", entryId, shareToken],
    queryFn: () => diaryApi.getComments(entryId, shareToken!),
    enabled: !!shareToken,
  });

  const mutation = useMutation({
    mutationFn: (newComment: { content: string; authorName?: string }) =>
      diaryApi.addComment(entryId, shareToken!, newComment),
    onSuccess: () => {
      setText("");
      queryClient.invalidateQueries({
        queryKey: ["comments", entryId, shareToken],
      });
    },
  });

  if (!shareToken) return null;

  return (
    <div className="mx-auto space-y-3 max-w-xl">
      <div className="flex flex-col gap-3 justify-center items-center sm:flex-row sm:space-x-2">
        <input
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="닉네임 (선택)"
          className="px-4 py-3 sm:px-3 sm:py-2 md:px-4 md:py-2.5 w-full text-base sm:text-sm md:text-base bg-amber-50 rounded-lg border border-amber-200 sm:w-40 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:bg-stone-700 dark:text-white dark:border-stone-600"
        />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="댓글을 입력하세요"
          className="px-4 py-3 sm:px-3 sm:py-2 md:px-4 md:py-2.5 text-base sm:text-sm md:text-base bg-amber-50 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:bg-stone-700 dark:text-white dark:border-stone-600"
          disabled={mutation.isPending}
        />
        <button
          onClick={() => {
            if (!text.trim() || mutation.isPending) return;
            mutation.mutate({
              content: text.trim(),
              authorName: authorName.trim() || undefined,
            });
          }}
          className="px-6 py-3 sm:px-3 sm:py-2 md:px-4 md:py-2.5 text-base font-semibold sm:text-sm md:text-base text-white bg-amber-700 rounded-lg hover:bg-amber-800 disabled:opacity-50 active:scale-95 transition-transform"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "등록 중..." : "등록"}
        </button>
      </div>
      {isLoading ? (
        <div className="text-sm text-gray-500 dark:text-gray-300">
          불러오는 중...
        </div>
      ) : (
        <ul className="space-y-2">
          {(!data || data.comments.length === 0) && (
            <li className="text-sm text-gray-500 dark:text-gray-300">
              첫 댓글을 남겨보세요
            </li>
          )}
          {data?.comments.map((c) => (
            <li
              key={c.id}
              className="p-2 bg-amber-50 rounded border border-amber-200 dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="text-sm text-gray-700 dark:text-gray-200">
                {c.authorName ? (
                  <strong className="mr-2">{c.authorName}</strong>
                ) : null}
                {c.content}
              </div>
              <div className="text-xs text-gray-400">
                {new Date(c.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// 하단 고정 툴바 컴포넌트 (모바일 전용)
const MobileToolbar: React.FC<{
  onAIFeedbackRequest: () => void;
  isOwner: boolean;
  aiLoading: boolean;
  hasFeedback: boolean;
}> = ({ onAIFeedbackRequest, isOwner, aiLoading, hasFeedback }) => (
  <div className="fixed right-0 bottom-0 left-0 z-50 sm:hidden">
    <div className="bg-white border-t-2 border-amber-700 shadow-lg dark:bg-gray-800 dark:border-stone-700">
      <div className="flex justify-center items-center p-4 space-x-4">
        <button
          onClick={onAIFeedbackRequest}
          disabled={!isOwner || aiLoading || hasFeedback}
          className={`flex-1 max-w-xs px-6 py-4 text-lg font-semibold rounded-xl transition-all transform active:scale-95 ${
            !isOwner || hasFeedback
              ? "bg-stone-300 text-stone-800 dark:bg-stone-700 dark:text-stone-300"
              : aiLoading
              ? "bg-amber-400 text-stone-900"
              : "bg-amber-700 text-amber-50 hover:bg-amber-800 shadow-lg"
          }`}
        >
          {!isOwner
            ? "작성자 전용"
            : hasFeedback
            ? "☕ AI 피드백 저장됨"
            : aiLoading
            ? "🤔 AI가 생각 중..."
            : "☕ 한마디 듣기"}
        </button>
      </div>
    </div>
    {/* 하단 안전 영역을 위한 패딩 */}
    <div className="bg-white safe-area-bottom dark:bg-gray-800"></div>
  </div>
);

// 메인 DiaryViewer 컴포넌트
const DiaryViewer: React.FC<DiaryViewerProps> = ({
  entry,
  showAIFeedback,
  aiFeedback,
  aiLoading,
  onAIFeedbackRequest,
  isOwner = false,
}) => {
  return (
    <>
      <DiaryTitle title={entry.title} />
      <AuthorInfo authorName={entry.authorName} userId={entry.userId} />
      <DateAndEmotion date={entry.date} emotion={entry.emotion} />
      <DiaryContent content={entry.entry} />
      <AIFeedback
        showAIFeedback={showAIFeedback}
        aiFeedback={aiFeedback}
        aiLoading={aiLoading}
        onAIFeedbackRequest={onAIFeedbackRequest}
        isOwner={isOwner}
        hasFeedback={Boolean(entry.aiFeedback)}
      />
      <Comments
        entryId={String(entry.id)}
        shareToken={entry.shareToken}
        visibility={entry.visibility}
      />

      {/* 모바일 하단 툴바 */}
      <MobileToolbar
        onAIFeedbackRequest={onAIFeedbackRequest}
        isOwner={isOwner}
        aiLoading={aiLoading}
        hasFeedback={Boolean(entry.aiFeedback)}
      />
    </>
  );
};

export default DiaryViewer;
