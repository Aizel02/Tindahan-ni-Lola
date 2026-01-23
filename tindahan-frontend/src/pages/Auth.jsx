import { useState } from "react";
import { supabase } from "../supabaseClient";
import "./Auth.css";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session.access_token}`,
      },
      body: JSON.stringify({ storeName }),
    });

    alert("Account created successfully!");
    setIsLogin(true);
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    localStorage.setItem("token", data.session.access_token);
    window.location.href = "/products";
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="brand">🛍️ Tindahan ni Lola</h2>
        <p className="subtitle">Your Personal Store Management</p>

        <div className="tabs">
          <button
            className={isLogin ? "active" : ""}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={!isLogin ? "active" : ""}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {!isLogin && (
          <input
            type="text"
            placeholder="Store Name"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {!isLogin && (
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}

        <button className="primary-btn" onClick={isLogin ? handleLogin : handleRegister}>
          {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
        </button>

        <p className="back-home" onClick={() => (window.location.href = "/")}>
          ← Back to Home
        </p>
      </div>

      <footer>© 2025 Tindahan ni Lola. Your store, your way.</footer>
    </div>
  );
}
