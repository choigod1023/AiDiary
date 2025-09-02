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
import LoadingSpinner from "./components/LoadingSpinner";

// 인증 로딩 상태를 표시하는 컴포넌트
const AuthLoadingScreen: React.FC = () => {
  const { authState } = useAuth();

  if (authState.isLoading) {
    return (
      <div className="flex flex-col justify-center items-center bg-gray-50 min-h-screen-mobile dark:bg-gray-900">
        <LoadingSpinner
          size="lg"
          color="primary"
          text="로그인 상태를 확인하고 있습니다..."
        />
        <p className="mt-4 max-w-md text-sm text-center text-gray-600 dark:text-gray-400">
          잠시만 기다려주세요. 서버에서 사용자 정보를 확인하고 있습니다.
        </p>
      </div>
    );
  }

  return null;
};

const AppContent: React.FC = () => {
  const [theme] = useState<"light" | "dark" | "system">(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark" || saved === "system")
      return saved;
    return "system"; // 기본값을 system으로 변경
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <Router>
      <div className="flex flex-col w-full text-gray-900 bg-gray-50 min-h-screen-mobile dark:bg-gray-900 dark:text-gray-100">
        <AuthLoadingScreen />
        <Header />

        <div className="flex flex-col flex-1 justify-center items-center sm:px-mobile">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
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
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
