import { useState } from "react";
import { loginUser } from "../services/authService";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

import {
  generateSigningKeyPair,
  generateLongTermEcdhPair,
  exportJwk,
  saveKeyJwk
} from "../crypto/keys";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();

  const isDark =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const theme = {
    background: isDark ? "#0b141a" : "#f2f5f7",
    card: isDark ? "rgba(17, 23, 27, 0.6)" : "rgba(255, 255, 255, 0.55)",
    accent: "#25D366",
    text: isDark ? "#e8eef0" : "#111827",
    faded: isDark ? "#98a2a6" : "#6b7280",
    inputBg: isDark ? "rgba(15, 26, 29, 0.65)" : "rgba(255,255,255,0.7)",
  };

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser(username, password);

      const { token, user, pubSigningKeyJwk, pubEcdhKeyJwk } = response;

      const signingPair = await generateSigningKeyPair();
      const ecdhPair = await generateLongTermEcdhPair();

      const privateSigningJwk = await exportJwk(signingPair.privateKey);
      const privateEcdhJwk = await exportJwk(ecdhPair.privateKey);

      await saveKeyJwk("privateSigningKey", privateSigningJwk);
      await saveKeyJwk("privateEcdhKey", privateEcdhJwk);

      setSession({
        user,
        token,
        serverPubSigning: pubSigningKeyJwk,
        serverPubEcdh: pubEcdhKeyJwk,
        privateSigningKey: signingPair.privateKey,
        privateEcdhKey: ecdhPair.privateKey,
      });

      localStorage.setItem("token", token);
      localStorage.setItem("username", user.username);
      localStorage.setItem("userId", user._id);
      localStorage.setItem("email", user.email);

      navigate("/chat");
    } catch (err) {
      console.error("Login error:", err);
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "url('/images/bg.jpg')", // ⭐ ADDED IMAGE
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        padding: 20,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      }}
    >
      <div
        style={{
          width: 420,
          borderRadius: 16,
          padding: 30,
          background: theme.card,         // ⭐ BLUR GLASS
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.45)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: theme.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 800,
              fontSize: 20,
            }}
          >
            WA
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                color: theme.text,
                fontSize: 22,
              }}
            >
              Welcome back
            </h1>
            <div style={{ fontSize: 13, color: theme.faded }}>
              Sign in to open your secure chat
            </div>
          </div>
        </header>

        <form onSubmit={handleLogin}>
          <label
            style={{
              display: "block",
              marginBottom: 6,
              color: theme.faded,
              fontSize: 13,
            }}
          >
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username or email"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.3)",
              background: theme.inputBg,
              color: theme.text,
              marginBottom: 14,
              outline: "none",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: 6,
              color: theme.faded,
              fontSize: 13,
            }}
          >
            Password
          </label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.3)",
              background: theme.inputBg,
              color: theme.text,
              marginBottom: 18,
              outline: "none",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              background: theme.accent,
              color: "#05311B",
              fontWeight: 700,
              border: "none",
              cursor: loading ? "progress" : "pointer",
              boxShadow: "0 6px 12px rgba(37,211,102,0.12)",
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: 12, color: "#ff7878", fontSize: 13 }}>
            {error}
          </div>
        )}

        <div
          style={{
            marginTop: 16,
            fontSize: 13,
            color: theme.faded,
            textAlign: "center",
          }}
        >
          Don’t have an account?{" "}
          <a
            href="/signup"
            style={{ color: theme.accent, fontWeight: 700 }}
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
