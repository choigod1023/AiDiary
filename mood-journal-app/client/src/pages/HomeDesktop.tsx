import React from "react";
import { Link } from "react-router-dom";
import { diaryApi } from "../utils/api";
import type { DiaryEntry } from "../types/diary";
import { useAuth } from "../contexts/AuthContext";
import { EmotionChart } from "../components";

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
  const { authState } = useAuth();
  const [recent, setRecent] = React.useState<DiaryEntry[] | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [emotionStats, setEmotionStats] = React.useState<{
    totalEntries: number;
    averageEmotions: { [key: string]: number };
    emotionTrends: { date: string; emotions: { [key: string]: number } }[];
  } | null>(null);
  const [statsLoading, setStatsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    let mounted = true;
    if (authState.isLoading) return;

    if (!authState.isAuthenticated) {
      setRecent([]);
      setLoading(false);
      setEmotionStats(null);
      setStatsLoading(false);
      return;
    }

    (async () => {
      try {
        const [list, stats] = await Promise.all([
          diaryApi.getList(),
          diaryApi.getEmotionStats(),
        ]);

        if (!mounted) return;

        const sorted = [...list].sort(
          (a, b) => safeTime(b.date) - safeTime(a.date)
        );
        setRecent(sorted.slice(0, 8));
        setEmotionStats(stats);
      } catch (e) {
        console.error("Failed to load data:", e);
        if (mounted) {
          setRecent([]);
          setEmotionStats(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setStatsLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [authState.isAuthenticated, authState.isLoading]);

  return (
    <div className="pt-20 w-full min-h-screen text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-white px-mobile">
      <div className="grid grid-cols-1 gap-6 mx-auto max-w-screen-xl lg:grid-cols-12">
        {/* Desktop signature banner */}
        <div className="hidden justify-between items-center p-6 rounded-2xl ring-1 shadow-sm lg:flex lg:col-span-12 bg-white/90 dark:bg-gray-800/90 ring-black/5 dark:ring-white/10">
          <div className="flex gap-4 items-center">
            <div className="flex justify-center items-center w-12 h-12 text-2xl text-amber-700 bg-amber-100 rounded-xl dark:bg-blue-900/40 dark:text-blue-200">
              ✨
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
                Mood Journal
              </h1>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                오늘의 감정을 기록하고, 나만의 패턴을 발견하세요.
              </p>
            </div>
          </div>
          <div className="hidden gap-3 items-center text-sm lg:flex text-stone-600 dark:text-stone-300">
            <span className="inline-flex gap-1 items-center px-3 py-1 text-amber-700 bg-amber-100 rounded-full dark:bg-blue-900/40 dark:text-blue-200">
              🗓️ 매일의 작은 기록
            </span>
            <span className="inline-flex gap-1 items-center px-3 py-1 text-amber-700 bg-amber-100 rounded-full dark:bg-blue-900/40 dark:text-blue-200">
              📈 감정 통계 미리보기
            </span>
          </div>
        </div>
        {/* Left: recent entries */}
        <div className="space-y-4 lg:col-span-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">최근 일기</h2>
            <Link
              to="/list"
              className="text-sm font-medium text-amber-700 opacity-80 dark:text-blue-400 hover:opacity-100"
            >
              전체 보기 →
            </Link>
          </div>
          {loading ? (
            <div className="p-5 rounded-lg ring-1 shadow-sm opacity-90 bg-white/90 dark:bg-gray-800/90 ring-black/5 dark:ring-white/10">
              불러오는 중...
            </div>
          ) : recent && recent.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {recent.map((e) => (
                <Link
                  key={e.id}
                  to={`/detail/${e.id}`}
                  className="flex justify-between items-center p-4 h-28 rounded-lg ring-1 shadow-sm transition-shadow bg-white/90 dark:bg-gray-800/90 ring-black/5 dark:ring-white/10 group hover:shadow-md"
                >
                  <div className="flex-1 pr-3 min-w-0">
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
                  <div className="flex justify-center items-center w-12 h-12 text-3xl bg-amber-50 rounded-full shrink-0 dark:bg-gray-700">
                    {emotionToEmoji[e.emotion] || e.emotion || "📝"}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-5 rounded-lg ring-1 shadow-sm opacity-90 bg-white/90 dark:bg-gray-800/90 ring-black/5 dark:ring-white/10">
              {authState.isAuthenticated
                ? "작성된 일기가 없습니다."
                : "로그인 후 일기를 확인할 수 있습니다."}
            </div>
          )}
        </div>

        {/* Right: CTA + stats */}
        <div className="space-y-4 lg:col-span-4">
          <div className="p-5 text-white bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl shadow-md dark:from-blue-500 dark:to-indigo-600">
            <h3 className="text-xl font-semibold">오늘의 감정 기록</h3>
            <p className="mt-1 text-sm opacity-90">
              간단히 오늘의 감정을 남겨보세요.
            </p>
            <Link
              to="/write"
              className="inline-flex justify-center items-center px-4 py-2 mt-4 font-semibold text-amber-600 bg-white rounded-lg transition-colors dark:text-blue-600 hover:bg-white/90"
            >
              ✍️ 새 일기 작성
            </Link>
          </div>

          {statsLoading ? (
            <div className="flex justify-center items-center p-5 h-32 rounded-lg ring-1 shadow-sm opacity-90 bg-white/90 dark:bg-gray-800/90 ring-black/5 dark:ring-white/10">
              <span className="text-sm">차트 로딩 중...</span>
            </div>
          ) : emotionStats ? (
            <EmotionChart data={emotionStats} type="weekly" className="h-50" />
          ) : (
            <div className="flex justify-center items-center p-5 h-32 rounded-lg ring-1 shadow-sm opacity-90 bg-white/90 dark:bg-gray-800/90 ring-black/5 dark:ring-white/10">
              <span className="text-sm">주간 감정 차트</span>
            </div>
          )}

          {statsLoading ? (
            <div className="flex justify-center items-center p-5 h-32 rounded-lg ring-1 shadow-sm opacity-90 bg-white/90 dark:bg-gray-800/90 ring-black/5 dark:ring-white/10">
              <span className="text-sm">차트 로딩 중...</span>
            </div>
          ) : emotionStats ? (
            <EmotionChart data={emotionStats} type="monthly" className="h-50" />
          ) : (
            <div className="flex justify-center items-center p-5 h-32 rounded-lg ring-1 shadow-sm opacity-90 bg-white/90 dark:bg-gray-800/90 ring-black/5 dark:ring-white/10">
              <span className="text-sm">월간 감정 차트</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeDesktop;
