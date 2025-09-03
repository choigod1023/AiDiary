import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { diaryApi } from "../utils/api";
import { getUserDisplayName } from "../utils/userUtils";
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

  // 현재 날짜와 시간을 실시간으로 업데이트
  const [currentDateTime, setCurrentDateTime] = useState(() => {
    const now = new Date();
    return now.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  });

  const navigate = useNavigate();
  const { authState } = useAuth();

  // 1분마다 날짜/시간 업데이트
  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    }, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, []);

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
      authorName: getUserDisplayName(authState),
    });
  };

  return (
    <div className="flex flex-1 justify-center items-center p-4 w-full bg-amber-50 md:p-8 h-min-screen dark:bg-gray-900">
      <div className="p-4 mx-auto w-full text-gray-900 bg-amber-200 rounded-2xl border-2 border-amber-800 shadow-md max-w-8xl md:p-8 dark:bg-gray-800 dark:text-white">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 font-sans rounded-lg transition-colors bg-stone-300 text-stone-900 hover:bg-stone-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
          >
            뒤로 가기
          </button>
          <h1 className="text-2xl font-bold text-center md:text-4xl">
            일기 작성
          </h1>
          <div className="w-[100px]"></div>
        </div>
        <DiaryEditor
          entry={{
            id: "new",
            title: editData.title,
            date: currentDateTime,
            emotion: "", // 오늘의 기분 숨김
            entry: editData.entry,
            visibility: editData.visibility ?? "private",
            userId: getUserDisplayName(authState), // 공통 함수 사용
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
