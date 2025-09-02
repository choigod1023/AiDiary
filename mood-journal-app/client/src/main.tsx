import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./contexts/AuthContext";

// React Query 클라이언트 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분 (이전 cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

// 간단한 업데이트 알림 컴포넌트 (서비스 워커 없이)
const UpdateNotification: React.FC = () => {
  const [showUpdate, setShowUpdate] = React.useState(false);

  React.useEffect(() => {
    // 페이지 로드 시간을 체크하여 업데이트 여부 판단
    const lastLoadTime = localStorage.getItem("lastLoadTime");
    const currentTime = Date.now();

    if (lastLoadTime) {
      const timeDiff = currentTime - parseInt(lastLoadTime);
      // 1시간 이상 지났으면 업데이트 알림 표시
      if (timeDiff > 60 * 60 * 1000) {
        setShowUpdate(true);
      }
    }

    localStorage.setItem("lastLoadTime", currentTime.toString());
  }, []);

  const handleUpdate = () => {
    // 캐시 무효화를 위한 쿼리 파라미터 추가
    const url = new URL(window.location.href);
    url.searchParams.set("v", Date.now().toString());
    window.location.href = url.toString();
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 p-4 max-w-sm text-white bg-blue-500 rounded-lg shadow-lg">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">새로운 버전이 있습니다</h3>
          <p className="text-sm opacity-90">
            업데이트를 적용하려면 새로고침하세요
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={handleUpdate}
            className="px-3 py-1 text-sm font-medium text-blue-500 bg-white rounded hover:bg-gray-100"
          >
            새로고침
          </button>
          <button
            onClick={handleDismiss}
            className="px-2 text-white opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

// 서비스 워커 등록 (안전한 버전)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registered successfully");

        // 업데이트 감지 (자동 새로고침 없이)
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                console.log(
                  "New service worker installed, but not auto-reloading"
                );
                // 자동 새로고침하지 않고 로그만 출력
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider
        clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID as string}
      >
        <AuthProvider>
          <App />
          <UpdateNotification />
        </AuthProvider>
      </GoogleOAuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
