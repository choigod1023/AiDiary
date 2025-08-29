import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import LoginModal from "./LoginModal";

const Header: React.FC = () => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showLoginModal, setShowLoginModal] = React.useState(false);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLogout = async () => {
    queryClient.clear();
    await logout();
    navigate("/");
  };

  const safeDecode = (value: string | null): string | null => {
    if (!value) return null;
    const replaced = value.replace(/\+/g, " ");
    try {
      const once = decodeURIComponent(replaced);
      if (/%[0-9A-Fa-f]{2}/.test(once)) {
        try {
          return decodeURIComponent(once);
        } catch {
          return once;
        }
      }
      return once;
    } catch {
      return replaced;
    }
  };

  const cookieName = (() => {
    const rawCookie = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("display_name="));
    if (!rawCookie) return null;
    const rawValue = rawCookie.slice("display_name=".length);
    return safeDecode(rawValue);
  })();

  const storedName = safeDecode(localStorage.getItem("user_name"));

  const displayName = authState.user?.name || storedName || cookieName || "";
  const nameReady = Boolean(displayName.trim());

  return (
    <>
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-gray-200 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 dark:border-gray-700 mobile-safe-top">
        <div className="flex justify-between items-center px-6 py-3">
          <div
            onClick={handleLogoClick}
            className="flex items-center space-x-2 transition-opacity cursor-pointer hover:opacity-80"
          >
            <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg">
              <span className="text-lg font-bold text-white">📝</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Mood Journal
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {authState.isAuthenticated && nameReady ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  안녕하세요, {displayName}님! 👋
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm text-white bg-red-500 rounded-lg transition-colors hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-3 py-2 text-sm text-white bg-blue-500 rounded-lg transition-colors hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                🔒 로그인
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mobile-header-height"></div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};

export default Header;
