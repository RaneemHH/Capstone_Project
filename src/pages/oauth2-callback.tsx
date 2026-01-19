import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store.tsx";

export default function OAuth2Callback() {
  const navigate = useNavigate();
  const { setToken, accessToken } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      navigate("/login?error=missing_token", { replace: true });
      return;
    }

    // Google OAuth only returns access token, no refresh token
    setToken(token);
    // Don't navigate here!
  }, [navigate, setToken]);

  // Navigate only after accessToken is set
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isNewUser = params.get("isNewUser") === "true";
    if (accessToken) {
      navigate(isNewUser ? "/profile" : "/dashboard", { replace: true });
    }
  }, [accessToken, navigate]);

  return <p className="text-center py-10">جاري تسجيل الدخول باستخدام Google...</p>;
}