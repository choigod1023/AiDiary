import React from "react";
import { Link } from "react-router-dom";
import { diaryApi } from "../utils/api";
import type { DiaryEntry } from "../types/diary";

const emotionToEmoji: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  neutral: "😐",
  surprised: "😮",
  fear: "😨",
  disgust: "🤢",
};

const safeTime = (iso: string) => {
  const t = Date.parse(iso);
  return isNaN(t) ? Date.parse(iso.replace(/-/g, "/")) : t;
};

const formatDate = (iso: string) => {
  const t = safeTime(iso);
  return isNaN(t) ? iso : new Date(t).toLocaleDateString();
};
const capitalize = (s?: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

const HomeDesktop: React.FC = () => {
  const [recent, setRecent] = React.useState<DiaryEntry[] | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await diaryApi.getList();
        if (!mounted) return;
        const sorted = [...list].sort(
          (a, b) => safeTime(b.date) - safeTime(a.date)
        );
        setRecent(sorted.slice(0, 8));
      } catch {
        if (mounted) setRecent([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-amber-50 dark:bg-gray-900 text-gray-900 dark:text-white px-mobile pt-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-screen-xl mx-auto">
        {/* Left: recent entries */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">최근 일기</h2>
            <Link
              to="/list"
              className="text-sm font-medium opacity-80 hover:opacity-100"
            >
              전체 보기 →
            </Link>
          </div>
          {loading ? (
            <div className="p-5 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-sm ring-1 ring-black/5 dark:ring-white/10 opacity-90">
              불러오는 중...
            </div>
          ) : recent && recent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recent.map((e) => (
                <Link
                  key={e.id}
                  to={`/detail/${e.id}`}
                  className="p-4 rounded-lg bg-white/90 dark:bg-gray-800/90 ring-1 ring-black/5 dark:ring-white/10 shadow-sm h-28 flex items-center justify-between group hover:shadow-md transition-shadow"
                >
                  <div className="min-w-0 pr-3 flex-1">
                    <div className="font-semibold truncate text-stone-900 dark:text-white group-hover:underline">
                      {e.title || "제목 없음"}
                    </div>
                    <div className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                      {formatDate(e.date)} ·{" "}
                      <span className="inline-block align-middle px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-blue-900/40 dark:text-blue-200">
                        {capitalize(e.emotion)}
                      </span>
                    </div>
                    {e.entry && (
                      <div className="mt-1 text-sm text-stone-700 dark:text-stone-300 line-clamp-1">
                        {e.entry}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 w-12 h-12 rounded-full bg-amber-50 dark:bg-gray-700 flex items-center justify-center text-3xl">
                    {emotionToEmoji[e.emotion] || e.emotion || "📝"}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-5 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-sm ring-1 ring-black/5 dark:ring-white/10 opacity-90">
              작성된 일기가 없습니다.
            </div>
          )}
          <div className="flex justify-end">
            <Link
              to="/list"
              className="text-sm font-medium opacity-80 hover:opacity-100"
            >
              전체 보기 →
            </Link>
          </div>
        </div>

        {/* Right: CTA + stats */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl shadow-md bg-gradient-to-br from-amber-400 to-yellow-500 dark:from-blue-500 dark:to-indigo-600 text-white">
            <h3 className="text-xl font-semibold">오늘의 감정 기록</h3>
            <p className="mt-1 text-sm opacity-90">
              간단히 오늘의 감정을 남겨보세요.
            </p>
            <Link
              to="/write"
              className="mt-4 inline-flex justify-center items-center px-4 py-2 rounded-lg bg-white text-amber-600 dark:text-blue-600 font-semibold hover:bg-white/90 transition-colors"
            >
              ✍️ 새 일기 작성
            </Link>
          </div>

          <div className="p-5 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-sm ring-1 ring-black/5 dark:ring-white/10 h-40 flex items-center justify-center opacity-90">
            <span className="text-sm">주간 감정 차트</span>
          </div>
          <div className="p-5 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-sm ring-1 ring-black/5 dark:ring-white/10 h-40 flex items-center justify-center opacity-90">
            <span className="text-sm">월간 감정 차트</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDesktop;
