import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface DiaryEntry {
  id: string;
  date: string;
  emotion: string;
  title: string;
}

const ListPage: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/diary`,
          {
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setEntries(data);
        } else {
          console.error("Failed to fetch diary entries.");
        }
      } catch (error) {
        console.error("Error fetching diary entries:", error);
      }
    };
    fetchEntries();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen text-gray-900 bg-amber-50 min-w-screen dark:bg-gray-900 dark:text-white">
      <div className="p-8 mx-auto w-full max-w-4xl text-gray-900 bg-white rounded-lg shadow-lg dark:bg-gray-800 dark:text-white">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-lg transition-colors bg-stone-300 text-stone-900 hover:bg-stone-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
          >
            뒤로 가기
          </button>
          <h1 className="text-4xl font-bold text-center">일기 목록</h1>
          <div className="w-[100px]"></div>
        </div>

        <ul className="space-y-4">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="p-4 bg-amber-200 rounded-lg border border-amber-800 transition-colors hover:bg-amber-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600"
            >
              <Link to={`/detail/${entry.id}`} className="block">
                <strong>{entry.date}</strong>: {entry.emotion} - {entry.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ListPage;
