import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const WritePage: React.FC = () => {
  const [entry, setEntry] = useState<string>("");
  const navigate = useNavigate();

  const handleSave = async () => {
    // 현재 날짜와 시간을 포맷팅 (월일시분까지)
    const now = new Date();
    const formattedDate = now.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const newEntry = {
      entry,
      date: formattedDate,
    };
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/diary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newEntry),
        }
      );
      if (response.ok) {
        setEntry("");
        alert("일기가 저장되었습니다!");
      } else {
        alert("Failed to save diary entry.");
      }
    } catch (error) {
      console.error("Error saving diary entry:", error);
      alert("An error occurred while saving the diary entry.");
    }
  };

  return (
    <div className="flex items-center justify-center flex-1 p-8 ">
      <div className="max-w-8xl w-[50vw]  mx-auto bg-gray-800 shadow-md rounded-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 font-sans text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700"
          >
            뒤로 가기
          </button>
          <h1 className="text-4xl font-bold text-center">일기 작성</h1>
          <div className="w-[100px]"></div> {/* 균형을 위한 빈 div */}
        </div>
        <textarea
          className="w-full p-6 font-sans text-white bg-gray-900 border-2 border-gray-600 rounded-lg resize-none h-80 focus:outline-none focus:border-blue-500"
          placeholder="여기에 일기를 작성하세요..."
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
        ></textarea>
        <button
          className="w-full py-4 mt-8 font-sans font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          onClick={handleSave}
        >
          일기 저장
        </button>
      </div>
    </div>
  );
};

export default WritePage;
