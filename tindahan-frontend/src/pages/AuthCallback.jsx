import { useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./AuthCallback.css";

export default function AuthCallback() {
  useEffect(() => {
    const handleAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        alert("Invalid or expired link.");
        window.location.href = "/auth";
        return;
      }

      localStorage.setItem("token", data.session.access_token);
      window.location.href = "/products";
    };

    handleAuth();
  }, []);

  return (
    <div className="auth-callback-wrapper">
      <div className="auth-callback-card">
        <h2>Verifying your account</h2>
        <p>Please wait while we log you in…</p>
        <div className="loader"></div>
      </div>
    </div>
  );
}
