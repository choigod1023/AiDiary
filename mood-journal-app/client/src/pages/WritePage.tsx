import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { diaryApi } from "../utils/api";
import DiaryEditor from "../components/DiaryEditor";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const WritePage: React.FC = () => {
  const [editData, setEditData] = useState<{
    title: string;
    entry: string;
    useAITitle: boolean;
    visibility?: "private" | "shared";
  }>({ title: "", entry: "", useAITitle: false, visibility: "private" });
  const navigate = useNavigate();
  const { authState } = useAuth();

  // 일기 저장 mutation
  const saveMutation = useMutation({
    mutationFn: (payload: {
      entry: string;
      visibility?: "private" | "shared";
      title?: string;
      useAITitle?: boolean;
      authorName?: string;
    }) => diaryApi.create(payload),
    onSuccess: () => {
      setEditData({
        title: "",
        entry: "",
        useAITitle: false,
        visibility: "private",
      });
      alert("일기가 저장되었습니다!");
      navigate("/list");
    },
    onError: (error: Error) => {
      console.error("Error saving diary entry:", error);
      alert("일기 저장에 실패했습니다. 다시 시도해주세요.");
    },
  });

  // 인증 로딩 중이거나 인증되지 않은 경우
  if (authState.isLoading) {
    return (
      <div className="flex flex-1 justify-center items-center p-8 w-full bg-amber-50 h-min-screen dark:bg-gray-900">
        <div className="max-w-8xl w-[70vw] mx-auto rounded-2xl p-8 border-2 border-amber-800 shadow-md bg-amber-200 text-gray-900 dark:bg-gray-800 dark:text-white">
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner size="lg" text="인증 상태를 확인하는 중..." />
          </div>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!authState.isAuthenticated) {
    navigate("/login?from=/write");
    return null;
  }

  const handleSave = async () => {
    if (!editData.entry.trim()) {
      alert("일기 내용을 입력해주세요.");
      return;
    }

    saveMutation.mutate({
      entry: editData.entry,
      visibility: editData.visibility,
      title: editData.title,
      useAITitle: !editData.title,
      authorName: authState.user?.name || "익명",
    });
  };

  return (
    <div className="flex flex-1 justify-center items-center p-8 w-full bg-amber-50 h-min-screen dark:bg-gray-900">
      <div className="max-w-8xl w-[70vw] mx-auto rounded-2xl p-8 border-2 border-amber-800 shadow-md  bg-amber-200 text-gray-900 dark:bg-gray-800 dark:text-white">
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
        <DiaryEditor
          entry={{
            id: "new",
            title: editData.title,
            date: new Date().toISOString().slice(0, 16).replace("T", " "),
            emotion: "🙂",
            entry: editData.entry,
            visibility: editData.visibility ?? "private",
            userId: "me",
          }}
          editData={editData}
          onEditDataChange={setEditData}
          onSave={handleSave}
          onCancel={() => navigate(-1)}
          isSaving={saveMutation.isPending}
        />
      </div>
    </div>
  );
};

export default WritePage;
