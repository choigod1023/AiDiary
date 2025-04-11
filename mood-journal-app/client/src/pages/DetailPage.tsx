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

  useEffect(() => {
    const fetchEntry = async () => {
      if (!id) {
        setError("ID가 제공되지 않았습니다.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/diary/${id}`);

        if (response.ok) {
          const data = await response.json();
          const formattedEntry: DiaryEntry = {
            id: data.id,
            title: data.title || "제목 없음",
            date: data.date,
            emotion: data.emotion,
            entry: data.entry,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl text-blue-500">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto p-8 bg-gray-800 text-white rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            뒤로 가기
          </button>
        </div>
        <div className="bg-red-900 p-4 rounded-lg">
          <p className="text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="w-full max-w-6xl mx-auto p-8 bg-gray-800 text-white rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            뒤로 가기
          </button>
        </div>
        <div className="bg-yellow-900 p-4 rounded-lg">
          <p className="text-yellow-200">일기 항목을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-8">
      <DiaryDetail entry={entry} handleBack={handleBack} />
    </div>
  );
};

export default DetailPage;
