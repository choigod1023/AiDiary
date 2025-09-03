import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { diaryApi } from "../utils/api";
import DiaryDetail from "../components/DiaryDetail";
import { DiaryEntry } from "../types/diary";
import LoadingSpinner from "../components/LoadingSpinner";

const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { search } = useLocation();
  const queryClient = useQueryClient();
  const token = new URLSearchParams(search).get("token");
  const isOwnerView = !token;
  const [showAIFeedback, setShowAIFeedback] = useState<boolean>(false);
  const [aiFeedback, setAIFeedback] = useState<string>("");
  const [aiLoading, setAILoading] = useState<boolean>(false);

  // React Query를 사용한 일기 조회
  const {
    data: entry,
    isLoading,
    error,
  } = useQuery<DiaryEntry>({
    queryKey: ["diary", id, token],
    queryFn: () => diaryApi.getById(id!, token || undefined),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5분
  });

  // AI 피드백이 있으면 자동으로 표시
  useEffect(() => {
    if (entry?.aiFeedback) {
      setAIFeedback(entry.aiFeedback);
      setShowAIFeedback(true);
    }
  }, [entry?.aiFeedback]);

  // 일기 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => diaryApi.delete(id),
    onSuccess: () => {
      alert("일기가 성공적으로 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["diary-list"] });
      navigate("/list");
    },
    onError: (error: Error) => {
      console.error("일기 삭제 중 오류 발생:", error);
      alert("일기 삭제에 실패했습니다.");
    },
  });

  // AI 피드백 요청 mutation
  const feedbackMutation = useMutation({
    mutationFn: (data: { id: string; entry: string; emotion: string }) =>
      diaryApi.requestFeedback(data.id, {
        entry: data.entry,
        emotion: data.emotion,
      }),
    onSuccess: (data) => {
      setAIFeedback(data.feedback);
      setShowAIFeedback(true);
      setAILoading(false);
      // 캐시 업데이트
      queryClient.setQueryData(["diary", id], (old: DiaryEntry | undefined) => {
        if (old) {
          return { ...old, aiFeedback: data.feedback };
        }
        return old;
      });
    },
    onError: (error: Error) => {
      console.error("AI 피드백 요청 중 오류 발생:", error);
      alert("AI 피드백 요청에 실패했습니다.");
      setAILoading(false);
    },
  });

  // 일기 수정 mutation
  const updateMutation = useMutation({
    mutationFn: (p: {
      id: string;
      title?: string;
      entry: string;
      useAITitle?: boolean;
      visibility?: "private" | "shared";
    }) =>
      diaryApi.update(p.id, {
        title: p.title,
        entry: p.entry,
        useAITitle: p.useAITitle,
        visibility: p.visibility,
      }),
    onSuccess: () => {
      alert("수정이 완료되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["diary", id] });
      queryClient.invalidateQueries({ queryKey: ["diary-list"] });
      navigate(`/detail/${id}`);
    },
    onError: () => alert("수정에 실패했습니다."),
  });

  const handleBack = () => {
    navigate("/list");
  };

  const handleDelete = async () => {
    if (!entry || !id) return;

    if (
      !window.confirm(
        "정말로 이 일기를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      )
    ) {
      return;
    }

    deleteMutation.mutate(id);
  };

  const handleAIFeedback = async () => {
    if (!entry || !id) return;

    setAILoading(true);
    feedbackMutation.mutate({
      id,
      entry: entry.entry,
      emotion: entry.emotion,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-gray-900 bg-amber-50 min-w-screen dark:bg-gray-900 dark:text-white">
        <div className="flex justify-center items-center py-16">
          <LoadingSpinner size="lg" text="일기를 불러오는 중..." />
        </div>
      </div>
    );
  }

  if (error) {
    // 권한 에러인지 확인
    const isAccessDenied =
      error instanceof Error &&
      (error.message.includes("Access denied") ||
        error.message.includes("권한이 없습니다") ||
        (error as { response?: { status?: number } }).response?.status === 403);

    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-gray-900 bg-amber-50 min-w-screen dark:bg-gray-900 dark:text-white">
        <div className="p-8 mx-auto w-full max-w-6xl text-gray-900 bg-white rounded-lg shadow-lg dark:bg-gray-800 dark:text-white">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-lg transition-colors text-stone-900 bg-stone-300 hover:bg-stone-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              뒤로 가기
            </button>
          </div>
          <div
            className={`p-4 rounded-lg border ${
              isAccessDenied
                ? "bg-yellow-100 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-800"
                : "bg-red-100 border-red-200 dark:bg-red-900 dark:border-red-800"
            }`}
          >
            <p
              className={`${
                isAccessDenied
                  ? "text-yellow-800 dark:text-yellow-200"
                  : "text-red-800 dark:text-red-200"
              }`}
            >
              {isAccessDenied
                ? "이 게시글에 접근할 권한이 없습니다. 비공개 게시글이거나 잘못된 링크입니다."
                : "일기 항목을 불러오는데 실패했습니다. 다시 시도해주세요."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-gray-900 bg-amber-50 min-w-screen dark:bg-gray-900 dark:text-white">
        <div className="p-8 mx-auto w-full max-w-6xl text-gray-900 bg-white rounded-lg shadow-lg dark:bg-gray-800 dark:text-white">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-lg transition-colors text-stone-900 bg-stone-300 hover:bg-stone-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
            >
              뒤로 가기
            </button>
          </div>
          <div className="p-4 bg-yellow-100 rounded-lg border border-yellow-200 dark:bg-yellow-900 dark:border-yellow-800">
            <p className="text-yellow-800 dark:text-yellow-200">
              일기 항목을 찾을 수 없습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen text-gray-900 bg-amber-50 min-w-screen dark:bg-gray-900 dark:text-white">
      <div className="px-6 w-full max-w-6xl">
        <DiaryDetail
          entry={{
            id: entry.id,
            title: entry.title,
            date: entry.date,
            emotion: entry.emotion,
            entry: entry.entry,
            aiFeedback: entry.aiFeedback,
            visibility:
              ("visibility" in entry && entry.visibility) || "private",
            shareToken: "shareToken" in entry ? entry.shareToken : undefined,
            userId: entry.authorName || entry.userId || "익명",
            authorName: entry.authorName,
          }}
          handleBack={handleBack}
          handleDelete={handleDelete}
          showAIFeedback={showAIFeedback}
          aiFeedback={aiFeedback}
          aiLoading={aiLoading}
          onAIFeedbackRequest={handleAIFeedback}
          isOwner={isOwnerView}
          isSaving={updateMutation.isPending}
          onEdit={(edited) =>
            updateMutation.mutate({
              id: String(entry.id),
              title: edited.useAITitle ? undefined : edited.title,
              entry: edited.entry,
              useAITitle: edited.useAITitle,
              visibility:
                ("visibility" in edited && edited.visibility) ||
                ("visibility" in entry && entry.visibility) ||
                "private",
            })
          }
        />
      </div>
    </div>
  );
};

export default DetailPage;
