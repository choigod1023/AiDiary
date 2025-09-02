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

// 서비스 워커 업데이트 알림 컴포넌트
const UpdateNotification: React.FC = () => {
  const [showUpdate, setShowUpdate] = React.useState(false);

  React.useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  setShowUpdate(true);
                }
              });
            }
          });
        })
        .catch(() => void 0);
    }
  }, []);

  const handleUpdate = () => {
    window.location.reload();
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

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // 주기적으로 업데이트 확인 (선택사항)
        setInterval(() => {
          registration.update();
        }, 1000 * 60 * 60); // 1시간마다 확인
      })
      .catch(() => void 0);
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
