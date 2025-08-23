import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
console.log(import.meta.env.VITE_API_URL);
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
          credentials: "include",
          body: JSON.stringify(newEntry),
        }
      );
      if (response.ok) {
        setEntry("");
        alert("일기가 저장되었습니다!");
        navigate("/list");
      } else {
        alert("Failed to save diary entry.");
      }
    } catch (error) {
      console.error("Error saving diary entry:", error);
      alert("An error occurred while saving the diary entry.");
    }
  };

  return (
    <div className="flex flex-1 justify-center items-center p-8 w-full bg-amber-50">
      <div className="max-w-8xl  w-[70vw] mx-auto rounded-lg shadow-lg p-8 bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 font-sans rounded-lg transition-colors bg-stone-300 text-stone-900 hover:bg-stone-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
          >
            뒤로 가기
          </button>
          <h1 className="text-4xl font-bold text-center">일기 작성</h1>
          <div className="w-[100px]"></div> {/* 균형을 위한 빈 div */}
        </div>
        <textarea
          className="p-6 w-full h-80 font-sans text-gray-900 bg-amber-50 rounded-lg border-2 border-amber-300 resize-none focus:outline-none focus:border-amber-400 dark:bg-gray-900 dark:text-white dark:border-gray-600 dark:focus:border-blue-500"
          placeholder="여기에 일기를 작성하세요..."
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
        ></textarea>
        <button
          className="py-4 mt-8 w-full font-sans font-semibold text-white bg-yellow-600 rounded-lg transition-colors hover:bg-yellow-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          onClick={handleSave}
        >
          일기 저장
        </button>
      </div>
    </div>
  );
};

export default WritePage;
