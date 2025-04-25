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
    <div className="flex-1 flex items-center justify-center p-8 ">
      <div className="max-w-4xl w-full mx-auto bg-gray-800 text-white rounded-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
              className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors"
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
