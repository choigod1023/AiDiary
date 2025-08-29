import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoginModal from "../components/LoginModal";
import { useAuth } from "../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const [showModal, setShowModal] = React.useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const from = params.get("from") || "/";

  React.useEffect(() => {
    if (authState.isAuthenticated) navigate(from, { replace: true });
  }, [authState.isAuthenticated, from, navigate]);

  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen text-gray-900 bg-amber-50 min-w-screen dark:bg-gray-900 dark:text-white">
      <div className="p-8 mx-4 w-full max-w-md bg-white rounded-2xl shadow-xl dark:bg-gray-800 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="mb-2 text-3xl font-bold">로그인이 필요합니다</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          계정으로 로그인하여 계속 진행하세요.
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 w-full text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
        >
          로그인하기
        </button>
      </div>
      <LoginModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default LoginPage;
