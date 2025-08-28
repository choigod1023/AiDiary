import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Header from "./components/Header";
import WritePage from "./pages/WritePage";
import ListPage from "./pages/ListPage";
import DetailPage from "./pages/DetailPage";
import StatsPage from "./pages/StatsPage";
import "./App.css";

const App: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return "dark";
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
      <div className="flex flex-col w-full min-h-screen text-gray-900 bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
        <Header />
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="fixed left-4 z-50 px-3 py-2 text-sm text-gray-900 bg-gray-200 rounded-lg shadow hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 80px)" }}
          aria-label="Toggle theme"
          title={theme === "dark" ? "밝은 모드로" : "다크 모드로"}
        >
          {theme === "dark" ? "☀️ 밝게" : "🌙 어둡게"}
        </button>
        <div className="flex flex-col flex-1 justify-center items-center">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/write" element={<WritePage />} />
            <Route path="/list" element={<ListPage />} />
            <Route path="/detail/:id" element={<DetailPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
