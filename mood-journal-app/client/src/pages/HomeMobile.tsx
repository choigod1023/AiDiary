import React from "react";
import { Link } from "react-router-dom";
import { diaryApi } from "../utils/api";
import type { DiaryEntry } from "../types/diary";
import { useAuth } from "../contexts/AuthContext";

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

const HomeMobile: React.FC = () => {
  const { authState } = useAuth();
  const [recent, setRecent] = React.useState<DiaryEntry[] | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    let mounted = true;
    // 대기: 인증 확인 후에만 호출 (Safari에서 쿠키/세션 지연 대응)
    if (authState.isLoading) return;

    if (!authState.isAuthenticated) {
      setRecent([]);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const list = await diaryApi.getList();
        if (!mounted) return;
        const sorted = [...list].sort(
          (a, b) => safeTime(b.date) - safeTime(a.date)
        );
        setRecent(sorted.slice(0, 3));
      } catch (e) {
        console.error("Failed to load recent diaries:", e);
        if (mounted) setRecent([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [authState.isAuthenticated, authState.isLoading]);

  return (
    <div className="flex flex-col w-full text-gray-900 bg-amber-50 min-h-screen-mobile dark:bg-gray-900 dark:text-white sm:px-mobile">
      {/* CTA gradient card */}
      <div className="pt-16 pb-6 px-mobile">
        <div className="p-5 text-white bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl shadow-md dark:from-blue-500 dark:to-indigo-600">
          <h1 className="font-bold text-mobile-2xl">오늘의 감정 기록하기</h1>
          <p className="mt-1 opacity-90 text-mobile-sm">
            지금 이 순간의 감정을 간단히 남겨보세요.
          </p>
          <Link
            to="/write"
            className="inline-flex justify-center items-center px-4 py-2 mt-4 font-semibold text-amber-600 bg-white rounded-lg transition-colors dark:text-blue-600 hover:bg-white/90"
          >
            ✍️ 새 일기 작성
          </Link>
        </div>
      </div>

      {/* Recent entries */}
      <div className="py-4 px-mobile">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-mobile-xl text-stone-800 dark:text-stone-100">
            최근 일기
          </h2>
          <Link
            to="/list"
            className="opacity-80 text-mobile-sm hover:opacity-100"
          >
            전체 보기 →
          </Link>
        </div>

        {loading ? (
          <div className="p-4 rounded-lg ring-1 shadow-sm opacity-90 bg-white/90 dark:bg-gray-800/90 ring-black/5 dark:ring-white/10">
            불러오는 중...
          </div>
        ) : recent && recent.length > 0 ? (
          <div className="space-y-3">
            {recent.map((e) => (
              <Link
                key={e.id}
                to={`/detail/${e.id}`}
                className="block p-4 rounded-lg ring-1 shadow-sm transition-shadow bg-white/90 dark:bg-gray-800/90 ring-black/5 dark:ring-white/10 hover:shadow-md"
              >
                <div className="flex gap-3 justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate text-stone-900 dark:text-white">
                      {e.title || "제목 없음"}
                    </div>
                    <div className="mt-1 text-stone-500 dark:text-stone-400 text-mobile-xs">
                      {formatDate(e.date)} ·{" "}
                      <span className="inline-block align-middle px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-blue-900/40 dark:text-blue-200">
                        {capitalize(e.emotion)}
                      </span>
                    </div>
                    {e.entry && (
                      <div className="mt-1 text-mobile-sm text-stone-700 dark:text-stone-300 line-clamp-1">
                        {e.entry}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center items-center ml-1 w-10 h-10 text-2xl bg-amber-50 rounded-full shrink-0 dark:bg-gray-700">
                    {e.emotion || "📝"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-lg ring-1 shadow-sm opacity-90 bg-white/90 dark:bg-gray-800/90 ring-black/5 dark:ring-white/10">
            {authState.isAuthenticated
              ? "작성된 일기가 없습니다."
              : "로그인 후 일기를 확인할 수 있습니다."}
          </div>
        )}
      </div>

      {/* Stats preview */}
      <div className="py-4 px-mobile">
        <h2 className="mb-2 font-semibold text-mobile-xl">
          주간 감정 미리보기
        </h2>
        <div className="flex justify-center items-center h-24 rounded-lg ring-1 opacity-90 bg-white/90 dark:bg-gray-800/90 ring-black/5 dark:ring-white/10">
          <span className="text-mobile-sm">차트 미리보기</span>
        </div>
      </div>
    </div>
  );
};

export default HomeMobile;
