import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LoginCallback: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  React.useEffect(() => {
    // Google 로그인 또는 일반 리다이렉트
    (async () => {
      await checkAuth();
      const from =
        sessionStorage.getItem("post_login_from") || params.get("from") || "/";
      sessionStorage.removeItem("post_login_from");
      navigate(from, { replace: true });
    })();
  }, [checkAuth, navigate, params]);

  return (
    <div className="flex justify-center items-center w-full h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default LoginCallback;
