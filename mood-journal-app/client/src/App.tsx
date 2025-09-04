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
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
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
