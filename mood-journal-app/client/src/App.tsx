import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Header from "./components/Header";
import WritePage from "./pages/WritePage";
import ListPage from "./pages/ListPage";
import DetailPage from "./pages/DetailPage";
import StatsPage from "./pages/StatsPage";
import "./App.css";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import LoginCallback from "./pages/LoginCallback";
import LoadingSpinner from "./components/LoadingSpinner";

const AppContent: React.FC = () => {
  const { authState } = useAuth();

  if (authState.isLoading) {
    return (
      <div className="flex justify-center items-center w-full h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" color="secondary" text="로딩 중..." />
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col p-0 w-full text-gray-900 bg-gray-50 min-h-screen-mobile dark:bg-gray-900 dark:text-gray-100">
        <Header />

        <div className="flex flex-col flex-1 justify-center items-center sm:px-mobile">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/callback" element={<LoginCallback />} />
            <Route
              path="/write"
              element={
                <ProtectedRoute>
                  <WritePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/list"
              element={
                <ProtectedRoute>
                  <ListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/detail/:id"
              element={
                <ProtectedRoute>
                  <DetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stats"
              element={
                <ProtectedRoute>
                  <StatsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  const [theme] = useState<"light" | "dark" | "system">(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark" || saved === "system")
      return saved;
    return "system"; // 기본값을 system으로 변경
  });

  useEffect(() => {
    const root = document.documentElement;

    const applySystemPref = () => {
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
        updateThemeColor("#111827"); // gray-900
      } else {
        root.classList.remove("dark");
        updateThemeColor("#ffffff"); // white
      }
    };

    const updateThemeColor = (color: string) => {
      const themeColorMeta = document.getElementById(
        "theme-color-meta"
      ) as HTMLMetaElement;
      const tileColorMeta = document.getElementById(
        "msapplication-tile-color"
      ) as HTMLMetaElement;
      const appleStatusBarMeta = document.getElementById(
        "apple-status-bar-style"
      ) as HTMLMetaElement;

      if (themeColorMeta) themeColorMeta.content = color;
      if (tileColorMeta) tileColorMeta.content = color;

      // iOS Safari 상태바 스타일도 함께 변경
      if (appleStatusBarMeta) {
        appleStatusBarMeta.content =
          color === "#111827" ? "black-translucent" : "default";
      }

      // PWA 환경에서 body 배경색도 직접 변경
      document.body.style.backgroundColor = color;
      
      // CSS 클래스도 함께 적용하여 일관성 유지
      if (color === "#111827") {
        document.body.classList.add("dark-mode");
        document.body.classList.remove("light-mode");
      } else {
        document.body.classList.add("light-mode");
        document.body.classList.remove("dark-mode");
      }
      
      // 강제로 스타일 적용
      document.body.style.setProperty('background-color', color, 'important');
    };

    if (theme === "system") {
      applySystemPref();
      const mq =
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => applySystemPref();
      if (mq && mq.addEventListener) mq.addEventListener("change", listener);
      // 구형 브라우저 대응
      if (mq && mq.addListener) mq.addListener(listener);
      return () => {
        if (mq && mq.removeEventListener)
          mq.removeEventListener("change", listener);
        if (mq && mq.removeListener) mq.removeListener(listener);
      };
    } else {
      if (theme === "dark") {
        root.classList.add("dark");
        updateThemeColor("#111827"); // gray-900
      } else {
        root.classList.remove("dark");
        updateThemeColor("#ffffff"); // white
      }
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
