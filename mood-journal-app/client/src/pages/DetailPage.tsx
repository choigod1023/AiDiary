import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DiaryDetail from "../components/DiaryDetail";
import { DiaryEntry } from "../types/diary";

const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAIFeedback, setShowAIFeedback] = useState<boolean>(false);
  const [aiFeedback, setAIFeedback] = useState<string>("");
  const [aiLoading, setAILoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchEntry = async () => {
      if (!id) {
        setError("ID가 제공되지 않았습니다.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/diary/${id}`,
          {
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          const formattedEntry: DiaryEntry = {
            id: data.id,
            title: data.title || "제목 없음",
            date: data.date,
            emotion: data.emotion,
            entry: data.entry,
            aiFeedback: data.aiFeedback,
          };
          setEntry(formattedEntry);
        } else {
          setError("일기 항목을 불러오는데 실패했습니다.");
        }
      } catch (error) {
        console.error("일기 항목을 불러오는 중 오류 발생:", error);
        setError("서버 연결에 문제가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
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

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/diary/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        alert("일기가 성공적으로 삭제되었습니다.");
        navigate("/list"); // 리스트 이동
      } else {
        const errorData = await response.json();
        alert(
          `삭제 실패: ${errorData.error || "알 수 없는 오류가 발생했습니다."}`
        );
      }
    } catch (error) {
      console.error("일기 삭제 중 오류 발생:", error);
      alert("서버 연결에 문제가 발생했습니다.");
    }
  };

  const handleAIFeedback = async () => {
    if (!entry) return;

    setAILoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/diary/${id}/ai-feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            entry: entry.entry,
            emotion: entry.emotion,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // 낙장불입: 서버가 저장한 값을 그대로 반영
        setAIFeedback(data.feedback);
        setShowAIFeedback(true);
        setEntry({ ...entry, aiFeedback: data.feedback });
      } else {
        const errorData = await response.json();
        alert(
          `AI 피드백 요청 실패: ${
            errorData.error || "알 수 없는 오류가 발생했습니다."
          }`
        );
      }
    } catch (error) {
      console.error("AI 피드백 요청 중 오류 발생:", error);
      alert("서버 연결에 문제가 발생했습니다.");
    } finally {
      setAILoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen text-gray-900 bg-amber-50 min-w-screen dark:bg-gray-900 dark:text-white">
        <div className="text-2xl text-blue-500">로딩 중...</div>
      </div>
    );
  }

  if (error) {
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
          <div className="p-4 bg-red-100 rounded-lg border border-red-200 dark:bg-red-900 dark:border-red-800">
            <p className="text-red-800 dark:text-red-200">{error}</p>
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
          entry={entry}
          handleBack={handleBack}
          handleDelete={handleDelete}
          showAIFeedback={showAIFeedback}
          aiFeedback={aiFeedback}
          aiLoading={aiLoading}
          onAIFeedbackRequest={handleAIFeedback}
        />
      </div>
    </div>
  );
};

export default DetailPage;
